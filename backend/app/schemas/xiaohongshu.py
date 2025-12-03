"""
小红书API数据模型
"""
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime


# 请求模型
class TrendAnalysisRequest(BaseModel):
    """趋势分析请求"""
    topic: str = Field(..., description="要分析的主题/领域", min_length=1, max_length=200)
    max_posts: int = Field(50, description="最大采集笔记数", ge=10, le=200)
    sort_by: str = Field("hot", description="排序方式: hot, latest, popular")
    use_ai: bool = Field(True, description="是否使用AI生成深度建议")


# 响应模型
class TagInfo(BaseModel):
    """标签信息"""
    tag: str
    count: int
    avg_likes: float
    avg_comments: float
    avg_collects: float
    heat_score: float


class ThemeInfo(BaseModel):
    """主题信息"""
    theme: str
    count: int
    percentage: float
    top_posts: List[Dict[str, Any]]


class PostInfo(BaseModel):
    """笔记信息"""
    title: str
    author: str
    url: str
    likes: int
    comments: int
    collects: int
    shares: int
    views: int
    tags: List[str]
    has_video: bool
    heat_score: float


class EngagementMetrics(BaseModel):
    """互动指标"""
    avg_engagement_rate: float
    median_engagement_rate: float
    max_engagement_rate: float
    min_engagement_rate: float
    high_engagement_posts: int


class ContentTypeDistribution(BaseModel):
    """内容类型分布"""
    video_posts: int
    image_posts: int
    video_percentage: float
    image_percentage: float
    avg_images_per_post: float


class HeatTrendData(BaseModel):
    """热度趋势数据"""
    period: str
    post_count: int
    avg_likes: float
    avg_engagement: float


class KeywordInfo(BaseModel):
    """关键词信息"""
    word: str
    count: int
    weight: float


class StatisticsData(BaseModel):
    """统计数据"""
    total_likes: int
    total_comments: int
    total_collects: int
    total_shares: int
    total_views: int
    avg_likes: float
    avg_comments: float
    avg_collects: float
    avg_engagement_rate: float


class TrendAnalysisData(BaseModel):
    """趋势分析数据"""
    total_posts: int
    statistics: StatisticsData
    hot_tags: List[TagInfo]
    themes: List[ThemeInfo]
    engagement: EngagementMetrics
    viral_posts: List[PostInfo]
    content_types: ContentTypeDistribution
    heat_trend: List[HeatTrendData]
    keywords: List[KeywordInfo]
    analyzed_at: str


class ContentSuggestion(BaseModel):
    """内容建议"""
    type: str
    priority: str
    description: str
    example_titles: Optional[List[str]] = None
    tips: Optional[List[str]] = None
    estimated_views: str
    opportunity: Optional[str] = None


class TitleSuggestion(BaseModel):
    """标题建议"""
    template: str
    type: str
    appeal: str
    example: str


class TagStrategy(BaseModel):
    """标签策略"""
    optimal_count: str
    mix_strategy: str
    tips: List[str]


class TagSuggestions(BaseModel):
    """标签建议"""
    must_use: List[str]
    recommended: List[str]
    niche: List[str]
    tag_strategy: TagStrategy


class PostingTimeInfo(BaseModel):
    """发布时间信息"""
    weekdays: List[str]
    weekends: List[str]
    explanation: str


class PostingTips(BaseModel):
    """发布建议"""
    best_posting_time: PostingTimeInfo
    content_optimization: Dict[str, List[str]]
    initial_boost: Dict[str, Any]
    consistency: Dict[str, str]


class CompetitorPost(BaseModel):
    """竞品笔记"""
    title: str
    author: str
    likes: int
    collects: int
    engagement_rate: float
    success_factors: List[str]


class CompetitiveAnalysis(BaseModel):
    """竞品分析"""
    top_performers: List[CompetitorPost]
    success_factors: List[str]
    benchmarks: Dict[str, Any]


class SuccessRatePrediction(BaseModel):
    """成功率预测"""
    overall_success_rate: float
    competition_index: float
    opportunity_index: float
    recommendation: str
    factors: Dict[str, List[str]]


class RuleBasedAdvice(BaseModel):
    """基于规则的建议"""
    competition_level: str
    opportunity_score: float
    recommended_content_type: str
    trending_tags: List[str]
    avg_engagement_benchmark: float
    market_insights: List[str]


class CreatorAdvice(BaseModel):
    """创作建议"""
    topic: str
    generated_at: str
    overview: RuleBasedAdvice
    ai_insights: Optional[str]
    content_suggestions: List[ContentSuggestion]
    title_suggestions: List[TitleSuggestion]
    tag_suggestions: TagSuggestions
    posting_tips: PostingTips
    competitive_analysis: CompetitiveAnalysis
    success_rate_prediction: SuccessRatePrediction


class TrendAnalysisResponse(BaseModel):
    """趋势分析完整响应"""
    id: int
    topic: str
    trend_analysis: TrendAnalysisData
    creator_advice: CreatorAdvice
    created_at: datetime

    class Config:
        from_attributes = True


class TrendAnalysisSummary(BaseModel):
    """趋势分析摘要"""
    id: int
    topic: str
    total_posts: int
    avg_engagement_rate: float
    competition_level: str
    opportunity_score: float
    success_rate: float
    created_at: datetime

    class Config:
        from_attributes = True


class TrendAnalysisListResponse(BaseModel):
    """趋势分析列表响应"""
    items: List[TrendAnalysisSummary]
    total: int
    page: int
    page_size: int
