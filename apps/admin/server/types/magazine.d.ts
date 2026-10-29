export interface Author {
  id: string;
  name: string;
  slug: string;
  avatar?: string;
  jobTitle?: string;
  bio?: string;
  socialLinks?: Record<string, string>;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  children?: Category[];
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImage?: string;
  coverImageAlt?: string;
  status: 'draft' | 'published' | 'archived';
  isFeatured: boolean;
  readingTime: number;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  author: Author;
  category: Category;
  tags: Tag[];
  relatedProductIds?: string[];
  publishedAt: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  name: string;
  content: string;
  createdAt: string;
  replies?: Comment[];
}

export interface PaginationMeta {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export interface PaginatedResult<T> {
  items: T[];
  meta: PaginationMeta;
}

export interface ArticleQuery {
  page?: number;
  limit?: number;
  search?: string;
  categorySlug?: string;
  tagSlug?: string;
  authorSlug?: string;
  featured?: boolean;
  sort?: 'latest' | 'popular' | 'most_liked';
}

export enum ArticleStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export interface CommentAdmin {
  id: string;
  name: string;
  email: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  article: { id: string; title: string; slug: string };
}