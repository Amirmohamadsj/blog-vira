import { Injectable } from '@nestjs/common';
import type { LoggerService as NestLoggerService } from '@nestjs/common';

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { RequestContextService } from './context/request-context.service.js';

type LogLevel = 'error' | 'warn' | 'log' | 'debug' | 'verbose';

interface LogEntry {
    project: string;
    version: string;
    timestamp: string;
    level: LogLevel;
    context?: string;
    message: string;
    requestId?: string;

    request?: {
        method: string;
        url: string;
    };

    response?: {
        statusCode: number;
        durationMs: number;
    };

    error?: {
        name: string;
        message: string;
        statusCode?: number;
        stack?: string;
    };
}

interface ProjectMetadata {
    project: string;
    version: string;
}

const LOG_LEVELS: Record<LogLevel, LogLevel[]> = {
    error: ['error'],
    warn: ['error', 'warn'],
    log: ['error', 'warn', 'log'],
    debug: ['error', 'warn', 'log', 'debug'],
    verbose: ['error', 'warn', 'log', 'debug', 'verbose'],
};

function getLogLevels(): LogLevel[] {
    const defaultLevel: LogLevel =
        process.env.NODE_ENV === 'production' ? 'log' : 'debug';

    const logLevel = process.env.LOG_LEVEL ?? defaultLevel;

    return LOG_LEVELS[logLevel as LogLevel] ?? LOG_LEVELS[defaultLevel];
}

function formatLog(entry: LogEntry, isDevelopment: boolean): string {
    if (isDevelopment) {
        const context = entry.context ? `[${entry.context}]` : '';

        const requestId = entry.requestId
            ? `[RequestID: ${entry.requestId}]`
            : '';

        const levelInfo = [
            entry.level.toUpperCase(),
            context,
            requestId,
        ].filter(Boolean).join(' ');

        const request = entry.request
            ? `${entry.request.method} ${entry.request.url}`
            : '';

        const response = entry.response
            ? `Status: ${entry.response.statusCode} | Duration: ${entry.response.durationMs}ms`
            : '';

        const error = entry.error
            ? [
                `Error: ${entry.error.name}`,
                `Message: ${entry.error.message}`,
                entry.error.statusCode !== undefined
                    ? `Status Code: ${entry.error.statusCode}`
                    : '',
                entry.error.stack,
            ].filter(Boolean).join('\n')
            : '';

        return [
            `${entry.timestamp} ${entry.project} v${entry.version}`,
            levelInfo,
            request,
            response,
            entry.message,
            error,
        ].filter(Boolean).join('\n');
    }

    return JSON.stringify(entry);
}

@Injectable()
export class LoggerService implements NestLoggerService {
    private readonly project: ProjectMetadata;
    private readonly isDevelopment: boolean;
    private readonly enabledLevels = new Set(getLogLevels());

    constructor(
        private readonly requestContext: RequestContextService,
    ) {
        const packagePath = join(process.cwd(), 'package.json');
        const packageContent = readFileSync(packagePath, 'utf-8');

        const packageJson = JSON.parse(packageContent) as {
            name: string;
            version: string;
        };

        this.project = {
            project: packageJson.name,
            version: packageJson.version,
        };

        this.isDevelopment = process.env.NODE_ENV === 'development';
    }

    private writeLog(
        level: LogLevel,
        message: string,
        context?: string,
        metadata?: Pick<LogEntry, 'request' | 'response' | 'error'>,
    ): void {
        if (!this.enabledLevels.has(level)) {
            return;
        }

        const entry: LogEntry = {
            ...this.project,
            timestamp: new Date().toISOString(),
            level,
            context,
            message,
            requestId: this.requestContext.getRequestId(),
            request: metadata?.request,
            response: metadata?.response,
            error: metadata?.error,
        };

        console.log(formatLog(entry, this.isDevelopment));
    }

    log(message: unknown, ...optionalParams: unknown[]): void {
        const context = optionalParams.at(-1);

        this.writeLog(
            'log',
            String(message),
            typeof context === 'string' ? context : undefined,
        );
    }

    error(message: unknown, ...optionalParams: unknown[]): void {
        const trace = optionalParams[0];
        const context = optionalParams[1];

        this.writeLog(
            'error',
            String(message),
            typeof context === 'string' ? context : undefined,
            {
                error: {
                    name: 'Error',
                    message: String(message),
                    stack: typeof trace === 'string' ? trace : undefined,
                },
            },
        );
    }

    warn(message: unknown, ...optionalParams: unknown[]): void {
        const context = optionalParams.at(-1);

        this.writeLog(
            'warn',
            String(message),
            typeof context === 'string' ? context : undefined,
        );
    }

    debug(message: unknown, ...optionalParams: unknown[]): void {
        const context = optionalParams.at(-1);

        this.writeLog(
            'debug',
            String(message),
            typeof context === 'string' ? context : undefined,
        );
    }

    verbose(message: unknown, ...optionalParams: unknown[]): void {
        const context = optionalParams.at(-1);

        this.writeLog(
            'verbose',
            String(message),
            typeof context === 'string' ? context : undefined,
        );
    }

    logHttpRequest(
        method: string,
        url: string,
        statusCode: number,
        durationMs: number,
    ): void {
        const level: LogLevel =
            statusCode >= 500
                ? 'error'
                : statusCode >= 400
                    ? 'warn'
                    : 'log';

        this.writeLog(
            level,
            'HTTP request completed',
            'HTTP',
            {
                request: { method, url },
                response: { statusCode, durationMs },
            },
        );
    }

    logException(
        name: string,
        message: string,
        statusCode: number,
        stack?: string,
    ): void {
        const level: LogLevel =
            statusCode >= 500 ? 'error' : 'warn';

        this.writeLog(
            level,
            message,
            'HTTP Exception',
            {
                error: {
                    name,
                    message,
                    statusCode,
                    stack,
                },
            },
        );
    }
}