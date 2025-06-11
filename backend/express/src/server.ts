import app from './app.js' //

const PORT = process.env.BACKEND_PORT || 3000

app.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`)
  console.log(`Access it at http://localhost:${PORT}`)
})
