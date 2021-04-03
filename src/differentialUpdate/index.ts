// https://s3-us-west-2.amazonaws.com/kepler-desktop-ota.keystone/dev1/Western%20Digital%20Discovery_dev1-1.0.0-633-mac.zip.blockmap
import { computeOperations, OperationKind } from "./check";
import { downloadBlockMap } from "./prepare";
import { formatBytes } from "../utils";

const url = process.env.S3_Url;

export async function getDiffferentialDownload(from: string, to: string) {
  const logger = console;
  const oldBlockMap = await downloadBlockMap(`${url}/${from}`);
  const newBlockMap = await downloadBlockMap(`${url}/${to}`);
  // const oldBlockMap = await downloadBlockMap(`${url}Western Digital Discovery_dev1 Setup 1.0.0-816.exe.blockmap`);
  // const newBlockMap = await downloadBlockMap(`${url}Western Digital Discovery_dev1 Setup 1.0.0-857.exe.blockmap`);

  const operations = computeOperations(oldBlockMap, newBlockMap, logger);
  if (logger.debug != null) {
    logger.debug(JSON.stringify(operations, null, 2));
  }
  let downloadSize = 0;
  let copySize = 0;
  for (const operation of operations) {
    const length = operation.end - operation.start;
    if (operation.kind === OperationKind.DOWNLOAD) {
      downloadSize += length;
    } else {
      copySize += length;
    }
  }

  return {
    to,
    from,
    toDownload: formatBytes(downloadSize),
    totalUpdate: formatBytes(copySize + downloadSize)
  };
}
