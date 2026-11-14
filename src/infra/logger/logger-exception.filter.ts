import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
    Injectable,
} from '@nestjs/common';

import { LoggerService } from './logger.service.js';

interface HttpRequest {
    method: string;
    url: string;
}

interface HttpResponse {
    status(code: number): HttpResponse;
    json(body: unknown): void;
}

@Catch()
@Injectable()
export class LoggerExceptionFilter implements ExceptionFilter {
    constructor(
        private readonly logger: LoggerService,
    ) {}

    catch(exception: unknown, host: ArgumentsHost): void {
        const context = host.switchToHttp();

        const request = context.getRequest<HttpRequest>();
        const response = context.getResponse<HttpResponse>();

        const statusCode = exception instanceof HttpException
            ? exception.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;

        const errorName = exception instanceof Error
            ? exception.name
            : 'UnknownError';

        const errorMessage = exception instanceof Error
            ? exception.message
            : 'An unexpected error occurred';

        const stack = exception instanceof Error
            ? exception.stack
            : undefined;

        this.logger.logException(
            errorName,
            errorMessage,
            statusCode,
            stack,
        );

        const errorResponse = exception instanceof HttpException
            ? exception.getResponse()
            : {
                statusCode,
                message: 'Internal server error',
            };

        response.status(statusCode).json(errorResponse);
    }
}