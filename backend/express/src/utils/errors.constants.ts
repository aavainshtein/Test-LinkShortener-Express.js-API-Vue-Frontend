export enum ErrorName {
  BadRequest = 'BadRequestError',
  NotFound = 'NotFoundError',
  Conflict = 'ConflictError',
  InternalServer = 'InternalServerError',
  ShortAliasGeneration = 'ShortAliasGenerationError',
}

export const ErrorMessages = {
  [ErrorName.BadRequest]: 'Bad Request',
  [ErrorName.NotFound]: 'Short URL not found.',
  [ErrorName.Conflict]: 'Alias is already in use.',
  [ErrorName.InternalServer]: 'Internal Server Error',
  [ErrorName.ShortAliasGeneration]:
    'Failed to generate a unique short alias after multiple attempts.',
}
