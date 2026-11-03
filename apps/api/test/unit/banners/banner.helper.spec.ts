import { describe, it, expect } from 'vitest';
import { BannerStatus, BannerDevice, LinkTarget } from '@nimoura/shared-types';

describe('Banner Enums and Structures', () => {
  it('validates banner status values', () => {
    expect(BannerStatus.ACTIVE).toBe('active');
    expect(BannerStatus.INACTIVE).toBe('inactive');
    expect(BannerStatus.DRAFT).toBe('draft');
  });

  it('validates banner device targets', () => {
    expect(BannerDevice.ALL).toBe('all');
    expect(BannerDevice.DESKTOP).toBe('desktop');
    expect(BannerDevice.MOBILE).toBe('mobile');
  });

  it('validates link targets', () => {
    expect(LinkTarget.SELF).toBe('_self');
    expect(LinkTarget.BLANK).toBe('_blank');
  });
});
