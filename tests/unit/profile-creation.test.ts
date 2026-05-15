import { describe, it, expect, vi } from 'vitest'
import { updateUserProfile } from '../../src/services/profile-service';

// Mock the Supabase client to capture the payload sent to the insert call
let lastPayload: any = null

vi.mock('@/integrations/supabase/client', () => {
  return {
    supabase: {
      from: () => ({
        update: (payload: any) => {
          lastPayload = payload
          return {
            eq: async () => ({
              error: null,
              data: null,
            }),
          }
        },
      }),
    },
  }
})

describe('profile creation', () => {
  it('builds and sends normalized payload to profiles', async () => {
    lastPayload = null
    const userId = 'user-123'
    const dto = {
      height_cm: 180,
      weight_kg: 75,
      body_type: 'Athletic',
      preferred_fit: 'Relaxed',
      country_code: 'ni',
      city: 'Managua',
      timezone: 'UTC'
    }

    const { error } = await updateUserProfile(userId, dto as any)
    expect(error).toBeNull()
    expect(lastPayload).toBeDefined()
    //expect(lastPayload.user_id).toBe(userId)
    expect(lastPayload.height_cm).toBe(180)
    expect(lastPayload.weight_kg).toBe(75)
    expect(lastPayload.body_type).toBe('athletic')
    expect(lastPayload.preferred_fit).toBe('relaxed')
    expect(lastPayload.country_code).toBe('NI')
    expect(lastPayload.city).toBe('Managua')
    expect(lastPayload.timezone).toBe('UTC')
  })
})
