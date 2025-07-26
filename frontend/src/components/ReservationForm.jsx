import { useState, useRef, useEffect, useMemo } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import TimeSlotPicker from './TimeSlotPicker'
import '../styles/main.css'
import AgendaCalendar from './AgendaCalendar'
import supabase from '../supabaseClient'
import getSlug from '../utils/getSlug'
const slug = getSlug()
const diaAbreviado = {
  0: 'Dom',
  1: 'Lun',
  2: 'Mar',
  3: 'Mié',
  4: 'Jue',
  5: 'Vie',
  6: 'Sáb'
}

const ReservationForm = ({ step, setStep, restaurante }) => {
  const [submitted, setSubmitted] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [availableTimes, setAvailableTimes] = useState([])
  const [tempDate, setTempDate] = useState(new Date())
  const [turnosDisponibles, setTurnosDisponibles] = useState([])
  const [diasCerrados, setDiasCerrados] = useState([])

  const formatDate = (date) => date.toLocaleDateString('sv-SE') // YYYY-MM-DD

  const formatearFechaBonita = (fechaISO) => {
    if (!fechaISO) return ''
    const [year, month, day] = fechaISO.split('-')
    return `${day}/${month}/${year}`
  }

  const obtenerDiasCerrados = () => {
  const dias = []
  const turnos = restaurante?.turnos || {}
  for (const clave in turnos) {
    const valor = turnos[clave]
    // Si es null o un array vacío
    if (valor === null || (Array.isArray(valor) && valor.length === 0)) {
      dias.push(clave)
    }
  }
  return dias
}


  useEffect(() => {
    const clavesCerradas = obtenerDiasCerrados()
    const nuevasFechas = []
    for (let i = 0; i < 30; i++) {
      const d = new Date()
      d.setDate(d.getDate() + i)
      const claveFecha = d.toISOString().split('T')[0]
      const claveDia = diaAbreviado[d.getDay()]
      if (clavesCerradas.includes(claveFecha) || clavesCerradas.includes(claveDia)) {
        nuevasFechas.push(claveFecha)
      }
    }
    setDiasCerrados(nuevasFechas)
  }, [restaurante])

  const enviarConfirmacionReserva = async (values) => {
    try {
      const { error } = await supabase.functions.invoke('send-confirmation', {
        body: {
          email: values.email,
          name: values.name,
          date: values.date,
          time: values.time,
          guests: values.guests,
          phone: values.phone,                        // ✅ añadido
          specialRequests: values.specialRequests,
          restaurantName: restaurante.nombre,
          logo: restaurante.logo_url,
          primaryColor: restaurante.color_primario,
          secondaryColor: restaurante.color_secundario,
          address: restaurante.direccion,
          telefonoRestaurante: restaurante.telefono,
          emailRestaurante: restaurante.emailRestaurante,
          slug: restaurante.slug,
          extraMail: restaurante.extraMail // ✅ AÑADIDO AQUÍ
        }
      })
      if (error) console.error('Error enviando email:', error)
    } catch (error) {
      console.error('Error general:', error)
    }
  }

  const validationSchema = useMemo(() => Yup.object({
    date: Yup.date().required('Requerido'),
    time: Yup.string().required('Requerido'),
    shift: Yup.string().required('Selecciona un turno'),
    guests: Yup.number()
      .min(1, 'Debe ser al menos 1 persona')
      .max(restaurante?.max_reserva || 12, `Para más de ${restaurante?.max_reserva || 12} personas, por favor llama al restaurante al ${restaurante?.telefono || 'número no disponible'}`)
      .required('Requerido'),
    name: Yup.string().required('Requerido'),
    email: Yup.string().email('Email inválido').required('Requerido'),
    phone: Yup.string().required('Requerido')
  }), [restaurante])

  const formik = useFormik({
    initialValues: {
      date: '',
      time: '',
      shift: '',
      guests: 2,
      name: '',
      email: '',
      phone: '',
      specialRequests: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      
      setCargando(true)  // ⏳ Inicia spinner

      try {
        const { error } = await supabase.from('reservas').insert([{
          date: values.date,
          time: values.time,
          guests: values.guests,
          name: values.name,
          email: values.email,
          phone: values.phone,
          turno: values.shift,
          special_requests: values.specialRequests,
          slug: slug
        }])
        if (!error) {
          await enviarConfirmacionReserva(values)
          setSubmitted(true)
        }
      } catch (error) {
        console.error('Error de red o conexión:', error)
      }finally {
    setCargando(false)  // ✅ Oculta spinner al finalizar
  }
    }
  })

  const handleTurnoSeleccionado = (turno) => {
    formik.setFieldValue('shift', turno.nombre)
    const horasArray = turno.horas.split(',').map(hora => hora.trim())
    setAvailableTimes(horasArray)
  }

const calcularDisponibilidadTurnos = async () => {
  const { data, error } = await supabase
    .from('restaurantes')
    .select('turnos')
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('Error al obtener turnos:', error)
    return []
  }

  const dateKey = formatDate(tempDate)
  let turnosDelDia = data.turnos?.[dateKey]

  // Si no hay turno específico, usa el día de la semana
  if (!turnosDelDia) {
    const diaNombre = diaAbreviado[new Date(tempDate).getDay()]
    turnosDelDia = data.turnos?.[diaNombre] || []
  }

  if (restaurante?.modo_aforo === 'basic') {
    const { data: reservas, error: reservasError } = await supabase
      .from('reservas')
      .select('turno, guests')
      .eq('date', formatDate(tempDate))

    if (reservasError) {
      console.error('Error al obtener reservas:', reservasError)
      return turnosDelDia
    }

    const aforoActual = reservas.reduce((acc, r) => {
      acc[r.turno] = (acc[r.turno] || 0) + r.guests
      return acc
    }, {})

    return turnosDelDia.map(turno => {
      const aforoMaximo = turno.aforo_maximo || 9999
      const reservado = aforoActual[turno.nombre] || 0
      const disponible = aforoMaximo - reservado
      return { ...turno, disponible }
    })
  }

  return turnosDelDia
}


  useEffect(() => {
    const cargarTurnos = async () => {
      const turnos = await calcularDisponibilidadTurnos()
      setTurnosDisponibles(turnos)
    }
    cargarTurnos()
  }, [tempDate, formik.values.guests])
  if (cargando) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
        <p>Procesando tu reserva...</p>
      </div>
    )
  }
  if (submitted) {
    return <div className="confirmation" style={{ textAlign: 'center'}}><h2>¡Reserva Confirmada!</h2><br/><div className="reservation-summary">
        <div className="summary-items">
          <div className="summary-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none"
              stroke="var(--primary-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <h4>{formatearFechaBonita(formik.values.date)}</h4>
          </div>
          <div className="summary-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none"
              stroke="var(--primary-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            <h4>{formik.values.time}h</h4>
          </div>
          <div className="summary-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none"
              stroke="var(--primary-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-3-3.87M4 21v-2a4 4 0 0 1 3-3.87" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <h4>{formik.values.guests} Personas</h4>
          </div>
          
        </div>
      </div><p>Hemos enviado los detalles a tu correo electrónico.</p><br/></div>
  }

  const disableStep1Next =
  !formik.values.shift ||
  formik.values.guests < 1 ||
  formik.values.guests > (restaurante?.max_reserva || 12);

  const disableStep2Next = !formik.values.time
  const disableStep3Next = !formik.values.email.trim() || !formik.values.phone.trim() || !formik.values.name.trim()

  return (
    <form onSubmit={formik.handleSubmit} className="reservation-form">
      {step === 1 && (
        <>
          <div className="form-group">
            <h3 className="step-title">Fecha</h3>
            <AgendaCalendar
              selectedDate={tempDate}
              onSelectDate={setTempDate}
              diasConReservas={[]}
              diasCerrados={diasCerrados}
              modoVisual="formulario"
            />

          </div>

          <div className="form-group">
            <h3 className="step-title">Personas</h3>
            <div className="people-counter">
              <button type="button" onClick={() => formik.setFieldValue('guests', Math.max(1, formik.values.guests - 1))}>−</button>
              <input
                type="number"
                value={formik.values.guests}
                onChange={(e) => {
                  const num = parseInt(e.target.value)
                  if (!isNaN(num)) {
                    formik.setFieldValue('guests', num)
                  }
                }}
              />
              <button type="button" onClick={() => formik.setFieldValue('guests', formik.values.guests + 1)}>+</button>
            </div>
            {formik.errors.guests && <div className="error-message">{formik.errors.guests}</div>}
          </div>

          <div className="form-group">
            <h3 className="step-title">Turno</h3>
            <div className="shift-selector" role="group">
  {turnosDisponibles.length === 0 ? (
    <p style={{ color: 'red', fontWeight: 'bold', marginTop: '1rem' }}>
      Restaurante cerrado
    </p>
  ) : (
    turnosDisponibles.map((turno, index) => {
      const noDisponible =
        restaurante?.modo_aforo === 'basic' &&
        turno.disponible < formik.values.guests;
      return (
        <button
          key={index}
          type="button"
          className={`shift-option ${
            formik.values.shift === turno.nombre ? 'selected' : ''
          } ${noDisponible ? 'disabled' : ''}`}
          disabled={noDisponible}
          onClick={() => handleTurnoSeleccionado(turno)}
        >
          {turno.nombre}{' '}
          {restaurante?.modo_aforo === 'basic'}
        </button>
      );
    })
  )}
</div>

            {formik.touched.shift && formik.errors.shift && <div className="error">{formik.errors.shift}</div>}
          </div>

          <div className="button-group">
            <button type="button" disabled={disableStep1Next} className={`next-button ${disableStep1Next ? 'disabled' : ''}`}
              onClick={() => { formik.setFieldValue('date', formatDate(tempDate)); setStep(2) }}>
              Siguiente
            </button>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <div className="form-group">
            <h3 className="step-title">Hora</h3>
            <TimeSlotPicker availableTimes={availableTimes} selectedTime={formik.values.time} onSelect={(time) => formik.setFieldValue('time', time)} />
            {formik.touched.time && formik.errors.time && <div className="error">{formik.errors.time}</div>}
          </div>

          <div className="button-group">
            <button type="button" className="back-button" onClick={() => setStep(1)}>Atrás</button>
            <button type="button" disabled={disableStep2Next} className={`next-button ${disableStep2Next ? 'disabled' : ''}`} onClick={() => setStep(3)}>Siguiente</button>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <div className="form-group">
      <div className="reservation-summary">
        <h3 className="summary-title">Confirma los detalles de tu reserva</h3>
        <div className="summary-items">
          <div className="summary-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none"
              stroke="var(--primary-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <h4>{formatearFechaBonita(formik.values.date)}</h4>
          </div>
          <div className="summary-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none"
              stroke="var(--primary-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-3-3.87M4 21v-2a4 4 0 0 1 3-3.87" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <h4>{formik.values.guests}</h4>
          </div>
          <div className="summary-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none"
              stroke="var(--primary-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            <h4>{formik.values.time}</h4>
          </div>
          <button
            type="button"
            className="modify-button"
            onClick={() => {
              setStep(1)
              formik.setFieldValue('time', '') // ❗ borrar la hora seleccionada
            }}
          >
            Modificar
          </button>
        </div>
      </div>
    </div>

          <div className="form-group">
            <label>Nombre</label>
            <input id="name" name="name" type="text" onChange={formik.handleChange} value={formik.values.name} />
            {formik.touched.name && formik.errors.name && <div className="error">{formik.errors.name}</div>}
          </div>

          <div className="form-group">
            <label>Email</label>
            <input id="email" name="email" type="email" onChange={formik.handleChange} value={formik.values.email} />
            {formik.touched.email && formik.errors.email && <div className="error">{formik.errors.email}</div>}
          </div>

          <div className="form-group">
            <label>Teléfono</label>
            <input id="phone" name="phone" type="tel" onChange={formik.handleChange} value={formik.values.phone} />
            {formik.touched.phone && formik.errors.phone && <div className="error">{formik.errors.phone}</div>}
          </div>

          <div className="form-group">
            <label>Peticiones especiales</label>
            <textarea id="specialRequests" name="specialRequests" rows="3" onChange={formik.handleChange} value={formik.values.specialRequests} />
          </div>

          <div className="button-group">
            <button type="submit" className={`next-button ${disableStep3Next ? 'disabled' : ''}`} disabled={disableStep3Next}>Confirmar Reserva</button>
          </div>
        </>
      )}
    </form>
  )
}

export default ReservationForm
