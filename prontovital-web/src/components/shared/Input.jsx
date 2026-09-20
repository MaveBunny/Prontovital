import { forwardRef } from 'react'

/**
 * Input reutilizável com suporte a label, erro e estilos de alta fidelidade
 */
const Input = forwardRef(function Input(
  { label, error, id, className = '', ...props },
  ref
) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="text-[0.8125rem] font-bold text-slate-700 tracking-wide">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={`
          w-full px-4 py-3.5 rounded-xl border text-sm shadow-sm
          bg-white placeholder:text-slate-400 text-slate-800
          outline-none transition-all duration-300 ease-out hover:border-slate-300
          ${error
            ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/20'
            : 'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20'
          }
          ${className}
        `}
        {...props}
      />
      {error && <p id={`${inputId}-error`} className="text-xs font-semibold text-red-500 mt-0.5 animate-[fadeIn_0.2s_ease]">{error}</p>}
    </div>
  )
})

export default Input
