import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Categories } from '../categories/entities/categories.entity';
import { Products } from '../products/entities/products.entity';
import { PromotionUsages } from './entities/promotion-usages.entity';
import { Promotions, PromotionType } from './entities/promotion.entity';
import { Brands } from '../brands/entities/brands.entity';
import { ApplyDiscountDto } from './dtos/apply-discount.dto';
import { CreatePromotionDto } from './dtos/create-promotion.dto';
import {
  buildPagination,
  buildSearchWhereClause,
  ListQuery,
  toSortDirection,
} from 'src/common/utils/pagination.helper';
import { UpdatePromotionDto } from './dtos/update-promotion.dto';
import { calculateDiscountAmount } from './utils/apply-discount';

@Injectable()
export class PromotionsService {
  constructor(
    @InjectRepository(Promotions)
    private promoRepo: Repository<Promotions>,
    @InjectRepository(PromotionUsages)
    private usageRepo: Repository<PromotionUsages>,
    @InjectRepository(Products)
    private productRepo: Repository<Products>,
    @InjectRepository(Categories)
    private categoryRepo: Repository<Categories>,
    @InjectRepository(Brands)
    private brandRepo: Repository<Brands>,
  ) {}

  async applyDiscountToCart(dto: ApplyDiscountDto, userId: number) {
    const { promoCode, cartTotal } = dto;

    const promo = await this.promoRepo.findOne({
      where: { promoCode, isActive: true },
      select: {
        id: true,
        type: true,
        amount: true,
        promoCode: true,
        startDate: true,
        endDate: true,
        isActive: true,
        maxTotalUses: true,
        maxUsesPerUser: true,
        minOrderAmount: true,
        totalUsed: true,
        maxAmount: true,
      },
      loadEagerRelations: false,
    });

    if (!promo) throw new BadRequestException('کد تخفیف نامعتبر است');

    const now = new Date();
    if (promo.startDate > now || promo.endDate < now)
      throw new BadRequestException('تاریخ کد تخفیف منقضی شده است');

    if (promo.minOrderAmount && cartTotal < promo.minOrderAmount)
      throw new BadRequestException(
        `حداقل مبلغ سفارش ${promo.minOrderAmount} تومان است`,
      );

    if (promo.maxTotalUses && promo.totalUsed >= promo.maxTotalUses)
      throw new BadRequestException('ظرفیت استفاده از کد تخفیف تمام شده');

    const allowedCheck = await this.promoRepo
      .createQueryBuilder('p')
      .innerJoin('p.allowedUsers', 'u')
      .select('COUNT(u.id)', 'total')
      .addSelect('COUNT(CASE WHEN u.id = :userId THEN 1 END)', 'matched')
      .where('p.id = :promoId', { promoId: promo.id })
      .setParameter('userId', userId)
      .getRawOne<{ total: string; matched: string }>();

    if (
      Number(allowedCheck?.total ?? 0) > 0 &&
      Number(allowedCheck?.matched ?? 0) === 0
    )
      throw new BadRequestException('این کد برای شما مجاز نیست');

    const usage = await this.usageRepo.findOne({
      where: { promotion: { id: promo.id }, user: { id: userId } },
      select: { id: true, usedCount: true },
      loadEagerRelations: false,
    });

    if (
      promo.maxUsesPerUser &&
      (usage?.usedCount as any) >= promo.maxUsesPerUser
    )
      throw new BadRequestException('سقف استفاده شما از این کد تمام شده');

    const discountAmount = calculateDiscountAmount(promo, cartTotal);

    return {
      discountAmount,
      finalTotal: cartTotal - discountAmount,
      promotionId: promo.id,
      message: 'کد تخفیف اعمال شد.',
    };
  }

