// backend/express/src/app.ts
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { errorHandler } from './middlewares/errorHandler.middleware.js'
import linkRoutes from './routes/link.routes.js'

const app = express()

app.use(morgan('dev'))
app.use(express.json())

const corsOptions = {
  origin: 'http://localhost:5173', // <-- Разрешенный источник
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // <-- Разрешенные методы
  allowedHeaders: ['Content-Type', 'Authorization'], // <-- Разрешенные заголовки
  credentials: true, // <-- Если вы используете куки или заголовки авторизации
}

app.use(cors(corsOptions)) // <-- Применяем CORS middleware

app.set('trust proxy', true)

app.get('/', (req, res) => {
  res.send(`this is the Shortener backend server, try <a href="http://localhost:5173/" target="_blank">frontend</a>`)
})

app.use('/', linkRoutes)

app.use(errorHandler)

export default app
