"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.formatBytes = void 0;

function formatBytes(value, symbol) {
  if (symbol === void 0) {
    symbol = " MB";
  }

  return new Intl.NumberFormat("en").format((value / 1024 / 1024).toFixed(2)) + symbol;
}

exports.formatBytes = formatBytes; 
// __ts-babel@6.0.4
//# sourceMappingURL=utils.js.map