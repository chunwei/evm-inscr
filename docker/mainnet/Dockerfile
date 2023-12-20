FROM node:18-alpine as base

# 阶段：安装依赖阶段
FROM base as deps
# 设置工作目录
WORKDIR /app
# 复制 package.json 和 package-lock.json 文件
COPY package*.json ./
# 安装依赖项 clean-install
RUN npm ci

# 阶段1：构建阶段
FROM base as builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
# 复制应用程序文件
COPY . .
# This will do the trick, use the corresponding env file for each environment.
COPY .env.production.mainnet .env.production
# 构建 Next.js 应用程序
RUN npm run build


# 阶段2：生产环境
FROM base AS runner

WORKDIR /app

# 设置环境变量
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# COPY package*.json ./

# 生产环境忽略开发依赖
# RUN npm ci --omit=dev

# 复制构建阶段的输出
# COPY --from=builder /app/.next ./.next

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

# 暴露容器端口
EXPOSE 3000

ENV PORT 3000

# 运行 Next.js 应用程序
CMD ["node", "server.js"]
# CMD ["npm", "start"]