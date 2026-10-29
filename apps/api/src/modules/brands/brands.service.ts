import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBrandDto } from './dtos/create-brand.dto';
import { UpdateBrandDto } from './dtos/update-brand.dto';
import { generateSlug } from 'src/common/utils/slug.helper';

import { Products } from '../products/entities/products.entity';
import {
  buildPagination,
  buildSearchWhereClause,
} from 'src/common/utils/pagination.helper';
import { Brands } from './entities/brands.entity';
import { SubBrands } from './entities/sub-brands.entity';
import { MediaOwnerType } from '../media/enums/media-owner-type.enum';
import { MediaStaticService } from '../media/media-static.service';

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brands)
    private readonly brandRepo: Repository<Brands>,

    @InjectRepository(SubBrands)
    private readonly subBrandRepo: Repository<SubBrands>,

    @InjectRepository(Products)
    private readonly productRepo: Repository<Products>,
    private readonly mediaService: MediaStaticService,
  ) {}

  async create(dto: CreateBrandDto) {
    const finalSlug =
      dto.slug && dto.slug.trim() !== ''
        ? generateSlug(dto.slug)
        : generateSlug(dto.name);

    const existing = await this.brandRepo.findOne({
      where: { slug: finalSlug },
    });
    if (existing) {
      throw new ConflictException(
        'اسلاگ (Slug) تکراری است. لطفا مقدار دیگری انتخاب کنید.',
      );
    }

    const brand = this.brandRepo.create({
      name: dto.name,
      slug: finalSlug,
      logo: dto.logo,
      description: dto.description,
    });

    const saved = await this.brandRepo.save(brand);

    // ۱. پیوند دادن لوگوی آپلود شده به این برند در جدول مدیا
    if (dto.logo) {
      await this.mediaService.reassignOwner(
        [dto.logo],
        MediaOwnerType.BRAND_LOGO,
        String(saved.id),
      );
    }

    // ۲. مدیریت ساب‌برندها
    if (
      dto.subBrands &&
      Array.isArray(dto.subBrands) &&
      dto.subBrands.length > 0
    ) {
      const subBrandEntities = dto.subBrands.map((sb: any) => {
        const sbName = typeof sb === 'string' ? sb : sb.name;
        return this.subBrandRepo.create({
          name: sbName,
          slug: generateSlug(sbName),
          brand: saved,
        });
      });

      await this.subBrandRepo.save(subBrandEntities);
    }

    return {
      message: 'برند با موفقیت ایجاد شد.',
      brand: saved,
    };
  }

  async findAll(query: any) {
    const {
      page = 1,
      limit = 10,
      search = '',
      sortOrder = 'DESC',
      sortBy = 'id',
    } = query;
    const searchableFields = ['name'];
    const where = buildSearchWhereClause(search, searchableFields);
    const [data, total] = await this.brandRepo.findAndCount({
      relations: {
        // products: true,
        subBrands: true,
      },
      where,
      take: +limit,
      skip: (+page - 1) * +limit,
      order: { [sortBy]: sortOrder.toUpperCase() },
    });

    return buildPagination([data, total], page, limit, 'brands');
  }

  findOne(id: number) {
    return this.brandRepo.findOne({
      where: { id },
      relations: {
        // products: true,
        subBrands: true,
      },
    });
  }

  async remove(id: number) {
    const brand = await this.findOne(id);
    if (!brand) throw new NotFoundException('برند یافت نشد');

    // ۱. حذف فایل‌های فیزیکی و رکوردهای مدیا مربوط به لوگوی این برند
    await this.mediaService.deleteByOwner(
      MediaOwnerType.BRAND_LOGO,
      String(brand.id),
    );

    // ۲. حذف خود انتیتی برند از دیتابیس
    await this.brandRepo.remove(brand);

    return {
      message: 'برند با موفقیت حذف شد.',
    };
  }

  async update(id: number, dto: UpdateBrandDto) {
    const brand = await this.brandRepo.findOne({ where: { id } });
    if (!brand) throw new NotFoundException('برند مورد نظر یافت نشد');

    let finalSlug = brand.slug;
    if (dto.slug && dto.slug.trim() !== '' && dto.slug !== brand.slug) {
      finalSlug = generateSlug(dto.slug);
      const existingSlug = await this.brandRepo.findOne({
        where: { slug: finalSlug },
      });
      if (existingSlug) {
        throw new ConflictException('اسلاگ وارد شده تکراری است.');
      }
    }

    const oldLogo = brand.logo;
    const newLogo = dto.logo !== undefined ? dto.logo : brand.logo;

    // ۱. مدیریت فایل‌های لوگو در صورت تغییر یا حذف لوگو
if (dto.logo !== undefined && dto.logo !== oldLogo) {
  // فقط و فقط آدرس عکس قبلی را پاک کن، نه کل رکوردهای برند را!
  if (oldLogo) {
    await this.mediaService.deleteByUrls([oldLogo]).catch(() => {});
  }

  // انتساب مالکیت برای لوگوی جدید
  if (newLogo) {
    await this.mediaService.reassignOwner(
      [newLogo],
      MediaOwnerType.BRAND_LOGO,
      String(brand.id),
    ).catch(() => {});
  }
}

    // ۲. آپدیت انتیتی برند
    Object.assign(brand, {
      name: dto.name ?? brand.name,
      slug: finalSlug,
      logo: newLogo,
      description:
        dto.description !== undefined ? dto.description : brand.description,
    });

    const saved = await this.brandRepo.save(brand);

    // ۳. مدیریت ساب‌برندها
    if (dto.subBrands && Array.isArray(dto.subBrands)) {
      const existing = await this.subBrandRepo.find({
        where: { brand: { id: brand.id } },
      });

      const toDelete = existing.filter(
        (e: any) => !dto.subBrands?.includes(e.name),
      );

      const toAdd = dto.subBrands.filter(
        (sb: string) => !existing.some((e: any) => e.name === sb),
      );

      if (toDelete.length > 0) {
        for (const sb of toDelete) {
          const hasProducts = await this.productRepo.count({
            where: { subBrand: { id: sb.id } },
          });
          if (hasProducts > 0) {
            throw new BadRequestException(
              `زیر برند ${sb.name} محصول دارد و قابل حذف نیست.`,
            );
          }
        }
        await this.subBrandRepo.remove(toDelete);
      }

      if (toAdd.length > 0) {
        const newSubs = toAdd.map((sb: string) =>
          this.subBrandRepo.create({
            name: sb,
            slug: generateSlug(sb),
            brand,
          }),
        );
        await this.subBrandRepo.save(newSubs);
      }
    }

    return {
      message: 'برند با موفقیت ویرایش شد.',
      brand: saved,
    };
  }
}
