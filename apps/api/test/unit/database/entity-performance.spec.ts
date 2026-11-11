import { describe, it, expect } from 'vitest';
import { getMetadataArgsStorage } from 'typeorm';

import '../../../src/modules/auth/entities/otp.entity';
import '../../../src/modules/banners/entities/banner.entity';
import '../../../src/modules/banners/entities/banner-position.entity';
import '../../../src/modules/brands/entities/brands.entity';
import '../../../src/modules/brands/entities/sub-brands.entity';
import '../../../src/modules/cart/entities/cart.entity';
import '../../../src/modules/cart/entities/cart-item.entity';
import '../../../src/modules/categories/entities/categories.entity';
import '../../../src/modules/comments/entities/comments.entity';
import '../../../src/modules/comments/entities/comment-reactions.entity';
import '../../../src/modules/magazine/entities/article-like.entity';
import '../../../src/modules/magazine/entities/articles.entity';
import '../../../src/modules/magazine/entities/author.entity';
import '../../../src/modules/magazine/entities/category.entity';
import '../../../src/modules/magazine/entities/comment.entity';
import '../../../src/modules/magazine/entities/tag.entity';
import '../../../src/modules/media/entities/media.entity';
import '../../../src/modules/orders/entities/orders.entity';
import '../../../src/modules/orders/entities/order-items.entity';
import '../../../src/modules/orders/entities/payment-info.entity';
import '../../../src/modules/orders/entities/shipping-info.entity';
import '../../../src/modules/payments/entities/payments.entity';
import '../../../src/modules/products/entities/products.entity';
import '../../../src/modules/products/entities/product-variants.entity';
import '../../../src/modules/products/entities/product-images.entity';
import '../../../src/modules/products/entities/product-price-tiers.entity';
import '../../../src/modules/products/entities/bundle-items.entity';
import '../../../src/modules/products/entities/attributes.entity';
import '../../../src/modules/products/entities/attribute-values.entity';
import '../../../src/modules/promotions/entities/promotion.entity';
import '../../../src/modules/promotions/entities/promotion-usages.entity';
import '../../../src/modules/tags/entities/tag-groups.entity';
import '../../../src/modules/tags/entities/tags.entity';
import '../../../src/modules/users/entities/users.entity';
import '../../../src/modules/users/addresses/entities/addresses.entity';
import '../../../src/modules/wishlist/entities/wishlist.entity';
import { Users } from '../../../src/modules/users/entities/users.entity';

describe('Entity Performance Metadata', () => {
  it('should have zero eager relations across all entities', () => {
    const storage = getMetadataArgsStorage();
    const eagerRelations = storage.relations.filter((rel) => rel.options?.eager === true);

    expect(eagerRelations).toEqual([]);
  });

  it('should hide Users.password with select: false', () => {
    const storage = getMetadataArgsStorage();
    const passwordCol = storage.columns.find(
      (c) => c.target === Users && c.propertyName === 'password',
    );

    expect(passwordCol).toBeDefined();
    expect(passwordCol?.options?.select).toBe(false);
  });

  it('should register critical FK and lookup indexes on entities', () => {
    const storage = getMetadataArgsStorage();
    const indexNames = new Set(storage.indices.map((i) => i.name).filter(Boolean));

    const expectedIndexes = [
      'idx_products_category',
      'idx_products_brand',
      'idx_products_sub_brand',
      'idx_products_avail_created',
      'idx_product_variants_product',
      'idx_product_images_product',
      'idx_bundle_items_bundle',
      'idx_categories_parent',
      'idx_sub_brands_brand',
      'idx_addresses_user',
      'idx_cart_user',
      'idx_cart_item_cart',
      'idx_wishlist_user_created',
      'idx_orders_user_created',
      'idx_orders_status_created',
      'idx_order_items_order',
      'idx_payments_authority',
      'idx_payments_order',
      'idx_promotions_code_active',
      'idx_comments_product_public',
      'idx_media_public_url',
      'idx_mag_articles_author',
      'idx_mag_articles_category',
      'idx_mag_comments_article_status_parent',
    ];

    for (const name of expectedIndexes) {
      expect(indexNames.has(name)).toBe(true);
    }
  });
});
