FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json ./
RUN npm install --legacy-peer-deps

# Production - run in development mode for now
FROM base AS runner
WORKDIR /app
ENV NODE_ENV development

COPY --from=deps /app/node_modules ./node_modules
COPY . .

EXPOSE 3000
CMD ["npm", "run", "dev"]
