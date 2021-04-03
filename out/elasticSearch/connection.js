"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.client = void 0;

var elasticsearch_1 = require("@elastic/elasticsearch");

exports.client = new elasticsearch_1.Client({
  node: "http://localhost:9200",
  maxRetries: 5,
  requestTimeout: 60000,
  sniffOnStart: true
}); 
// __ts-babel@6.0.4
//# sourceMappingURL=connection.js.map