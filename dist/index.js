"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var cors = require("cors");
var debug = require("debug");
var Dockerode = require("dockerode");
var express = require("express");
var docker_1 = require("./docker");
var http_1 = require("./http");
var lambda_1 = require("./lambda");
var signal_1 = require("./signal");
var DEFAULT_PORT = 3000;
module.exports = /** @class */ (function () {
    function Localhost(serverless, options) {
        this.debug = debug('localhost');
        this.serverless = serverless;
        this.options = options;
        this.commands = {
            localhost: {
                usage: 'Runs a local http server simulating API Gateway, triggering your http functions on demand',
                lifecycleEvents: ['start'],
                options: {
                    port: {
                        usage: "Port to listen on. Default: " + DEFAULT_PORT,
                        shortcut: 'p'
                    },
                    debugPort: {
                        usage: 'Debugger port to listen on. Only supported for a subset of runtimes. Default: none',
                        shortcut: 'd'
                    }
                }
            }
        };
        this.hooks = {
            'localhost:start': this.start.bind(this)
        };
    }
    Localhost.prototype.httpFunc = function (name, runtime, env, func) {
        return {
            name: name,
            qualifiedName: func.name,
            handler: func.handler,
            runtime: runtime,
            memorySize: func.memorySize || this.serverless.service.provider.memorySize || 1536,
            timeout: func.timeout || this.serverless.service.provider.timeout || 300,
            events: (func.events || []).filter(http_1.isHttpEvent).map(function (event) {
                var http = event['http'];
                if (typeof http === 'string') {
                    var _a = http.split(' '), method = _a[0], path = _a[1];
                    return {
                        method: http_1.translateMethod(method),
                        path: http_1.translatePath(path)
                    };
                }
                return {
                    method: http_1.translateMethod(http.method),
                    path: http_1.translatePath(http.path),
                    cors: event.cors
                };
            }),
            environment: Object.assign(env, func.environment)
        };
    };
    Localhost.prototype.respond = function (funcResponse, response) {
        this.debug("raw function response '" + funcResponse + "'");
        // stdout stream may contain other data, response should be the last line
        var lastLine = funcResponse.lastIndexOf('\n');
        if (lastLine >= 0) {
            console.log(funcResponse.substring(lastLine).trim());
            funcResponse = funcResponse.substring(0, lastLine).trim();
        }
        var json = JSON.parse(funcResponse);
        if (lambda_1.errorLike(json)) {
            this.debug('function invocation yieled unhandled error');
            response
                .status(500)
                .type('application/json')
                .send(json);
        }
        else {
            var status = json.statusCode || 200;
            var contentType = (json.headers || {})['Content-Type'] || 'application/json';
            response
                .status(status)
                .type(contentType)
                .send(json.isBase64Encoded ? Buffer.from(json.body, 'base64') : json.body);
        }
    };
    Localhost.prototype.httpFunctions = function () {
        var _this = this;
        var svc = this.serverless.service;
        var env = Object.assign({}, svc.provider.environment);
        return svc.getAllFunctions().reduce(function (httpFuncs, name) {
            var func = svc.functions[name];
            var runtime = func.runtime || svc.provider.runtime;
            if (!runtime) {
                _this.serverless.cli.log("Warning: unable to infer a runtime for function " + name);
                return httpFuncs;
            }
            if ((func.events || []).find(http_1.isHttpEvent)) {
                httpFuncs.push(_this.httpFunc(name, runtime, env, func));
            }
            return httpFuncs;
        }, []);
    };
    Localhost.prototype.bootstrap = function (docker, funcs) {
        return __awaiter(this, void 0, void 0, function () {
            var svc, app, _loop_1, _i, funcs_1, func;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        svc = this.serverless.service;
                        app = express().disable('x-powered-by');
                        app.use(cors());
                        _loop_1 = function (func) {
                            var _i, _a, event;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        _i = 0, _a = func.events;
                                        _b.label = 1;
                                    case 1:
                                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                                        event = _a[_i];
                                        return [4 /*yield*/, app[event.method](event.path, function (request, response) { return __awaiter(_this, void 0, void 0, function () {
                                                var dockerImage, provider, event, invokeArgs, create, container, logs, stdout;
                                                var _this = this;
                                                return __generator(this, function (_a) {
                                                    switch (_a.label) {
                                                        case 0:
                                                            dockerImage = docker_1.runtimeImage(func.runtime);
                                                            provider = this.serverless
                                                                .getProvider(svc.provider.name)
                                                                .getStage();
                                                            event = JSON.stringify(lambda_1.apigwEvent(request, provider));
                                                            invokeArgs = docker_1.containerArgs(dockerImage, event, func, this.serverless.getProvider(svc.provider.name).getStage(), this.options.debugPort);
                                                            create = function () {
                                                                _this.debug('Creating docker container for ${func.handler}');
                                                                return docker.createContainer(invokeArgs);
                                                            };
                                                            return [4 /*yield*/, create().catch(function (e) {
                                                                    if (e.statusCode === 404) {
                                                                        _this.serverless.cli.log('Docker image not present');
                                                                        _this.serverless.cli.log("Pulling " + dockerImage + " image...");
                                                                        return docker_1.pull(docker, dockerImage).then(function () {
                                                                            return create();
                                                                        });
                                                                    }
                                                                    throw e;
                                                                })];
                                                        case 1:
                                                            container = _a.sent();
                                                            // invoke function
                                                            this.debug("Invoking " + func.handler + " function in " + container.id);
                                                            return [4 /*yield*/, container.start().then(function () { return container.wait(); })];
                                                        case 2:
                                                            _a.sent();
                                                            // get the logs
                                                            this.debug("Fetching container logs of " + container.id);
                                                            return [4 /*yield*/, container.logs({
                                                                    stdout: true,
                                                                    stderr: true
                                                                })];
                                                        case 3:
                                                            logs = _a.sent();
                                                            stdout = [];
                                                            docker_1.demux(logs, function (data) {
                                                                process.stderr.write(data);
                                                            }, function (data) {
                                                                stdout.push(data);
                                                            });
                                                            this.respond(Buffer.concat(stdout).toString('utf8'), response);
                                                            // sweep up
                                                            this.debug("Deleting container " + container.id);
                                                            return [4 /*yield*/, container.remove()];
                                                        case 4:
                                                            _a.sent();
                                                            return [2 /*return*/];
                                                    }
                                                });
                                            }); })];
                                    case 2:
                                        _b.sent();
                                        _b.label = 3;
                                    case 3:
                                        _i++;
                                        return [3 /*break*/, 1];
                                    case 4: return [2 /*return*/];
                                }
                            });
                        };
                        _i = 0, funcs_1 = funcs;
                        _a.label = 1;
                    case 1:
                        if (!(_i < funcs_1.length)) return [3 /*break*/, 4];
                        func = funcs_1[_i];
                        return [5 /*yield**/, _loop_1(func)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, app];
                }
            });
        });
    };
    Localhost.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            var svc, providerName, funcs, docker, app;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        svc = this.serverless.service;
                        providerName = svc.provider.name;
                        if ('aws' !== providerName) {
                            throw Error("Provider " + providerName + " is not supported");
                        }
                        funcs = this.httpFunctions();
                        if (!funcs) {
                            throw Error('This serverless service has no http functions');
                        }
                        docker = new Dockerode({
                            socketPath: '/var/run/docker.sock'
                        });
                        // make sure we can communicate with docker
                        this.debug('pinging docker daemon');
                        return [4 /*yield*/, docker.ping().catch(function (e) {
                                throw new Error('Unable to communicate with docker. \n' +
                                    ("   Error: " + e.message + "\n") +
                                    '  Follow https://docs.docker.com/get-started/ to make sure you have docker installed \n');
                            })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.bootstrap(docker, funcs)];
                    case 2:
                        app = _a.sent();
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                _this.serverless.cli.log('Starting server...');
                                var port = _this.options.port || DEFAULT_PORT;
                                var debugPort = _this.options.debugPort;
                                app
                                    .listen(port, function () {
                                    _this.serverless.cli.log("Listening on port " + port + "...");
                                    if (debugPort) {
                                        _this.serverless.cli.log("\u276F Debugging enabled on port " + debugPort);
                                    }
                                    _this.serverless.cli.log('❯ Function routes');
                                    for (var _i = 0, funcs_2 = funcs; _i < funcs_2.length; _i++) {
                                        var func = funcs_2[_i];
                                        _this.serverless.cli.log("* " + func.name);
                                        for (var _a = 0, _b = func.events; _a < _b.length; _a++) {
                                            var event = _b[_a];
                                            _this.serverless.cli.log("    " + event.method + " http://localhost:" + port + event.path);
                                        }
                                    }
                                    resolve();
                                })
                                    .on('error', function (e) {
                                    if (e.message.indexOf('listen EADDRINUSE') > -1) {
                                        reject(new Error("Error starting server on localhost port " + port + ".\n" +
                                            '  * Hint: You likely already have something listening on this port'));
                                        return;
                                    }
                                    reject(new Error("Unexpected error while starting server " + e.message));
                                });
                            }).then(function () {
                                return signal_1.trapAll().then(function (sig) {
                                    return _this.serverless.cli.log("Received " + sig + " signal. Stopping server...");
                                });
                            })];
                }
            });
        });
    };
    return Localhost;
}());
//# sourceMappingURL=index.js.map