from sqlalchemy import Column, Integer, String, Float, DateTime, Text, JSON
from sqlalchemy.sql import func
from app.core.database import Base


class SentimentAnalysis(Base):
    """舆情分析结果模型"""

    __tablename__ = "sentiment_analysis"

    id = Column(Integer, primary_key=True, index=True)
    query = Column(String(255), index=True, nullable=False)  # 查询关键词
    product_name = Column(String(255), index=True)  # 产品名称

    # 平台信息
    platform = Column(String(50), index=True)  # reddit, twitter, quora等
    post_id = Column(String(255), unique=True, index=True)  # 平台上的帖子ID
    post_url = Column(String(512))  # 帖子链接

    # 内容
    title = Column(String(512))  # 标题
    content = Column(Text)  # 正文内容
    author = Column(String(255))  # 作者

    # 统计信息
    score = Column(Integer, default=0)  # 点赞数/评分
    comments_count = Column(Integer, default=0)  # 评论数
    views = Column(Integer, default=0)  # 浏览数

    # 情感分析结果
    sentiment_score = Column(Float)  # 情感分数 -1到1
    sentiment_label = Column(String(20))  # positive, negative, neutral
    confidence = Column(Float)  # 置信度

    # 关键信息提取
    key_points = Column(JSON)  # 关键观点列表
    topics = Column(JSON)  # 主题标签

    # 时间信息
    post_created_at = Column(DateTime)  # 帖子创建时间
    created_at = Column(DateTime, server_default=func.now())  # 记录创建时间
    updated_at = Column(DateTime, onupdate=func.now())  # 记录更新时间

    def __repr__(self):
        return f"<SentimentAnalysis {self.platform}:{self.post_id}>"


class AnalysisReport(Base):
    """分析报告模型"""

    __tablename__ = "analysis_reports"

    id = Column(Integer, primary_key=True, index=True)
    query = Column(String(255), index=True, nullable=False)
    product_name = Column(String(255), index=True)

    # 统计摘要
    total_posts = Column(Integer, default=0)  # 总帖子数
    positive_count = Column(Integer, default=0)  # 正面评价数
    negative_count = Column(Integer, default=0)  # 负面评价数
    neutral_count = Column(Integer, default=0)  # 中性评价数

    # 平均分数
    avg_sentiment_score = Column(Float)  # 平均情感分数
    avg_post_score = Column(Float)  # 平均帖子评分

    # 平台分布
    platform_distribution = Column(JSON)  # {"reddit": 50, "twitter": 30, ...}

    # 关键发现
    top_positive_points = Column(JSON)  # 主要优点列表
    top_negative_points = Column(JSON)  # 主要缺点列表
    trending_topics = Column(JSON)  # 热门话题

    # 时间趋势
    sentiment_trend = Column(JSON)  # 情感趋势数据

    # 完整报告
    full_report = Column(Text)  # AI生成的完整报告

    # 时间信息
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    def __repr__(self):
        return f"<AnalysisReport {self.product_name}>"
