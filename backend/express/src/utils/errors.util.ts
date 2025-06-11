import { ErrorName, ErrorMessages } from './errors.constants.js'

interface ErrorDetails {
  [key: string]: any // Общий тип для деталей ошибки
  path?: string // Поле для валидационных ошибок
  message?: string // Поле для валидационных ошибок
}

/**
 * Базовый класс для всех кастомных ошибок приложения.
 * Позволяет стандартизировать структуру ошибок с HTTP-статусом и деталями.
 */
export class CustomError extends Error {
  public statusCode: number
  public details?: ErrorDetails[]

  constructor(message: string, statusCode: number, details?: ErrorDetails[]) {
    super(message)
    this.statusCode = statusCode
    this.details = details
    Object.setPrototypeOf(this, CustomError.prototype)
  }
}

/**
 * Ошибка 400 Bad Request.
 * Используется для ошибок валидации или некорректных запросов.
 */
export class BadRequestError extends CustomError {
  constructor(details?: ErrorDetails[]) {
    super(ErrorMessages[ErrorName.BadRequest], 400, details)
    this.name = ErrorName.BadRequest
    Object.setPrototypeOf(this, BadRequestError.prototype)
  }
}

/**
 * Ошибка 404 Not Found.
 * Используется, когда ресурс не найден.
 */
export class NotFoundError extends CustomError {
  constructor() {
    super(ErrorMessages[ErrorName.NotFound], 404)
    this.name = ErrorName.NotFound
    Object.setPrototypeOf(this, NotFoundError.prototype)
  }
}

/**
 * Ошибка 409 Conflict.
 * Используется, когда запрос конфликтует с текущим состоянием сервера (например, алиас уже занят).
 */
export class ConflictError extends CustomError {
  constructor() {
    super(ErrorMessages[ErrorName.Conflict], 409)
    this.name = ErrorName.Conflict
    Object.setPrototypeOf(this, ConflictError.prototype)
  }
}

/**
 * Ошибка 500 Internal Server Error.
 * Используется для непредвиденных ошибок сервера.
 */
export class InternalServerError extends CustomError {
  constructor() {
    super(ErrorMessages[ErrorName.InternalServer], 500)
    this.name = ErrorName.InternalServer
    Object.setPrototypeOf(this, InternalServerError.prototype)
  }
}

export class ShortAliasGenerationError extends InternalServerError {
  constructor() {
    super()
    this.name = ErrorName.ShortAliasGeneration
    this.message = ErrorMessages[ErrorName.ShortAliasGeneration]
    Object.setPrototypeOf(this, ShortAliasGenerationError.prototype)
  }
}
