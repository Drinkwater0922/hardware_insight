"""
小红书趋势分析数据模型
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, JSON, Boolean
from sqlalchemy.sql import func
from backend.app.core.database import Base


class XiaohongshuTrendAnalysis(Base):
    """小红书趋势分析记录"""
    __tablename__ = "xiaohongshu_trend_analysis"

    id = Column(Integer, primary_key=True, index=True)
    topic = Column(String(200), index=True, nullable=False)  # 分析的主题/领域

    # 分析参数
    max_posts = Column(Integer, default=50)
    sort_by = Column(String(20), default="hot")  # hot, latest, popular

    # 统计数据
    total_posts = Column(Integer, default=0)
    total_likes = Column(Integer, default=0)
    total_comments = Column(Integer, default=0)
    total_collects = Column(Integer, default=0)
    total_shares = Column(Integer, default=0)
    total_views = Column(Integer, default=0)

    avg_likes = Column(Float, default=0.0)
    avg_comments = Column(Float, default=0.0)
    avg_collects = Column(Float, default=0.0)
    avg_engagement_rate = Column(Float, default=0.0)

    # 趋势分析结果（JSON格式）
    hot_tags = Column(JSON, default=list)  # 热门标签列表
    themes = Column(JSON, default=list)  # 内容主题分布
    keywords = Column(JSON, default=list)  # 关键词云
    viral_posts = Column(JSON, default=list)  # 爆款笔记
    content_types = Column(JSON, default=dict)  # 内容类型分布
    heat_trend = Column(JSON, default=list)  # 热度趋势

    # 创作建议（JSON格式）
    creator_advice = Column(JSON, default=dict)  # 创作建议数据
    ai_insights = Column(Text, nullable=True)  # AI生成的深度洞察

    # 竞争分析
    competition_level = Column(String(20))  # 竞争程度：低、中、高
    opportunity_score = Column(Float, default=0.0)  # 机会分数 0-100
    success_rate = Column(Float, default=0.0)  # 预测成功率 0-100

    # 时间戳
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # 原始数据（可选，用于调试）
    raw_posts_data = Column(JSON, nullable=True)  # 原始笔记数据


class XiaohongshuPost(Base):
    """小红书笔记记录"""
    __tablename__ = "xiaohongshu_posts"

    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(Integer, index=True)  # 关联的分析ID

    # 笔记基本信息
    post_id = Column(String(200), unique=True, index=True)
    post_url = Column(String(500))
    title = Column(String(500))
    content = Column(Text)

    # 作者信息
    author = Column(String(200))
    author_id = Column(String(200), index=True)

    # 互动数据
    likes = Column(Integer, default=0)
    comments_count = Column(Integer, default=0)
    collects = Column(Integer, default=0)
    shares = Column(Integer, default=0)
    views = Column(Integer, default=0)

    # 内容特征
    tags = Column(JSON, default=list)  # 标签列表
    images_count = Column(Integer, default=0)
    has_video = Column(Boolean, default=False)

    # 热度分数
    heat_score = Column(Float, default=0.0)
    engagement_rate = Column(Float, default=0.0)

    # 发布时间
    published_at = Column(DateTime(timezone=True))

    # 创建时间
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # 原始数据
    raw_data = Column(JSON, nullable=True)
