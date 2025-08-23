export interface Download {
  id: string;
  title: string;
  description?: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  isPublic: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}