/**
 * Valida CPF brasileiro
 */
export function isValidCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, '')
  if (cleaned.length !== 11) return false
  if (/^(\d)\1{10}$/.test(cleaned)) return false

  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(cleaned[i]) * (10 - i)
  let remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cleaned[9])) return false

  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(cleaned[i]) * (11 - i)
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  return remainder === parseInt(cleaned[10])
}

/**
 * Valida CNPJ brasileiro
 */
export function isValidCNPJ(cnpj: string): boolean {
  const cleaned = cnpj.replace(/\D/g, '')
  if (cleaned.length !== 14) return false
  if (/^(\d)\1{13}$/.test(cleaned)) return false

  const calcDigit = (slice: string, weights: number[]) => {
    const sum = slice.split('').reduce((acc, d, i) => acc + parseInt(d) * weights[i], 0)
    const rem = sum % 11
    return rem < 2 ? 0 : 11 - rem
  }

  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]

  return (
    calcDigit(cleaned.slice(0, 12), w1) === parseInt(cleaned[12]) &&
    calcDigit(cleaned.slice(0, 13), w2) === parseInt(cleaned[13])
  )
}

/**
 * Valida CEP brasileiro
 */
export function isValidCEP(cep: string): boolean {
  return /^\d{5}-?\d{3}$/.test(cep)
}

/**
 * Formata CEP: "01310100" → "01310-100"
 */
export function formatCEP(cep: string): string {
  const cleaned = cep.replace(/\D/g, '')
  return cleaned.replace(/^(\d{5})(\d{3})$/, '$1-$2')
}
