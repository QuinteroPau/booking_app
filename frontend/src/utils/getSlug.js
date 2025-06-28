export default function getSlug() {
  const hostname = window.location.hostname
  const partes = hostname.split('.')

  if (hostname.includes('localhost') || hostname === '127.0.0.1') {
    return 'ejemplo'
  }

  // Remove www if present
  if (partes[0] === 'www') {
    partes.shift()
  }

  if (partes.length >= 3) {
    return partes[0]
  }

  if (partes.length === 2) {
    return partes[0]
  }

  return 'ejemplo'
}
