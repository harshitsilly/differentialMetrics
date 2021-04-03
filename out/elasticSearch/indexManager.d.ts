export default class IndexManager {
    [x: string]: any;
    constructor(indexName: any);
    createIndex(): import("@elastic/elasticsearch/lib/Transport").TransportRequestPromise<import("@elastic/elasticsearch").ApiResponse<Record<string, any>, import("@elastic/elasticsearch/lib/Transport").Context>>;
    indexExists(): import("@elastic/elasticsearch/lib/Transport").TransportRequestPromise<import("@elastic/elasticsearch").ApiResponse<boolean, import("@elastic/elasticsearch/lib/Transport").Context>>;
    deleteIndex(): Promise<import("@elastic/elasticsearch").ApiResponse<Record<string, any>, import("@elastic/elasticsearch/lib/Transport").Context>>;
    addDocument(id: any, docType: any, body: any): void;
}
