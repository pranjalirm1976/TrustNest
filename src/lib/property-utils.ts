/**
 * Validates whether a database user role is authorized to create properties
 */
export function canCreateProperty(role: string): boolean {
  return ['OWNER', 'PG_OWNER', 'SUPER_ADMIN', 'INSPECTOR'].includes(role)
}

/**
 * Generates spreadsheet-style bed identifiers: A, B, ..., Z, AA, AB, ..., AZ, BA, etc.
 */
export function getBedIdentifier(index: number): string {
  let result = ''
  let num = index
  while (num >= 0) {
    result = String.fromCharCode(65 + (num % 26)) + result
    num = Math.floor(num / 26) - 1
  }
  return result
}
