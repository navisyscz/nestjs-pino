"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var LoggerModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerModule = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const common_1 = require("@nestjs/common");
const pino_http_1 = require("pino-http");
const InjectPinoLogger_1 = require("./InjectPinoLogger");
const Logger_1 = require("./Logger");
const params_1 = require("./params");
const PinoLogger_1 = require("./PinoLogger");
const DEFAULT_ROUTES = [{ path: '*', method: common_1.RequestMethod.ALL }];
let LoggerModule = LoggerModule_1 = class LoggerModule {
    static forRoot(params) {
        const paramsProvider = {
            provide: params_1.PARAMS_PROVIDER_TOKEN,
            useValue: params || {},
        };
        const decorated = (0, InjectPinoLogger_1.createProvidersForDecorated)();
        return {
            module: LoggerModule_1,
            providers: [Logger_1.Logger, ...decorated, PinoLogger_1.PinoLogger, paramsProvider],
            exports: [Logger_1.Logger, ...decorated, PinoLogger_1.PinoLogger, paramsProvider],
        };
    }
    static forRootAsync(params) {
        const paramsProvider = {
            provide: params_1.PARAMS_PROVIDER_TOKEN,
            useFactory: params.useFactory,
            inject: params.inject,
        };
        const decorated = (0, InjectPinoLogger_1.createProvidersForDecorated)();
        const providers = [
            Logger_1.Logger,
            ...decorated,
            PinoLogger_1.PinoLogger,
            paramsProvider,
            ...(params.providers || []),
        ];
        return {
            module: LoggerModule_1,
            imports: params.imports,
            providers,
            exports: [Logger_1.Logger, ...decorated, PinoLogger_1.PinoLogger, paramsProvider],
        };
    }
    constructor(params) {
        this.params = params;
    }
    configure(consumer) {
        const { exclude, forRoutes = DEFAULT_ROUTES, pinoHttp } = this.params;
        const middlewares = createLoggerMiddlewares(pinoHttp || {});
        if (exclude) {
            const safeExcludes = exclude.filter((e) => typeof e === 'string' || ('path' in e && 'method' in e));
            consumer
                .apply(...middlewares)
                .exclude(...safeExcludes)
                .forRoutes(...forRoutes);
        }
        else {
            consumer.apply(...middlewares).forRoutes(...forRoutes);
        }
    }
};
exports.LoggerModule = LoggerModule;
exports.LoggerModule = LoggerModule = LoggerModule_1 = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({ providers: [Logger_1.Logger], exports: [Logger_1.Logger] }),
    __param(0, (0, common_1.Inject)(params_1.PARAMS_PROVIDER_TOKEN)),
    __metadata("design:paramtypes", [Object])
], LoggerModule);
function createLoggerMiddlewares(params) {
    const normalized = Array.isArray(params) ? params : [params];
    console.clear();
    console.log('🧪 Normalized pinoHttp params:', JSON.stringify(normalized, null, 2));
    const middleware = (0, pino_http_1.pinoHttp)(...normalized);
    // @ts-expect-error: root is readonly field, but this is the place where it's set actually
    PinoLogger_1.PinoLogger.root = middleware.logger;
    return [middleware];
}
//# sourceMappingURL=LoggerModule.js.map