"use strict"; // import { Logger } from "../main"

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.computeOperations = exports.OperationKind = void 0;
var OperationKind;

(function (OperationKind) {
  OperationKind[OperationKind["COPY"] = 0] = "COPY";
  OperationKind[OperationKind["DOWNLOAD"] = 1] = "DOWNLOAD";
})(OperationKind = exports.OperationKind || (exports.OperationKind = {}));

function computeOperations(oldBlockMap, newBlockMap, logger) {
  var nameToOldBlocks = buildBlockFileMap(oldBlockMap.files);
  var nameToNewBlocks = buildBlockFileMap(newBlockMap.files);
  var lastOperation = null; // for now only one file is supported in block map

  var blockMapFile = newBlockMap.files[0];
  var operations = [];
  var name = blockMapFile.name;
  var oldEntry = nameToOldBlocks.get(name);

  if (oldEntry == null) {
    // new file (unrealistic case for now, because in any case both blockmap contain the only file named as "file")
    throw new Error("no file " + name + " in old blockmap");
  }

  var newFile = nameToNewBlocks.get(name);
  var changedBlockCount = 0;

  var _a = buildChecksumMap(nameToOldBlocks.get(name), oldEntry.offset, logger),
      checksumToOldOffset = _a.checksumToOffset,
      checksumToOldSize = _a.checksumToOldSize;

  var newOffset = blockMapFile.offset;

  for (var i = 0; i < newFile.checksums.length; newOffset += newFile.sizes[i], i++) {
    var blockSize = newFile.sizes[i];
    var checksum = newFile.checksums[i];
    var oldOffset = checksumToOldOffset.get(checksum);

    if (oldOffset != null && checksumToOldSize.get(checksum) !== blockSize) {
      logger.warn("Checksum (\"" + checksum + "\") matches, but size differs (old: " + checksumToOldSize.get(checksum) + ", new: " + blockSize + ")");
      oldOffset = undefined;
    }

    if (oldOffset === undefined) {
      // download data from new file
      changedBlockCount++;

      if (lastOperation != null && lastOperation.kind === OperationKind.DOWNLOAD && lastOperation.end === newOffset) {
        lastOperation.end += blockSize;
      } else {
        lastOperation = {
          kind: OperationKind.DOWNLOAD,
          start: newOffset,
          end: newOffset + blockSize // oldBlocks: null,

        };
        validateAndAdd(lastOperation, operations, checksum, i);
      }
    } else {
      // reuse data from old file
      if (lastOperation != null && lastOperation.kind === OperationKind.COPY && lastOperation.end === oldOffset) {
        lastOperation.end += blockSize; // lastOperation.oldBlocks!!.push(checksum)
      } else {
        lastOperation = {
          kind: OperationKind.COPY,
          start: oldOffset,
          end: oldOffset + blockSize // oldBlocks: [checksum]

        };
        validateAndAdd(lastOperation, operations, checksum, i);
      }
    }
  }

  if (changedBlockCount > 0) {
    logger.info("File" + (blockMapFile.name === "file" ? "" : " " + blockMapFile.name) + " has " + changedBlockCount + " changed blocks");
  }

  return operations;
}

exports.computeOperations = computeOperations;

function validateAndAdd(operation, operations, checksum, index) {
  if (operations.length !== 0) {
    var lastOperation = operations[operations.length - 1];

    if (lastOperation.kind === operation.kind && operation.start < lastOperation.end && operation.start > lastOperation.start) {
      var min = [lastOperation.start, lastOperation.end, operation.start, operation.end].reduce(function (p, v) {
        return p < v ? p : v;
      });
      throw new Error("operation (block index: " + index + ", checksum: " + checksum + ", kind: " + OperationKind[operation.kind] + ") overlaps previous operation (checksum: " + checksum + "):\n" + ("abs: " + lastOperation.start + " until " + lastOperation.end + " and " + operation.start + " until " + operation.end + "\n") + ("rel: " + (lastOperation.start - min) + " until " + (lastOperation.end - min) + " and " + (operation.start - min) + " until " + (operation.end - min)));
    }
  }

  operations.push(operation);
} // eslint-disable-next-line @typescript-eslint/explicit-function-return-type


function buildChecksumMap(file, fileOffset, logger) {
  var checksumToOffset = new Map();
  var checksumToSize = new Map();
  var offset = fileOffset;
  var debugLog = logger.debug;

  for (var i = 0; i < file.checksums.length; i++) {
    var checksum = file.checksums[i];
    var size = file.sizes[i];
    var existing = checksumToSize.get(checksum);

    if (existing === undefined) {
      checksumToOffset.set(checksum, offset);
      checksumToSize.set(checksum, size);
    } else if (debugLog != null) {
      var sizeExplanation = existing === size ? "(same size)" : "(size: " + existing + ", this size: " + size + ")";
      debugLog(checksum + " duplicated in blockmap " + sizeExplanation + ", it doesn't lead to broken differential downloader, just corresponding block will be skipped)");
    }

    offset += size;
  }

  return {
    checksumToOffset: checksumToOffset,
    checksumToOldSize: checksumToSize
  };
}

function buildBlockFileMap(list) {
  var result = new Map();

  for (var _i = 0, list_1 = list; _i < list_1.length; _i++) {
    var item = list_1[_i];
    result.set(item.name, item);
  }

  return result;
} 
// __ts-babel@6.0.4
//# sourceMappingURL=check.js.map