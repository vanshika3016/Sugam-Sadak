import { Chip } from '@/components/ui/Chip'
import { cn } from '@/lib/cn'

interface FilterOption<T extends string> {
  value: T
  label: string
}

interface SingleFilterBarProps<T extends string> {
  options: FilterOption<T>[]
  value?: T | 'all'
  onChange: (value: T | 'all') => void
  className?: string
  filters?: never
}

interface MultiFilterBarProps {
  filters: Array<{
    label: string
    value: string
    options: Array<{ value: string; label: string }>
    onChange: (value: string) => void
  }>
  className?: string
  options?: never
  value?: never
  onChange?: never
}

type FilterBarProps<T extends string> = SingleFilterBarProps<T> | MultiFilterBarProps

export function FilterBar<T extends string>({
  options,
  value = 'all',
  onChange,
  className,
  filters,
}: FilterBarProps<T>) {
  // Multi-filter mode
  if (filters) {
    return (
      <div className={cn('flex flex-wrap gap-4', className)}>
        {filters.map((filter, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="text-caption text-muted">{filter.label}</span>
            <div className="flex gap-2">
              <Chip active={filter.value === 'all'} onClick={() => filter.onChange('all')}>
                All
              </Chip>
              {filter.options.map((option) => (
                <Chip
                  key={option.value}
                  active={filter.value === option.value}
                  onClick={() => filter.onChange(option.value)}
                >
                  {option.label}
                </Chip>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Single filter mode (backward compatible)
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      <Chip active={value === 'all'} onClick={() => onChange('all')}>
        All
      </Chip>
      {options?.map((option) => (
        <Chip
          key={option.value}
          active={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Chip>
      ))}
    </div>
  )
}