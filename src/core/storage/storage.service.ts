import type { StorageFile } from "./storage-file.model.js";

export type StorageReadAccess = {
    type : 'redirect';
    url : string;
};


export abstract class StorageService{
    abstract upload(
        key : string,
        body : Buffer,
        contentType : string,
    ):Promise<void>;
    abstract get(key : string):Promise<StorageFile>;

    abstract delete(key : string):Promise<void>;

    abstract getReadAccess(
        key : string,
        expiresInSeconds : number,
    ):Promise<StorageReadAccess>;
}