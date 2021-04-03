"use strict";

var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function (resolve) {
      resolve(value);
    });
  }

  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }

    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }

    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }

    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};

var __generator = this && this.__generator || function (thisArg, body) {
  var _ = {
    label: 0,
    sent: function () {
      if (t[0] & 1) throw t[1];
      return t[1];
    },
    trys: [],
    ops: []
  },
      f,
      y,
      t,
      g;
  return g = {
    next: verb(0),
    "throw": verb(1),
    "return": verb(2)
  }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
    return this;
  }), g;

  function verb(n) {
    return function (v) {
      return step([n, v]);
    };
  }

  function step(op) {
    if (f) throw new TypeError("Generator is already executing.");

    while (_) try {
      if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
      if (y = 0, t) op = [op[0] & 2, t.value];

      switch (op[0]) {
        case 0:
        case 1:
          t = op;
          break;

        case 4:
          _.label++;
          return {
            value: op[1],
            done: false
          };

        case 5:
          _.label++;
          y = op[1];
          op = [0];
          continue;

        case 7:
          op = _.ops.pop();

          _.trys.pop();

          continue;

        default:
          if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
            _ = 0;
            continue;
          }

          if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
            _.label = op[1];
            break;
          }

          if (op[0] === 6 && _.label < t[1]) {
            _.label = t[1];
            t = op;
            break;
          }

          if (t && _.label < t[2]) {
            _.label = t[2];

            _.ops.push(op);

            break;
          }

          if (t[2]) _.ops.pop();

          _.trys.pop();

          continue;
      }

      op = body.call(thisArg, _);
    } catch (e) {
      op = [6, e];
      y = 0;
    } finally {
      f = t = 0;
    }

    if (op[0] & 5) throw op[1];
    return {
      value: op[0] ? op[1] : void 0,
      done: true
    };
  }
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getLast5Version = exports.getLastModifiedTime = exports.indexing = void 0;

var indexManager_1 = require("./indexManager");

var connection_1 = require("./connection");

var redis_1 = require("../redis"); // import { writeFileSync } from "fs";


var appName = process.env.appName;
connection_1.client.cluster.health({}, function (_err, resp) {
  console.log(resp);
});
var indexManger = new indexManager_1.default("update");

function indexing() {
  return __awaiter(this, void 0, void 0, function () {
    var _a;

    var _this = this;

    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          _a = indexManger.indexExists();
          if (!_a) return [3
          /*break*/
          , 2];
          return [4
          /*yield*/
          , indexManger.deleteIndex()];

        case 1:
          _a = _b.sent();
          _b.label = 2;

        case 2:
          _a;
          indexManger.createIndex();
          return [4
          /*yield*/
          , new Promise(function (resolve, reject) {
            redis_1.client.get("s3Data", function (_err, s3Data) {
              return __awaiter(_this, void 0, void 0, function () {
                var _i, s3Data_1, doc;

                return __generator(this, function (_a) {
                  if (_err) {
                    return [2
                    /*return*/
                    ];
                    reject("indexing failed");
                  }

                  try {
                    if (s3Data) {
                      s3Data = JSON.parse(s3Data).ListBucketResult.Contents;

                      for (_i = 0, s3Data_1 = s3Data; _i < s3Data_1.length; _i++) {
                        doc = s3Data_1[_i];
                        console.log(doc);
                        indexManger.addDocument(null, "posts", JSON.stringify(doc));
                      }
                    }

                    resolve("indexing done");
                  } catch (error) {
                    console.log(error);
                    resolve(error);
                  }

                  return [2
                  /*return*/
                  ];
                });
              });
            });
          })];

        case 3:
          _b.sent();

          return [2
          /*return*/
          ];
      }
    });
  });
}

exports.indexing = indexing;

function getLastModifiedTime(to, isMac) {
  var _a, _b, _c;

  if (isMac === void 0) {
    isMac = true;
  }

  return __awaiter(this, void 0, void 0, function () {
    var response;
    return __generator(this, function (_d) {
      switch (_d.label) {
        case 0:
          return [4
          /*yield*/
          , connection_1.client.search({
            index: "update",
            body: {
              sort: ["_score", {
                LastModified: "desc"
              }],
              query: {
                match: {
                  Key: to
                }
              }
            },
            size: 1
          })];

        case 1:
          response = _d.sent();
          console.log(response);
          return [2
          /*return*/
          , (_c = (_b = (_a = response === null || response === void 0 ? void 0 : response.body) === null || _a === void 0 ? void 0 : _a.hits) === null || _b === void 0 ? void 0 : _b.hits) === null || _c === void 0 ? void 0 : _c.map(function (_a) {
            var _source = _a._source;
            return _source.LastModified;
          })[0]];
      }
    });
  });
}

exports.getLastModifiedTime = getLastModifiedTime;

function getLast5Version(env, isMac, versionTime) {
  if (isMac === void 0) {
    isMac = true;
  }

  return __awaiter(this, void 0, void 0, function () {
    var appExtension, appModifiedName, response;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          appExtension = isMac ? "-0.0.0-0-mac.zip.blockmap" : "Setup 0.0.0-0.exe.blockmap";
          appModifiedName = env === "beta" ? appName : appName + "_" + env;
          appModifiedName = appModifiedName + " " + appExtension;
          return [4
          /*yield*/
          , connection_1.client.search({
            index: "update",
            body: {
              sort: ["_score", {
                LastModified: "desc"
              }],
              query: {
                bool: {
                  must: [{
                    match: {
                      Key: env + "/" + appModifiedName
                    }
                  }],
                  filter: [{
                    range: {
                      LastModified: {
                        lte: versionTime
                      }
                    }
                  }]
                }
              }
            },
            size: 5
          })];

        case 1:
          response = _a.sent(); // return response;

          return [2
          /*return*/
          , response.body.hits.hits.map(function (_a) {
            var _source = _a._source;
            return _source.Key;
          })];
      }
    });
  });
}

exports.getLast5Version = getLast5Version; 
// __ts-babel@6.0.4
//# sourceMappingURL=updater.js.map