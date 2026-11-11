import { describe, it, expect, vi } from 'vitest';
import { UsersService } from '../../../src/modules/users/user.service';
import { AddressesService } from '../../../src/modules/users/addresses/address.service';
import { UserRole } from '../../../src/common/auth/jwt.types';

describe('UsersService & AddressesService Projections', () => {
  it('UsersService.getProfile should return safe profile and counts without loading full relations or sensitive fields', async () => {
    const mockUser = {
      id: 7,
      first_name: 'سارا',
      last_name: 'راد',
      mobile: '09123456789',
      verify_mobile: true,
      email: 'sara@example.com',
      verify_email: false,
      identity_card: '0011223344',
      role: UserRole.USER,
      createdAt: new Date('2026-01-01T00:00:00Z'),
    };

    const countMock = vi.fn().mockResolvedValueOnce(3).mockResolvedValueOnce(2);
    const mockUserRepo = {
      findOne: vi.fn().mockResolvedValue(mockUser),
      manager: {
        count: countMock,
      },
    } as any;
    const mockWishlist = { count: vi.fn().mockResolvedValue(5) } as any;

    const service = new UsersService(mockUserRepo, mockWishlist);
    const result = await service.getProfile(7);

    expect(result.profile).toEqual({
      id: 7,
      first_name: 'سارا',
      last_name: 'راد',
      mobile: '09123456789',
      verify_mobile: true,
      email: 'sara@example.com',
      verify_email: false,
      identity_card: '0011223344',
      role: UserRole.USER,
      createdAt: mockUser.createdAt,
    });
    expect(result.profile).not.toHaveProperty('password');
    expect(result.profile).not.toHaveProperty('deletedAt');
    expect(result.profile).not.toHaveProperty('orders');
    expect(result.profile).not.toHaveProperty('addresses');
    expect(result.stats).toEqual({
      ordersCount: 2,
      addressesCount: 3,
      wishlistCount: 5,
    });
    expect(mockUserRepo.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 7 },
        loadEagerRelations: false,
      }),
    );
  });

  it('UsersService.getUser should return admin editable fields without password or heavy relations', async () => {
    const mockUser = {
      id: 9,
      first_name: 'مریم',
      last_name: 'نوری',
      mobile: '09120001122',
      verify_mobile: true,
      email: 'm@example.com',
      verify_email: true,
      identity_card: '1234567890',
      role: UserRole.ADMIN,
      createdAt: new Date('2026-02-01T00:00:00Z'),
      updatedAt: new Date('2026-02-02T00:00:00Z'),
    };

    const mockUserRepo = {
      findOne: vi.fn().mockResolvedValue(mockUser),
    } as any;

    const service = new UsersService(mockUserRepo);
    const result = await service.getUser(9);

    expect(result).not.toHaveProperty('password');
    expect(result).not.toHaveProperty('deletedAt');
    expect(result).not.toHaveProperty('orders');
    expect(result).not.toHaveProperty('addresses');
    expect(result).not.toHaveProperty('comments');
    expect(result.mobile).toBe('09120001122');
    expect(result.role).toBe(UserRole.ADMIN);
  });

  it('AddressesService.create should not leak user object or password in created address', async () => {
    const savedAddress = {
      id: 11,
      title: 'خانه',
      postal_code: '1234567890',
      state: 'تهران',
      city: 'تهران',
      address: 'خیابان ولیعصر',
      userId: 7,
      user: { id: 7, password: 'hashed_secret', mobile: '09123456789' },
      deletedAt: null,
    };

    const mockAddressRepo = {
      create: vi.fn((x) => x),
      save: vi.fn().mockResolvedValue(savedAddress),
    } as any;
    const mockUserRepo = {
      existsBy: vi.fn().mockResolvedValue(true),
      findOne: vi.fn().mockResolvedValue({ id: 7 }),
    } as any;

    const service = new AddressesService(mockAddressRepo, mockUserRepo);
    const res = await service.create(
      {
        title: 'خانه',
        postal_code: '1234567890',
        state: 'تهران',
        city: 'تهران',
        address: 'خیابان ولیعصر',
      },
      7,
    );

    expect(res.address).toEqual({
      id: 11,
      title: 'خانه',
      postal_code: '1234567890',
      state: 'تهران',
      city: 'تهران',
      address: 'خیابان ولیعصر',
      userId: 7,
    });
    expect(res.address).not.toHaveProperty('user');
    expect(res.address).not.toHaveProperty('deletedAt');
  });

  it('AddressesService.findAllPaginated should project minimal user fields and exclude password', async () => {
    const row = {
      id: 12,
      title: 'محل کار',
      postal_code: '9876543210',
      state: 'فارس',
      city: 'شیراز',
      address: 'بلوار زند',
      userId: 3,
      user: {
        id: 3,
        first_name: 'علی',
        last_name: 'احمدی',
        mobile: '09171112233',
      },
    };
    const mockAddressRepo = {
      findAndCount: vi.fn().mockResolvedValue([[row], 1]),
    } as any;

    const service = new AddressesService(mockAddressRepo, {} as any);
    const res = await service.findAllPaginated(1, 20);

    expect(res.total).toBe(1);
    expect(res.data[0].user).toEqual({
      id: 3,
      first_name: 'علی',
      last_name: 'احمدی',
      mobile: '09171112233',
    });
    expect(res.data[0].user).not.toHaveProperty('password');
  });
});
