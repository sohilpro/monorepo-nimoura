// src/modules/products/controllers/admin-products.controller.ts
import {
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseInterceptors,
  UploadedFiles,
  Query,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AdminController } from 'src/common/auth/decorators/admin-controller.decorator';
import { ProductsService } from '../products.service';
import { CreateProductDto } from '../dtos/create-product.dto';
import { UpdateProductDto } from '../dtos/update-product.dto';
import { ProductFilterQueryDto } from '../dtos/product-query.dto';
import { Products } from '../entities/products.entity';
import { ImportPricesDto } from '../dtos/import-prices.dto';
import { ProductsImportService } from '../products-import.service';

// ساختار ولیدیشن فایل‌ها (اختیاری بودن فایل‌ها در ایجاد/ویرایش)
const fileValidationPipe = new ParseFilePipe({
  validators: [
    new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // حداکثر ۵ مگابایت
    new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
  ],
  fileIsRequired: false,
});

type RawBody = Record<string, unknown>;

const isTruthyFlag = (value: unknown): boolean =>
  value === true || value === 'true' || value === '1' || value === 1;

const NUMERIC_FIELDS = [
  'price',
  'priceDiscount',
  'stock',
  'categoryId',
  'brandId',
  'subBrandId',
  'lowStockThreshold',
] as const;

/**
 * تبدیل فیلدهای رشته‌ای فرم multipart/form-data به آبجکت و نوع‌های واقعی
 */
function transformMultipartBody<T>(rawBody: object): T {
  const payload: RawBody = { ...rawBody };

  const jsonFields = [
    'specifications',
    'variants',
    'tags',
    'tagIds',
    'imagesToDelete',
    'attributes',
    'bundleItems',
  ];

  for (const field of jsonFields) {
    const raw = payload[field];
    if (typeof raw === 'string' && raw.trim()) {
      try {
        payload[field] = JSON.parse(raw);
      } catch {
        // در صورت عدم تطابق با JSON مقدار تغییر نمی‌کند تا پایپ ولیدیشن متوجه شود
      }
    }
  }

  // فلگ‌های بولی
  if (payload.removeOldThumbnail !== undefined) {
    payload.removeOldThumbnail =
      payload.removeOldThumbnail === 'true' ||
      payload.removeOldThumbnail === true;
  }

  if (payload.isAmazingOffer !== undefined) {
    payload.isAmazingOffer = isTruthyFlag(payload.isAmazingOffer);
  }

  if (payload.isAvailable !== undefined) {
    payload.isAvailable = isTruthyFlag(payload.isAvailable);
  }

  // تبدیل فیلدهای عددی پایه
  for (const field of NUMERIC_FIELDS) {
    if (payload[field] !== undefined) payload[field] = Number(payload[field]);
  }

  return payload as T;
}

@AdminController('products') // مسیر نهایی: /api/v1/admin/products
export class AdminProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly productsImportService: ProductsImportService,
  ) {}

  @Get('export')
  @ApiOperation({ summary: 'دریافت لیست تمام محصولات برای اکسپورت' })
  @ApiResponse({ status: 200, description: 'لیست محصولات', type: [Products] })
  async exportAll() {
    return await this.productsService.exportAll();
  }

  @Post('import-prices')
  async importPrices(@Body() dto: ImportPricesDto) {
    return await this.productsImportService.importPrices(dto);
  }

  @Post()
  @ApiOperation({ summary: 'ایجاد محصول جدید به همراه تصویر و گالری' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: 'محصول با موفقیت ایجاد شد',
    type: Products,
  })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'thumbnail', maxCount: 1 },
      { name: 'images', maxCount: 8 },
    ]),
  )
  async create(
    @UploadedFiles(fileValidationPipe)
    files: {
      thumbnail?: Express.Multer.File[];
      images?: Express.Multer.File[];
    },
    @Body() dto: CreateProductDto,
  ) {
    const formattedDto = transformMultipartBody<CreateProductDto>(dto);
    return await this.productsService.create(
      formattedDto,
      files?.thumbnail?.[0],
      files?.images || [],
    );
  }

  @Get()
  @ApiOperation({ summary: 'دریافت لیست تمام محصولات برای مدیریت' })
  @ApiResponse({ status: 200, description: 'لیست محصولات', type: [Products] })
  async findAll(@Query() query: ProductFilterQueryDto) {
    return await this.productsService.findAllForAdmin(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'دریافت جزئیات کامل محصول جهت ویرایش' })
  @ApiParam({ name: 'id', type: Number, description: 'شناسه محصول' })
  @ApiResponse({ status: 200, description: 'اطلاعات محصول', type: Products })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.productsService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'ویرایش مشخصات، تصاویر و واریانت‌های محصول' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', type: Number, description: 'شناسه محصول' })
  @ApiResponse({
    status: 200,
    description: 'محصول با موفقیت ویرایش شد',
    type: Products,
  })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'thumbnail', maxCount: 1 },
      { name: 'images', maxCount: 8 },
    ]),
  )
  async update(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles(fileValidationPipe)
    files: {
      thumbnail?: Express.Multer.File[];
      images?: Express.Multer.File[];
    },
    @Body() dto: UpdateProductDto,
  ) {
    const formattedDto = transformMultipartBody<UpdateProductDto>(dto);
    return await this.productsService.update(
      id,
      formattedDto,
      files?.thumbnail?.[0],
      files?.images || [],
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف کامل محصول و تصاویر آن از هاست' })
  @ApiParam({ name: 'id', type: Number, description: 'شناسه محصول' })
  @ApiResponse({ status: 200, description: 'محصول با موفقیت حذف شد' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.productsService.remove(id);
  }
}
