import React from 'react'

const ReservaItem = ({ reserva, onEdit }) => {
  return (
    <li className="reserva-item">
      <div className="items-reserva" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <strong>{reserva.name}</strong> - {reserva.time} ({reserva.guests} personas)<br />
          Email: {reserva.email} | Tel: {reserva.phone}
          {reserva.specialRequests && <em><br />Nota: {reserva.specialRequests}</em>}
        </div>
        <button
          className="edit-button"
          onClick={onEdit}
          style={{ marginTop: '5px' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
          </svg>
        </button>
      </div>
    </li>
  )
}

export default ReservaItem
