import { useRef, useEffect } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { registerLocale } from 'react-datepicker'
import es from 'date-fns/locale/es'
registerLocale('es', es)

const DatePickerModal = ({ selectedDate, onSelectDate, onClose, diasNoDisponibles = [] }) => {
  const datepickerRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datepickerRef.current && !datepickerRef.current.contains(event.target)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  return (
    <div className="datepicker-modal">
      <div ref={datepickerRef} className="datepicker-content">
        <DatePicker
          selected={selectedDate}
          onChange={(date) => {
            onSelectDate(date)
            onClose()
          }}
          inline
          locale="es"
          excludeDates={diasNoDisponibles}
        />
      </div>
    </div>
  )
}

export default DatePickerModal
