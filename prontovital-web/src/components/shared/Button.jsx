const variants = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 active:bg-blue-800',
  secondary: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm active:bg-slate-100',
  danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-500/20 active:bg-rose-800',
  ghost: 'text-blue-600 hover:bg-blue-50 active:bg-blue-100',
  outline: 'bg-transparent border-2 border-blue-600 text-blue-600 hover:bg-blue-50 active:bg-blue-100',
}

const sizes = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-8 py-3.5 text-base',
}

/**
 * Botão reutilizável PRONTOVITAL
 * @param {{ variant?: 'primary'|'secondary'|'danger'|'ghost'|'outline', size?: 'sm'|'md'|'lg', loading?: boolean }} props
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  ...props
}) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 rounded-xl font-bold tracking-wide
        transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed
        active:scale-[0.97] focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/30
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      disabled={loading || props.disabled}
      aria-busy={loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
}
