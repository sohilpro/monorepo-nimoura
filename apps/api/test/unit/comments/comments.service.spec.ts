import { describe, it, expect, vi } from 'vitest';
import { CommentsService } from '../../../src/modules/comments/comments.service';

describe('CommentsService Projections', () => {
  it('findByProduct should paginate in DB and expose only public user name fields', async () => {
    const rows = [
      {
        id: 1,
        subject: 'عالی',
        description: 'بسیار با کیفیت بود',
        rating: 5,
        images: [],
        isVerifiedBuyer: true,
        likesCount: 2,
        dislikesCount: 0,
        createdAt: new Date('2026-05-01T00:00:00Z'),
        user: {
          id: 10,
          first_name: 'نگار',
          last_name: 'کریمی',
        },
      },
    ];

    const commentRepo = {
      findAndCount: vi.fn().mockResolvedValue([rows, 1]),
    } as any;

    const service = new CommentsService(
      commentRepo,
      {} as any,
      {} as any,
      {} as any,
    );

    const res = await service.findByProduct(42, { page: 2, limit: 5 });

    expect(commentRepo.findAndCount).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 5,
        skip: 5,
        loadEagerRelations: false,
      }),
    );
    expect(res.comments).toHaveLength(1);
    expect(res.comments[0].user).toEqual({
      id: 10,
      first_name: 'نگار',
      last_name: 'کریمی',
    });
    expect(res.comments[0].user).not.toHaveProperty('password');
    expect(res.comments[0].user).not.toHaveProperty('mobile');
    expect(res.comments[0].user).not.toHaveProperty('email');
    expect(res.comments[0].user).not.toHaveProperty('identity_card');
  });

  it('findAll (admin) should select only id, name and mobile on comment user', async () => {
    const commentRepo = {
      findAndCount: vi.fn().mockResolvedValue([[], 0]),
    } as any;

    const service = new CommentsService(
      commentRepo,
      {} as any,
      {} as any,
      {} as any,
    );

    await service.findAll({ page: 1, limit: 10 });

    const callArgs = commentRepo.findAndCount.mock.calls[0][0];
    expect(callArgs.loadEagerRelations).toBe(false);
    expect(callArgs.select.user).toEqual({
      id: true,
      first_name: true,
      last_name: true,
      mobile: true,
    });
  });
});
