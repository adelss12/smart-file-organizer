export interface ScannedFile {
  id: string;
  name: string;
  relativePath: string;
  size: number;
  type: string;
  lastModified: number;
  hash?: string;
  isDuplicate?: boolean;
  duplicateOf?: string; // path or id of the original file
  fileHandle?: File;
}

export interface ScanStats {
  totalFiles: number;
  totalSize: number;
  uniqueCount: number;
  uniqueSize: number;
  duplicateCount: number;
  duplicateSize: number;
  scannedCount: number;
  durationMs: number;
  status: 'idle' | 'scanning' | 'organizing' | 'completed' | 'error';
  errorMessage?: string;
}

export type OperationMode = 'copy' | 'move';

export interface OrganizerConfig {
  sourceDirectoryName: string;
  newFolderName: string;
  operationMode: OperationMode;
  speedOptimization: boolean;
  generateReport: boolean;
  skipDuplicates: boolean;
}

export interface DuplicateGroup {
  hash: string;
  size: number;
  originalFile: ScannedFile;
  duplicates: ScannedFile[];
}
