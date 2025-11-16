# 部署指南

## 本地开发

### 1. 后端设置

```bash
cd backend

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入您的API密钥

# 运行后端
uvicorn app.main:app --reload
```

后端将在 http://localhost:8000 启动。访问 http://localhost:8000/docs 查看API文档。

### 2. 前端设置

```bash
cd frontend

# 安装依赖
npm install

# 运行前端
npm run dev
```

前端将在 http://localhost:5173 启动。

## Docker部署

### 使用Docker Compose

```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

访问：
- 前端: http://localhost:5173
- 后端: http://localhost:8000
- API文档: http://localhost:8000/docs

## 配置API密钥

### Reddit API

1. 访问 https://www.reddit.com/prefs/apps
2. 创建新应用（选择 "script"）
3. 获取 client_id 和 client_secret
4. 在 `.env` 文件中配置

### Twitter API

1. 访问 https://developer.twitter.com/
2. 创建项目和应用
3. 获取 Bearer Token
4. 在 `.env` 文件中配置

### OpenAI API

1. 访问 https://platform.openai.com/
2. 创建API密钥
3. 在 `.env` 文件中配置

## 生产环境部署

### 1. 环境变量

确保在生产环境中设置以下环境变量：

```bash
DEBUG=False
ENVIRONMENT=production
SECRET_KEY=<strong-random-secret>
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/dbname
```

### 2. 数据库迁移

如果使用PostgreSQL：

```bash
# 安装PostgreSQL
pip install asyncpg

# 更新DATABASE_URL
export DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/dbname

# 运行应用（自动创建表）
python -m uvicorn app.main:app
```

### 3. 使用Gunicorn

```bash
pip install gunicorn

gunicorn app.main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000
```

### 4. Nginx配置

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5173;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 300s;
    }
}
```

## 性能优化

1. **使用Redis缓存**: 设置 REDIS_URL 环境变量
2. **并行采集**: 多个平台的数据采集会自动并行执行
3. **数据库索引**: 已在模型中定义索引字段
4. **限流**: 建议在生产环境中添加API限流

## 监控

- 后端日志: 使用 Python logging 模块
- 健康检查: GET /health
- API文档: GET /docs

## 故障排除

### 数据采集失败

1. 检查API密钥是否正确配置
2. 检查网络连接
3. 查看后端日志了解详细错误

### 前端连接失败

1. 检查后端是否正常运行
2. 检查CORS配置
3. 查看浏览器控制台错误

### 数据库错误

1. 确保DATABASE_URL正确
2. 检查数据库连接
3. 删除并重新创建数据库（开发环境）
