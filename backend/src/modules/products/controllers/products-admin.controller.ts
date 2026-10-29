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

/**
 * تبدیل فیلدهای رشته‌ای فرم multipart/form-data به آبجکت و نوع‌های واقعی
 */
function transformMultipartBody<T>(rawBody: any): T {
  const payload = { ...rawBody };

  const jsonFields = [
    'specifications',
    'variants',
    'tags',
    'imagesToDelete',
    'attributes',
    'priceTiers', // ۱. اضافه شدن پله‌های قیمتی محصول ساده
    'bundleItems',
  ];

  for (const field of jsonFields) {
    if (typeof payload[field] === 'string' && payload[field].trim()) {
      try {
        payload[field] = JSON.parse(payload[field]);
      } catch {
        // در صورت عدم تطابق با JSON مقدار تغییر نمی‌کند تا پایپ ولیدیشن متوجه شود
      }
    }
  }

  // ۲. تمیزکاری و پارس مقادیر داخل آرایه variants در صورت ارسال تو در تو
  if (Array.isArray(payload.variants)) {
    payload.variants = payload.variants.map((v: any) => {
      let variantObj = v;
      if (typeof v === 'string') {
        try {
          variantObj = JSON.parse(v);
        } catch {
          return v;
        }
      }

      // اگر priceTiers درون خود واریانت استرینگ شده بود
      if (typeof variantObj.priceTiers === 'string') {
        try {
          variantObj.priceTiers = JSON.parse(variantObj.priceTiers);
        } catch {
          variantObj.priceTiers = [];
        }
      }

      // اطمینان از عددی بودن مقادیر داخل پله‌های واریانت
      if (Array.isArray(variantObj.priceTiers)) {
        variantObj.priceTiers = variantObj.priceTiers.map((tier: any) => ({
          minQuantity: Number(tier.minQuantity),
          price: Number(tier.price),
        }));
      }

      // تبدیل مقادیر عددی خود واریانت
      if (variantObj.price !== undefined) variantObj.price = Number(variantObj.price);
      if (variantObj.priceDiscount !== undefined) variantObj.priceDiscount = Number(variantObj.priceDiscount);
      if (variantObj.stock !== undefined) variantObj.stock = Number(variantObj.stock);

      return variantObj;
    });
  }

  // ۳. اطمینان از عددی بودن مقادیر پله‌های محصول ساده
  if (Array.isArray(payload.priceTiers)) {
    payload.priceTiers = payload.priceTiers.map((tier: any) => ({
      minQuantity: Number(tier.minQuantity),
      price: Number(tier.price),
    }));
  }

  // فلگ‌های بولی
  if (payload.removeOldThumbnail !== undefined) {
    payload.removeOldThumbnail =
      payload.removeOldThumbnail === 'true' ||
      payload.removeOldThumbnail === true;
  }

  if (payload.isAmazingOffer !== undefined) {
    payload.isAmazingOffer =
      payload.isAmazingOffer === true ||
      payload.isAmazingOffer === 'true' ||
      payload.isAmazingOffer === '1' ||
      payload.isAmazingOffer === 1;
  }

  if (payload.isAvailable !== undefined) {
    payload.isAvailable =
      payload.isAvailable === true ||
      payload.isAvailable === 'true' ||
      payload.isAvailable === '1' ||
      payload.isAvailable === 1;
  }

  // تبدیل فیلدهای عددی پایه
  if (payload.price !== undefined) payload.price = Number(payload.price);
  if (payload.priceDiscount !== undefined)
    payload.priceDiscount = Number(payload.priceDiscount);
  if (payload.stock !== undefined) payload.stock = Number(payload.stock);
  if (payload.categoryId !== undefined)
    payload.categoryId = Number(payload.categoryId);
  if (payload.brandId !== undefined) payload.brandId = Number(payload.brandId);
  if (payload.subBrandId !== undefined)
    payload.subBrandId = Number(payload.subBrandId);

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
    return await this.productsService.findAllActive(query);
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
