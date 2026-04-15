import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3000

// Expose runtime env vars to the frontend safely
app.get('/api/config', (_req, res) => {
  res.json({
    geminiApiKey: process.env.VITE_GEMINI_API_KEY || '',
  })
})

// Serve static build files
app.use(express.static(join(__dirname, 'dist')))

// SPA fallback
app.get('*', (_req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`Rota AI running on port ${PORT}`)
})
