// src/modules/products/controllers/products.controller.ts
import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import {
  ProductFilterQueryDto,
  PaginationQueryDto,
} from '../dtos/product-query.dto';
import { ProductResponseDto } from '../dtos/product-response.dto';
import { plainToInstance } from 'class-transformer';
import { Public } from 'src/common/auth/auth.decorators';
import { ProductsService } from '../products.service';
import { ProductFacetsService } from '../product-facets.service';
import { parseBool } from '../product-listing-filters.service';

@ApiTags('Store - Products')
@Public() // دسترسی آزاد و بدون نیاز به توکن برای تمام متدهای این کنترلر
@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly facetsService: ProductFacetsService,
  ) {}

  @Get('catalog')
  @ApiOperation({ summary: 'کاتالوگ: همه محصولات فعال با صفحه‌بندی و فیلتر' })
  async getCatalog(@Query() query: ProductFilterQueryDto) {
    const result = await this.productsService.findAllActive(query);
    return {
      ...result,
      products: plainToInstance(ProductResponseDto, result.products, {
        excludeExtraneousValues: true,
      }),
    };
  }

  @Get('catalog/filters')
  @ApiOperation({
    summary: 'دسته‌بندی‌ها و برندهای دارای محصول فعال (برای فیلتر کاتالوگ)',
  })
  async getCatalogFilters() {
    return this.productsService.getCatalogFilters();
  }

  @Get('catalog/facets')
  @ApiOperation({
    summary: 'داده‌های فیلتر سایدبار: گروه‌های تگ با تعداد محصول، بازه قیمت و شمارنده‌ها',
  })
  async getFacets(@Query() query: ProductFilterQueryDto) {
    return this.facetsService.getFacets({
      search: query.search,
      brandId: query.brandId,
      subBrandId: query.subBrandId,
      categoryId: query.categoryId,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
      inStock: parseBool(query.inStock) || parseBool(query.isAvailable),
      onSale: query.onSale,
      tagIds: query.tags,
    });
  }

  @Get('catalog/wholesale')
  @ApiOperation({
    summary: 'همه‌ی محصولات دارای قیمت عمده (برای دیالوگ قیمت‌های عمده)',
  })
  async getWholesale(@Query() query: PaginationQueryDto) {
    const result = await this.productsService.findWholesale(query);
    return {
      ...result,
      products: plainToInstance(ProductResponseDto, result.products, {
        excludeExtraneousValues: true,
      }),
    };
  }

  @Get('amazing')
  @ApiOperation({ summary: 'دریافت محصولات شگفت‌انگیز / تخفیف‌دار' })
  async getAmazingOffers(@Query() query: PaginationQueryDto) {
    const result = await this.productsService.findAmazing(query);
    return {
      ...result,
      products: plainToInstance(ProductResponseDto, result.products, {
        excludeExtraneousValues: true,
      }),
    };
  }

  @Get('brand/:id')
  @ApiOperation({ summary: 'دریافت محصولات یک برند خاص یا ساب‌برندهای آن' })
  @ApiParam({
    name: 'id',
    description: 'شناسه عددی (ID) یا اسلاگ برند (مانند hl)',
    type: String,
  })
  async getProductsByBrand(
    @Param('id') brandIdentifier: string,
    @Query() query: ProductFilterQueryDto,
  ) {
    const result = await this.productsService.findByBrand(
      brandIdentifier,
      query,
    );

    return {
      ...result,
      products: plainToInstance(ProductResponseDto, result.products, {
        excludeExtraneousValues: true,
      }),
    };
  }

  @Get('category/:id')
  @ApiOperation({ summary: 'دریافت محصولات یک دسته‌بندی خاص' })
  @ApiParam({ name: 'id', description: 'شناسه دسته‌بندی' })
  async getProductsByCategory(
    @Param('id', ParseIntPipe) categoryId: number,
    @Query() query?: ProductFilterQueryDto,
  ) {
    const result = await this.productsService.findByCategory(categoryId, query);

    return {
      ...result,
      products: plainToInstance(ProductResponseDto, result.products, {
        excludeExtraneousValues: true,
      }),
    };
  }

  @Get(':id/similar')
  @ApiOperation({ summary: 'دریافت محصولات مشابه' })
  @ApiParam({ name: 'id', description: 'شناسه محصول مرجع' })
  async getSimilarProducts(
    @Param('id', ParseIntPipe) id: number,
    @Query() pagination: PaginationQueryDto,
  ) {
    const items = await this.productsService.findSimilarProducts(
      id,
      pagination.page,
      pagination.limit,
    );
    return plainToInstance(ProductResponseDto, items, {
      excludeExtraneousValues: true,
    });
  }

  @Get(':id/related')
  @ApiOperation({ summary: 'دریافت محصولات مکمل / مرتبط' })
  @ApiParam({ name: 'id', description: 'شناسه محصول مرجع' })
  async getRelatedProducts(
    @Param('id', ParseIntPipe) id: number,
    @Query() pagination: PaginationQueryDto,
  ) {
    const items = await this.productsService.findRelatedProducts(
      id,
      pagination.page,
      pagination.limit,
    );
    return plainToInstance(ProductResponseDto, items, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  @ApiOperation({ summary: 'دریافت تمام محصولات فعال با فیلتر و صفحه‌بندی' })
  @ApiResponse({
    status: 200,
    description: 'لیست محصولات',
    type: [ProductResponseDto],
  })
  async findAll(@Query() query: ProductFilterQueryDto) {
    const result = await this.productsService.findAllActive(query);
    return {
      ...result,
      products: plainToInstance(ProductResponseDto, result.products, {
        excludeExtraneousValues: true,
      }),
    };
  }

  @Get(':slugOrId')
  @ApiOperation({ summary: 'دریافت جزئیات محصول با شناسه یا اسلاگ' })
  @ApiParam({
    name: 'slugOrId',
    description: 'شناسه عددی یا نامک (slug) محصول',
  })
  @ApiResponse({
    status: 200,
    description: 'اطلاعات کامل محصول',
    type: ProductResponseDto,
  })
  async findOne(@Param('slugOrId') slugOrId: string) {
    const product = isNaN(Number(slugOrId))
      ? await this.productsService.findBySlug(slugOrId)
      : await this.productsService.findById(Number(slugOrId));

    return plainToInstance(ProductResponseDto, product, {
      excludeExtraneousValues: true,
    });
  }
}
