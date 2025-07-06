FROM node:22-slim

RUN apt-get update && apt-get install -y curl && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /home/user/nextjs-app

COPY package*.json ./

RUN npm ci

COPY . .

# Replace the original page.tsx with the sandbox version to avoid database calls
RUN cp app/\(landing\)/page.sandbox.tsx app/\(landing\)/page.tsx

ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1

EXPOSE 3000

RUN mv /home/user/nextjs-app/* /home/user/ && rm -rf /home/user/nextjs-app