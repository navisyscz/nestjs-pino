import { ModuleMetadata, Type, RequestMethod } from '@nestjs/common';
import { Logger, DestinationStream } from 'pino';
import { Options } from 'pino-http';
export type PassedLogger = {
    logger: Logger;
};
export interface RouteInfo {
    path: string;
    method: RequestMethod;
}
export interface Params {
    /**
     * Optional parameters for `pino-http` module
     * @see https://github.com/pinojs/pino-http#pinohttpopts-stream
     */
    pinoHttp?: Options | DestinationStream | [Options, DestinationStream];
    /**
     * Optional parameter to exclude routes from middleware
     */
    exclude?: Array<string | RouteInfo | Type<any>>;
    /**
     * Optional parameter to define which routes to apply middleware to
     */
    forRoutes?: Array<string | RouteInfo | Type<any>>;
    /**
     * Optional parameter to skip pino configuration if logger is already configured
     */
    useExisting?: true;
    /**
     * Optional parameter to rename the `context` field in logs
     */
    renameContext?: string;
    /**
     * Optional parameter to assign logger to response
     */
    assignResponse?: boolean;
}
export interface LoggerModuleAsyncParams extends Pick<ModuleMetadata, 'imports' | 'providers'> {
    useFactory: (...args: any[]) => Params | Promise<Params>;
    inject?: any[];
}
export declare function isPassedLogger(pinoHttpProp: any): pinoHttpProp is PassedLogger;
export declare const PARAMS_PROVIDER_TOKEN = "pino-params";
