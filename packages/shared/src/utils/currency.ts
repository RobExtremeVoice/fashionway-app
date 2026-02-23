/**
 * Converte centavos para string formatada BRL
 * Ex: 1950 → "R$ 19,50"
 */
export function formatBRL(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100)
}

/**
 * Converte valor decimal em centavos
 * Ex: 19.5 → 1950
 */
export function toCents(value: number): number {
  return Math.round(value * 100)
}

/**
 * Converte centavos para decimal
 * Ex: 1950 → 19.5
 */
export function fromCents(cents: number): number {
  return cents / 100
}

/**
 * Calcula taxa da plataforma
 * Ex: calcPlatformFee(1950, 15) → 293 (R$ 2,93)
 */
export function calcPlatformFee(amountCents: number, feePercent: number): number {
  return Math.round(amountCents * (feePercent / 100))
}

/**
 * Calcula repasse ao motoboy (frete - taxa plataforma)
 */
export function calcRepasse(freteCents: number, feePercent: number): number {
  const taxa = calcPlatformFee(freteCents, feePercent)
  return freteCents - taxa
}
