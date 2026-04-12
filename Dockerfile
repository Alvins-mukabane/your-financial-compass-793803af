FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS builder
WORKDIR /app
COPY . .

ARG VITE_SUPABASE_PROJECT_ID=local-project-id
ARG VITE_SUPABASE_PUBLISHABLE_KEY=local-publishable-key
ARG VITE_SUPABASE_URL=https://local-project-id.supabase.co
ARG GROQ_API_KEY=
ARG TAVILY_API_KEY=

ENV VITE_SUPABASE_PROJECT_ID=${VITE_SUPABASE_PROJECT_ID}
ENV VITE_SUPABASE_PUBLISHABLE_KEY=${VITE_SUPABASE_PUBLISHABLE_KEY}
ENV VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
ENV GROQ_API_KEY=${GROQ_API_KEY}
ENV TAVILY_API_KEY=${TAVILY_API_KEY}

RUN npm run validate-env
RUN npm run build

FROM nginx:1.27-alpine AS runner
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
