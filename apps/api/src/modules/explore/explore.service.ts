import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, In } from 'typeorm';
import { ExploreVideo } from './entities/explore-video.entity';
import { ExploreVideoComment } from './entities/explore-video-comment.entity';
import { ExploreVideoLike } from './entities/explore-video-like.entity';
import { Categories } from 'src/modules/categories/entities/categories.entity';
import { QueryExploreDto } from './dtos/query-explore.dto';

@Injectable()
export class ExploreService {
  constructor(
    @InjectRepository(ExploreVideo)
    private readonly videoRepo: Repository<ExploreVideo>,
    @InjectRepository(ExploreVideoComment)
    private readonly commentRepo: Repository<ExploreVideoComment>,
    @InjectRepository(ExploreVideoLike)
    private readonly likeRepo: Repository<ExploreVideoLike>,
    @InjectRepository(Categories)
    private readonly categoryRepo: Repository<Categories>,
  ) {}

  async getVideos(query: QueryExploreDto, userId?: number) {
    const limit = Math.min(Math.max(Number(query.limit) || 5, 1), 50);
    const where: any = { isActive: true };

    if (query.categoryId) {
      where.category = { id: Number(query.categoryId) };
    }

    if (query.cursor) {
      where.id = LessThan(Number(query.cursor));
    }

    const videos = await this.videoRepo.find({
      where,
      relations: {
        product: true,
        category: true,
      },
      order: {
        id: 'DESC',
      },
      take: limit + 1,
    });

    let nextCursor: number | null = null;
    if (videos.length > limit) {
      const nextItem = videos.pop();
      nextCursor = nextItem ? nextItem.id : null;
    }

    const videoIds = videos.map((v) => v.id);
    let likedSet = new Set<number>();

    if (userId && videoIds.length > 0) {
      const likes = await this.likeRepo.find({
        where: {
          video: { id: In(videoIds) },
          user: { id: userId },
        },
        relations: { video: true },
      });
      likedSet = new Set(likes.map((l) => l.video.id));
    }

    const items = videos.map((v) => ({
      id: v.id,
      title: v.title,
      description: v.description || undefined,
      videoUrl: v.videoUrl,
      posterUrl: v.posterUrl,
      likesCount: v.likesCount,
      commentsCount: v.commentsCount,
      viewsCount: v.viewsCount,
      isLiked: likedSet.has(v.id),
      product: v.product
        ? {
            id: v.product.id,
            title: v.product.title,
            slug: v.product.slug,
            thumbnail: v.product.thumbnail,
            price: Number(v.product.price || 0),
            priceDiscount: Number(v.product.priceDiscount || 0),
          }
        : null,
      category: v.category
        ? {
            id: v.category.id,
            name: v.category.name,
          }
        : null,
    }));

    return {
      items,
      nextCursor,
    };
  }

  async getCategories() {
    const categories = await this.categoryRepo.find({
      select: {
        id: true,
        name: true,
      },
      order: {
        id: 'ASC',
      },
      take: 50,
    });

    return categories.map((c) => ({
      id: c.id,
      name: c.name,
    }));
  }

  async getComments(videoId: number, cursor?: number, limit = 10) {
    const takeLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);
    const where: any = {
      video: { id: videoId },
      isApproved: true,
    };

    if (cursor) {
      where.id = LessThan(Number(cursor));
    }

    const comments = await this.commentRepo.find({
      where,
      relations: {
        user: true,
      },
      order: {
        id: 'DESC',
      },
      take: takeLimit + 1,
    });

    let nextCursor: number | null = null;
    if (comments.length > takeLimit) {
      const nextItem = comments.pop();
      nextCursor = nextItem ? nextItem.id : null;
    }

    const items = comments.map((c) => ({
      id: c.id,
      text: c.text,
      createdAt: c.createdAt.toISOString(),
      user: {
        id: c.user?.id,
        firstName: c.user?.first_name || '',
        lastName: c.user?.last_name || '',
        avatar: (c.user as any)?.avatar || undefined,
      },
    }));

    return {
      items,
      nextCursor,
    };
  }

  async addComment(videoId: number, userId: number, text: string) {
    const video = await this.videoRepo.findOneBy({ id: videoId });
    if (!video) throw new NotFoundException('ویدیو یافت نشد');

    const comment = this.commentRepo.create({
      text,
      video: { id: videoId } as any,
      user: { id: userId } as any,
      isApproved: true,
    });

    const saved = await this.commentRepo.save(comment);

    await this.videoRepo.increment({ id: videoId }, 'commentsCount', 1);

    const reloaded = await this.commentRepo.findOne({
      where: { id: saved.id },
      relations: { user: true },
    });

    return {
      id: reloaded!.id,
      text: reloaded!.text,
      createdAt: reloaded!.createdAt.toISOString(),
      user: {
        id: reloaded!.user?.id,
        firstName: reloaded!.user?.first_name || '',
        lastName: reloaded!.user?.last_name || '',
        avatar: (reloaded!.user as any)?.avatar || undefined,
      },
    };
  }

  async toggleLike(videoId: number, userId?: number, ip?: string) {
    const video = await this.videoRepo.findOneBy({ id: videoId });
    if (!video) throw new NotFoundException('ویدیو یافت نشد');

    let existingLike: ExploreVideoLike | null = null;
    if (userId) {
      existingLike = await this.likeRepo.findOne({
        where: {
          video: { id: videoId },
          user: { id: userId },
        },
      });
    } else if (ip) {
      existingLike = await this.likeRepo.findOne({
        where: {
          video: { id: videoId },
          ip,
        },
      });
    }

    if (existingLike) {
      await this.likeRepo.remove(existingLike);
      video.likesCount = Math.max(0, (video.likesCount || 0) - 1);
      await this.videoRepo.save(video);
      return {
        liked: false,
        likesCount: video.likesCount,
      };
    } else {
      const newLike = this.likeRepo.create({
        video: { id: videoId } as any,
        user: userId ? ({ id: userId } as any) : null,
        ip: ip || null,
      });
      await this.likeRepo.save(newLike);
      video.likesCount = (video.likesCount || 0) + 1;
      await this.videoRepo.save(video);
      return {
        liked: true,
        likesCount: video.likesCount,
      };
    }
  }

  async incrementView(videoId: number) {
    await this.videoRepo.increment({ id: videoId }, 'viewsCount', 1);
    const video = await this.videoRepo.findOne({
      where: { id: videoId },
      select: { id: true, viewsCount: true },
    });
    return {
      success: true,
      viewsCount: video?.viewsCount ?? 1,
    };
  }
}
