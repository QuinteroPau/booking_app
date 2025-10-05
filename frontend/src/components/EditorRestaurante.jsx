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
          {/* Frase extra del mail */}
          <div className="form-group" style={{ flex: '1 1 100%' }}>
            <label>Frase extra e-mail de confirmación</label>
            <textarea
              rows={3}
              placeholder="Este texto se añadirá al final del correo al cliente..."
              value={visual.extraMail || ''}
              onChange={(e) => updateVisual('extraMail', e.target.value)}
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
      <p style={{}}>Aforo por turno:</p>
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
      {visual.modo_aforo === 'premium' && (
  <div className="form-group" style={{ flex: '1 1 100%', marginTop: '1rem' }}>
    <h4>Aforo por zonas (modo premium)</h4>

    {Object.entries(visual.aforo_personalizado || {}).map(([zona, config], idx) => (
      <div key={idx} style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
        <h4 style={{ marginBottom: '0.5rem' }}>Zona: {zona}</h4>

        <label>Tipo de configuración:</label>
        <select
          value={config.tipo}
          onChange={(e) => {
            const nuevoTipo = e.target.value
            const nuevaConfig = nuevoTipo === 'mesas'
              ? { tipo: 'mesas', mesas: [2] }
              : { tipo: 'reglas', reglas: [], maxPersonas: null, maxMesas: null }
            setVisual(prev => ({
              ...prev,
              aforo_personalizado: {
                ...prev.aforo_personalizado,
                [zona]: nuevaConfig
              }
            }))
          }}
        >
          <option value="mesas">Lista de mesas</option>
          <option value="reglas">Reglas por número de personas</option>
        </select>

        {config.tipo === 'mesas' && (
          <>
            <ul>
              {config.mesas.map((capacidad, i) => (
                <li key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <label style={{ minWidth: '70px' }}>Mesa {i + 1}:</label>
                  <input
                    type="number"
                    min={1}
                    value={capacidad}
                    onChange={(e) => {
                      const nuevas = [...config.mesas]
                      nuevas[i] = parseInt(e.target.value)
                      setVisual(prev => ({
                        ...prev,
                        aforo_personalizado: {
                          ...prev.aforo_personalizado,
                          [zona]: { ...config, mesas: nuevas }
                        }
                      }))
                    }}
                  />
                  <button type="button" onClick={() => {
                    const nuevas = [...config.mesas]
                    nuevas.splice(i, 1)
                    setVisual(prev => ({
                      ...prev,
                      aforo_personalizado: {
                        ...prev.aforo_personalizado,
                        [zona]: { ...config, mesas: nuevas }
                      }
                    }))
                  }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
                  </button>
                </li>
              ))}
            </ul>
            <button type="button" onClick={() => {
              setVisual(prev => ({
                ...prev,
                aforo_personalizado: {
                  ...prev.aforo_personalizado,
                  [zona]: {
                    ...config,
                    mesas: [...config.mesas, 2]
                  }
                }
              }))
            }}>Añadir mesa</button>
          </>
        )}

        {config.tipo === 'reglas' && (
          <>
            <p><strong>Reglas:</strong></p><div style={{
  display: 'grid',
  gridTemplateColumns: '80px 100px 120px 1fr 40px',
  gap: '10px',
  fontWeight: 'bold',
  marginBottom: '6px'
}}>
  <span>Personas</span>
  <span>Mesas</span>
  <span>Máx reservas</span>
  <span>Días (ej: Vie,Sáb)</span>
  <span></span> {/* espacio para botón eliminar */}
</div>
            {config.reglas.map((regla, i) => (
              
              <div key={i} style={{
    display: 'grid',
    gridTemplateColumns: '80px 100px 120px 1fr 40px',
    gap: '10px',
    marginBottom: '6px',
    alignItems: 'center'
  }}>
                
                <input
                  type="number"
                  placeholder="Personas"
                  value={regla.personas}
                  onChange={(e) => {
                    const reglas = [...config.reglas]
                    reglas[i].personas = parseInt(e.target.value)
                    setVisual(prev => ({
                      ...prev,
                      aforo_personalizado: {
                        ...prev.aforo_personalizado,
                        [zona]: { ...config, reglas }
                      }
                    }))
                  }}
                />
                <input
                  type="text"
                  placeholder="Mesas (número o 'llamar')"
                  value={regla.mesas}
                  onChange={(e) => {
                    const reglas = [...config.reglas]
                    reglas[i].mesas = isNaN(e.target.value) ? e.target.value : parseInt(e.target.value)
                    setVisual(prev => ({
                      ...prev,
                      aforo_personalizado: {
                        ...prev.aforo_personalizado,
                        [zona]: { ...config, reglas }
                      }
                    }))
                  }}
                />
                <input
                  type="number"
                  placeholder=""
                  value={regla.max || ''}
                  onChange={(e) => {
                    const reglas = [...config.reglas]
                    reglas[i].max = parseInt(e.target.value) || null
                    setVisual(prev => ({
                      ...prev,
                      aforo_personalizado: {
                        ...prev.aforo_personalizado,
                        [zona]: { ...config, reglas }
                      }
                    }))
                  }}
                />
                <input
                  type="text"
                  placeholder=""
                  value={regla.dias || ''}
                  onChange={(e) => {
                    const reglas = [...config.reglas]
                    reglas[i].dias = e.target.value
                    setVisual(prev => ({
                      ...prev,
                      aforo_personalizado: {
                        ...prev.aforo_personalizado,
                        [zona]: { ...config, reglas }
                      }
                    }))
                  }}
                />
                <button type="button" onClick={() => {
                  const reglas = [...config.reglas]
                  reglas.splice(i, 1)
                  setVisual(prev => ({
                    ...prev,
                    aforo_personalizado: {
                      ...prev.aforo_personalizado,
                      [zona]: { ...config, reglas }
                    }
                  }))
                }}><svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg></button>
              </div>
            ))}
            <button type="button" onClick={() => {
              const nueva = { personas: 2, mesas: 1 }
              setVisual(prev => ({
                ...prev,
                aforo_personalizado: {
                  ...prev.aforo_personalizado,
                  [zona]: { ...config, reglas: [...config.reglas, nueva] }
                }
              }))
            }}>Añadir regla</button>

            <div style={{ marginTop: '10px' }}>
              <label>Máximo total de personas en la zona:</label>
              <input
                type="number"
                value={config.maxPersonas || ''}
                onChange={(e) => {
                  const max = parseInt(e.target.value) || null
                  setVisual(prev => ({
                    ...prev,
                    aforo_personalizado: {
                      ...prev.aforo_personalizado,
                      [zona]: { ...config, maxPersonas: max }
                    }
                  }))
                }}
              />
              <label>Máximo total de mesas:</label>
              <input
                type="number"
                value={config.maxMesas || ''}
                onChange={(e) => {
                  const max = parseInt(e.target.value) || null
                  setVisual(prev => ({
                    ...prev,
                    aforo_personalizado: {
                      ...prev.aforo_personalizado,
                      [zona]: { ...config, maxMesas: max }
                    }
                  }))
                }}
              />
            </div>
          </>
        )}

        <button type="button" className="delete" style={{ marginTop: '1rem' }}
          onClick={() => {
            const actualizado = { ...visual.aforo_personalizado }
            delete actualizado[zona]
            setVisual(prev => ({
              ...prev,
              aforo_personalizado: actualizado
            }))
          }}>Eliminar zona</button>
      </div>
    ))}

    <button
      type="button"
      onClick={() => {
        const nuevaZona = prompt('Nombre de la nueva zona (ej: DENTRO, FUERA):')
        if (nuevaZona) {
          setVisual(prev => ({
            ...prev,
            aforo_personalizado: {
              ...prev.aforo_personalizado,
              [nuevaZona.toUpperCase()]: { tipo: 'mesas', mesas: [] }
            }
          }))
        }
      }}
    >
      Añadir Zona
    </button>
  </div>
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