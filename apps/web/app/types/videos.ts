export interface VideoProduct {
  id: number;
  title: string;
  slug: string;
  thumbnail?: string;
  price: number;
  priceDiscount: number;
  percentageDiscount: number;
}

export interface Video {
  id: number;
  title: string;
  slug: string;
  description?: string;
  videoUrl: string;
  posterUrl: string;
  durationSeconds: number;
  width: number;
  height: number;
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  product?: VideoProduct;
  isLiked?: boolean;
}

export interface VideoComment {
  id: number;
  text: string;
  createdAt: string;
  likesCount: number;
  user: {
    id: number;
    name?: string;
    avatar?: string;
  };
}

export interface Paginated<T> {
  items: T[];
  nextCursor: number | null;
}