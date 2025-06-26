import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Ensures the server is accessible from other devices
    allowedHosts: [
      '7967-188-90-78-37.ngrok-free.app', // Add your ngrok host here
    ]
  }
})
