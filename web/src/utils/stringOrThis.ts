/**
 *
 * @param string to check
 * @param orThis the fallback case
 * @returns the original string or second parameter
 */
export const stringOrThis = (string: any, orThis: string) =>
  typeof string === 'string' ? string : orThis
