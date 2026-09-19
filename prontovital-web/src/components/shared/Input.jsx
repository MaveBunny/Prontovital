import { forwardRef } from 'react'

/**
 * Input reutilizável com suporte a label, erro e ícone
 */
const Input = forwardRef(function Input(
  { label, error, id, className = '', ...props },
  ref
) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={`
          w-full px-4 py-3 rounded-xl border text-sm
          bg-white placeholder:text-slate-400 text-slate-800
          outline-none transition-all duration-150
          ${error
            ? 'border-red-400 focus:ring-2 focus:ring-red-200'
            : 'border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
          }
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
})

export default Input
