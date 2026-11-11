import { DataSource, EntityManager, IsNull } from 'typeorm';
import dataSource from '../../src/common/database/data-source';
import type { AttributeKind } from '../../src/modules/products/constants/attribute-kind';
import { Attributes } from '../../src/modules/products/entities/attributes.entity';
import { AttributeValues } from '../../src/modules/products/entities/attribute-values.entity';
import { Brands } from '../../src/modules/brands/entities/brands.entity';
import { SubBrands } from '../../src/modules/brands/entities/sub-brands.entity';
import { Categories } from '../../src/modules/categories/entities/categories.entity';
import { ProductVariants } from '../../src/modules/products/entities/product-variants.entity';
import { Products } from '../../src/modules/products/entities/products.entity';
import { DEFAULT_TAG_GROUPS } from '../../src/modules/tags/constants/default-tag-groups';
import { TagGroups } from '../../src/modules/tags/entities/tag-groups.entity';
import { Tags } from '../../src/modules/tags/entities/tags.entity';

export interface BrandSeedInput {
  name: string;
  slug: string;
  description?: string;
  logo?: string;
}

export interface SubBrandSeedInput {
  name: string;
  slug: string;
}

export interface TagSeedSpec {
  groupSlug: string;
  groupName?: string;
  name: string;
  color?: string;
}

export interface AttributeSeedInput {
  name: string;
  label?: string;
  kind: AttributeKind;
}

export interface AttributeValueSeedInput {
  value: string;
  colorHex?: string | null;
}

export interface SingleVolumeProductSeedInput {
  title: string;
  englishTitle: string;
  sku: string;
  slug: string;
  volumeLabel: string;
  volumeAttributeName: string;
  variantSkuSuffix: string;
  price: number;
  priceDiscount: number;
  stock: number;
  lowStockThreshold: number;
  isAvailable?: boolean;
  isAmazingOffer?: boolean;
  shortDescription: string;
  introduce: string;
  howToUse: string;
  specifications: Array<{ key: string; value: string }>;
}

export interface SingleVolumeProductSeedConfig {
  product: SingleVolumeProductSeedInput;
  categoryPath: string[];
  brand: BrandSeedInput;
  subBrand: SubBrandSeedInput;
  tags: TagSeedSpec[];
}

export function slugify(value: string): string {
  return value
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^\p{L}\p{N}-]+/gu, '')
    .toLowerCase();
}

