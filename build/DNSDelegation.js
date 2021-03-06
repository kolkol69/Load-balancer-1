"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var LoadBalancingStrategy_1 = require("./LoadBalancingStrategy");
var LoadBalancer_1 = __importDefault(require("./LoadBalancer"));
var fetch = require('node-fetch');
var DNSDelegation = /** @class */ (function (_super) {
    __extends(DNSDelegation, _super);
    function DNSDelegation() {
        return _super.call(this) || this;
    }
    DNSDelegation.checkHealth = function (db) {
        var _this = this;
        var t1 = new Date().getMilliseconds();
        fetch('http://localhost:' + db.port)
            .then(function (res) {
            if (res.statusCode < 200 || res.statusCode > 299) {
                db.active = false;
                db.lastTimeResponse = 999999;
            }
            else {
                db.active = true;
                db.lastTimeResponse = new Date().getMilliseconds() - t1;
            }
            _this.sortDatabasesByAccesability();
        })
            .catch(function (err) {
            db.active = true;
            db.lastTimeResponse = new Date().getMilliseconds() - t1;
        });
    };
    DNSDelegation.prototype.manageQueries = function () {
        if (LoadBalancer_1.default.getInstance().activeDatabaseCount < LoadBalancer_1.default.getInstance().databaseCount)
            return;
        var query = LoadBalancer_1.default.getInstance().queryList[0];
        if (!query)
            return;
        if (query.type === 'modify') {
            clearInterval(this.intervalID);
            LoadBalancer_1.default.getInstance().activeDatabaseCount = 0;
            LoadBalancer_1.default.getInstance().databases.forEach(function (e) { return e.sendQuery(query); });
            LoadBalancer_1.default.getInstance().queryList.shift();
            return;
        }
        else {
            LoadBalancer_1.default.getInstance().databases.forEach(function (e) { return DNSDelegation.checkHealth(e); });
            LoadBalancer_1.default.getInstance().databases[0].sendQuery(query);
            LoadBalancer_1.default.getInstance().queryList.shift(); // this was probably lacking
        }
    };
    DNSDelegation.sortDatabasesByAccesability = function () {
        LoadBalancer_1.default.getInstance().databases = LoadBalancer_1.default.getInstance().databases.sort(function (a, b) { return a.lastTimeResponse - b.lastTimeResponse; });
    };
    return DNSDelegation;
}(LoadBalancingStrategy_1.LoadBalancingStrategy));
exports.default = DNSDelegation;
