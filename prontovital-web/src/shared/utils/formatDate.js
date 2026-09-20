/** Formata data ISO para dd/mm/aaaa */
export function formatarData(isoString) {
  if (!isoString) return '—'
  const d = new Date(isoString)
  return d.toLocaleDateString('pt-BR')
}

/** Formata data e hora ISO para dd/mm/aaaa às HH:mm */
export function formatarDataHora(isoString) {
  if (!isoString) return '—'
  const d = new Date(isoString)
  return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}
