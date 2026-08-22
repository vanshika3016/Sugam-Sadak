import { describe, expect, it } from 'vitest'
import { assertTransition, canTransition } from '@/services/stateMachineService'

describe('stateMachineService', () => {
  it('allows the P0 happy-path transitions', () => {
    expect(canTransition('reported', 'verified')).toBe(true)
    expect(canTransition('verified', 'assigned')).toBe(true)
    expect(canTransition('assigned', 'in_repair')).toBe(true)
    expect(canTransition('in_repair', 'inspection')).toBe(true)
    expect(canTransition('inspection', 'resolved')).toBe(true)
  })

  it('rejects invalid jumps', () => {
    expect(canTransition('reported', 'resolved')).toBe(false)
    expect(() => assertTransition('reported', 'resolved')).toThrow()
  })
})
