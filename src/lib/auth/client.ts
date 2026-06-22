export async function signIn(credentials: { email: string; password: string }) {
  const res = await fetch("/api/auth/sign-in/email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
    credentials: "include",
  })
  
  const data = await res.json()
  
  if (!res.ok) {
    return { error: { message: data.message || "Sign in failed" }, data: null }
  }
  
  return { error: null, data }
}

export async function signUp(credentials: { name: string; email: string; password: string }) {
  const res = await fetch("/api/auth/sign-up/email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
    credentials: "include",
  })
  
  const data = await res.json()
  
  if (!res.ok) {
    return { error: { message: data.message || "Sign up failed" }, data: null }
  }
  
  return { error: null, data }
}

export async function signOut() {
  const res = await fetch("/api/auth/sign-out", {
    method: "POST",
    credentials: "include",
  })
  
  if (!res.ok) {
    console.error("Sign out failed")
  }
}
