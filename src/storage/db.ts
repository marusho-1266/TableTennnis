import { openDB } from "idb";

export const DB_NAME = "table-tennis";
export const SCHEMA_VERSION = 1;
export const MATCH_STORE = "matches";

export function openMatchDb() {
  return openDB(DB_NAME, SCHEMA_VERSION, {
    upgrade(database) {
      if (!database.objectStoreNames.contains(MATCH_STORE)) {
        database.createObjectStore(MATCH_STORE, { keyPath: "id" });
      }
    },
  });
}
