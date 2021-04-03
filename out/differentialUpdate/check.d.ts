export declare enum OperationKind {
    COPY = 0,
    DOWNLOAD = 1
}
export interface Operation {
    kind: OperationKind;
    start: number;
    end: number;
}
export declare function computeOperations(oldBlockMap: any, newBlockMap: any, logger: Console): Array<Operation>;
