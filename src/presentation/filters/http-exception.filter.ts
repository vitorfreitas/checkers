import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpAdapterHost,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const httpStatus = this.getHttpStatus(exception);
    const responseBody = {
      statusCode: httpStatus,
      type: exception.constructor.name,
      message: (exception as Error).message,
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }

  private getHttpStatus(exception: unknown) {
    const status = new Map()
      .set('EmptyTileException', HttpStatus.UNPROCESSABLE_ENTITY)
      .set('UserMustJumpException', HttpStatus.UNPROCESSABLE_ENTITY)
      .set('OccupiedTileException', HttpStatus.CONFLICT)
      .set('NotPlayerTurnException', HttpStatus.BAD_REQUEST)
      .set('InvalidMovementException', HttpStatus.UNPROCESSABLE_ENTITY)
      .set('MaxNumberOfPlayersException', HttpStatus.BAD_GATEWAY)
      .set('GameNotFoundException', HttpStatus.NOT_FOUND)
      .set('InvalidTokenException', HttpStatus.UNAUTHORIZED)
      .set('PieceNotFoundException', HttpStatus.NOT_FOUND)
      .set('GameNotStartedException', HttpStatus.BAD_REQUEST)
      .get(exception.constructor.name);

    return status || HttpStatus.INTERNAL_SERVER_ERROR;
  }
}
