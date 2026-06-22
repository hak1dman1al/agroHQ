declare module "better-auth" {
  export function betterAuth(config: any): any
}

declare module "better-auth/adapters/drizzle" {
  export function drizzleAdapter(db: any, options: any): any
}

declare module "better-auth/next-js" {
  export function toNextJsHandler(auth: any): {
    GET: any
    POST: any
  }
}

declare module "better-auth/react" {
  export function createAuthClient(config: any): any
  export const SessionProvider: any
}
