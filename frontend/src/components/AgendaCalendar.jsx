import { useState, useRef, useEffect } from 'react'
import DatePicker from 'react-datepicker'
import '../styles/main.css'
import 'react-datepicker/dist/react-datepicker.css'
import { registerLocale } from 'react-datepicker'
import es from 'date-fns/locale/es'
registerLocale('es', es)

const AgendaCalendar = ({ selectedDate, onSelectDate, diasConReservas = [], diasCerrados = [], modoVisual = 'formulario' }) => {

  const [mostrarSelector, setMostrarSelector] = useState(false)
  const datepickerRef = useRef(null)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const selected = new Date(selectedDate)
  selected.setHours(0, 0, 0, 0)

  const diffInDays = Math.floor((selected - today) / (1000 * 60 * 60 * 24))
  const formatDateLocal = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  let startDate
  const isMobile = window.innerWidth < 768;
  const visibleDays = isMobile ? 4 : 7;
  const offset = isMobile ? 1 : 3;

  if (diffInDays <= offset - 1) {
    startDate = new Date(today)
  } else {
    startDate = new Date(selected)
    startDate.setDate(selected.getDate() - offset)

    if (startDate < today) {
      startDate = new Date(today)
    }
  }

  const days = Array.from({ length: visibleDays }, (_, i) => {
    const d = new Date(startDate)
    d.setDate(startDate.getDate() + i)
    return d
  })

  const formatDay = (date) =>
    date.toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase()

  const isSameDay = (a, b) => a.toDateString() === b.toDateString()

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datepickerRef.current && !datepickerRef.current.contains(event.target)) {
        setMostrarSelector(false)
      }
    }

    if (mostrarSelector) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [mostrarSelector])

  return (
    <div className="agenda-wrapper">
      <div className="agenda-calendar">
        {days.map((date, index) => {
          const fechaStr = formatDateLocal(date)
          const isCerrado = diasCerrados.includes(fechaStr)

          return (
            <div
              key={index}
              className={`agenda-day ${isSameDay(date, selectedDate) ? 'selected' : ''} ${isCerrado && modoVisual === 'formulario' ? 'deshabilitado' : ''}`}
              onClick={() => {
                if (modoVisual === 'formulario' && isCerrado) return
                onSelectDate(date)
              }}
            >

              <div className="agenda-day-name">{formatDay(date)}</div>
              <div className="agenda-day-date">
                <span className="day-number">{date.getDate()}</span>
                <span className="day-month">
                  {date.toLocaleDateString('es-ES', { month: 'short' })}
                </span>
              </div>
              {(diasConReservas.includes(fechaStr) || isCerrado) && (
                <div className={`reserva-dot ${isCerrado ? 'cerrado-dot' : ''}`}></div>
              )}
            </div>
          )
        })}

        <div className="agenda-plus-wrapper">
          <button
            className="agenda-add-button"
            onClick={() => setMostrarSelector(!mostrarSelector)}
            aria-label="Elegir otra fecha"
          >
            ...
          </button>
        </div>

        {mostrarSelector && (
          <div className="datepicker-modal">
            <div ref={datepickerRef} className="datepicker-content">
              <DatePicker
  selected={selectedDate}
  onChange={(date) => {
    onSelectDate(date)
    setMostrarSelector(false)
  }}
  inline
  locale="es"
  excludeDates={modoVisual === 'formulario' ? diasCerrados.map(f => new Date(f)) : []}

/>

            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AgendaCalendar