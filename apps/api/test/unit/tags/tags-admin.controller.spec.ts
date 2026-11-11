import 'reflect-metadata';
import { describe, it, expect, vi } from 'vitest';
import { plainToInstance } from 'class-transformer';
import { TagsAdminController } from '../../../src/modules/tags/controllers/tags-admin.controller';
import { ProductResponseDto } from '../../../src/modules/products/dtos/product-response.dto';
import { ProductsService } from '../../../src/modules/products/products.service';
import { Tags } from '../../../src/modules/tags/entities/tags.entity';
import { TagGroups } from '../../../src/modules/tags/entities/tag-groups.entity';

describe('TagsAdminController & Product Tags Serialization', () => {
  it('listGroups delegates to listForAdmin by default and listPublic when includeEmpty/includeTags is set', async () => {
    const groupsService = {
      listForAdmin: vi.fn().mockResolvedValue([{ id: 1, tagCount: 3 }]),
      listPublic: vi
        .fn()
        .mockResolvedValue([{ id: 1, tags: [{ id: 10, name: 'چهار فصل' }] }]),
    };
    const controller = new TagsAdminController(groupsService as any, {} as any);

    await expect(controller.listGroups()).resolves.toEqual([
      { id: 1, tagCount: 3 },
    ]);
    expect(groupsService.listForAdmin).toHaveBeenCalledTimes(1);

    await expect(controller.listGroups(undefined, 'true')).resolves.toEqual([
      { id: 1, tags: [{ id: 10, name: 'چهار فصل' }] },
    ]);
    expect(groupsService.listPublic).toHaveBeenCalledWith({
      includeEmpty: true,
    });

    await controller.listGroups('true', undefined);
    expect(groupsService.listPublic).toHaveBeenCalledWith({
      includeEmpty: false,
    });

    await controller.listGroupOptions();
    expect(groupsService.listPublic).toHaveBeenLastCalledWith({
      includeEmpty: true,
    });
  });

  it('ProductResponseDto keeps active tags with group metadata and filters inactive ones', () => {
    const activeGroup = Object.assign(new TagGroups(), {
      id: 9,
      name: 'مناسب فصل',
      slug: 'season',
      isActive: true,
    });
    const inactiveGroup = Object.assign(new TagGroups(), {
      id: 10,
      name: 'مخفی',
      slug: 'hidden',
      isActive: false,
    });

    const activeTag = Object.assign(new Tags(), {
      id: 11,
      name: 'چهار فصل',
      slug: 'چهار-فصل',
      color: null,
      isActive: true,
      group: activeGroup,
    });
    const inactiveTag = Object.assign(new Tags(), {
      id: 12,
      name: 'غیرفعال',
      slug: 'inactive',
      color: null,
      isActive: false,
      group: activeGroup,
    });
    const tagInInactiveGroup = Object.assign(new Tags(), {
      id: 13,
      name: 'تگ گروه غیرفعال',
      slug: 'in-hidden',
      color: null,
      isActive: true,
      group: inactiveGroup,
    });

    const dto = plainToInstance(
      ProductResponseDto,
      {
        id: 11,
        title: 'ریمل',
        slug: 'mascara',
        sku: 'SKU-1',
        type: 'simple',
        price: 100,
        priceDiscount: 0,
        percentageDiscount: 0,
        stock: 10,
        isAvailable: true,
        isAmazingOffer: false,
        averageRating: 0.5,
        ratingsCount: 0,
        specifications: [],
        images: [],
        variants: [],
        tags: [activeTag, inactiveTag, tagInInactiveGroup],
      },
      { excludeExtraneousValues: true },
    );

    expect(dto.tags).toEqual([
      {
        id: 11,
        name: 'چهار فصل',
        slug: 'چهار-فصل',
        color: null,
        group: { id: 9, name: 'مناسب فصل', slug: 'season' },
      },
    ]);
  });

  it('ProductsService.findBySlug loads tags with group and images', async () => {
    const productRepo = {
      findOne: vi
        .fn()
        .mockResolvedValue({ id: 11, slug: 'mascara', tags: [], images: [] }),
    } as any;

    const service = new ProductsService(
      productRepo,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
    );

    await service.findBySlug('mascara');

    const call = productRepo.findOne.mock.calls[0][0];
    expect(call.relations.tags).toEqual({ group: true });
    expect(call.relations.images).toBe(true);
    expect(call.select.tags).toBeDefined();
    expect(call.select.images).toBeDefined();
  });
});
