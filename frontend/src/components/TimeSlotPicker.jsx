import '../styles/main.css'

const TimeSlotPicker = ({ availableTimes, selectedTime, onSelect }) => {
  return (
    <div className="time-slot-picker">
      {availableTimes.map(time => (
        <button
          key={time}
          type="button"
          className={`time-slot ${selectedTime === time ? 'selected' : ''}`}
          onClick={() => onSelect(time)}
        >
          {time}
        </button>
      ))}
    </div>
  )
}

export default TimeSlotPicker