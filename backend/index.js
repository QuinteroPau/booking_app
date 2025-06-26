const express = require('express');
const cors = require('cors');
const supabase = require('./supabaseClient')
const app = express();
const PORT = 3001;

// Permitir solicitudes desde tu frontend local
app.use(cors({
  origin: 'http://localhost:5173', // o '*', pero no se recomienda en producción
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json()); // muy importante para leer JSON en POST

// Ejemplo de ruta
app.post('/api/reservas', async (req, res) => {
  const { date, time, guests, name, email, phone, specialRequests } = req.body
  const { data, error } = await supabase
    .from('reservas')
    .insert([
      {
        date,
        time,
        guests,
        name,
        email,
        phone,
        special_requests: specialRequests
      }
    ])

  if (error) {
    console.error('Error al guardar reserva:', error)
    return res.status(500).json({ error: 'Error guardando reserva' })
  }
  console.log('Reserva guardada:', data)
  res.json({ message: 'Reserva guardada correctamente' })
})

app.get('/api/reservas', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('reservas')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error al obtener reservas:', error);
    res.status(500).json({ error: 'Error al obtener reservas' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en http://localhost:${PORT}`);
});
