import { gunzipSync } from "zlib";
import { client as redis } from "../redis";
import got from "got";

export const downloadBlockMap = (url: string) => {
  return new Promise((resolve, reject) => {
    redis.get(url, async (_err: Error, blockmap) => {
      if (_err) {
        throw new Error(_err.message);
      }
      if (blockmap) {
        console.log(blockmap);
        resolve(JSON.parse(blockmap));
      }
      try {
        const { rawBody } = await got(url);

        if (rawBody == null || rawBody.length === 0) {
          throw new Error(`Blockmap "${url}" is empty`);
        }

        redis.set(url, gunzipSync(rawBody).toString());
        resolve(JSON.parse(gunzipSync(rawBody).toString()));
      } catch (e) {
        console.error(e);
      }
    });
  });
};
