import { useState, useEffect, useRef } from 'react'
import ReservationForm from './components/ReservationForm'
import AdminPanel from './components/AdminPanel'
import Login from './components/Login'
import supabase from './supabaseClient'
import { fetchRestauranteConfig } from './utils/configService'
import './styles/main.css'
import 'react-datepicker/dist/react-datepicker.css'

// ✅ Mueve estas funciones FUERA del componente
function obtenerSlugDesdeSubdominio() {
  const hostname = window.location.hostname
  const partes = hostname.split('.')

  if (hostname.includes('localhost') || hostname === '127.0.0.1') {
    return 'ejemplo'
  }

  if (partes[0] === 'www') {
    partes.shift()
  }

  if (partes[0] === 'admin' && partes.length >= 3) {
    return partes[1]
  }

   if (partes[0] === 'booking' && partes.length >= 3) {
    return partes[1]
  }

  if (partes[0] === 'reservas' && partes.length >= 3) {
    return partes[1]
  }

  if (partes.length >= 3) {
    return partes[0]
  }

  if (partes.length === 2) {
    return partes[0]
  }

  return 'ejemplo'
}


function obtenerVistaDesdeSubdominio() {
  const hostname = window.location.hostname
  const partes = hostname.split('.')

  if (hostname.includes('localhost') || hostname === '127.0.0.1') {
    return 'admin'
  }

  if (partes[0] === 'www') {
    partes.shift()
  }

  if (partes[0] === 'admin') {
    return 'admin'
  }

  return 'reserva'
}

function App() {
  const vista = obtenerVistaDesdeSubdominio()

  const [user, setUser] = useState(null)
  const [fondoUrl, setFondoUrl] = useState(null)
  const [logoUrl, setLogoUrl] = useState('')
  const [restaurante, setRestaurante] = useState(null)
  const [height, setHeight] = useState('auto')
  const containerRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [formStep, setFormStep] = useState(1)

  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const newHeight = containerRef.current.scrollHeight
        setHeight(`${newHeight}px`)
      }
    }

    updateHeight()

    const resizeObserver = new ResizeObserver(updateHeight)
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    return () => {
      resizeObserver.disconnect()
    }
  }, [vista])

  useEffect(() => {
    const cargarConfiguracionVisual = async () => {
      const slug = obtenerSlugDesdeSubdominio()
      console.log("Slug detectado:", slug)
      const configPromise = fetchRestauranteConfig(slug)
      const delayPromise = new Promise(resolve => setTimeout(resolve, 10))

      const [config] = await Promise.all([configPromise, delayPromise])

      if (config) {
        setRestaurante(config)

        document.documentElement.style.setProperty('--primary-color', config.color_primario)
        document.documentElement.style.setProperty('--primary-hover', config.color_primario_hover)
        document.documentElement.style.setProperty('--secondary-color', config.color_secundario)
        document.documentElement.style.setProperty('--secondary-hover', config.color_secundario_hover)

        if (config.fondo_url) {
          setFondoUrl(config.fondo_url)
          document.body.style.backgroundSize = 'cover'
          document.body.style.backgroundRepeat = 'no-repeat'
          document.body.style.backgroundPosition = 'center'
        }

        if (config.logo_url) {
          setLogoUrl(config.logo_url)
        }
      }

      setLoading(false)
    }

    cargarConfiguracionVisual()
  }, [])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        zIndex: 9999
      }}>
      </div>
    )
  }

  return (
    <div
      className="app-background"
      style={fondoUrl ? { backgroundImage: `url(${fondoUrl})` } : {}}
    >
      {logoUrl && <img src={logoUrl} alt="Logo" className="restaurante-logo" />}
      <div className="header-left">
        <div className="restaurant-info">
          <h2>{restaurante?.nombre || 'Nombre del Restaurante'}</h2>
          <p>{restaurante?.direccion || ''}</p>
        </div>
      </div>

      <div className="app-container-wrapper" style={{ height }}>
        <div className="app-container" ref={containerRef}>
          <header className="app-header">
            <div className="header-actions">
              {vista === 'admin' ? (
                <h1>Panel de Administración</h1>
              ) : formStep === 1 && (
                <h1>Reserva en {restaurante?.nombre}</h1>
              )}
            </div>
          </header>

          <main className="app-main">
            {vista === 'admin'
              ? (user
                  ? <AdminPanel />
                  : <Login onLogin={() => {}} />)
              : <ReservationForm
                  step={formStep}
                  setStep={setFormStep}
                  restaurante={restaurante}
                />}
          </main>

          <footer className="app-footer">
            <p>© {new Date().getFullYear()} {restaurante?.nombre || 'Nombre del Restaurante'}</p>
          </footer>
        </div>
      </div>
    </div>
  )
}

export default App
