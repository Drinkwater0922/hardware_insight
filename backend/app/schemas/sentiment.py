from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime


class SentimentBase(BaseModel):
    """情感分析基础模型"""
    query: str
    product_name: Optional[str] = None
    platform: str
    post_id: str
    post_url: Optional[str] = None
    title: Optional[str] = None
    content: str
    author: Optional[str] = None
    score: int = 0
    comments_count: int = 0
    views: int = 0


class SentimentCreate(SentimentBase):
    """创建情感分析记录"""
    pass


class SentimentAnalysisResult(BaseModel):
    """情感分析结果"""
    sentiment_score: float = Field(..., ge=-1, le=1, description="情感分数，-1到1")
    sentiment_label: str = Field(..., description="情感标签：positive/negative/neutral")
    confidence: float = Field(..., ge=0, le=1, description="置信度")
    key_points: List[str] = Field(default_factory=list, description="关键观点")
    topics: List[str] = Field(default_factory=list, description="主题标签")


class SentimentResponse(SentimentBase):
    """情感分析响应"""
    id: int
    sentiment_score: Optional[float] = None
    sentiment_label: Optional[str] = None
    confidence: Optional[float] = None
    key_points: Optional[List[str]] = None
    topics: Optional[List[str]] = None
    post_created_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class AnalysisQuery(BaseModel):
    """分析查询请求"""
    query: str = Field(..., description="查询内容，如：帮我找到关于 vivo X300 的用户舆情")
    platforms: List[str] = Field(
        default=["reddit", "twitter", "quora"],
        description="要搜索的平台列表"
    )
    max_results: int = Field(default=100, ge=10, le=500, description="每个平台的最大结果数")
    language: str = Field(default="en", description="语言")


class AnalysisReportSummary(BaseModel):
    """分析报告摘要"""
    total_posts: int
    positive_count: int
    negative_count: int
    neutral_count: int
    avg_sentiment_score: float
    avg_post_score: float
    platform_distribution: Dict[str, int]


class AnalysisReportResponse(BaseModel):
    """分析报告响应"""
    id: int
    query: str
    product_name: Optional[str] = None
    summary: AnalysisReportSummary
    top_positive_points: List[str]
    top_negative_points: List[str]
    trending_topics: List[str]
    sentiment_trend: Optional[Dict] = None
    full_report: Optional[str] = None
    posts: List[SentimentResponse]
    created_at: datetime

    class Config:
        from_attributes = True


class PlatformStats(BaseModel):
    """平台统计"""
    platform: str
    total_posts: int
    avg_sentiment: float
    positive_ratio: float
    negative_ratio: float
    neutral_ratio: float
