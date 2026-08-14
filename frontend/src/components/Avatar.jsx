import { getInitials } from '../lib/format'

const SIZES = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
  xl: 'h-24 w-24 text-2xl',
}

export default function Avatar({ name, src, size = 'md' }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`shrink-0 rounded-full object-cover ${SIZES[size]}`}
      />
    )
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 font-semibold text-white ${SIZES[size]}`}
    >
      {getInitials(name) || '?'}
    </div>
  )
}
