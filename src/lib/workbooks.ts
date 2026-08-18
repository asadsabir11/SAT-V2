import { appendData, readData, deleteByField } from "@/lib/storage";

export interface Workbook {
  id: string;
  title: string;
  fileUrl: string;
  fileName: string;
  uploadedBy: string;
  createdAt: string;
}

const COLLECTION = "workbooks";

export async function listWorkbooks(): Promise<Workbook[]> {
  return readData<Workbook>(COLLECTION);
}

export async function createWorkbook(data: { title: string; fileUrl: string; fileName: string; uploadedBy: string }): Promise<string> {
  const id = crypto.randomUUID();
  const record: Workbook = {
    id,
    title: data.title,
    fileUrl: data.fileUrl,
    fileName: data.fileName,
    uploadedBy: data.uploadedBy,
    createdAt: new Date().toISOString(),
  };
  await appendData(COLLECTION, record);
  return id;
}

export async function deleteWorkbook(id: string): Promise<void> {
  await deleteByField(COLLECTION, "id", id);
}
