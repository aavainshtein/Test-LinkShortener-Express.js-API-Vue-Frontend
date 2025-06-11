// backend/express/src/utils/errors.util.ts

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
  public details?: ErrorDetails[] // Опциональные детали, например, для валидации

  constructor(message: string, statusCode: number, details?: ErrorDetails[]) {
    super(message)
    this.statusCode = statusCode
    this.details = details
    // Установка прототипа для корректного instanceof
    Object.setPrototypeOf(this, CustomError.prototype)
  }
}

/**
 * Ошибка 400 Bad Request.
 * Используется для ошибок валидации или некорректных запросов.
 */
export class BadRequestError extends CustomError {
  constructor(message: string = 'Bad Request', details?: ErrorDetails[]) {
    super(message, 400, details)
    Object.setPrototypeOf(this, BadRequestError.prototype)
  }
}

/**
 * Ошибка 404 Not Found.
 * Используется, когда ресурс не найден.
 */
export class NotFoundError extends CustomError {
  constructor(message: string = 'Resource Not Found') {
    super(message, 404)
    Object.setPrototypeOf(this, NotFoundError.prototype)
  }
}

/**
 * Ошибка 409 Conflict.
 * Используется, когда запрос конфликтует с текущим состоянием сервера (например, алиас уже занят).
 */
export class ConflictError extends CustomError {
  constructor(message: string = 'Conflict') {
    super(message, 409)
    Object.setPrototypeOf(this, ConflictError.prototype)
  }
}

/**
 * Ошибка 500 Internal Server Error.
 * Используется для непредвиденных ошибок сервера.
 */
export class InternalServerError extends CustomError {
  constructor(message: string = 'Internal Server Error') {
    super(message, 500)
    Object.setPrototypeOf(this, InternalServerError.prototype)
  }
}
