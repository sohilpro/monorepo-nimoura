import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import {
  AdminUsersQueryDto,
  USER_SORTABLE_FIELDS,
} from './dtos/admin-users-query.dto';
import { WishlistService } from 'src/modules/wishlist/wishlist.service';
import { Addresses } from './addresses/entities/addresses.entity';
import { Orders } from 'src/modules/orders/entities/orders.entity';
import { Comments } from 'src/modules/comments/entities/comments.entity';
import { Users } from './entities/users.entity';
import { UserRole } from 'src/common/auth/jwt.types';

const USER_PUBLIC_SELECT = {
  id: true,
  first_name: true,
  last_name: true,
  mobile: true,
  verify_mobile: true,
  email: true,
  verify_email: true,
  identity_card: true,
  role: true,
  createdAt: true,
} as const;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,

    @Optional()
    private readonly wishlistService?: WishlistService,
  ) {}

  // ==========================================
  // بخش ۱: متدهای کاربر عادی (User Profile)
  // ==========================================

  async getProfile(userId: number) {
    const [user, addressesCount, ordersCount, wishlistCount] =
      await Promise.all([
        this.userRepository.findOne({
          where: { id: userId },
          select: USER_PUBLIC_SELECT,
          loadEagerRelations: false,
        }),
        this.userRepository.manager.count(Addresses, { where: { userId } }),
        this.userRepository.manager.count(Orders, {
          where: { user: { id: userId } },
        }),
        this.wishlistService
          ? this.wishlistService.count(userId)
          : Promise.resolve(0),
      ]);

    if (!user) {
      throw new NotFoundException('کاربر یافت نشد.');
    }

    return {
      profile: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        mobile: user.mobile,
        verify_mobile: user.verify_mobile,
        email: user.email,
        verify_email: user.verify_email,
        identity_card: user.identity_card,
        role: user.role,
        createdAt: user.createdAt,
      },
      stats: {
        ordersCount,
        addressesCount,
        wishlistCount,
      },
    };
  }

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        verify_email: true,
        identity_card: true,
        first_name: true,
        last_name: true,
        role: true,
        mobile: true,
        verify_mobile: true,
      },
      loadEagerRelations: false,
    });
    if (!user) throw new NotFoundException('کاربر یافت نشد.');

    // بررسی یکتایی ایمیل در صورت تغییر
    if (dto.email && dto.email !== user.email) {
      const existing = await this.userRepository.findOne({
        where: { email: dto.email },
        select: { id: true },
        loadEagerRelations: false,
      });
      if (existing) throw new ConflictException('این ایمیل قبلاً ثبت شده است.');
      user.email = dto.email;
      user.verify_email = false;
    }

    // تغییر و هش رمزعبور
    if (dto.password) {
      user.password = await bcrypt.hash(dto.password, 10);
    }

    // بررسی یکتایی کدملی
    if (
      dto.identity_card !== undefined &&
      dto.identity_card !== user.identity_card
    ) {
      const existingUser = await this.userRepository.findOne({
        where: { identity_card: dto.identity_card },
        select: { id: true },
        loadEagerRelations: false,
      });
      if (existingUser && existingUser.id !== user.id) {
        throw new ConflictException('این کد ملی قبلاً ثبت شده است.');
      }
      user.identity_card = dto.identity_card;
    }

    if (dto.first_name !== undefined) user.first_name = dto.first_name;
    if (dto.last_name !== undefined) user.last_name = dto.last_name;

    const savedUser = await this.userRepository.save(user);

    return {
      message: 'پروفایل با موفقیت به‌روزرسانی شد.',
      user: {
        id: savedUser.id,
        email: savedUser.email,
        first_name: savedUser.first_name,
        last_name: savedUser.last_name,
        identity_card: savedUser.identity_card,
        role: savedUser.role,
        mobile: savedUser.mobile,
        verify_email: savedUser.verify_email,
        verify_mobile: savedUser.verify_mobile,
      },
    };
  }

  // ==========================================
  // بخش ۲: متدهای پنل ادمین (Admin Management)
  // ==========================================

  async createUser(dto: CreateUserDto) {
    const existingMobile = await this.userRepository.findOne({
      where: { mobile: dto.mobile },
      select: { id: true, deletedAt: true },
      withDeleted: true,
      loadEagerRelations: false,
    });
    if (existingMobile) {
      throw new ConflictException(
        existingMobile.deletedAt
          ? 'حسابی با این شماره موبایل قبلاً حذف بایگانی شده است.'
          : 'کاربری با این شماره موبایل قبلاً ثبت‌نام کرده است.',
      );
    }

    if (dto.email) {
      const existingEmail = await this.userRepository.findOne({
        where: { email: dto.email },
        select: { id: true },
        withDeleted: true,
        loadEagerRelations: false,
      });
      if (existingEmail) {
        throw new ConflictException('این ایمیل قبلاً ثبت شده است.');
      }
    }

    if (dto.identity_card) {
      const existingId = await this.userRepository.findOne({
        where: { identity_card: dto.identity_card },
        select: { id: true },
        withDeleted: true,
        loadEagerRelations: false,
      });
      if (existingId) {
        throw new ConflictException('این کد ملی قبلاً ثبت شده است.');
      }
    }

    const hashedPassword = dto.password
      ? await bcrypt.hash(dto.password, 10)
      : undefined;

    const user = this.userRepository.create({
      mobile: dto.mobile,
      first_name: dto.first_name,
      last_name: dto.last_name,
      email: dto.email,
      password: hashedPassword,
      role: dto.role ?? UserRole.USER,
      identity_card: dto.identity_card,
      verify_mobile: dto.verify_mobile ?? true,
      verify_email: dto.email ? (dto.verify_email ?? true) : false,
    });

    const saved = await this.userRepository.save(user);

    return {
      message: 'کاربر با موفقیت ایجاد شد.',
      user: {
        id: saved.id,
        first_name: saved.first_name,
        last_name: saved.last_name,
        mobile: saved.mobile,
        email: saved.email,
        role: saved.role,
        identity_card: saved.identity_card,
        verify_mobile: saved.verify_mobile,
        verify_email: saved.verify_email,
        createdAt: saved.createdAt,
      },
    };
  }

  async getUsers(query: AdminUsersQueryDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
    const search = (query.search || '').trim();
    const sortOrder =
      String(query.sortOrder || 'DESC').toUpperCase() === 'ASC'
        ? 'ASC'
        : 'DESC';
    const rawSortBy = query.sortBy || query.sort || 'id';
    const sortBy = (USER_SORTABLE_FIELDS as readonly string[]).includes(
      rawSortBy,
    )
      ? rawSortBy
      : 'id';

    const qb = this.userRepository
      .createQueryBuilder('u')
      .select([
        'u.id',
        'u.first_name',
        'u.last_name',
        'u.mobile',
        'u.verify_mobile',
        'u.email',
        'u.verify_email',
        'u.identity_card',
        'u.role',
        'u.createdAt',
        'u.updatedAt',
      ]);

    if (search) {
      const numericId = Number(search);
      qb.andWhere(
        new Brackets((sub) => {
          sub
            .where('u.first_name ILIKE :q', { q: `%${search}%` })
            .orWhere('u.last_name ILIKE :q', { q: `%${search}%` })
            .orWhere(
              `CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, '')) ILIKE :q`,
              { q: `%${search}%` },
            )
            .orWhere('u.mobile ILIKE :q', { q: `%${search}%` })
            .orWhere('u.email ILIKE :q', { q: `%${search}%` })
            .orWhere('u.identity_card ILIKE :q', { q: `%${search}%` });
          if (Number.isInteger(numericId) && numericId > 0) {
            sub.orWhere('u.id = :numericId', { numericId });
          }
        }),
      );
    }

    if (query.role) {
      qb.andWhere('u.role = :role', { role: query.role });
    }
    if (query.verify_mobile !== undefined) {
      qb.andWhere('u.verify_mobile = :verifyMobile', {
        verifyMobile: query.verify_mobile,
      });
    }
    if (query.verify_email !== undefined) {
      qb.andWhere('u.verify_email = :verifyEmail', {
        verifyEmail: query.verify_email,
      });
    }

    qb.orderBy(`u.${sortBy}`, sortOrder)
      .addOrderBy('u.id', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [[data, total], summaryRow] = await Promise.all([
      qb.getManyAndCount(),
      this.userRepository
        .createQueryBuilder('u')
        .select('COUNT(u.id)', 'total')
        .addSelect(`COUNT(u.id) FILTER (WHERE u.role = :userRole)`, 'users')
        .addSelect(`COUNT(u.id) FILTER (WHERE u.role = :adminRole)`, 'admins')
        .addSelect(`COUNT(u.id) FILTER (WHERE u.role = :ownerRole)`, 'owners')
        .addSelect(
          `COUNT(u.id) FILTER (WHERE u.verify_mobile = true)`,
          'verifiedMobile',
        )
        .addSelect(
          `COUNT(u.id) FILTER (WHERE u.verify_email = true)`,
          'verifiedEmail',
        )
        .setParameters({
          userRole: UserRole.USER,
          adminRole: UserRole.ADMIN,
          ownerRole: UserRole.OWNER,
        })
        .getRawOne<Record<string, string>>(),
    ]);

    const userIds = data.map((u) => u.id);
    const [orderCounts, addressCounts] = userIds.length
      ? await Promise.all([
          this.userRepository.manager
            .createQueryBuilder(Orders, 'o')
            .select('o.userId', 'userId')
            .addSelect('COUNT(o.id)', 'count')
            .where('o.userId IN (:...userIds)', { userIds })
            .groupBy('o.userId')
            .getRawMany<{ userId: number; count: string }>(),
          this.userRepository.manager
            .createQueryBuilder(Addresses, 'a')
            .select('a.userId', 'userId')
            .addSelect('COUNT(a.id)', 'count')
            .where('a.userId IN (:...userIds)', { userIds })
            .groupBy('a.userId')
            .getRawMany<{ userId: number; count: string }>(),
        ])
      : [[], []];

    const ordersByUser = new Map(
      orderCounts.map((r) => [Number(r.userId), Number(r.count)]),
    );
    const addressesByUser = new Map(
      addressCounts.map((r) => [Number(r.userId), Number(r.count)]),
    );

    const enriched = data.map((u) => ({
      ...u,
      ordersCount: ordersByUser.get(u.id) ?? 0,
      addressesCount: addressesByUser.get(u.id) ?? 0,
    }));

    const totalPages = Math.ceil(total / limit);
    return {
      items: enriched,
      users: enriched,
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
      summary: {
        total: Number(summaryRow?.total ?? 0),
        users: Number(summaryRow?.users ?? 0),
        admins: Number(summaryRow?.admins ?? 0),
        owners: Number(summaryRow?.owners ?? 0),
        verifiedMobile: Number(summaryRow?.verifiedMobile ?? 0),
        verifiedEmail: Number(summaryRow?.verifiedEmail ?? 0),
      },
    };
  }

  async getUser(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      select: {
        ...USER_PUBLIC_SELECT,
        updatedAt: true,
      },
      loadEagerRelations: false,
    });

    if (!user) throw new NotFoundException('کاربر مورد نظر یافت نشد.');

    return {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      mobile: user.mobile,
      verify_mobile: user.verify_mobile,
      email: user.email,
      verify_email: user.verify_email,
      identity_card: user.identity_card,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async getUserStats(id: number) {
    const exists = await this.userRepository.existsBy({ id });
    if (!exists) throw new NotFoundException('کاربر مورد نظر یافت نشد.');

    const [ordersCount, addressesCount, commentsCount] = await Promise.all([
      this.userRepository.manager.count(Orders, { where: { user: { id } } }),
      this.userRepository.manager.count(Addresses, { where: { userId: id } }),
      this.userRepository.manager.count(Comments, { where: { user: { id } } }),
    ]);

    return { ordersCount, addressesCount, commentsCount };
  }

  async updateUser(id: number, dto: UpdateUserDto) {
    const user = await this.userRepository.findOne({
      where: { id },
      select: {
        id: true,
        email: true,
        mobile: true,
        identity_card: true,
        verify_email: true,
        verify_mobile: true,
        role: true,
        first_name: true,
        last_name: true,
        createdAt: true,
        updatedAt: true,
      },
      loadEagerRelations: false,
    });
    if (!user) throw new NotFoundException('کاربر یافت نشد.');

    // بررسی یکتایی ایمیل
    if (dto.email !== undefined) {
      if (dto.email !== null && dto.email !== user.email) {
        const emailExists = await this.userRepository.findOne({
          where: { email: dto.email },
          select: { id: true },
          withDeleted: true,
          loadEagerRelations: false,
        });
        if (emailExists && emailExists.id !== user.id) {
          throw new ConflictException('ایمیل تکراری است.');
        }
        if (dto.verify_email === undefined) {
          user.verify_email = false;
        }
      }
      if (dto.email === null) {
        user.verify_email = false;
      }
      user.email = dto.email as unknown as string;
    }

    // بررسی یکتایی موبایل
    if (dto.mobile !== undefined && dto.mobile !== user.mobile) {
      const mobileExists = await this.userRepository.findOne({
        where: { mobile: dto.mobile },
        select: { id: true },
        withDeleted: true,
        loadEagerRelations: false,
      });
      if (mobileExists && mobileExists.id !== user.id) {
        throw new ConflictException('شماره موبایل تکراری است.');
      }
      user.mobile = dto.mobile;
      if (dto.verify_mobile === undefined) {
        user.verify_mobile = false;
      }
    }

    // بررسی یکتایی کدملی
    if (dto.identity_card !== undefined) {
      if (
        dto.identity_card !== null &&
        dto.identity_card !== user.identity_card
      ) {
        const idExists = await this.userRepository.findOne({
          where: { identity_card: dto.identity_card },
          select: { id: true },
          withDeleted: true,
          loadEagerRelations: false,
        });
        if (idExists && idExists.id !== user.id) {
          throw new ConflictException('کد ملی تکراری است.');
        }
      }
      user.identity_card = dto.identity_card as unknown as string;
    }

    if (dto.verify_mobile !== undefined) {
      user.verify_mobile = dto.verify_mobile;
    }
    if (dto.verify_email !== undefined) {
      user.verify_email = user.email ? dto.verify_email : false;
    }

    if (dto.password) {
      user.password = await bcrypt.hash(dto.password, 10);
    }

    if (dto.role !== undefined && dto.role !== user.role) {
      if (user.role === UserRole.OWNER) {
        const ownerCount = await this.userRepository.countBy({
          role: UserRole.OWNER,
        });
        if (ownerCount <= 1) {
          throw new BadRequestException(
            'حداقل یک مالک فروشگاه باید در سیستم باقی بماند.',
          );
        }
      }
      user.role = dto.role;
    }

    if (dto.first_name !== undefined) {
      user.first_name = dto.first_name as unknown as string;
    }
    if (dto.last_name !== undefined) {
      user.last_name = dto.last_name as unknown as string;
    }

    const saved = await this.userRepository.save(user);
    return {
      message: 'کاربر با موفقیت بروزرسانی شد.',
      user: {
        id: saved.id,
        first_name: saved.first_name,
        last_name: saved.last_name,
        mobile: saved.mobile,
        verify_mobile: saved.verify_mobile,
        email: saved.email,
        verify_email: saved.verify_email,
        identity_card: saved.identity_card,
        role: saved.role,
        createdAt: saved.createdAt,
        updatedAt: saved.updatedAt,
      },
    };
  }

  async deleteUser(id: number, currentUserId?: number) {
    if (currentUserId && id === currentUserId) {
      throw new BadRequestException(
        'امکان حذف حساب کاربری که با آن وارد شده‌اید وجود ندارد.',
      );
    }

    const user = await this.userRepository.findOne({
      where: { id },
      select: { id: true, role: true },
      loadEagerRelations: false,
    });
    if (!user) {
      throw new NotFoundException('کاربر مورد نظر یافت نشد.');
    }

    if (user.role === UserRole.OWNER) {
      const ownerCount = await this.userRepository.countBy({
        role: UserRole.OWNER,
      });
      if (ownerCount <= 1) {
        throw new BadRequestException('تنها مالک فروشگاه قابل حذف نیست.');
      }
    }

    try {
      const result = await this.userRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException('کاربر مورد نظر یافت نشد.');
      }
      return { message: 'کاربر با موفقیت حذف شد.', archived: false };
    } catch (error: any) {
      // If orders or promotion usages reference this user, soft-delete so history stays intact.
      if (error?.code === '23503') {
        await this.userRepository.softDelete(id);
        return {
          message:
            'کاربر دارای سوابق سفارش است و به‌صورت امن بایگانی (حذف نرم) شد.',
          archived: true,
        };
      }
      throw error;
    }
  }

  async bulkDeleteUsers(ids: number[], currentUserId?: number) {
    const uniqueIds = [...new Set(ids)];
    let deleted = 0;
    let archived = 0;
    const errors: Array<{ id: number; message: string }> = [];

    for (const id of uniqueIds) {
      try {
        const res = await this.deleteUser(id, currentUserId);
        if (res.archived) archived++;
        else deleted++;
      } catch (err: any) {
        errors.push({
          id,
          message: err?.message || 'خطا در حذف کاربر',
        });
      }
    }

    return {
      deleted,
      archived,
      failed: errors.length,
      errors,
      message: `${deleted + archived} کاربر با موفقیت پردازش شد.`,
    };
  }
}
