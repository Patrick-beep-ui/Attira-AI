import type { PersistedClient, Persister } from "@tanstack/react-query-persist-client";
import { get, set, del } from "idb-keyval";

const CACHE_KEY = "dressly-query-cache";

export function createIDBPersister(): Persister {
  return {
    persistClient: async (client: PersistedClient) => {
      await set(CACHE_KEY, client);
    },
    restoreClient: async () => {
      return get<PersistedClient>(CACHE_KEY);
    },
    removeClient: async () => {
      await del(CACHE_KEY);
    },
  };
}

export const persister = createIDBPersister();

export const queryCacheConfig = {
  staleTime: 1000 * 60 * 5,
  gcTime: 1000 * 60 * 60 * 24,
  retry: 1,
};