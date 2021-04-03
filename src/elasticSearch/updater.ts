import IndexManager from "./indexManager";
import { client as elastic } from "./connection";
import { client } from "../redis";
// import { writeFileSync } from "fs";
const { appName } = process.env;

elastic.cluster.health({}, (_err, resp) => {
  console.log(resp);
});
const indexManger = new IndexManager("update");
export async function indexing() {
  indexManger.indexExists() && (await indexManger.deleteIndex());
  indexManger.createIndex();
  await new Promise((resolve, reject) => {
    client.get("s3Data", async (_err: Error, s3Data) => {
      if (_err) {
        return;
        reject("indexing failed");
      }
      try {
        if (s3Data) {
          s3Data = JSON.parse(s3Data).ListBucketResult.Contents;
          for (const doc of s3Data) {
            console.log(doc);
            indexManger.addDocument(null, "posts", JSON.stringify(doc));
          }
        }
        resolve("indexing done");
      }
      catch (error) {
        console.log(error);
         resolve(error);
      }
    });
   

   
  });
}
export async function getLastModifiedTime(to, isMac = true) {
  const response = await elastic.search({
    index: "update",
    body: {
      sort: ["_score", { LastModified: "desc" }],
      query: {
        match: {
          Key: to
        }
      }
    },
    size: 1
  });
  console.log(response);
  return response?.body?.hits?.hits?.map(({ _source }) => _source.LastModified)[0];
}

export async function getLast5Version(env, isMac = true, versionTime?) {
  const appExtension = isMac
    ? "-0.0.0-0-mac.zip.blockmap"
    : "Setup 0.0.0-0.exe.blockmap";
  let appModifiedName = env === "beta" ? appName : `${appName}_${env}`;
  appModifiedName = `${appModifiedName} ${appExtension}`;
  const response = await elastic.search({
    index: "update",
    body: {
      sort: ["_score", { LastModified: "desc" }],
      query: {
        bool: {
          must: [
            {
              match: {
                Key: `${env}/${appModifiedName}`
              }
            }
          ],
          filter: [{ range: { LastModified: { lte: versionTime } } }]
        }
      }
    },
    size: 5
  });

  // return response;
  return response.body.hits.hits.map(({ _source }) => _source.Key);
}
