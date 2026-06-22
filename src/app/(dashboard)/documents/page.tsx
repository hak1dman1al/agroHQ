export const dynamic = "force-dynamic"

import { db } from "@/lib/db/client"
import { documents, documentFolders, users } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"
import { DocumentsPage } from "@/components/documents/documents-page"

async function getFolders() {
  try {
    return await db.select().from(documentFolders)
  } catch {
    return []
  }
}

async function getDocuments(folderId?: string) {
  try {
    const query = db
      .select({
        id: documents.id,
        title: documents.title,
        filename: documents.filename,
        mimeType: documents.mimeType,
        size: documents.size,
        version: documents.version,
        tags: documents.tags,
        uploadedBy: documents.uploadedBy,
        uploaderName: users.name,
        createdAt: documents.createdAt,
        updatedAt: documents.updatedAt,
      })
      .from(documents)
      .innerJoin(users, eq(documents.uploadedBy, users.id))
      .orderBy(desc(documents.createdAt))

    if (folderId) {
      query.where(eq(documents.folderId, folderId))
    }

    return await query
  } catch {
    return []
  }
}

export default async function DocumentsRoute() {
  const [folders, docs] = await Promise.all([getFolders(), getDocuments()])
  return <DocumentsPage folders={folders} documents={docs} />
}
