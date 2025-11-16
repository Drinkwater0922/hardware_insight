# Hardware Insight - AI硬件舆情分析平台

一个专注于AI硬件领域的舆情分析平台，帮助用户快速了解产品在海外社交媒体上的用户反馈。

## 功能特性

- 🔍 **多平台数据采集**: 支持Reddit、Twitter/X、Quora等主流平台
- 🤖 **AI智能分析**: 使用先进的NLP技术进行情感分析
- 📊 **可视化展示**: 直观展示舆情趋势和用户观点
- 🚀 **实时搜索**: 快速查询指定产品的用户反馈

## 技术栈

### 后端
- FastAPI - 高性能Web框架
- SQLAlchemy - ORM数据库操作
- Celery - 异步任务队列
- Redis - 缓存和任务队列

### 前端
- React 18 - UI框架
- TypeScript - 类型安全
- Vite - 快速构建工具
- Ant Design - UI组件库
- ECharts - 数据可视化

### 数据采集
- PRAW - Reddit API客户端
- Tweepy - Twitter API客户端
- Beautiful Soup - 网页解析

### AI分析
- Transformers - NLP模型
- OpenAI API - GPT模型支持
- TextBlob - 情感分析

## 快速开始

### 环境要求
- Python 3.9+
- Node.js 16+
- Redis (可选)

### 后端安装

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 前端安装

```bash
cd frontend
npm install
```

### 配置

1. 复制环境变量模板：
```bash
cp backend/.env.example backend/.env
```

2. 配置API密钥（在 `backend/.env` 中）：
```
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
TWITTER_BEARER_TOKEN=your_twitter_bearer_token
OPENAI_API_KEY=your_openai_api_key
```

### 运行

启动后端：
```bash
cd backend
uvicorn app.main:app --reload
```

启动前端：
```bash
cd frontend
npm run dev
```

访问 http://localhost:5173

## API文档

启动后端后，访问 http://localhost:8000/docs 查看交互式API文档。

## 使用示例

在搜索框输入：
```
帮我找到关于 vivo X300 的用户舆情
```

系统将：
1. 解析查询意图，提取产品名称
2. 在多个平台并行搜索相关内容
3. 使用AI分析用户情感和观点
4. 生成可视化报告

## 项目结构

```
hardware_insight/
├── backend/              # 后端服务
│   ├── app/
│   │   ├── api/         # API路由
│   │   ├── core/        # 核心配置
│   │   ├── models/      # 数据模型
│   │   ├── scrapers/    # 数据采集器
│   │   ├── analyzers/   # 分析模块
│   │   └── main.py      # 应用入口
│   └── requirements.txt
├── frontend/            # 前端应用
│   ├── src/
│   │   ├── components/  # React组件
│   │   ├── pages/       # 页面
│   │   ├── services/    # API服务
│   │   └── App.tsx
│   └── package.json
└── README.md
```

## 开发计划

- [x] 项目架构设计
- [ ] 后端API开发
- [ ] 数据采集模块
- [ ] 情感分析引擎
- [ ] 前端界面
- [ ] 数据可视化
- [ ] 部署配置

## License

MIT
