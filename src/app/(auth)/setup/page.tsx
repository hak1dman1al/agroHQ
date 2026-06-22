"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { signUp } from "@/lib/auth/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Leaf, Loader2, CheckCircle2 } from "lucide-react"

export default function SetupPage() {
  const [step, setStep] = useState(1)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Check if setup has already been completed
    async function checkSetup() {
      try {
        const res = await fetch("/api/setup/check")
        const data = await res.json()
        if (data.hasAdmin) {
          router.push("/login")
        }
      } catch {
        // API might not exist yet, continue with setup
      } finally {
        setChecking(false)
      }
    }
    checkSetup()
  }, [router])

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
          title: "Setup failed",
          description: result.error.message || "Could not create account",
          variant: "destructive",
        })
      } else {
        // Update user role to admin
        await fetch("/api/setup/admin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: result.data?.user?.id }),
        })

        setStep(2)
        setTimeout(() => {
          router.push("/dashboard")
          router.refresh()
        }, 2000)
      }
    } catch (error) {
      toast({
        title: "Setup failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
          <h1 className="text-3xl font-bold text-foreground">Welcome to Agro HQ</h1>
          <p className="text-muted-foreground mt-2">Set up your workspace</p>
        </div>

        {step === 1 ? (
          <Card className="border-border/50">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">Create Admin Account</CardTitle>
              <CardDescription>
                This will be the first user with full administrative access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
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
                    placeholder="admin@agro.com"
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
                    "Create Admin Account"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <CheckCircle2 className="h-16 w-16 text-primary" />
                <h2 className="text-2xl font-semibold">Setup Complete!</h2>
                <p className="text-muted-foreground">
                  Your workspace is ready. Redirecting to dashboard...
                </p>
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
