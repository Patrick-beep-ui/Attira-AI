import { describe, it, expect, vi } from 'vitest'
import { signupFlow } from '../../src/auth/signup-core'

describe('signupFlow', () => {
  it('calls onSuccess when signup succeeds', async () => {
    const onSuccess = vi.fn()
    const mockSignUp = vi.fn().mockResolvedValue({ error: null })
    await signupFlow('alice@example.com', 'secret', mockSignUp, onSuccess)
    expect(mockSignUp).toHaveBeenCalledWith('alice@example.com', 'secret')
    expect(onSuccess).toHaveBeenCalled()
  })

  it('returns error when signup fails', async () => {
    const onSuccess = vi.fn()
    const mockSignUp = vi.fn().mockResolvedValue({ error: { message: 'exists' } })
    const res = await signupFlow('alice@example.com', 'secret', mockSignUp, onSuccess)
    expect(res).toEqual({ error: { message: 'exists' } })
    expect(onSuccess).not.toHaveBeenCalled()
  })
})
