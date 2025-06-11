export const fallbackLng = 'en'
export const languages = [fallbackLng, 'vi']
export const defaultNS = 'common'

export function getOptions (lng = fallbackLng, ns: string | string[] = defaultNS) {
  const resolvedNs = Array.isArray(ns) ? ns : [ns]; // Ensure ns is always an array for the 'ns' property
  const singleNs = resolvedNs[0] || defaultNS; // Get a single namespace for fallback/default

  return {
    // debug: true,
    supportedLngs: languages,
    fallbackLng,
    lng,
    fallbackNS: singleNs,
    defaultNS: singleNs,
    ns: resolvedNs,
  }
} 