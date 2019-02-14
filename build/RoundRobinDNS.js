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
var RoundRobinDNS = /** @class */ (function (_super) {
    __extends(RoundRobinDNS, _super);
    function RoundRobinDNS() {
        var _this = _super.call(this) || this;
        _this.loadBalancer = LoadBalancer_1.default.getInstance();
        return _this;
    }
    RoundRobinDNS.prototype.manageQueries = function () {
        if (this.loadBalancer || this.loadBalancer.activeDatabaseCount < this.loadBalancer.databaseCount)
            return;
        var query = this.loadBalancer.queryList[0];
        if (!query)
            return;
        if (query.type === 'modify') {
            clearInterval(this.intervalID);
            this.loadBalancer.activeDatabaseCount = 0;
            this.loadBalancer.databases.forEach(function (e) { return e.sendQuery(query); });
            this.loadBalancer.queryList.shift();
            return;
        }
        else {
            var database = this.loadBalancer.databases.find(function (db) { return db.port === query.databasePort; });
            if (database) {
                database.sendQuery(query);
                this.loadBalancer.queryList.shift();
            }
        }
    };
    return RoundRobinDNS;
}(LoadBalancingStrategy_1.LoadBalancingStrategy));
exports.default = RoundRobinDNS;
