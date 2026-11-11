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
import { Promotions } from './entities/promotion.entity';
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
    const promo = this.promoRepo.create(dto);

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

  async findAll(query: ListQuery) {
    const {
      page = 1,
      limit = 10,
      search = '',
      sortOrder = 'DESC',
      sortBy = 'id',
    } = query;
    const searchableFields = ['title'];
    const where = buildSearchWhereClause(search, searchableFields);
    const [data, total] = await this.promoRepo.findAndCount({
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
      },
      where,
      take: +limit,
      skip: (+page - 1) * +limit,
      order: { [sortBy]: toSortDirection(sortOrder) },
      loadEagerRelations: false,
    });
    return buildPagination([data, total], page, limit, 'promotions');
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

  async update(id: number, dto: UpdatePromotionDto) {
    const promo = await this.promoRepo.findOne({
      where: { id },
      loadEagerRelations: false,
    });
    if (!promo) throw new NotFoundException();

    Object.assign(promo, dto);

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

    const now = new Date();

    const startDate = dto.startDate ? new Date(dto.startDate) : promo.startDate;
    const endDate = dto.endDate ? new Date(dto.endDate) : promo.endDate;

    if (endDate < now) {
      // اگر تاریخ پایان گذشته باشه → غیرفعال
      promo.isActive = false;
    } else if (startDate <= now) {
      // اگر تاریخ شروع الان یا قبلش باشه → فعال
      promo.isActive = true;
    } else {
      // اگر تاریخ شروع هنوز نیومده باشه → غیرفعال
      promo.isActive = false;
    }

    return this.promoRepo.save(promo);
  }

  async remove(id: number) {
    const promo = await this.promoRepo.findOneBy({ id });
    if (!promo) throw new NotFoundException();
    return this.promoRepo.remove(promo);
  }
}
