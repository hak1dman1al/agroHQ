"use client"

import { AuthProvider as BetterAuthProvider } from "@/components/providers/auth-provider-wrapper"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <BetterAuthProvider>{children}</BetterAuthProvider>
}
