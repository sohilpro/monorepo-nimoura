import {
  BadRequestException,
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
import {
  buildPagination,
  buildSearchWhereClause,
} from 'src/common/utils/pagination.helper'; // مسیر هلپر پجینیشن
import { WishlistService } from 'src/modules/wishlist/wishlist.service'; // مسیر سرویس ویش‌لیست
import { Users } from './entities/users.entity';

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
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: {
        addresses: true,
        orders: true,
      },
    });

    if (!user) {
      throw new NotFoundException('کاربر یافت نشد.');
    }

    const { password, addresses, orders, ...safeUser } = user;
    
    // دریافت تعداد آیتم‌های علاقه‌مندی در صورت وجود ماژول
    const wishlistCount = this.wishlistService
      ? await this.wishlistService.count(userId)
      : 0;

    return {
      profile: safeUser,
      stats: {
        ordersCount: orders?.length ?? 0,
        addressesCount: addresses?.length ?? 0,
        wishlistCount,
      },
    };
  }

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) throw new NotFoundException('کاربر یافت نشد.');

    // بررسی یکتایی ایمیل در صورت تغییر
    if (dto.email && dto.email !== user.email) {
      const existing = await this.userRepository.findOne({
        where: { email: dto.email },
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
    if (dto.identity_card !== undefined && dto.identity_card !== user.identity_card) {
      const existingUser = await this.userRepository.findOne({
        where: { identity_card: dto.identity_card },
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
    });
    if (existingMobile) {
      throw new ConflictException('کاربری با این شماره موبایل قبلاً ثبت‌نام کرده است.');
    }

    if (dto.email) {
      const existingEmail = await this.userRepository.findOne({
        where: { email: dto.email },
      });
      if (existingEmail) {
        throw new ConflictException('این ایمیل قبلاً ثبت شده است.');
      }
    }

    if (dto.identity_card) {
      const existingId = await this.userRepository.findOne({
        where: { identity_card: dto.identity_card },
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
    const { password, ...safeUser } = saved;

    return {
      message: 'کاربر با موفقیت ایجاد شد.',
      user: safeUser,
    };
  }

  async getUsers(query: any) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
    const search = (query.search || '').trim();
    const sortOrder =
      String(query.sortOrder || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const allowedSortFields = ['id', 'createdAt', 'first_name', 'last_name', 'mobile', 'email'];
    const sortBy = allowedSortFields.includes(query.sortBy) ? query.sortBy : 'id';

    const searchableFields = ['first_name', 'last_name', 'email', 'mobile'];
    const where = search ? buildSearchWhereClause(search, searchableFields) : {};

    const [data, total] = await this.userRepository.findAndCount({
      where,
      take: limit,
      skip: (page - 1) * limit,
      order: { [sortBy]: sortOrder },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        mobile: true,
        role: true,
        verify_email: true,
        verify_mobile: true,
        identity_card: true,
        createdAt: true,
      },
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
      relations: {
        addresses: true,
        comments: true,
        orders: true,
      },
    });

    if (!user) throw new NotFoundException('کاربر مورد نظر یافت نشد.');
    
    const { password, ...safeUser } = user;
    return safeUser;
  }

  async updateUser(id: number, dto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('کاربر یافت نشد.');

    // بررسی یکتایی ایمیل
    if (dto.email && dto.email !== user.email) {
      const emailExists = await this.userRepository.findOne({
        where: { email: dto.email },
      });
      if (emailExists) throw new ConflictException('ایمیل تکراری است.');
      user.email = dto.email;
      user.verify_email = false;
    }

    // بررسی یکتایی موبایل
    if (dto.mobile && dto.mobile !== user.mobile) {
      const mobileExists = await this.userRepository.findOne({
        where: { mobile: dto.mobile },
      });
      if (mobileExists) throw new ConflictException('شماره موبایل تکراری است.');
      user.mobile = dto.mobile;
      user.verify_mobile = false;
    }

    // بررسی یکتایی کدملی
    if (dto.identity_card !== undefined && dto.identity_card !== user.identity_card) {
      const idExists = await this.userRepository.findOne({
        where: { identity_card: dto.identity_card },
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