import { client } from "./connection";

export default class IndexManager {
  [x: string]: any;
  constructor(indexName) {
    this.indexName = indexName || "test";
  }

  createIndex() {
    return client.indices.create({
      index: this.indexName
    });
  }

  indexExists() {
    return client.indices.exists({
      index: this.indexName
    });
  }

  async deleteIndex() {
    return await client.indices.delete({
      index: this.indexName
    });
  }
  addDocument(id, docType, body) {
    client.index(
      {
        index: this.indexName,
        type: docType,
        id,
        body
      },
      (err, resp) => {
        if (err) {
          console.log(err);
        } else {
          console.log("added or updated", resp);
        }
      }
    );
  }
}
