"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function errorLike(payload) {
    // https://aws.amazon.com/blogs/compute/error-handling-patterns-in-amazon-api-gateway-and-aws-lambda/
    var fields = ['errorMessage', 'errorType', 'stackTrace'];
    return fields.every(function (f) { return f in payload; }) || 'errorMessage' in payload;
}
exports.errorLike = errorLike;
function apigwEvent(request, stage) {
    request.headers['X-Forwarded-Proto'] = request.protocol;
    return {
        httpMethod: request.method,
        path: request.path,
        body: request.body,
        headers: request.headers,
        queryStringParameters: request.query,
        multiValueQueryStringParameters: Object.keys(request.query).reduce(function (res, key) { return Object.assign(res, { key: [request.query[key]] }); }, {}),
        pathParameters: request.params,
        stageVariables: null,
        isBase64Encoded: false,
        requestContext: {
            path: '/',
            accountId: "" + Math.random()
                .toString(10)
                .slice(2),
            resourceId: '123',
            stage: stage,
            requestId: '123',
            identity: {
                cognitoIdentityPoolId: null,
                accountId: null,
                cognitoIdentityId: null,
                caller: null,
                apiKey: null,
                sourceIp: '127.0.0.1',
                accessKey: null,
                cognitoAuthenticationType: null,
                cognitoAuthenticationProvider: null,
                userArn: null,
                userAgent: 'Serverless/xxx',
                user: null
            },
            resourcePath: '/',
            httpMethod: request.method,
            apiId: '123'
        }
    };
}
exports.apigwEvent = apigwEvent;
//# sourceMappingURL=lambda.js.map