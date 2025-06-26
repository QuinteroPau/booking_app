import React from 'react'
import DatePickerModal from './DatePickerModal'
import supabase from '../supabaseClient'

const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const obtenerDiaSemana = (fechaStr) => dias[new Date(fechaStr).getDay()]

const EditorReserva = ({ reservaEditando, setReservaEditando, visual, setMostrarDatePicker, mostrarDatePicker, handleGuardarReserva, refrescarReservas }) => {

  const handleEliminarReserva = async () => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar esta reserva?")) return;

    const { error } = await supabase
      .from('reservas')
      .delete()
      .eq('id', reservaEditando.id);

    if (error) {
      console.error("Error eliminando reserva:", error);
      alert("Hubo un error al eliminar la reserva.");
    } else {
      alert("Reserva eliminada correctamente.");
      setReservaEditando(null);
      refrescarReservas();
    }
  };

  const turnosDeLaFecha = visual.turnos?.[reservaEditando.date] 
    || visual.turnos?.[obtenerDiaSemana(reservaEditando.date)] 
    || []

  const diaCerrado = visual.turnos?.[reservaEditando.date] === null

  return (
    <div className="editor-modal">
      <div className="editor-box">
        <h3>Editar Reserva</h3>
        <form onSubmit={handleGuardarReserva}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {mostrarDatePicker && (
              <DatePickerModal
                selectedDate={new Date(reservaEditando.date)}
                onSelectDate={(selectedDate) => {
                  const year = selectedDate.getFullYear()
                  const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
                  const day = String(selectedDate.getDate()).padStart(2, '0')
                  const formattedDate = `${year}-${month}-${day}`
                  setReservaEditando({ ...reservaEditando, date: formattedDate })
                }}
                onClose={() => setMostrarDatePicker(false)}
              />
            )}

            <div className="form-group">
              <label>Nombre</label>
              <input
                type="text"
                value={reservaEditando.name}
                onChange={(e) => setReservaEditando({ ...reservaEditando, name: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label>Email</label>
                <input
                  type="email"
                  value={reservaEditando.email}
                  onChange={(e) => setReservaEditando({ ...reservaEditando, email: e.target.value })}
                />
              </div>

              <div style={{ flex: 1 }}>
                <label>Teléfono</label>
                <input
                  type="text"
                  value={reservaEditando.phone}
                  onChange={(e) => setReservaEditando({ ...reservaEditando, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group" style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label>Fecha</label>
                <input
                  type="text"
                  readOnly
                  value={reservaEditando.date}
                  onClick={() => setMostrarDatePicker(true)}
                  style={{ cursor: 'pointer' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label>Personas</label>
                <input
                  type="text"
                  value={reservaEditando.guests}
                  onChange={(e) => setReservaEditando({ ...reservaEditando, guests: parseInt(e.target.value) || "" })}
                />
              </div>
            </div>

            {diaCerrado ? (
              <div className="form-group">
                <strong style={{ color: 'red' }}>El restaurante está cerrado este día.</strong>
              </div>
            ) : (
              turnosDeLaFecha.length > 0 && (
                <div className="form-group" style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label>Turno</label>
                    <select
                      value={reservaEditando.turno}
                      onChange={(e) => {
                        const nuevoTurno = e.target.value;
                        setReservaEditando({
                          ...reservaEditando,
                          turno: nuevoTurno,
                          time: ''
                        });
                      }}
                    >
                      {turnosDeLaFecha.map((turno, index) => (
                        <option key={index} value={turno.nombre}>{turno.nombre}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ flex: 1 }}>
                    <label>Hora</label>
                    <select
                      value={reservaEditando.time}
                      onChange={(e) => setReservaEditando({ ...reservaEditando, time: e.target.value })}
                    >
                      {turnosDeLaFecha.find(t => t.nombre === reservaEditando.turno)?.horas
                        .split(',')
                        .map((hora, idx) => (
                          <option key={idx} value={hora.trim()}>{hora.trim()}</option>
                        ))}
                    </select>
                  </div>
                </div>
              )
            )}

            <div className="form-group">
              <label>Peticiones especiales</label>
              <textarea
                rows="3"
                value={reservaEditando.specialRequests}
                onChange={(e) => setReservaEditando({ ...reservaEditando, specialRequests: e.target.value })}
              />
            </div>
            <button type="button" className="delete" onClick={handleEliminarReserva}>Eliminar reserva</button>

          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
            <button type="submit" className="secondary">Guardar</button>
            <button type="button" className="secondary" onClick={() => setReservaEditando(null)}>Cerrar</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditorReserva
