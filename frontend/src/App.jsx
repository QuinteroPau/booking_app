import { useState, useEffect, useRef } from 'react'
import ReservationForm from './components/ReservationForm'
import AdminPanel from './components/AdminPanel'
import Login from './components/Login'
import supabase from './supabaseClient'
import { fetchRestauranteConfig } from './utils/configService'
import './styles/main.css'
import 'react-datepicker/dist/react-datepicker.css'

function App() {
  const [view, setView] = useState('reserva')
  const [user, setUser] = useState(null)
  const [fondoUrl, setFondoUrl] = useState(null)
  const [logoUrl, setLogoUrl] = useState('')
  const [restaurante, setRestaurante] = useState(null)
  const [height, setHeight] = useState('auto') // Estado para la altura dinámica
  const containerRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [formStep, setFormStep] = useState(1) // Nuevo estado
function obtenerSlugDesdeSubdominio() {
  const hostname = window.location.hostname
  const partes = hostname.split('.')

  if (hostname.includes('localhost') || hostname === '127.0.0.1') {
    return 'ejemplo'
  }

  // Quitar 'www' si existe
  if (partes[0] === 'www') {
    partes.shift()
  }

  if (partes.length >= 3) {
    return partes[0]
  }

  // Si solo es dominio + tld, devuelve el dominio
  if (partes.length === 2) {
    return partes[0]
  }

  return 'ejemplo'
}


  // Add this useEffect to track height changes from ReservationForm steps
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const newHeight = containerRef.current.scrollHeight;
        setHeight(`${newHeight}px`);
      }
    };

    // Initial height set
    updateHeight();

    // You might want to add a ResizeObserver for more dynamic content
    const resizeObserver = new ResizeObserver(updateHeight);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [view]); // Also include any other dependencies that might affect height

  useEffect(() => {
  const cargarConfiguracionVisual = async () => {
    //let slug = 'ejemplo'
    //if (slug === 'localhost') slug = 'ejemplo'

    const slug = obtenerSlugDesdeSubdominio();
    console.log("Slug detectado:", slug)
    const configPromise = fetchRestauranteConfig(slug)
    const delayPromise = new Promise(resolve => setTimeout(resolve, 10)) // mínimo 1 segundo

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

    setLoading(false) // ✅ termina la carga
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

  // Usamos el ref para obtener la altura del contenedor
  useEffect(() => {
    if (containerRef.current) {
      setHeight(containerRef.current.scrollHeight)  // Actualizamos la altura del contenedor dinámicamente
    }
  }, [view]) // Esto se ejecutará cuando cambie la vista

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setView('reserva')
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

      {/* Aquí envolvemos el contenedor app-container en un div con animación de altura */}
      <div className="app-container-wrapper" style={{ height }}>
        <div className="app-container" ref={containerRef}>
          <header className="app-header">
            <div className="header-actions">
              {view === 'admin' ? (
                <h1>Panel de Administración</h1>
              ) : formStep === 1 && (
                <h1>Reserva en {restaurante?.nombre}</h1>
              )}

              <div className="demo-toolbar">
                <button onClick={() => setView(view === 'admin' ? 'reserva' : 'admin')}>
                  🛠
                </button>
                {/* {user && <button onClick={handleLogout}>Cerrar sesión</button>} */}
              </div>
            </div>
          </header>

          <main className="app-main">
            {view === 'admin' && user && <AdminPanel />}
            {(view !== 'admin' || !user) && (
              <div>{view === 'reserva' ? <ReservationForm step={formStep} setStep={setFormStep} restaurante={restaurante} /> : <Login onLogin={() => setView('admin')} />}</div>
            )}
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
