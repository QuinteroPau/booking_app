import React, { useState } from 'react'
import DatePickerModal from './DatePickerModal'

const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

const EditorRestaurante = ({ visual, updateVisual, setVisual, setMostrarEditorRestaurante, handleRestauranteSubmit }) => {
  const [diaSeleccionado, setDiaSeleccionado] = useState('Lun')
  const [modoFechaPersonalizada, setModoFechaPersonalizada] = useState(false)
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null)
  const [mostrarDatePicker, setMostrarDatePicker] = useState(false)

  const diaClave = modoFechaPersonalizada ? fechaSeleccionada : diaSeleccionado
  const turnosDia = visual.turnos?.[diaClave] || []

  const actualizarTurnosDia = (nuevosTurnos) => {
    setVisual(prev => ({
      ...prev,
      turnos: {
        ...prev.turnos,
        [diaClave]: nuevosTurnos
      }
    }))
  }

  return (
    <div className="editor-modal">
      <div className="editor-box">
        <h3>Gestión del Restaurante</h3>
        <form onSubmit={handleRestauranteSubmit}>

          {/* Nombre */}
          <div className="form-group" style={{ flex: '1 1 100%' }}>
            <label>Nombre del restaurante</label>
            <input
              type="text"
              value={visual.nombre}
              onChange={(e) => updateVisual('nombre', e.target.value)}
            />
          </div>

          {/* Dirección */}
          <div className="form-group" style={{ flex: '1 1 100%' }}>
            <label>Dirección</label>
            <input
              type="text"
              value={visual.direccion}
              onChange={(e) => updateVisual('direccion', e.target.value)}
            />
          </div>
          
          {/* Teléfono */}
          <div className="form-group" style={{ flex: '1 1 100%' }}>
            <label>Teléfono</label>
            <input
              type="text"
              value={visual.telefono || ''}
              onChange={(e) => updateVisual('telefono', e.target.value)}
            />
          </div>
          {/* Teléfono */}
          <div className="form-group" style={{ flex: '1 1 100%' }}>
            <label>Email del Restaurante</label>
            <input
              type="text"
              value={visual.emailRestaurante || ''}
              onChange={(e) => updateVisual('emailRestaurante', e.target.value)}
            />
          </div>

          {/* Aforo máximo */}
          <div className="form-group" style={{ flex: '1 1 100%' }}>
            <label>Máximo de personas por reserva</label>
            <input
              type="number"
              placeholder="Ejemplo: 12"
              value={visual.max_reserva || ''}
              onChange={(e) => updateVisual('max_reserva', parseInt(e.target.value) || 0)}
            />
          </div>

          {/* Turnos y horarios */}
          <div className="form-group" style={{ flex: '1 1 100%' }}>
            <label>Turnos y Horarios</label>

            {/* Botones por día */}
            <div className="form-group" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {diasSemana.map(dia => (
                <button
                  key={dia}
                  type="button"
                  className={`primary ${!modoFechaPersonalizada && dia === diaSeleccionado ? 'active' : ''}`}
                  onClick={() => {
                    setModoFechaPersonalizada(false)
                    setDiaSeleccionado(dia)
                  }}
                  style={{ flex: 1 }}
                >
                  {dia.charAt(0).toUpperCase() + dia.slice(1)}
                </button>
              ))}
            </div>

            {/* Fecha personalizada */}
            <div className="form-group">
              <button
                type="button"
                className={`primary ${modoFechaPersonalizada ? 'active' : ''}`}
                onClick={() => setMostrarDatePicker(true)}
              >
                {modoFechaPersonalizada ? `Editando ${fechaSeleccionada}` : 'Configurar día personalizado'}
              </button>

              {mostrarDatePicker && (
                <DatePickerModal
                  selectedDate={fechaSeleccionada ? new Date(fechaSeleccionada) : new Date()}
                  onSelectDate={(date) => {
                    const y = date.getFullYear()
                    const m = String(date.getMonth() + 1).padStart(2, '0')
                    const d = String(date.getDate()).padStart(2, '0')
                    const f = `${y}-${m}-${d}`
                    setFechaSeleccionada(f)
                    setModoFechaPersonalizada(true)
                    setMostrarDatePicker(false)
                  }}
                  onClose={() => setMostrarDatePicker(false)}
                />
              )}

              {modoFechaPersonalizada && (
                <button
                  type="button"
                  className="delete"
                  style={{ marginTop: '0.5rem' , marginLeft: '10px'}}
                  onClick={() => actualizarTurnosDia([])}
                >
                  Marcar como cerrado
                </button>
              )}
            </div>

            {turnosDia.length === 0 ? (
  <h3 style={{color: '#888' , marginBottom:'20px'}}>Restaurante cerrado</h3>
) : (
  turnosDia.map((turno, index) => (
    <div key={index} style={{ display: 'flex', flexDirection: 'column', marginBottom: '10px', gap: '4px' }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          placeholder="Turno (ej: Mañana)"
          value={turno.nombre}
          onChange={(e) => {
            const updated = [...turnosDia]
            updated[index].nombre = e.target.value
            actualizarTurnosDia(updated)
          }}
        />
        <input
          type="text"
          placeholder="Horas (ej: 12:00,12:30,13:00)"
          value={turno.horas}
          onChange={(e) => {
            const updated = [...turnosDia]
            updated[index].horas = e.target.value
            actualizarTurnosDia(updated)
          }}
        />
        <button type="button" onClick={() => {
          const updated = [...turnosDia];
          updated.splice(index, 1);
          actualizarTurnosDia(updated)
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <label style={{}}>Aforo por turno:</label>
      {visual.modo_aforo === 'basic' && (
        <input
          type="number"
          placeholder="Aforo máximo por turno"
          value={turno.aforo_maximo || ''}
          onChange={(e) => {
            const updated = [...turnosDia]
            updated[index].aforo_maximo = parseInt(e.target.value) || 0
            actualizarTurnosDia(updated)
          }}
        />
      )}

      <hr style={{ margin: '10px 0', borderColor: '#ddd' }} />
    </div>
  ))
)}


            <button type="button" onClick={() => actualizarTurnosDia([
              ...turnosDia, { nombre: '', horas: '', aforo_maximo: 0 }
            ])}>Añadir turno</button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
            <button type="submit" className="secondary">Guardar</button>
            <button type="button" className="secondary" onClick={() => setMostrarEditorRestaurante(false)}>Cerrar</button>
          </div>

        </form>
      </div>
    </div>
  )
}

export default EditorRestaurante