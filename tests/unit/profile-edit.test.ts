import { describe, it, expect, vi, beforeEach } from 'vitest'
import { canUpdatePersonalData, canUpdateStyleData, updatePersonalData } from '../../src/services/profile-service';

let lastUpdatePayload: any = null;
let mockProfileData: any = null;

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: (table: string) => {
      if (table === 'profiles') {
        return {
          select: () => ({
            eq: () => ({
              single: async () => ({
                error: null,
                data: mockProfileData,
              }),
            }),
          }),
          update: (payload: any) => {
            lastUpdatePayload = payload;
            return {
              eq: async () => ({
                error: null,
                data: null,
              }),
            };
          },
        };
      }
      if (table === 'profile_style_preferences') {
        return {
          delete: () => ({
            eq: async () => ({ error: null }),
          }),
          insert: async () => ({ error: null }),
        };
      }
      return {};
    },
  },
}));

describe('profile edit - personal data cooldown (7 days)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    lastUpdatePayload = null;
    mockProfileData = null;
  });

  it('allows update when no profile exists', async () => {
    mockProfileData = null;
    const result = await canUpdatePersonalData('user-123');
    expect(result.canUpdate).toBe(false);
  });

  it('allows update when first time (last_personal_update is null)', async () => {
    mockProfileData = {
      id: 'profile-1',
      user_id: 'user-123',
      last_personal_update: null,
    };
    const result = await canUpdatePersonalData('user-123');
    expect(result.canUpdate).toBe(true);
  });

  it('blocks update if updated less than 7 days ago', async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    mockProfileData = {
      id: 'profile-1',
      user_id: 'user-123',
      last_personal_update: yesterday.toISOString(),
    };
    
    const result = await canUpdatePersonalData('user-123');
    expect(result.canUpdate).toBe(false);
    expect(result.daysRemaining).toBe(6);
  });

  it('allows update if updated more than 7 days ago', async () => {
    const eightDaysAgo = new Date();
    eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);
    
    mockProfileData = {
      id: 'profile-1',
      user_id: 'user-123',
      last_personal_update: eightDaysAgo.toISOString(),
    };
    
    const result = await canUpdatePersonalData('user-123');
    expect(result.canUpdate).toBe(true);
  });
});

describe('profile edit - style data cooldown (24 hours)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    lastUpdatePayload = null;
    mockProfileData = null;
  });

  it('allows update when first time (last_style_update is null)', async () => {
    mockProfileData = {
      id: 'profile-1',
      user_id: 'user-123',
      last_style_update: null,
    };
    const result = await canUpdateStyleData('user-123');
    expect(result.canUpdate).toBe(true);
  });

  it('blocks update if updated less than 24 hours ago', async () => {
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    
    mockProfileData = {
      id: 'profile-1',
      user_id: 'user-123',
      last_style_update: oneHourAgo.toISOString(),
    };
    
    const result = await canUpdateStyleData('user-123');
    expect(result.canUpdate).toBe(false);
    expect(result.hoursRemaining).toBe(23);
  });

  it('allows update if updated more than 24 hours ago', async () => {
    const twentyFiveHoursAgo = new Date();
    twentyFiveHoursAgo.setHours(twentyFiveHoursAgo.getHours() - 25);
    
    mockProfileData = {
      id: 'profile-1',
      user_id: 'user-123',
      last_style_update: twentyFiveHoursAgo.toISOString(),
    };
    
    const result = await canUpdateStyleData('user-123');
    expect(result.canUpdate).toBe(true);
  });
});

describe('profile edit - independent cooldowns', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    lastUpdatePayload = null;
    mockProfileData = null;
  });

  it('blocks style only when style on cooldown, allows personal', async () => {
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    
    mockProfileData = {
      id: 'profile-1',
      user_id: 'user-123',
      last_personal_update: null,
      last_style_update: oneHourAgo.toISOString(),
    };
    
    const result = await updatePersonalData('user-123', {
      preferred_fit: 'relaxed',
    });
    
    expect(result.error).toBeDefined();
    expect(result.error?.message).toContain('24 hours');
  });

  it('blocks personal only when personal on cooldown, allows style', async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    mockProfileData = {
      id: 'profile-1',
      user_id: 'user-123',
      last_personal_update: yesterday.toISOString(),
      last_style_update: null,
    };
    
    const result = await updatePersonalData('user-123', {
      height_cm: 180,
    });
    
    expect(result.error).toBeDefined();
    expect(result.error?.message).toContain('7 days');
  });

  it('updates both when both cooldowns allow', async () => {
    mockProfileData = {
      id: 'profile-1',
      user_id: 'user-123',
      last_personal_update: null,
      last_style_update: null,
    };
    
    const result = await updatePersonalData('user-123', {
      height_cm: 180,
      preferred_fit: 'relaxed',
      style_preferences: ['Minimalist'],
    });
    
    expect(result.error).toBeNull();
    expect(lastUpdatePayload.last_personal_update).toBeDefined();
    expect(lastUpdatePayload.last_style_update).toBeDefined();
  });
});