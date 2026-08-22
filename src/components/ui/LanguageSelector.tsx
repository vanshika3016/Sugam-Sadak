import { useTranslation } from '@/lib/i18n'
import { Globe, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useState, useRef, useEffect } from 'react'

export function LanguageSelector() {
  const { language, setLanguage, t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const languages = [
    { code: 'en' as const, label: 'English', nativeLabel: 'English' },
    { code: 'hi' as const, label: 'Hindi', nativeLabel: 'हिन्दी' },
  ]

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'inline-flex items-center gap-2 px-3 py-2 rounded-[8px] border border-border bg-surface text-sm font-medium',
          'hover:bg-surface-recessed transition-colors duration-150'
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <Globe size={16} />
        <span className="hidden sm:inline">{languages.find(l => l.code === language)?.label}</span>
        <ChevronDown size={14} className={cn('transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 rounded-[10px] border border-border bg-surface shadow-[var(--shadow-dropdown)] overflow-hidden z-50 animate-fade-in">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => { setLanguage(lang.code); setIsOpen(false); }}
              className={cn(
                'w-full px-4 py-2 text-left text-sm transition-colors duration-150',
                language === lang.code ? 'bg-primary/10 text-primary' : 'text-slate hover:bg-surface-recessed'
              )}
            >
              <span className="flex items-center gap-2">
                {language === lang.code && <span className="text-primary">✓</span>}
                {lang.nativeLabel}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}