  // Admin
  async create(dto: CreatePromotionDto) {
    const promoCode = (dto.promoCode || dto.code || '').trim() || undefined;
    const type = (dto.type || (dto.discountType === 'percentage' ? PromotionType.PERCENTAGE : PromotionType.FIXED)) as PromotionType;
    const amount = Number(dto.amount ?? dto.discountValue ?? 0);
    const title = dto.title || (promoCode ? `کد تخفیف ${promoCode}` : 'تخفیف ویژه');
    const maxTotalUses = Number(dto.maxTotalUses ?? dto.usageLimit ?? 0);
    const maxUsesPerUser = Number(dto.maxUsesPerUser ?? dto.usageLimitPerUser ?? 0);
    const minOrderAmount = Number(dto.minOrderAmount ?? 0);
    const maxAmount = (dto.maxAmount ?? dto.maxDiscountAmount) ? Number(dto.maxAmount ?? dto.maxDiscountAmount) : undefined;
    const isPublic = dto.isPublic !== undefined ? Boolean(dto.isPublic) : true;
    const isActive = dto.isActive !== undefined ? Boolean(dto.isActive) : true;

    const promo = this.promoRepo.create({
      ...dto,
      title,
      type,
      amount,
      promoCode,
      maxTotalUses,
      maxUsesPerUser,
      minOrderAmount,
      maxAmount,
      isPublic,
      isActive,
      startDate: dto.startDate ? new Date(dto.startDate) : new Date(),
      endDate: dto.endDate ? new Date(dto.endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    if (dto.productIds?.length) {
      promo.products = await this.productRepo.find({
        where: { id: In(dto.productIds) },
        select: { id: true },
        loadEagerRelations: false,
      });
    }
    if (dto.categoryIds?.length) {
      promo.categories = await this.categoryRepo.find({
        where: { id: In(dto.categoryIds) },
        select: { id: true },
        loadEagerRelations: false,
      });
    }

    if (dto.brandIds?.length) {
      promo.brands = await this.brandRepo.find({
        where: { id: In(dto.brandIds) },
        select: { id: true },
        loadEagerRelations: false,
      });
    }

    return this.promoRepo.save(promo);
  }

  async findAll(query: any) {
    const page = Math.max(1, Number(query?.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query?.limit) || 10));
    const search = (query?.search || '').trim();
    const sortDir = String(query?.sortOrder || query?.sortDir || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const validSortFields = ['id', 'createdAt', 'title', 'amount', 'startDate', 'endDate', 'totalUsed', 'promoCode'];
    const rawSort = query?.sortBy || query?.sort || 'id';
    const sortBy = rawSort === 'created_at' ? 'createdAt' : (validSortFields.includes(rawSort) ? rawSort : 'id');

    const qb = this.promoRepo.createQueryBuilder('promo');

    if (search) {
      qb.andWhere('(promo.title ILIKE :search OR promo.promoCode ILIKE :search)', {
        search: `%${search}%`,
      });
    }

    if (query?.isActive !== undefined && query?.isActive !== null && query?.isActive !== '') {
      const isActive = query.isActive === true || query.isActive === 'true' || query.isActive === 1 || query.isActive === '1';
      qb.andWhere('promo.isActive = :isActive', { isActive });
    }

    if (query?.type) {
      qb.andWhere('promo.type = :type', { type: query.type });
    }

    qb.orderBy(`promo.${sortBy}`, sortDir);
    qb.skip((page - 1) * limit);
    qb.take(limit);

    const [data, total] = await qb.getManyAndCount();

    const pagination = buildPagination([data, total], page, limit, 'promotions');
    return {
      ...pagination,
      items: data, // provide both 'promotions' and 'items' for frontend compatibility
    };
  }

  findOne(id: number) {
    return this.promoRepo.findOne({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        amount: true,
        promoCode: true,
        startDate: true,
        endDate: true,
        isPublic: true,
        isActive: true,
        maxTotalUses: true,
        maxUsesPerUser: true,
        minOrderAmount: true,
        totalUsed: true,
        maxAmount: true,
        createdAt: true,
        updatedAt: true,
        products: { id: true, title: true },
        categories: { id: true, name: true },
        brands: { id: true, name: true },
      },
      relations: {
        products: true,
        categories: true,
        brands: true,
      },
      loadEagerRelations: false,
    });
  }

  async update(id: number, dto: any) {
    const promo = await this.promoRepo.findOne({
      where: { id },
      loadEagerRelations: false,
    });
    if (!promo) throw new NotFoundException('تخفیف یافت نشد');

    const type = dto.type || ((dto.discountType === 'percentage' || dto.discountType === 'PERCENTAGE') ? PromotionType.PERCENTAGE : (dto.discountType ? PromotionType.FIXED : undefined));
    const amount = (dto.amount !== undefined || dto.discountValue !== undefined) ? Number(dto.amount ?? dto.discountValue) : undefined;
    const promoCode = dto.promoCode !== undefined ? dto.promoCode : (dto.code !== undefined ? dto.code : undefined);
    const maxTotalUses = dto.maxTotalUses !== undefined ? Number(dto.maxTotalUses) : (dto.usageLimit !== undefined ? Number(dto.usageLimit) : undefined);
    const maxUsesPerUser = dto.maxUsesPerUser !== undefined ? Number(dto.maxUsesPerUser) : (dto.usageLimitPerUser !== undefined ? Number(dto.usageLimitPerUser) : undefined);
    const minOrderAmount = dto.minOrderAmount !== undefined ? Number(dto.minOrderAmount) : undefined;
    const maxAmount = dto.maxAmount !== undefined ? Number(dto.maxAmount) : (dto.maxDiscountAmount !== undefined ? Number(dto.maxDiscountAmount) : undefined);

    if (dto.title !== undefined) promo.title = dto.title;
    if (dto.description !== undefined) promo.description = dto.description;
    if (type !== undefined) promo.type = type;
    if (amount !== undefined) promo.amount = amount;
    if (promoCode !== undefined) promo.promoCode = (promoCode || '').trim();
    if (maxTotalUses !== undefined) promo.maxTotalUses = maxTotalUses;
    if (maxUsesPerUser !== undefined) promo.maxUsesPerUser = maxUsesPerUser;
    if (minOrderAmount !== undefined) promo.minOrderAmount = minOrderAmount;
    if (maxAmount !== undefined) promo.maxAmount = maxAmount;
    if (dto.isPublic !== undefined) promo.isPublic = Boolean(dto.isPublic);

    if (dto.startDate) promo.startDate = new Date(dto.startDate);
    if (dto.endDate) promo.endDate = new Date(dto.endDate);

    if (dto.isActive !== undefined) {
      promo.isActive = Boolean(dto.isActive);
    } else {
      const now = new Date();
      if (promo.endDate && promo.endDate < now) {
        promo.isActive = false;
      } else if (promo.startDate && promo.startDate <= now) {
        promo.isActive = true;
      }
    }

    if (dto.productIds) {
      promo.products = await this.productRepo.find({
        where: { id: In(dto.productIds) },
        select: { id: true },
        loadEagerRelations: false,
      });
    }

    if (dto.categoryIds) {
      promo.categories = await this.categoryRepo.find({
        where: { id: In(dto.categoryIds) },
        select: { id: true },
        loadEagerRelations: false,
      });
    }

    if (dto.brandIds) {
      promo.brands = await this.brandRepo.find({
        where: { id: In(dto.brandIds) },
        select: { id: true },
        loadEagerRelations: false,
      });
    }

    return this.promoRepo.save(promo);
  }

  async remove(id: number) {
    const promo = await this.promoRepo.findOneBy({ id });
    if (!promo) throw new NotFoundException();
    return this.promoRepo.remove(promo);
  }

  async getUsages(promotionId: number, page: number = 1, limit: number = 20) {
    const [items, total] = await this.usageRepo.findAndCount({
      where: { promotion: { id: promotionId } },
      relations: { user: true },
      order: { id: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }
}
