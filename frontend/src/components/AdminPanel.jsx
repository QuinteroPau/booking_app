import { useEffect, useState } from 'react'
import supabase from '../supabaseClient'
import AgendaCalendar from './AgendaCalendar'
import DatePickerModal from './DatePickerModal'
import EditorVisual from './EditorVisual'
import EditorRestaurante from './EditorRestaurante'
import EditorReserva from './EditorReserva'
import ReservaItem from './ReservaItem'
import HistorialReservas from './HistorialReservas'
import getSlug from '../utils/getSlug'
import '../styles/main.css'

const AdminPanel = () => {
  const [date, setDate] = useState(new Date())
  const [reservas, setReservas] = useState([])
  const [loading, setLoading] = useState(false)
  const [diasConReservas, setDiasConReservas] = useState([])
  const [diasCerrados, setDiasCerrados] = useState([])
  const [mostrarDatePicker, setMostrarDatePicker] = useState(false)
  const [mostrarEditorVisual, setMostrarEditorVisual] = useState(false)
  const [mostrarEditorRestaurante, setMostrarEditorRestaurante] = useState(false)
  const [mostrarHistorialReservas, setMostrarHistorialReservas] = useState(false)
  const [reservaEditando, setReservaEditando] = useState(null)
  const [visual, setVisual] = useState({
    nombre: '',
    color_primario: '',
    color_secundario: '',
    fondo_url: '',
    logo_url: '',
    turnos: []
  })

  const formatDateLocal = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  const formattedDate = formatDateLocal(date)
  const slug = getSlug()
  console.log('SLUG:', slug)

  const refrescarReservas = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('reservas')
      .select('*')
      .eq('date', formattedDate)
      .eq('slug', slug)
      .order('time', { ascending: true })
    if (!error) setReservas(data)
    setLoading(false)
  }

  useEffect(() => {
    const fetchConfiguracionVisual = async () => {
      const { data, error } = await supabase
        .from('restaurantes')
        .select('nombre, telefono, color_primario, color_primario_hover, color_secundario, color_secundario_hover, fondo_url, logo_url, turnos, direccion, modo_aforo, max_reserva, emailRestaurante') 
        .eq('slug', slug)
        .single()
      if (!error && data) setVisual(data)
    }
    fetchConfiguracionVisual()
  }, [])

  useEffect(() => {
    refrescarReservas();
  }, [formattedDate])
