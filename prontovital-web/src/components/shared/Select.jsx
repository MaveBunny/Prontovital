import { forwardRef } from 'react'

/**
 * Select reutilizável com label e erro
 */
const Select = forwardRef(function Select(
  { label, error, id, options = [], placeholder = 'Selecione', className = '', ...props },
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
      <select
        ref={ref}
        id={inputId}
        className={`
          w-full px-4 py-3 rounded-xl border text-sm bg-white text-slate-800
          outline-none transition-all duration-150 appearance-none cursor-pointer
          ${error
            ? 'border-red-400 focus:ring-2 focus:ring-red-200'
            : 'border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
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
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
})

export default Select
