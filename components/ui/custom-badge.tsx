import { cn } from '@/lib/utils'

interface BadgeProps {
  variant?: 'orange' | 'blue' | 'green' | 'gray'
  children: React.ReactNode
  className?: string
}

export function CustomBadge({ variant = 'orange', children, className }: BadgeProps) {
  const variants = {
    orange: 'bg-orange-100 text-orange-600',
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    gray: 'bg-gray-100 text-gray-600'
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-bold tracking-wide uppercase rounded-full',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
