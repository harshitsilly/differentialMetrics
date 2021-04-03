require("dotenv").config();
const express = require("express");
const { getDiffferentialDownload } = require("./differentialUpdate");

import { client } from "./redis";
import {
  indexing,
  getLast5Version,
  getLastModifiedTime
} from "./elasticSearch/updater";
import { formatBytes } from "./utils";
const { S3_Url, PORT } = process.env;
const got = require("got");
const yaml = require("yaml");
const xml2json = require("xml2json");

// create new express app and save it as "app"
const app = express();

// create a route for the app
const returnLast5PromotedVersion = async (env, res, update, bMac) => {
  const response = await getLast5Version(env, bMac);
  return res.send({
    latest: update.version,
    size: formatBytes(parseInt(update.files[0].size)),
    last: response
  });
};

app.get("/differentialData", async (req, res) => {
  const { from, to } = req.query;
  const response = await getDiffferentialDownload(from, to);
  res.send({ ...response, to, from });
});

app.get("/lastnDifferentialData", async (req, res) => {
  const { to } = req.query;
  const env = to.split("/")[0];
  const isMac = to.indexOf(".zip") > -1;
  const versionTime = await getLastModifiedTime(to);
  const appVersions = await getLast5Version(env, isMac, versionTime);
  const response = await Promise.all(
    appVersions
      .filter(version => version !== to)
      .map(async version => await getDiffferentialDownload(version, to))
  );
  res.send([...response]);
});

app.get("/last5PromotedVersion", async (req, res) => {
  const { env, isMac } = req.query;
  const bMac = isMac === "true" ? true : false;
  const ymlUpdateFile = bMac ? "latest-mac.yml" : "latest.yml";
  client.get(`${ymlUpdateFile}/${env}`, async (_err: Error, update) => {
    update = JSON.parse(update);
    // const latest = appnameMac?.replace('VERSION', update.version);
    if (update) {
      return returnLast5PromotedVersion(env, res, update, bMac);
    }

    const response = await got(`${S3_Url}/${env}/${ymlUpdateFile}`, {
      responseType: "text"
    });

    const s3response = await got(`${S3_Url}`, {
      responseType: "text"
    });
    const updateData = yaml.parse(response.body);
    const s3Data = xml2json.toJson(s3response.body);
    client.setex(`${ymlUpdateFile}/${env}`, 1440, JSON.stringify(updateData));
    client.setex("s3Data", 1440, s3Data);
    return returnLast5PromotedVersion(env, res, updateData, bMac);
  });
});

app.get("/indexing", async (req, res) => {
  const s3response = await got(`${S3_Url}`, {
    responseType: "text"
  });
  const s3Data = xml2json.toJson(s3response.body);
  client.setex("s3Data", 1440, s3Data);
  const response = await indexing();
  res.send(response);
});

// make the server listen to requests
app.listen(PORT, "127.0.0.1", () => {
  console.log(`Server running at: http://localhost:${PORT}/`);
});

// tasks when updating index avoid duplicate entry
