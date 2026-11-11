import {
  ConflictException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { buildSearchWhereClause } from 'src/common/utils/pagination.helper';
import { WishlistService } from 'src/modules/wishlist/wishlist.service'; // مسیر سرویس ویش‌لیست
import { Addresses } from './addresses/entities/addresses.entity';
import { Orders } from 'src/modules/orders/entities/orders.entity';
import { Users } from './entities/users.entity';

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
      select: { id: true },
      loadEagerRelations: false,
    });
    if (existingMobile) {
      throw new ConflictException(
        'کاربری با این شماره موبایل قبلاً ثبت‌نام کرده است.',
      );
    }

    if (dto.email) {
      const existingEmail = await this.userRepository.findOne({
        where: { email: dto.email },
        select: { id: true },
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
      role: dto.role,
      identity_card: dto.identity_card,
      verify_mobile: true,
      verify_email: !!dto.email,
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

  async getUsers(query: any) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
    const search = (query.search || '').trim();
    const sortOrder =
      String(query.sortOrder || 'DESC').toUpperCase() === 'ASC'
        ? 'ASC'
        : 'DESC';
    const allowedSortFields = [
      'id',
      'createdAt',
      'first_name',
      'last_name',
      'mobile',
      'email',
    ];
    const sortBy = allowedSortFields.includes(query.sortBy)
      ? query.sortBy
      : 'id';

    const searchableFields = ['first_name', 'last_name', 'email', 'mobile'];
    const where = search
      ? buildSearchWhereClause(search, searchableFields)
      : {};

    const [data, total] = await this.userRepository.findAndCount({
      where,
      take: limit,
      skip: (page - 1) * limit,
      order: { [sortBy]: sortOrder },
      select: USER_PUBLIC_SELECT,
      loadEagerRelations: false,
    });

    const totalPages = Math.ceil(total / limit);
    return {
      items: data,
      users: data,
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
      },
      loadEagerRelations: false,
    });
    if (!user) throw new NotFoundException('کاربر یافت نشد.');

    // بررسی یکتایی ایمیل
    if (dto.email && dto.email !== user.email) {
      const emailExists = await this.userRepository.findOne({
        where: { email: dto.email },
        select: { id: true },
        loadEagerRelations: false,
      });
      if (emailExists) throw new ConflictException('ایمیل تکراری است.');
      user.email = dto.email;
      user.verify_email = false;
    }

    // بررسی یکتایی موبایل
    if (dto.mobile && dto.mobile !== user.mobile) {
      const mobileExists = await this.userRepository.findOne({
        where: { mobile: dto.mobile },
        select: { id: true },
        loadEagerRelations: false,
      });
      if (mobileExists) throw new ConflictException('شماره موبایل تکراری است.');
      user.mobile = dto.mobile;
      user.verify_mobile = false;
    }

    // بررسی یکتایی کدملی
    if (
      dto.identity_card !== undefined &&
      dto.identity_card !== user.identity_card
    ) {
      const idExists = await this.userRepository.findOne({
        where: { identity_card: dto.identity_card },
        select: { id: true },
        loadEagerRelations: false,
      });
      if (idExists && idExists.id !== user.id) {
        throw new ConflictException('کد ملی تکراری است.');
      }
      user.identity_card = dto.identity_card;
    }

    if (dto.password) {
      user.password = await bcrypt.hash(dto.password, 10);
    }

    if (dto.role) user.role = dto.role;
    if (dto.first_name !== undefined) user.first_name = dto.first_name;
    if (dto.last_name !== undefined) user.last_name = dto.last_name;

    await this.userRepository.save(user);
    return { message: 'کاربر با موفقیت بروزرسانی شد.' };
  }

  async deleteUser(id: number) {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('کاربر مورد نظر یافت نشد.');
    }
    return { message: 'کاربر با موفقیت حذف شد.' };
  }
}
