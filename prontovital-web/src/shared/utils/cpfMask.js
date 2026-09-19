/** Aplica máscara de CPF: 000.000.000-00 */
export function mascaraCPF(value) {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    .slice(0, 14)
}

/** Remove formatação do CPF */
export function limparCPF(value) {
  return value.replace(/\D/g, '')
}

/** Valida CPF */
export function validarCPF(cpf) {
  const num = limparCPF(cpf)
  if (num.length !== 11 || /^(\d)\1{10}$/.test(num)) return false
  let soma = 0
  for (let i = 0; i < 9; i++) soma += Number(num[i]) * (10 - i)
  let resto = (soma * 10) % 11
  if (resto === 10 || resto === 11) resto = 0
  if (resto !== Number(num[9])) return false
  soma = 0
  for (let i = 0; i < 10; i++) soma += Number(num[i]) * (11 - i)
  resto = (soma * 10) % 11
  if (resto === 10 || resto === 11) resto = 0
  return resto === Number(num[10])
}
