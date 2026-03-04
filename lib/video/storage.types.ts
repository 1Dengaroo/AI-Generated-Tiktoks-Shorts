export type StoredFile = {
  name: string;
  url: string;
  path: string;
};

export type VideoStorageProvider = {
  save(filename: string, data: Buffer): Promise<StoredFile>;
  list(directory: string): Promise<StoredFile[]>;
  getUrl(filename: string, directory: string): string;
};
