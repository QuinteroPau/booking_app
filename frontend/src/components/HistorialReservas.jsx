import { useEffect, useState } from 'react'
import supabase from '../supabaseClient'
import '../styles/main.css'
import getSlug from '../utils/getSlug'
const slug = getSlug()

const HistorialReservas = ({ setMostrarHistorialReservas }) => {
  const [reservas, setReservas] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [agrupadas, setAgrupadas] = useState({})

  const formatearFecha = (fechaStr) => {
    const date = new Date(fechaStr)
    return date.toLocaleDateString('es-ES', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    })
  }

  useEffect(() => {
    const fetchReservasAnteriores = async () => {
      const hoy = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('reservas')
        .select('*')
        .eq('slug', slug)
        .lt('date', hoy)
        .order('date', { ascending: false })

      if (!error && data) {
        setReservas(data)
      }
    }

    fetchReservasAnteriores()
  }, [])

  useEffect(() => {
    const agrupadasPorFecha = reservas
      .filter(r => {
        const texto = busqueda.toLowerCase()
        return (
          r.name.toLowerCase().includes(texto) ||
          r.email.includes(texto)
        )
      })
      .reduce((acc, r) => {
        if (!acc[r.date]) acc[r.date] = []
        acc[r.date].push(r)
        return acc
      }, {})

    setAgrupadas(agrupadasPorFecha)
  }, [reservas, busqueda])

  return (
    <div className="editor-modal">
      <div className="editor-box">
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '10px', justifyContent:'space-between'}}> 
          <h2>Historial de Reservas</h2>
          <button className="close-button" onClick={() => setMostrarHistorialReservas(false)}>✕</button>
          
        </div>
        <input style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '10px'}}
          type="text"
          placeholder="Buscar por nombre o email"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="search-input"
        />

        {Object.keys(agrupadas).length === 0 ? (
          <p style={{ marginTop: '20px' }}>No se encontraron reservas.</p>
        ) : (
          Object.entries(agrupadas).map(([fecha, reservasDia]) => (
            <div key={fecha} className="reserva-dia">
              <h3>{formatearFecha(fecha)}</h3>
              <ul className="reservas-list">
                {reservasDia.map((r) => (
                  <li key={r.id} className="reserva-item">
                    <strong>{r.name}</strong> – {r.guests} personas – {r.turno} – {r.time}
                    <br />
                    <small>{r.email} | {r.phone}</small>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default HistorialReservas
