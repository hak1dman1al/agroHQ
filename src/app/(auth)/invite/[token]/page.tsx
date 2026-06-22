"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { signUp } from "@/lib/auth/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Leaf, Loader2, CheckCircle2, AlertCircle } from "lucide-react"

export default function InvitePage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(true)
  const [inviteValid, setInviteValid] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const params = useParams()
  const token = params.token as string
  const { toast } = useToast()

  useEffect(() => {
    async function verifyInvite() {
      try {
        const res = await fetch(`/api/invite/verify?token=${token}`)
        const data = await res.json()
        if (data.valid) {
          setName(data.name || "")
          setEmail(data.email || "")
          setInviteValid(true)
        }
      } catch {
        // Invalid invite
      } finally {
        setVerifying(false)
      }
    }
    verifyInvite()
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await signUp({
        name,
        email,
        password,
      })

      if (result.error) {
        toast({
          title: "Registration failed",
          description: result.error.message || "Could not create account",
          variant: "destructive",
        })
      } else {
        // Accept the invite
        await fetch("/api/invite/accept", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, userId: result.data?.user?.id }),
        })

        setSuccess(true)
        setTimeout(() => {
          router.push("/dashboard")
          router.refresh()
        }, 2000)
      }
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!inviteValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md border-border/50">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <AlertCircle className="h-16 w-16 text-destructive" />
              <h2 className="text-2xl font-semibold">Invalid Invite</h2>
              <p className="text-muted-foreground">
                This invite link is invalid or has expired. Please contact the administrator.
              </p>
              <Button onClick={() => router.push("/login")}>Go to Login</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Leaf className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Join Agro HQ</h1>
          <p className="text-muted-foreground mt-2">Create your account</p>
        </div>

        {success ? (
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <CheckCircle2 className="h-16 w-16 text-primary" />
                <h2 className="text-2xl font-semibold">Welcome!</h2>
                <p className="text-muted-foreground">
                  Your account has been created. Redirecting to dashboard...
                </p>
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border/50">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">Set Your Password</CardTitle>
              <CardDescription>
                You've been invited to join Agro HQ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Must be at least 8 characters
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account & Join"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
