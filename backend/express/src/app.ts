// backend/express/src/app.ts
import express from 'express'
import morgan from 'morgan'
import { errorHandler } from './middlewares/errorHandler.middleware'
import linkRoutes from './routes/link.routes'

const app = express()

app.use(morgan('dev'))
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello World')
})

app.use('/', linkRoutes)

app.use(errorHandler)

export default app
