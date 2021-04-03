"use strict";

var __assign = this && this.__assign || function () {
  __assign = Object.assign || function (t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];

      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
    }

    return t;
  };

  return __assign.apply(this, arguments);
};

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

var __spreadArrays = this && this.__spreadArrays || function () {
  for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;

  for (var r = Array(s), k = 0, i = 0; i < il; i++) for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++) r[k] = a[j];

  return r;
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

require("dotenv").config();

var express = require("express");

var getDiffferentialDownload = require("./differentialUpdate").getDiffferentialDownload;

var redis_1 = require("./redis");

var updater_1 = require("./elasticSearch/updater");

var utils_1 = require("./utils");

var _a = process.env,
    S3_Url = _a.S3_Url,
    PORT = _a.PORT;

var got = require("got");

var yaml = require("yaml");

var xml2json = require("xml2json"); // create new express app and save it as "app"


var app = express(); // create a route for the app

var returnLast5PromotedVersion = function (env, res, update, bMac) {
  return __awaiter(void 0, void 0, void 0, function () {
    var response;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4
          /*yield*/
          , updater_1.getLast5Version(env, bMac)];

        case 1:
          response = _a.sent();
          return [2
          /*return*/
          , res.send({
            latest: update.version,
            size: utils_1.formatBytes(parseInt(update.files[0].size)),
            last: response
          })];
      }
    });
  });
};

app.get("/differentialData", function (req, res) {
  return __awaiter(void 0, void 0, void 0, function () {
    var _a, from, to, response;

    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          _a = req.query, from = _a.from, to = _a.to;
          return [4
          /*yield*/
          , getDiffferentialDownload(from, to)];

        case 1:
          response = _b.sent();
          res.send(__assign(__assign({}, response), {
            to: to,
            from: from
          }));
          return [2
          /*return*/
          ];
      }
    });
  });
});
app.get("/lastnDifferentialData", function (req, res) {
  return __awaiter(void 0, void 0, void 0, function () {
    var to, env, isMac, versionTime, appVersions, response;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          to = req.query.to;
          env = to.split("/")[0];
          isMac = to.indexOf(".zip") > -1;
          return [4
          /*yield*/
          , updater_1.getLastModifiedTime(to)];

        case 1:
          versionTime = _a.sent();
          return [4
          /*yield*/
          , updater_1.getLast5Version(env, isMac, versionTime)];

        case 2:
          appVersions = _a.sent();
          return [4
          /*yield*/
          , Promise.all(appVersions.filter(function (version) {
            return version !== to;
          }).map(function (version) {
            return __awaiter(void 0, void 0, void 0, function () {
              return __generator(this, function (_a) {
                switch (_a.label) {
                  case 0:
                    return [4
                    /*yield*/
                    , getDiffferentialDownload(version, to)];

                  case 1:
                    return [2
                    /*return*/
                    , _a.sent()];
                }
              });
            });
          }))];

        case 3:
          response = _a.sent();
          res.send(__spreadArrays(response));
          return [2
          /*return*/
          ];
      }
    });
  });
});
app.get("/last5PromotedVersion", function (req, res) {
  return __awaiter(void 0, void 0, void 0, function () {
    var _a, env, isMac, bMac, ymlUpdateFile;

    return __generator(this, function (_b) {
      _a = req.query, env = _a.env, isMac = _a.isMac;
      bMac = isMac === "true" ? true : false;
      ymlUpdateFile = bMac ? "latest-mac.yml" : "latest.yml";
      redis_1.client.get(ymlUpdateFile + "/" + env, function (_err, update) {
        return __awaiter(void 0, void 0, void 0, function () {
          var response, s3response, updateData, s3Data;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                update = JSON.parse(update); // const latest = appnameMac?.replace('VERSION', update.version);

                if (update) {
                  return [2
                  /*return*/
                  , returnLast5PromotedVersion(env, res, update, bMac)];
                }

                return [4
                /*yield*/
                , got(S3_Url + "/" + env + "/" + ymlUpdateFile, {
                  responseType: "text"
                })];

              case 1:
                response = _a.sent();
                return [4
                /*yield*/
                , got("" + S3_Url, {
                  responseType: "text"
                })];

              case 2:
                s3response = _a.sent();
                updateData = yaml.parse(response.body);
                s3Data = xml2json.toJson(s3response.body);
                redis_1.client.setex(ymlUpdateFile + "/" + env, 1440, JSON.stringify(updateData));
                redis_1.client.setex("s3Data", 1440, s3Data);
                return [2
                /*return*/
                , returnLast5PromotedVersion(env, res, updateData, bMac)];
            }
          });
        });
      });
      return [2
      /*return*/
      ];
    });
  });
});
app.get("/indexing", function (req, res) {
  return __awaiter(void 0, void 0, void 0, function () {
    var s3response, s3Data, response;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4
          /*yield*/
          , got("" + S3_Url, {
            responseType: "text"
          })];

        case 1:
          s3response = _a.sent();
          s3Data = xml2json.toJson(s3response.body);
          redis_1.client.setex("s3Data", 1440, s3Data);
          return [4
          /*yield*/
          , updater_1.indexing()];

        case 2:
          response = _a.sent();
          res.send(response);
          return [2
          /*return*/
          ];
      }
    });
  });
}); // make the server listen to requests

app.listen(PORT, function () {
  console.log("Server running at: http://localhost:" + PORT + "/");
}); // tasks when updating index avoid duplicate entry

// __ts-babel@6.0.4
//# sourceMappingURL=server.js.map