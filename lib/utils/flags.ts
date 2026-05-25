const FLAG_CODE_MAP: Record<string, string> = {
  EN: 'gb-eng',
  SC: 'gb-sct',
  WA: 'gb-wls',
  NI: 'gb-nir',
}

export function getFlagImageCode(countryCode: string | null | undefined): string | null {
  if (!countryCode) return null

  const normalized = countryCode.trim().toUpperCase()
  if (!normalized) return null

  return FLAG_CODE_MAP[normalized] ?? normalized.toLowerCase()
}

export function getFlagImageUrl(
  countryCode: string | null | undefined,
  sourceWidth: 20 | 40 | 80 | 160 = 40
): string | null {
  const imageCode = getFlagImageCode(countryCode)
  if (!imageCode) return null

  return `https://flagcdn.com/w${sourceWidth}/${imageCode}.png`
}
