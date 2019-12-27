import * as debug from 'debug';
import * as Dockerode from 'dockerode';
import * as express from 'express';
import { HttpFunc } from './@types/localhost';
import { CommandDescription, FunctionConfig, Options, Serverless } from './@types/serverless';
declare const _default: {
    new (serverless: Serverless, options: Options): {
        readonly serverless: Serverless;
        readonly options: Options;
        readonly commands: {
            [key: string]: CommandDescription;
        };
        readonly hooks: {
            [key: string]: any;
        };
        readonly debug: debug.IDebugger;
        httpFunc(name: string, runtime: string, env: {
            [key: string]: string;
        }, func: FunctionConfig): HttpFunc;
        respond(funcResponse: string, response: express.Response): void;
        httpFunctions(): HttpFunc[];
        bootstrap(docker: Dockerode, funcs: HttpFunc[]): Promise<express.Application>;
        start(): Promise<any>;
    };
};
export = _default;
