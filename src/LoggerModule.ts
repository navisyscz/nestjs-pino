/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Global,
  Module,
  DynamicModule,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
  Inject,
} from '@nestjs/common';
import { Provider } from '@nestjs/common/interfaces';
import { pinoHttp } from 'pino-http';

import { createProvidersForDecorated } from './InjectPinoLogger';
import { Logger } from './Logger';
import {
  Params,
  LoggerModuleAsyncParams,
  PARAMS_PROVIDER_TOKEN,
} from './params';
import { PinoLogger } from './PinoLogger';

const DEFAULT_ROUTES = [{ path: '*', method: RequestMethod.ALL }];

@Global()
@Module({ providers: [Logger], exports: [Logger] })
export class LoggerModule implements NestModule {
  static forRoot(params?: Params): DynamicModule {
    const paramsProvider: Provider<Params> = {
      provide: PARAMS_PROVIDER_TOKEN,
      useValue: params || {},
    };

    const decorated = createProvidersForDecorated();

    return {
      module: LoggerModule,
      providers: [Logger, ...decorated, PinoLogger, paramsProvider],
      exports: [Logger, ...decorated, PinoLogger, paramsProvider],
    };
  }

  static forRootAsync(params: LoggerModuleAsyncParams): DynamicModule {
    const paramsProvider: Provider<Params | Promise<Params>> = {
      provide: PARAMS_PROVIDER_TOKEN,
      useFactory: params.useFactory,
      inject: params.inject,
    };

    const decorated = createProvidersForDecorated();

    const providers: any[] = [
      Logger,
      ...decorated,
      PinoLogger,
      paramsProvider,
      ...(params.providers || []),
    ];

    return {
      module: LoggerModule,
      imports: params.imports,
      providers,
      exports: [Logger, ...decorated, PinoLogger, paramsProvider],
    };
  }

  constructor(@Inject(PARAMS_PROVIDER_TOKEN) private readonly params: Params) {}

  configure(consumer: MiddlewareConsumer) {
    const { exclude, forRoutes = DEFAULT_ROUTES, pinoHttp } = this.params;

    const middlewares = createLoggerMiddlewares(pinoHttp || {});

    if (exclude) {
      const safeExcludes = exclude.filter(
        (e): e is string | { path: string; method: RequestMethod } =>
          typeof e === 'string' || ('path' in e && 'method' in e),
      );

      consumer
        .apply(...middlewares)
        .exclude(...safeExcludes)
        .forRoutes(...forRoutes);
    } else {
      consumer.apply(...middlewares).forRoutes(...forRoutes);
    }
  }
}

function createLoggerMiddlewares(params: NonNullable<Params['pinoHttp']>) {
  const normalized = Array.isArray(params) ? params : [params];

  console.clear();
  console.log(
    '🧪 Normalized pinoHttp params:',
    JSON.stringify(normalized, null, 2),
  );

  const middleware = pinoHttp(...(normalized as [any]));

  // @ts-expect-error: root is readonly field, but this is the place where it's set actually
  PinoLogger.root = middleware.logger;

  return [middleware];
}
