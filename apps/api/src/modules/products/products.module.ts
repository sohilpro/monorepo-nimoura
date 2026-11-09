// src/modules/products/products.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Products } from './entities/products.entity';
import { ProductImages } from './entities/product-images.entity';
import { ProductVariants } from './entities/product-variants.entity';
import { ProductsService } from './products.service';
import { AdminProductsController } from './controllers/products-admin.controller';
import { ProductsController } from './controllers/products.controller';
import { SubBrands } from '../brands/entities/sub-brands.entity';
import { Brands } from '../brands/entities/brands.entity';
import { Categories } from '../categories/entities/categories.entity';
import { Tags } from '../tags/entities/tags.entity';
import { TagsModule } from '../tags/tag.module';
import { CategoryTreeService } from './category-tree.service';
import { ProductListingFilters } from './product-listing-filters.service';
import { ProductFacetsService } from './product-facets.service';
import { MediaModule } from '../media/media.module';
import { AttributeValues } from './entities/attribute-values.entity';
import { Attributes } from './entities/attributes.entity';
import { BundleItems } from './entities/bundle-items.entity';
import { ProductsImportService } from './products-import.service';
import { ProductPriceTiers } from './entities/product-price-tiers.entity';
import { ProductVariantsService } from './product-variants.service';
import { ProductBundlesService } from './product-bundles.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Products,
      ProductImages,
      ProductVariants,
      Categories,
      Brands,
      SubBrands,
      Tags,
      Attributes,
      AttributeValues,
      BundleItems,
      ProductPriceTiers,
    ]),
    MediaModule,
    TagsModule,
  ],
  controllers: [ProductsController, AdminProductsController],
  providers: [
    ProductsService,
    ProductsImportService,
    ProductVariantsService,
    ProductBundlesService,
    CategoryTreeService,
    ProductListingFilters,
    ProductFacetsService,
  ],
  exports: [ProductsService, ProductsImportService],
})
export class ProductsModule {}
