"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var StatusCode;
(function (StatusCode) {
    StatusCode[StatusCode["START"] = 1] = "START";
    StatusCode[StatusCode["OK"] = 2] = "OK";
    StatusCode[StatusCode["BAD"] = 3] = "BAD";
    StatusCode[StatusCode["ERROR"] = 4] = "ERROR";
    StatusCode[StatusCode["COMPLETE"] = 5] = "COMPLETE";
})(StatusCode = exports.StatusCode || (exports.StatusCode = {}));
;
var PlainTcpAuthentication = /** @class */ (function () {
    function PlainTcpAuthentication(username, password) {
        if (username === void 0) { username = 'anonymous'; }
        if (password === void 0) { password = 'anonymous'; }
        this.username = username;
        this.password = password;
    }
    PlainTcpAuthentication.prototype.authenticate = function (transport) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var onConnect = function () {
                transport.write(_this.createPackage(StatusCode.START, Buffer.from(PlainTcpAuthentication.AUTH_MECH)));
                transport.write(_this.createPackage(StatusCode.OK, Buffer.concat([
                    Buffer.from(_this.username || ""),
                    Buffer.from([0]),
                    Buffer.from(_this.username || ""),
                    Buffer.from([0]),
                    Buffer.from(_this.password || ""),
                ])));
            };
            var onData = function (data) {
                var result = data[0];
                if (result === StatusCode.COMPLETE) {
                    onSuccess();
                }
                else {
                    var message = data.slice(5).toString();
                    onError(new Error('Authentication error: ' + message));
                }
            };
            var onSuccess = function () {
                transport.removeListener('connect', onConnect);
                transport.removeListener('data', onData);
                resolve(transport);
            };
            var onError = function (error) {
                transport.end();
                reject(error);
            };
            transport.connect();
            transport.addListener('connect', onConnect);
            transport.addListener('data', onData);
            transport.addListener('error', onError);
        });
    };
    PlainTcpAuthentication.prototype.createPackage = function (status, body) {
        var bodyLength = new Buffer(4);
        bodyLength.writeUInt32BE(body.length, 0);
        return Buffer.concat([Buffer.from([status]), bodyLength, body]);
    };
    PlainTcpAuthentication.AUTH_MECH = 'PLAIN';
    return PlainTcpAuthentication;
}());
exports.default = PlainTcpAuthentication;
//# sourceMappingURL=PlainTcpAuthentication.js.map