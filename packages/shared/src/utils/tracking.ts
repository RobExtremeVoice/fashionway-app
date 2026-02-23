/**
 * Gera código de rastreamento único
 * Ex: "FW78921"
 */
export function generateTrackingCode(): string {
  const digits = Math.floor(10000 + Math.random() * 90000)
  return `FW${digits}`
}

/**
 * Valida formato de tracking code
 */
export function isValidTrackingCode(code: string): boolean {
  return /^FW\d{5}$/.test(code)
}
