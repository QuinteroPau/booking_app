import { useEffect, useState } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import supabase from '../supabaseClient'
import TimeSlotPicker from './TimeSlotPicker'
import AgendaCalendar from './AgendaCalendar'
import '../styles/main.css'

const diaAbreviado = {
  0: 'Dom', 1: 'Lun', 2: 'Mar', 3: 'Mié', 4: 'Jue', 5: 'Vie', 6: 'Sáb'
}


const formatDate = (date) => date.toLocaleDateString('sv-SE') // YYYY-MM-DD

const AñadirReservaModal = ({ onClose, restaurante, refrescarReservas, setMostrarModalNuevaReserva }) => {
  const [fecha, setFecha] = useState(new Date())
  const [turnosDisponibles, setTurnosDisponibles] = useState([])
  const [horasDelTurno, setHorasDelTurno] = useState([])
  const [diasCerrados, setDiasCerrados] = useState([])

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      guests: 2,
      date: formatDate(fecha),
      turno: '',
      time: '',
      special_requests: ''
    },
    validationSchema: Yup.object({
      name: Yup.string().required(''),
      email: Yup.string().email('Email inválido'),
      phone: Yup.string().required(''),
      guests: Yup.number().min(1).max(20).required(''),
      turno: Yup.string().required('Selecciona un turno'),
      time: Yup.string().required('Selecciona una hora')
    }),
    onSubmit: async (values) => {
      if (!restaurante?.slug) {
        alert("Error: el slug del restaurante no está definido.")
        return
      }

      const { error } = await supabase.from('reservas').insert([{
        ...values,
        slug: restaurante.slug,
        special_requests: values.special_requests
      }])

      if (!error) {
        await refrescarReservas()
        onClose()
      } else {
        console.error('Error insertando reserva:', error)
      }
    }
  })

  const cargarTurnosDelDia = () => {
    const claveFecha = formatDate(fecha)
    const claveDia = diaAbreviado[fecha.getDay()]
    const turnos = restaurante?.turnos?.[claveFecha] || restaurante?.turnos?.[claveDia] || []
    setTurnosDisponibles(turnos)
  }

  useEffect(() => {
    cargarTurnosDelDia()
    formik.setFieldValue('date', formatDate(fecha))
    formik.setFieldValue('turno', '')
    formik.setFieldValue('time', '')
    setHorasDelTurno([])
  }, [fecha])

  const obtenerDiasCerrados = () => {
    const dias = []
    const turnos = restaurante?.turnos || {}
    for (const clave in turnos) {
      const valor = turnos[clave]
      if (valor === null || (Array.isArray(valor) && valor.length === 0)) {
        dias.push(clave)
      }
    }
    return dias
  }

  useEffect(() => {
    const clavesCerradas = obtenerDiasCerrados()
    const nuevasFechas = []
    for (let i = 0; i < 60; i++) {
      const d = new Date()
      d.setDate(d.getDate() + i)
      const claveFecha = formatDate(d)
      const claveDia = diaAbreviado[d.getDay()]
      if (clavesCerradas.includes(claveFecha) || clavesCerradas.includes(claveDia)) {
        nuevasFechas.push(claveFecha)
      }
    }
    setDiasCerrados(nuevasFechas)
  }, [restaurante])

  const handleSeleccionarTurno = (turno) => {
    formik.setFieldValue('turno', turno.nombre)
    const horas = turno.horas.split(',').map(h => h.trim())
    setHorasDelTurno(horas)
  }

  return (
    <div className="editor-modal">
      <div className="editor-box">
        <h2>Nueva reserva</h2>
        <form onSubmit={formik.handleSubmit}>

          <label>Nombre</label>
          <input name="name" value={formik.values.name} onChange={formik.handleChange} />

          <label>Email (opcional)</label>
          <input name="email" value={formik.values.email} onChange={formik.handleChange} />

          <label>Teléfono</label>
          <input name="phone" value={formik.values.phone} onChange={formik.handleChange} />

          <label>Personas</label>
          <input type="number" name="guests" value={formik.values.guests} onChange={formik.handleChange} />

          <label>Fecha</label>
          <AgendaCalendar
            selectedDate={fecha}
            onSelectDate={setFecha}
            diasConReservas={[]}
            diasCerrados={diasCerrados}
            modoVisual="formulario"
          />

          <label>Turno</label>
          <div className="shift-selector">
            {turnosDisponibles.length === 0 ? (
              <p style={{ color: 'red', fontWeight: 'bold' }}>No hay turnos</p>
            ) : (
              turnosDisponibles.map((turno, index) => (
                <button
                  key={index}
                  type="button"
                  className={`shift-option ${formik.values.turno === turno.nombre ? 'selected' : ''}`}
                  onClick={() => handleSeleccionarTurno(turno)}
                >
                  {turno.nombre}
                </button>
              ))
            )}
          </div>

          <label>Hora</label>
          <TimeSlotPicker
            availableTimes={horasDelTurno}
            selectedTime={formik.values.time}
            onSelect={(time) => formik.setFieldValue('time', time)}
          />

          <label>Peticiones especiales</label>
          <textarea name="special_requests" rows="2" value={formik.values.special_requests} onChange={formik.handleChange} />

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
            <button type="submit" className="secondary">Guardar</button>
            <button type="button" className="secondary" onClick={() => setMostrarModalNuevaReserva(false)}>Cerrar</button>
          </div>

        </form>
      </div>
    </div>
  )
}

export default AñadirReservaModal