export function percent(price: number, discount: number): number {
  if (!discount || discount <= 0 || discount >= price) return 0;
  return Math.round(((price - discount) / price) * 100 * 100) / 100;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Converts plain multi-paragraph text into `<p>...</p>` HTML blocks for
 * storefront `v-html` and admin TipTap editors, leaving existing HTML intact.
 */
export function formatRichTextHtml(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (/^<[a-z][\s\S]*>/i.test(trimmed)) return trimmed;

  return trimmed
    .split(/\n\s*\n+/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => `<p>${escapeHtml(block).replace(/\n+/g, '<br>')}</p>`)
    .join('\n');
}

export async function ensureCategoryPath(
  manager: EntityManager,
  path: string[],
): Promise<Categories> {
  let parent: Categories | null = null;

  for (const name of path) {
    const slug = slugify(name);
    let category = await manager.findOne(Categories, {
      where: { slug },
      relations: { parent: true },
      withDeleted: true,
      loadEagerRelations: false,
    });

    if (!category) {
      category = await manager.findOne(Categories, {
        where: parent
          ? { name, parent: { id: parent.id } }
          : { name, parent: IsNull() },
        relations: { parent: true },
        withDeleted: true,
        loadEagerRelations: false,
      });
    }

    if (!category) {
      category = await manager.save(
        Categories,
        manager.create(Categories, {
          name,
          slug,
          parent: parent ?? undefined,
        }),
      );
      console.log(`  + دسته‌بندی: ${name}`);
    } else {
      if (category.deletedAt) {
        await manager.restore(Categories, category.id);
        category.deletedAt = undefined;
      }
      if (!category.parent && parent) {
        category.parent = parent;
        category = await manager.save(Categories, category);
      }
      console.log(`  = دسته‌بندی موجود: ${name}`);
    }

    parent = category;
  }

  return parent!;
}

export async function ensureBrand(
  manager: EntityManager,
  input: BrandSeedInput,
): Promise<Brands> {
  let brand = await manager.findOne(Brands, {
    where: { slug: input.slug },
    withDeleted: true,
    loadEagerRelations: false,
  });

  if (!brand) {
    brand = await manager.save(
      Brands,
      manager.create(Brands, {
        name: input.name,
        slug: input.slug,
        logo: input.logo,
        description: input.description,
      }),
    );
    console.log(`  + برند: ${input.name}`);
  } else {
    if (brand.deletedAt) {
      await manager.restore(Brands, brand.id);
      brand.deletedAt = undefined;
    }
    brand.name = input.name;
    if (input.logo !== undefined) {
      brand.logo = input.logo;
    }
    if (input.description !== undefined) {
      brand.description = input.description;
    }
    brand = await manager.save(Brands, brand);
    console.log(`  = برند به‌روزرسانی شد: ${input.name}`);
  }

  return brand;
}

export async function ensureSubBrand(
  manager: EntityManager,
  brand: Brands,
  input: SubBrandSeedInput,
): Promise<SubBrands> {
  let subBrand = await manager.findOne(SubBrands, {
    where: [{ slug: input.slug }, { name: input.name, brandId: brand.id }],
    withDeleted: true,
    loadEagerRelations: false,
  });

  if (!subBrand) {
    subBrand = await manager.save(
      SubBrands,
      manager.create(SubBrands, {
        name: input.name,
        slug: input.slug,
        brandId: brand.id,
        brand,
      }),
    );
    console.log(`  + زیربرند: ${input.name}`);
  } else {
    let dirty = false;
    if (subBrand.deletedAt) {
      await manager.restore(SubBrands, subBrand.id);
      subBrand.deletedAt = undefined;
      dirty = true;
    }
    if (subBrand.name !== input.name) {
      subBrand.name = input.name;
      dirty = true;
    }
    if (subBrand.brandId !== brand.id) {
      subBrand.brandId = brand.id;
      subBrand.brand = brand;
      dirty = true;
    }
    if (dirty) {
      subBrand = await manager.save(SubBrands, subBrand);
      console.log(`  ~ زیربرند به‌روزرسانی شد: ${input.name}`);
    } else {
      console.log(`  = زیربرند موجود: ${input.name}`);
    }
  }

  return subBrand;
}

export async function ensureTagGroups(
  manager: EntityManager,
): Promise<Map<string, TagGroups>> {
  const existing = await manager.find(TagGroups, {
    withDeleted: true,
    loadEagerRelations: false,
  });
  const bySlug = new Map(existing.map((g) => [g.slug, g]));

  for (const def of DEFAULT_TAG_GROUPS) {
    let group = bySlug.get(def.slug);
    if (!group) {
      group = await manager.save(
        TagGroups,
        manager.create(TagGroups, {
          name: def.name,
          slug: def.slug,
          sortOrder: def.sortOrder,
          isActive: true,
          isFilterable: true,
        }),
      );
      bySlug.set(group.slug, group);
      console.log(`  + گروه تگ: ${def.name} (${def.slug})`);
    } else if (group.deletedAt) {
      await manager.restore(TagGroups, group.id);
      group.deletedAt = undefined;
      group.isActive = true;
      group = await manager.save(TagGroups, group);
      bySlug.set(group.slug, group);
      console.log(`  ~ گروه تگ بازیابی شد: ${group.name} (${group.slug})`);
    }
  }

  return bySlug;
}

function nextUniqueSlug(base: string, taken: Set<string>): string {
  if (!taken.has(base)) {
    taken.add(base);
    return base;
  }
  let suffix = 2;
  while (taken.has(`${base}-${suffix}`)) {
    suffix++;
  }
  const candidate = `${base}-${suffix}`;
  taken.add(candidate);
  return candidate;
}

export async function ensureTags(
  manager: EntityManager,
  specs: TagSeedSpec[],
): Promise<Tags[]> {
  const bySlug = await ensureTagGroups(manager);
  const takenSlugsByGroup = new Map<number, Set<string>>();
  const result: Tags[] = [];

  for (const [index, spec] of specs.entries()) {
    let group = bySlug.get(spec.groupSlug);
    if (!group && spec.groupName) {
      group = await manager.save(
        TagGroups,
        manager.create(TagGroups, {
          name: spec.groupName,
          slug: spec.groupSlug,
          sortOrder: (bySlug.size + 1) * 10,
          isActive: true,
          isFilterable: true,
        }),
      );
      bySlug.set(group.slug, group);
      console.log(`  + گروه تگ: ${group.name} (${group.slug})`);
    }

    if (!group) {
      console.warn(`  ! گروه تگ «${spec.groupSlug}» پیدا نشد، رد شد.`);
      continue;
    }

    let tag = await manager.findOne(Tags, {
      where: { groupId: group.id, name: spec.name },
      withDeleted: true,
      loadEagerRelations: false,
    });

    if (!tag) {
      let takenSlugs = takenSlugsByGroup.get(group.id);
      if (!takenSlugs) {
        const groupTags = await manager.find(Tags, {
          where: { groupId: group.id },
          select: { id: true, slug: true },
          withDeleted: true,
          loadEagerRelations: false,
        });
        takenSlugs = new Set(groupTags.map((t) => t.slug));
        takenSlugsByGroup.set(group.id, takenSlugs);
      }

      const slug = nextUniqueSlug(slugify(spec.name) || 'tag', takenSlugs);
      tag = await manager.save(
        Tags,
        manager.create(Tags, {
          groupId: group.id,
          name: spec.name,
          slug,
          color: spec.color ?? null,
          sortOrder: (index + 1) * 10,
          isActive: true,
        }),
      );
      console.log(`  + تگ: ${spec.name} (${group.name})`);
    } else if (tag.deletedAt) {
      await manager.restore(Tags, tag.id);
      tag.deletedAt = undefined;
      tag.isActive = true;
      tag = await manager.save(Tags, tag);
      console.log(`  ~ تگ بازیابی شد: ${spec.name}`);
    } else {
      console.log(`  = تگ موجود: ${spec.name}`);
    }

    result.push(tag);
  }

  return result;
}

export async function ensureAttribute(
  manager: EntityManager,
  input: AttributeSeedInput,
): Promise<Attributes> {
  const label = input.label ?? input.name;
  let attribute = await manager.findOne(Attributes, {
    where: { name: input.name },
    withDeleted: true,
    loadEagerRelations: false,
  });

  if (!attribute) {
    attribute = await manager.save(
      Attributes,
      manager.create(Attributes, {
        name: input.name,
        label,
        kind: input.kind,
      }),
    );
    console.log(`  + ویژگی: ${input.name} (${input.kind})`);
  } else {
    let dirty = false;
    if (attribute.deletedAt) {
      await manager.restore(Attributes, attribute.id);
      attribute.deletedAt = undefined;
      dirty = true;
    }
    if (attribute.kind !== input.kind) {
      attribute.kind = input.kind;
      dirty = true;
    }
    if (!attribute.label && label) {
      attribute.label = label;
      dirty = true;
    }
    if (dirty) {
      attribute = await manager.save(Attributes, attribute);
      console.log(`  ~ ویژگی به‌روزرسانی شد: ${input.name} (${input.kind})`);
    } else {
      console.log(`  = ویژگی موجود: ${input.name}`);
    }
  }

  return attribute;
}

export async function ensureAttributeValue(
  manager: EntityManager,
  attribute: Attributes,
  input: AttributeValueSeedInput,
): Promise<AttributeValues> {
  const normalizedHex = input.colorHex ? input.colorHex.toUpperCase() : null;
  let value = await manager.findOne(AttributeValues, {
    where: { attribute: { id: attribute.id }, value: input.value },
    relations: { attribute: true },
    withDeleted: true,
    loadEagerRelations: false,
  });

  if (!value) {
    value = await manager.save(
      AttributeValues,
      manager.create(AttributeValues, {
        attribute,
        value: input.value,
        colorHex: normalizedHex,
      }),
    );
    console.log(
      `  + مقدار ویژگی: ${input.value}${normalizedHex ? ` ${normalizedHex}` : ''}`,
    );
  } else {
    let dirty = false;
    if (value.deletedAt) {
      await manager.restore(AttributeValues, value.id);
      value.deletedAt = undefined;
      dirty = true;
    }
    if (normalizedHex !== null && value.colorHex !== normalizedHex) {
      value.colorHex = normalizedHex;
      dirty = true;
    }
    if (dirty) {
      value = await manager.save(AttributeValues, value);
      console.log(
        `  ~ مقدار ویژگی به‌روزرسانی شد: ${input.value}${normalizedHex ? ` ${normalizedHex}` : ''}`,
      );
    } else {
      console.log(
        `  = مقدار ویژگی موجود: ${input.value}${normalizedHex ? ` ${normalizedHex}` : ''}`,
      );
    }
  }

  return value;
}

export async function seedSingleVolumeProduct(
  ds: DataSource,
  config: SingleVolumeProductSeedConfig,
): Promise<Products> {
  const {
    product: spec,
    categoryPath,
    brand: brandSpec,
    subBrand: subBrandSpec,
    tags: tagSpecs,
  } = config;

  return ds.transaction(async (manager) => {
    console.log('[1/5] دسته‌بندی');
    const category = await ensureCategoryPath(manager, categoryPath);

    console.log('\n[2/5] برند و زیربرند');
    const brand = await ensureBrand(manager, brandSpec);
    const subBrand = await ensureSubBrand(manager, brand, subBrandSpec);

    console.log('\n[3/5] تگ‌ها');
    const tags = await ensureTags(manager, tagSpecs);

    console.log('\n[4/5] ویژگی حجم');
    const volumeAttribute = await ensureAttribute(manager, {
      name: spec.volumeAttributeName,
      label: spec.volumeAttributeName,
      kind: 'volume',
    });
    const volumeValue = await ensureAttributeValue(manager, volumeAttribute, {
      value: spec.volumeLabel,
    });

    console.log('\n[5/5] محصول و تنوع');
    let product = await manager.findOne(Products, {
      where: [{ sku: spec.sku }, { slug: spec.slug }],
      relations: { tags: true },
      withDeleted: true,
      loadEagerRelations: false,
    });

    if (product?.deletedAt) {
      await manager.restore(Products, product.id);
      product.deletedAt = undefined;
    }

    const base: Partial<Products> = {
      title: spec.title,
      englishTitle: spec.englishTitle,
      slug: spec.slug,
      sku: spec.sku,
      type: 'variant',
      category,
      brand,
      subBrand,
      price: spec.price,
      priceDiscount: spec.priceDiscount,
      percentageDiscount: percent(spec.price, spec.priceDiscount),
      stock: spec.stock,
      isAvailable: spec.isAvailable ?? true,
      isAmazingOffer: spec.isAmazingOffer ?? false,
      thumbnail: product?.thumbnail || '',
      shortDescription: spec.shortDescription,
      introduce: formatRichTextHtml(spec.introduce),
      howToUse: formatRichTextHtml(spec.howToUse),
      specifications: spec.specifications,
      lowStockThreshold: spec.lowStockThreshold,
      tags,
    };

    if (!product) {
      product = manager.create(Products, base);
      product = await manager.save(Products, product);
      console.log(`  + محصول: ${spec.title} (id=${product.id})`);
    } else {
      Object.assign(product, base);
      product = await manager.save(Products, product);
      console.log(`  ~ محصول به‌روزرسانی شد (id=${product.id})`);
    }

    const variantSku = `${spec.sku}-${spec.variantSkuSuffix}`;
    let variant = await manager.findOne(ProductVariants, {
      where: { sku: variantSku },
      relations: { attributeValues: true },
      withDeleted: true,
      loadEagerRelations: false,
    });

    if (!variant) {
      variant = manager.create(ProductVariants, { product, sku: variantSku });
    } else if (variant.deletedAt) {
      await manager.restore(ProductVariants, variant.id);
      variant.deletedAt = undefined;
    }

    variant.product = product;
    variant.price = spec.price;
    variant.priceDiscount = spec.priceDiscount;
    variant.percentageDiscount = percent(spec.price, spec.priceDiscount);
    variant.stock = spec.stock;
    variant.isAvailable = spec.isAvailable ?? true;
    variant.images = variant.images?.length ? variant.images : [];
    variant.attributeValues = [volumeValue];

    variant = await manager.save(ProductVariants, variant);

    console.log(`    ${spec.volumeLabel} → variant id=${variant.id}`);
    console.log(`\n✓ محصول نهایی: id=${product.id} slug=${product.slug}`);

    return product;
  });
}

export async function printSeedSummary(ds: DataSource): Promise<void> {
  const counts = await ds.query(
    `SELECT (SELECT COUNT(*) FROM products) AS products,
            (SELECT COUNT(*) FROM product_variants) AS variants,
            (SELECT COUNT(*) FROM categories) AS categories,
            (SELECT COUNT(*) FROM brands) AS brands,
            (SELECT COUNT(*) FROM sub_brands) AS sub_brands,
            (SELECT COUNT(*) FROM tag_groups) AS tag_groups,
            (SELECT COUNT(*) FROM tags) AS tags,
            (SELECT COUNT(*) FROM attributes) AS attributes,
            (SELECT COUNT(*) FROM attribute_values) AS attribute_values`,
  );
  console.log('\n=== شمارش نهایی ===');
  console.table(counts[0]);
}

export function runStandaloneSeed(
  title: string,
  seedFn: (ds: DataSource) => Promise<void>,
): void {
  (async () => {
    const ds: DataSource = await dataSource.initialize();
    console.log(`\n=== Seed: ${title} ===`);
    console.log(
      `  db=${(ds.options as { database?: string }).database} host=${(ds.options as { host?: string }).host}\n`,
    );

    try {
      await seedFn(ds);
      await printSeedSummary(ds);
    } finally {
      await ds.destroy();
    }
  })().catch((error) => {
    console.error('\n✗ Seed failed:', error);
    process.exit(1);
  });
}
