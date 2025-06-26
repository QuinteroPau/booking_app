export default function getSlug() {
  const hostname = window.location.hostname
  const partes = hostname.split('.')

  if (hostname.includes('localhost') || hostname === '127.0.0.1') {
    return 'ejemplo' // slug por defecto en local
  }

  if (partes.length >= 3) {
    return partes[0] // subdominio
  }

  return 'ejemplo' // fallback
}
