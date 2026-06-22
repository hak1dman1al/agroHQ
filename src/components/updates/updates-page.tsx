"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/providers/auth-provider"
import { getInitials, formatRelativeTime, formatFileSize } from "@/lib/utils"
import {
  Megaphone,
  Send,
  Loader2,
  Image,
  ThumbsUp,
  Paperclip,
} from "lucide-react"

interface Attachment {
  id: string
  filename: string
  mimeType: string
  size: number
  minioKey: string
}

interface Reaction {
  id: string
  emoji: string
  userId: string
  userName: string
}

interface Update {
  id: string
  content: string
  userId: string
  userName: string
  createdAt: Date
  attachments: Attachment[]
  reactions: Reaction[]
}

const quickReactions = ["👍", "🎉", "🌱", "🔥", "✅"]

export function UpdatesPage({ updates }: { updates: Update[] }) {
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const { session } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  async function handlePost(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return

    setLoading(true)
    try {
      const res = await fetch("/api/updates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      })

      if (!res.ok) throw new Error("Failed to post")

      setContent("")
      router.refresh()
      toast({ title: "Update posted" })
    } catch {
      toast({ title: "Failed to post update", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  async function handleReaction(updateId: string, emoji: string) {
    try {
      await fetch(`/api/updates/${updateId}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji }),
      })
      router.refresh()
    } catch {
      toast({ title: "Failed to add reaction", variant: "destructive" })
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    // File upload logic similar to task attachments
    toast({ title: "File upload coming soon" })
    e.target.value = ""
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Progress Updates</h2>
        <p className="text-muted-foreground">
          Share progress, milestones, and updates with the team
        </p>
      </div>

      {/* Post Update */}
      <Card className="border-border/50">
        <CardContent className="pt-6">
          <form onSubmit={handlePost} className="space-y-4">
            <div className="flex gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback>
                  {session?.user?.name ? getInitials(session.user.name) : "U"}
                </AvatarFallback>
              </Avatar>
              <Textarea
                placeholder="Share an update... (e.g., '2000 MD2 seedlings arrived', 'Land clearing completed')"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
                className="flex-1"
              />
            </div>
            <div className="flex items-center justify-between pl-13">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  id="update-upload"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => document.getElementById("update-upload")?.click()}
                >
                  <Image className="mr-1 h-4 w-4" />
                  Media
                </Button>
              </div>
              <Button type="submit" disabled={loading || !content.trim()}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Post Update
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Feed */}
      {updates.length > 0 ? (
        <div className="space-y-4">
          {updates.map((update) => (
            <Card key={update.id} className="border-border/50">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {getInitials(update.userName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {update.userName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(update.createdAt)}
                      </span>
                    </div>
                    <p className="text-foreground whitespace-pre-wrap">
                      {update.content}
                    </p>

                    {/* Attachments */}
                    {update.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {update.attachments.map((att) => (
                          <div
                            key={att.id}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-muted/50"
                          >
                            <Paperclip className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs">{att.filename}</span>
                            <span className="text-xs text-muted-foreground">
                              ({formatFileSize(att.size)})
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reactions */}
                    <div className="flex items-center gap-2 pt-2">
                      {quickReactions.map((emoji) => {
                        const count = update.reactions.filter(
                          (r) => r.emoji === emoji
                        ).length
                        const hasReacted = update.reactions.some(
                          (r) =>
                            r.emoji === emoji &&
                            r.userId === session?.user?.id
                        )

                        return (
                          <button
                            key={emoji}
                            onClick={() => handleReaction(update.id, emoji)}
                            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors ${
                              hasReacted
                                ? "bg-primary/10 border border-primary/20"
                                : "bg-muted/50 hover:bg-muted border border-transparent"
                            }`}
                          >
                            <span>{emoji}</span>
                            {count > 0 && (
                              <span className="text-muted-foreground">
                                {count}
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Megaphone className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">
              No updates yet. Share your first progress update!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
