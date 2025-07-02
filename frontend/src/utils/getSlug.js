export default function getSlug() {
  const hostname = window.location.hostname
  const partes = hostname.split('.')

  if (hostname.includes('localhost') || hostname === '127.0.0.1') {
    return 'ejemplo'
  }

  if (partes[0] === 'www') {
    partes.shift()
  }

  // Si hay al menos 3 partes (subdominio.dominio.tld)
  if (partes.length >= 3) {
    // devolver el dominio (segundo nivel)
    return partes[partes.length - 2]
  }

  if (partes.length === 2) {
    return partes[0]
  }

  return 'ejemplo'
}
