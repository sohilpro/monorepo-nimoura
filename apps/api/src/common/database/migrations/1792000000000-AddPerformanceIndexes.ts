import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPerformanceIndexes1792000000000 implements MigrationInterface {
  name = 'AddPerformanceIndexes1792000000000';

  private readonly indexes: Array<[string, string, string]> = [
    // products
    ['idx_products_category', 'products', '("categoryId")'],
    ['idx_products_brand', 'products', '("brandId")'],
    ['idx_products_sub_brand', 'products', '("subBrandId")'],
    ['idx_products_average_rating', 'products', '("averageRating")'],
    ['idx_products_type', 'products', '("type")'],
    ['idx_products_stock', 'products', '("stock")'],
    ['idx_products_avail_created', 'products', '("isAvailable", "created_at")'],
    ['idx_products_avail_price', 'products', '("isAvailable", "price")'],
    [
      'idx_products_avail_rating',
      'products',
      '("isAvailable", "averageRating")',
    ],
    [
      'idx_products_avail_amazing',
      'products',
      '("isAvailable", "isAmazingOffer")',
    ],

    // product_variants & product_images & bundle_items & attribute_values
    ['idx_product_variants_product', 'product_variants', '("productId")'],
    [
      'idx_product_variants_product_avail',
      'product_variants',
      '("productId", "isAvailable")',
    ],
    ['idx_product_variants_stock', 'product_variants', '("stock")'],
    ['idx_product_images_product', 'product_images', '("productId")'],
    ['idx_bundle_items_bundle', 'bundle_items', '("bundle_id")'],
    ['idx_bundle_items_product', 'bundle_items', '("product_id")'],
    ['idx_bundle_items_variant', 'bundle_items', '("variant_id")'],
    ['idx_attribute_values_attribute', 'attribute_values', '("attributeId")'],
    [
      'idx_attribute_values_attr_val',
      'attribute_values',
      '("attributeId", "value")',
    ],

    // categories & sub_brands
    ['idx_categories_parent', 'categories', '("parentId")'],
    ['idx_sub_brands_brand', 'sub_brands', '("brandId")'],

    // addresses, cart, wishlist
    ['idx_addresses_user', 'addresses', '("userId")'],
    ['idx_cart_user', 'cart', '("userId")'],
    ['idx_cart_item_cart', 'cart_item', '("cartId")'],
    ['idx_cart_item_product', 'cart_item', '("productId")'],
    ['idx_cart_item_variant', 'cart_item', '("variantId")'],
    ['idx_wishlist_product', 'wishlist', '("productId")'],
    ['idx_wishlist_user_created', 'wishlist', '("userId", "created_at")'],

    // orders, order_items, payments
    ['idx_orders_user', 'orders', '("userId")'],
    ['idx_orders_shipping_info', 'orders', '("shippingInfoId")'],
    ['idx_orders_payment_info', 'orders', '("paymentInfoId")'],
    ['idx_orders_promotion', 'orders', '("promotionId")'],
    ['idx_orders_user_created', 'orders', '("userId", "created_at")'],
    ['idx_orders_status_created', 'orders', '("status", "created_at")'],
    ['idx_orders_created_at', 'orders', '("created_at")'],
    ['idx_order_items_order', 'order_items', '("orderId")'],
    ['idx_order_items_product', 'order_items', '("productId")'],
    ['idx_order_items_variant', 'order_items', '("variantId")'],
    ['idx_payments_order', 'payments', '("orderId")'],
    ['idx_payments_authority', 'payments', '("authority")'],
    ['idx_payments_status', 'payments', '("status")'],

    // promotions & comments
    ['idx_promotions_code_active', 'promotions', '("promoCode", "isActive")'],
    [
      'idx_promotions_active_dates',
      'promotions',
      '("isActive", "startDate", "endDate")',
    ],
    [
      'idx_promotion_usages_promo_user',
      'promotio_usages',
      '("promotionId", "userId")',
    ],
    ['idx_comments_user', 'comments', '("userId")'],
    ['idx_comments_product', 'comments', '("productId")'],
    [
      'idx_comments_product_public',
      'comments',
      '("productId", "isApproved", "isRejected", "created_at")',
    ],
    ['idx_comment_reactions_comment', 'comments_reactions', '("commentId")'],

    // banners & media
    ['idx_banners_status_end_at', 'banners', '("status", "end_at")'],
    ['idx_media_owner_id', 'media', '("ownerId")'],
    ['idx_media_public_url', 'media', '("publicUrl")'],

    // magazine
    ['idx_mag_articles_author', 'magazine_articles', '("author_id")'],
    ['idx_mag_articles_category', 'magazine_articles', '("category_id")'],
    [
      'idx_mag_articles_status_featured_pub',
      'magazine_articles',
      '("status", "is_featured", "published_at")',
    ],
    [
      'idx_mag_articles_status_views',
      'magazine_articles',
      '("status", "view_count")',
    ],
    [
      'idx_mag_articles_status_likes',
      'magazine_articles',
      '("status", "like_count")',
    ],
    ['idx_mag_articles_updated_at', 'magazine_articles', '("updated_at")'],
    ['idx_mag_categories_parent', 'magazine_categories', '("parent_id")'],
    ['idx_mag_categories_sort', 'magazine_categories', '("sort_order")'],
    [
      'idx_mag_comments_article_status_parent',
      'magazine_comments',
      '("article_id", "status", "parent_id", "created_at")',
    ],
    [
      'idx_mag_comments_status_created',
      'magazine_comments',
      '("status", "created_at")',
    ],
    [
      'idx_mag_article_likes_article',
      'magazine_article_likes',
      '("article_id")',
    ],
  ];

  async up(q: QueryRunner): Promise<void> {
    for (const [name, table, cols] of this.indexes) {
      await q.query(
        `CREATE INDEX IF NOT EXISTS "${name}" ON "${table}" ${cols}`,
      );
    }
  }

  async down(q: QueryRunner): Promise<void> {
    for (const [name] of [...this.indexes].reverse()) {
      await q.query(`DROP INDEX IF EXISTS "${name}"`);
    }
  }
}
