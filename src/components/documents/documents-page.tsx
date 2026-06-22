"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { formatDate, formatFileSize } from "@/lib/utils"
import {
  Folder,
  FolderPlus,
  FileText,
  FileImage,
  FileSpreadsheet,
  Upload,
  Download,
  Search,
  Loader2,
  Plus,
} from "lucide-react"

interface FolderType {
  id: string
  name: string
  parentId: string | null
  createdAt: Date
}

interface DocumentType {
  id: string
  title: string
  filename: string
  mimeType: string
  size: number
  version: number
  tags: string | null
  uploadedBy: string
  uploaderName: string
  createdAt: Date
  updatedAt: Date
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return FileImage
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return FileSpreadsheet
  return FileText
}

export function DocumentsPage({ folders, documents }: { folders: FolderType[]; documents: DocumentType[] }) {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [folderDialogOpen, setFolderDialogOpen] = useState(false)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [docTitle, setDocTitle] = useState("")
  const [docTags, setDocTags] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const filteredDocs = documents.filter((doc) => {
    const matchesFolder = selectedFolder ? doc.folderId === selectedFolder : true
    const matchesSearch = searchQuery
      ? doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.tags && doc.tags.toLowerCase().includes(searchQuery.toLowerCase()))
      : true
    return matchesFolder && matchesSearch
  })

  async function createFolder(e: React.FormEvent) {
    e.preventDefault()
    if (!newFolderName.trim()) return

    setLoading(true)
    try {
      const res = await fetch("/api/documents/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newFolderName }),
      })
      if (!res.ok) throw new Error("Failed to create folder")

      setFolderDialogOpen(false)
      setNewFolderName("")
      router.refresh()
      toast({ title: "Folder created" })
    } catch {
      toast({ title: "Failed to create folder", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    const fileInput = document.getElementById("doc-file") as HTMLInputElement
    const file = fileInput?.files?.[0]
    if (!file) {
      toast({ title: "Please select a file", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      // Get signed upload URL
      const signRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
        }),
      })
      if (!signRes.ok) throw new Error("Failed to get upload URL")

      const { url, key } = await signRes.json()

      // Upload to MinIO
      const uploadRes = await fetch(url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      })
      if (!uploadRes.ok) throw new Error("Failed to upload file")

      // Save document record
      const docRes = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: docTitle || file.name,
          filename: file.name,
          mimeType: file.type,
          size: file.size,
          minioKey: key,
          folderId: selectedFolder,
          tags: docTags,
        }),
      })
      if (!docRes.ok) throw new Error("Failed to save document")

      setUploadDialogOpen(false)
      setDocTitle("")
      setDocTags("")
      router.refresh()
      toast({ title: "Document uploaded" })
    } catch (error: any) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  async function handleDownload(docId: string) {
    try {
      const res = await fetch(`/api/documents/${docId}/download`)
      if (!res.ok) throw new Error("Failed to get download URL")

      const { url } = await res.json()
      window.open(url, "_blank")
    } catch {
      toast({ title: "Download failed", variant: "destructive" })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Documents</h2>
          <p className="text-muted-foreground">
            Central repository for all company files
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={folderDialogOpen} onOpenChange={setFolderDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FolderPlus className="mr-2 h-4 w-4" />
                New Folder
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Folder</DialogTitle>
              </DialogHeader>
              <form onSubmit={createFolder} className="space-y-4">
                <div className="space-y-2">
                  <Label>Folder Name</Label>
                  <Input
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="e.g., Legal, Finance, Contracts"
                    required
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setFolderDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Document</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUpload} className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    placeholder="Document title (optional)"
                  />
                </div>
                <div className="space-y-2">
                  <Label>File</Label>
                  <Input id="doc-file" type="file" />
                </div>
                <div className="space-y-2">
                  <Label>Tags (comma-separated)</Label>
                  <Input
                    value={docTags}
                    onChange={(e) => setDocTags(e.target.value)}
                    placeholder="legal, contract, 2026"
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setUploadDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      "Upload"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar - Folders */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Folders</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <button
                onClick={() => setSelectedFolder(null)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                  !selectedFolder ? "bg-primary/10 text-primary" : "hover:bg-muted"
                }`}
              >
                <Folder className="h-4 w-4" />
                All Documents
              </button>
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => setSelectedFolder(folder.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                    selectedFolder === folder.id ? "bg-primary/10 text-primary" : "hover:bg-muted"
                  }`}
                >
                  <Folder className="h-4 w-4" />
                  {folder.name}
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents by name or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Documents Grid */}
          {filteredDocs.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2">
              {filteredDocs.map((doc) => {
                const Icon = getFileIcon(doc.mimeType)
                return (
                  <Card key={doc.id} className="border-border/50 hover:border-primary/20 transition-colors">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                          <Icon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{doc.title}</h4>
                          <p className="text-xs text-muted-foreground truncate">{doc.filename}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-muted-foreground">
                              {formatFileSize(doc.size)}
                            </span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(doc.createdAt)}
                            </span>
                            {doc.version > 1 && (
                              <Badge variant="outline" className="text-xs">
                                v{doc.version}
                              </Badge>
                            )}
                          </div>
                          {doc.tags && (
                            <div className="flex gap-1 mt-2">
                              {doc.tags.split(",").map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag.trim()}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownload(doc.id)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery ? "No documents match your search" : "No documents yet. Upload your first file."}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
