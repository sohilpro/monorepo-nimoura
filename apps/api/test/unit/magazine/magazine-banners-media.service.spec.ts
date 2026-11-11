import { describe, it, expect, vi } from 'vitest';
import { ArticlesService } from '../../../src/modules/magazine/articles/articles.service';
import { CommentsService as MagazineCommentsService } from '../../../src/modules/magazine/comments/comments.service';
import { BannersService } from '../../../src/modules/banners/banners.service';
import { MediaStaticService } from '../../../src/modules/media/media-static.service';
import { BannerDevice } from '../../../src/modules/banners/enums';

describe('Magazine, Banners & Media Service Projections', () => {
  it('ArticlesService.findAllPublished should exclude heavy content and SEO columns in list queries', async () => {
    const qb: any = {
      select: vi.fn().mockReturnThis(),
      leftJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      andWhere: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      take: vi.fn().mockReturnThis(),
      getManyAndCount: vi.fn().mockResolvedValue([[], 0]),
    };

    const articleRepo = {
      createQueryBuilder: vi.fn().mockReturnValue(qb),
    } as any;
    const service = new ArticlesService(
      articleRepo,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
    );

    await service.findAllPublished({ page: 1, limit: 9, skip: 0 });

    expect(qb.select).toHaveBeenCalled();
    const selectedCols = qb.select.mock.calls[0][0] as string[];
    expect(selectedCols).not.toContain('article.content');
    expect(selectedCols).not.toContain('article.metaKeywords');
    expect(selectedCols).not.toContain('article.canonicalUrl');
    expect(selectedCols).not.toContain('author.bio');
  });

  it('Magazine CommentsService.findApprovedByArticle should never select or expose email or ipAddress', async () => {
    const commentRepo = {
      find: vi.fn().mockResolvedValue([]),
    } as any;

    const service = new MagazineCommentsService(commentRepo, {} as any);
    await service.findApprovedByArticle(15);

    const opts = commentRepo.find.mock.calls[0][0];
    expect(opts.loadEagerRelations).toBe(false);
    expect(opts.select).toEqual({
      id: true,
      name: true,
      content: true,
      createdAt: true,
      replies: {
        id: true,
        name: true,
        content: true,
        createdAt: true,
      },
    });
  });

  it('BannersService.findActiveForPosition should select minimal banner payload without analytics or position entity', async () => {
    const qb: any = {
      select: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      andWhere: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      getMany: vi.fn().mockResolvedValue([]),
    };

    const bannerRepo = {
      createQueryBuilder: vi.fn().mockReturnValue(qb),
    } as any;
    const service = new BannersService(bannerRepo, {} as any);

    await service.findActiveForPosition('home-hero', BannerDevice.DESKTOP);

    expect(qb.select).toHaveBeenCalled();
    const selectedCols = qb.select.mock.calls[0][0] as string[];
    expect(selectedCols).not.toContain('banner.views');
    expect(selectedCols).not.toContain('banner.clicks');
    expect(selectedCols).not.toContain('banner.deletedAt');
    expect(qb.innerJoin).toHaveBeenCalledWith('banner.position', 'position');
  });

  it('MediaStaticService.findAll should exclude internal ftpPath and deletedAt from query selection', async () => {
    const qb: any = {
      select: vi.fn().mockReturnThis(),
      andWhere: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      take: vi.fn().mockReturnThis(),
      getManyAndCount: vi.fn().mockResolvedValue([[], 0]),
    };

    const mediaRepo = {
      createQueryBuilder: vi.fn().mockReturnValue(qb),
    } as any;
    const service = new MediaStaticService(mediaRepo, {} as any, {} as any);

    await service.findAll({ page: 1, limit: 20 });

    expect(qb.select).toHaveBeenCalled();
    const selectedCols = qb.select.mock.calls[0][0] as string[];
    expect(selectedCols).not.toContain('media.ftpPath');
    expect(selectedCols).not.toContain('media.deletedAt');
  });
});
