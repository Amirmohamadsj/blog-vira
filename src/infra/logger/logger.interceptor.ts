import {CallHandler,ExecutionContext,HttpException,Injectable,NestInterceptor} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { defer, finalize, Observable, tap } from 'rxjs';
import { LoggerService } from './logger.service.js';
import { RequestContextService } from './context/request-context.service.js';

interface HttpRequest {
    method: string;
    baseUrl?: string;
    route?: {
        path: string;
    };
}

interface HttpResponse {
    statusCode: number;
    setHeader(name: string, value: string): void;
}

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
    constructor(
        private readonly logger: LoggerService,
        private readonly requestContext: RequestContextService,
    ) {}

    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<unknown> {
        const request = context.switchToHttp().getRequest<HttpRequest>();
        const response = context.switchToHttp().getResponse<HttpResponse>();

        const requestId = randomUUID();
        const startTime = Date.now();

        let statusCode = response.statusCode;

        const url = request.route
            ? `${request.baseUrl ?? ''}${request.route.path}`
            : '[unknown-route]';

        response.setHeader('X-Request-ID', requestId);

        return defer(() =>
            this.requestContext.run(
                { requestId },
                () =>
                    next.handle().pipe(
                        tap({
                            error: (error: unknown) => {
                                statusCode = error instanceof HttpException
                                    ? error.getStatus()
                                    : 500;
                            },
                        }),

                        finalize(() => {
                            const durationMs = Date.now() - startTime;

                            this.logger.logHttpRequest(
                                request.method,
                                url,
                                statusCode,
                                durationMs,
                            );
                        }),
                    ),
            ),
        );
    }
}