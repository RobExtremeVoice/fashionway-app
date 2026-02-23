/**
 * Formata data para padrão brasileiro DD/MM/YYYY
 */
export function formatDateBR(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('pt-BR')
}

/**
 * Formata data e hora para padrão brasileiro
 * Ex: "22/02/2026 às 14:30"
 */
export function formatDateTimeBR(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Formata countdown em MM:SS
 * Ex: 540 → "09:00"
 */
export function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
