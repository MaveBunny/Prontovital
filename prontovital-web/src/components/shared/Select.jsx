import { forwardRef } from 'react'

/**
 * Select reutilizável com label e erro e alta fidelidade
 */
const Select = forwardRef(function Select(
  { label, error, id, options = [], placeholder = 'Selecione', className = '', ...props },
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
      <div className="relative">
        <select
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={`
            w-full px-4 py-3.5 rounded-xl border text-sm bg-white text-slate-800 shadow-sm
            outline-none transition-all duration-300 ease-out appearance-none cursor-pointer hover:border-slate-300
            ${error
              ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/20'
              : 'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20'
            }
            ${className}
          `}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>
      </div>
      {error && <p id={`${inputId}-error`} className="text-xs font-semibold text-red-500 mt-0.5 animate-[fadeIn_0.2s_ease]">{error}</p>}
    </div>
  )
})

export default Select
