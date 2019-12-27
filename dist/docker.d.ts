/// <reference types="node" />
import * as Dockerode from 'dockerode';
import { ContainerCreateOptions } from 'dockerode';
import { HttpFunc } from './@types/localhost';
export declare function demux(logs: Buffer, stderr: (d: any) => void, stdout: (d: any) => void): void;
export declare function pull(docker: Dockerode, image: string): Promise<void>;
export declare function runtimeImage(runtime: string): string;
export declare function debugSupported(runtime: string): boolean;
export declare function containerArgs(dockerImage: string, event: string, func: HttpFunc, region: string, debugPort?: number): ContainerCreateOptions;
