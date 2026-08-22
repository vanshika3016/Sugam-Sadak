import { ReactNode } from 'react'

interface ConditionalProps {
  condition: boolean
  children: ReactNode
}

export function Conditional({ condition, children }: ConditionalProps) {
  return condition ? children : null
}