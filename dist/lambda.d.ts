/// <reference types="node" />
import * as express from 'express';
export declare function errorLike(payload: object): boolean;
export declare function apigwEvent(request: express.Request, stage: string): {
    httpMethod: string;
    path: string;
    body: any;
    headers: import("http").IncomingHttpHeaders;
    queryStringParameters: any;
    multiValueQueryStringParameters: {
        [key: string]: string[];
    };
    pathParameters: any;
    stageVariables: null;
    isBase64Encoded: boolean;
    requestContext: {
        path: string;
        accountId: string;
        resourceId: string;
        stage: string;
        requestId: string;
        identity: {
            cognitoIdentityPoolId: null;
            accountId: null;
            cognitoIdentityId: null;
            caller: null;
            apiKey: null;
            sourceIp: string;
            accessKey: null;
            cognitoAuthenticationType: null;
            cognitoAuthenticationProvider: null;
            userArn: null;
            userAgent: string;
            user: null;
        };
        resourcePath: string;
        httpMethod: string;
        apiId: string;
    };
};