useEffect(() => {
  const diaAbreviado = {
    0: 'Dom',
    1: 'Lun',
    2: 'Mar',
    3: 'Mié',
    4: 'Jue',
    5: 'Vie',
    6: 'Sáb'
  }

  const obtenerDiasCerrados = () => {
    const dias = []
    const turnos = visual?.turnos || {}
    for (const clave in turnos) {
      const valor = turnos[clave]
      if (valor === null || (Array.isArray(valor) && valor.length === 0)) {
        dias.push(clave)
      }
    }
    return dias
  }

  const clavesCerradas = obtenerDiasCerrados()
  const nuevasFechas = []

  for (let i = 0; i < 100; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    const claveFecha = d.toISOString().split('T')[0]
    const claveDia = diaAbreviado[d.getDay()]
    if (clavesCerradas.includes(claveFecha) || clavesCerradas.includes(claveDia)) {
      nuevasFechas.push(claveFecha)
    }
  }

  setDiasCerrados(nuevasFechas)
}, [visual])

  useEffect(() => {
    const fetchDiasConReservas = async () => {
      const today = new Date()
      const futureDate = new Date()
      futureDate.setDate(today.getDate() + 100)
      const { data, error } = await supabase
        .from('reservas')
        .select('date')
        .eq('slug', slug)
        .gte('date', today.toISOString().split('T')[0])
        .lte('date', futureDate.toISOString().split('T')[0])
      if (!error && data) {
        const fechas = [...new Set(data.map(r => r.date))]
        setDiasConReservas(fechas)
      }
    }
    fetchDiasConReservas()
  }, [])

  const darkenColor = (hex, percent) => {
    const num = parseInt(hex.slice(1), 16)
    const amt = Math.round(2.55 * percent)
    const R = (num >> 16) - amt
    const G = ((num >> 8) & 0x00FF) - amt
    const B = (num & 0x0000FF) - amt
    return `#${(0x1000000 +
      (R < 255 ? (R < 0 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 0 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 0 ? 0 : B) : 255)
    ).toString(16).slice(1)}`
  }

  const updateVisual = (campo, valor) => {
    setVisual(prev => {
      const updated = { ...prev, [campo]: valor }
      if (campo === 'color_primario') updated.color_primario_hover = darkenColor(valor, 15)
      if (campo === 'color_secundario') updated.color_secundario_hover = darkenColor(valor, 15)
      return updated
    })
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const fileName = `${slug}/${Date.now()}_${file.name}`
    const { error: uploadError } = await supabase.storage.from('fondos').upload(fileName, file, { upsert: true })
    if (uploadError) return
    const { data: urlData } = supabase.storage.from('fondos').getPublicUrl(fileName)
    const publicUrl = urlData.publicUrl
    setVisual(prev => ({ ...prev, fondo_url: publicUrl }))
  }

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const fileName = `${slug}/${Date.now()}_${file.name}`
    const { error } = await supabase.storage.from('logos').upload(fileName, file)
    if (error) return
    const { data: urlData } = supabase.storage.from('logos').getPublicUrl(fileName)
    const publicUrl = urlData.publicUrl
    setVisual(prev => ({ ...prev, logo_url: publicUrl }))
  }

  const handleVisualSubmit = async (e) => {
    e.preventDefault()
    const { error } = await supabase.from('restaurantes').update(visual).eq('slug', slug)
    if (!error) {
      alert('Cambios guardados')
      setMostrarEditorVisual(false)
      location.reload()
    }
  }

  const handleRestauranteSubmit = async (e) => {
  e.preventDefault()
  const { error } = await supabase.from('restaurantes').update({
    nombre: visual.nombre,
    direccion: visual.direccion,
    telefono: visual.telefono,
    emailRestaurante: visual.emailRestaurante,
    turnos: visual.turnos,
    max_reserva: visual.max_reserva,
    extraMail: visual.extraMail // 🔹 añadir aquí
  }).eq('slug', slug)
    if (!error) {
      alert('Cambios guardados')
      setMostrarEditorRestaurante(false)
      location.reload()
    }
  }

  const handleGuardarReserva = async (e) => {
    e.preventDefault()
    const { error } = await supabase.from('reservas').update({
      date: reservaEditando.date,
      name: reservaEditando.name,
      email: reservaEditando.email,
      phone: reservaEditando.phone,
      guests: reservaEditando.guests,
      turno: reservaEditando.turno,
      time: reservaEditando.time,
      special_requests: reservaEditando.specialRequests
    }).eq('id', reservaEditando.id)

    if (!error) {
      alert('Reserva actualizada')
      setReservaEditando(null)
      refrescarReservas()
    }
  }

  return (
    <div className="admin-panel-box">
      <div className="admin-buttons">
        <button onClick={() => setMostrarEditorVisual(true)} className="edit">Editar Apariencia</button>
        <button onClick={() => setMostrarEditorRestaurante(true)} className="edit">Editar Restaurante</button>
        <button onClick={() => setMostrarHistorialReservas(true)} className="edit">Reservas anteriores</button>
      </div>

      <h2>Agenda de Reservas</h2>

      {mostrarEditorVisual && (
        <EditorVisual visual={visual} updateVisual={updateVisual} handleVisualSubmit={handleVisualSubmit} setMostrarEditorVisual={setMostrarEditorVisual} handleImageUpload={handleImageUpload} handleLogoUpload={handleLogoUpload} />
      )}

      {mostrarEditorRestaurante && (
        <EditorRestaurante visual={visual} updateVisual={updateVisual} setVisual={setVisual} setMostrarEditorRestaurante={setMostrarEditorRestaurante} handleRestauranteSubmit={handleRestauranteSubmit} />
      )}

      {mostrarHistorialReservas && (
        <HistorialReservas visual={visual} updateVisual={updateVisual} setVisual={setVisual} setMostrarHistorialReservas={setMostrarHistorialReservas}/>
      )}

      {reservaEditando && (
        <EditorReserva 
          reservaEditando={reservaEditando} 
          setReservaEditando={setReservaEditando} 
          visual={visual} 
          setMostrarDatePicker={setMostrarDatePicker} 
          mostrarDatePicker={mostrarDatePicker} 
          handleGuardarReserva={handleGuardarReserva} 
          refrescarReservas={refrescarReservas} 
        />
      )}

      <AgendaCalendar
  selectedDate={date}
  onSelectDate={setDate}
  diasConReservas={diasConReservas}
  diasCerrados={diasCerrados}
  modoVisual="admin"
/>


      <h3 style={{ marginTop: '10px' }}>{date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>

      {loading ? (
        <p>Cargando reservas...</p>
      ) : reservas.length === 0 ? (
        <p>No hay reservas este día.</p>
      ) : (
        <ul className="reservas-list">
          {reservas.map((r) => (
            <ReservaItem key={r.id} reserva={r} onEdit={() => setReservaEditando(r)} />
          ))}
        </ul>
      )}
    </div>
  )
}

export default AdminPanel
