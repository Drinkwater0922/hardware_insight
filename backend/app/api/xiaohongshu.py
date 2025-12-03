"""
小红书趋势分析API接口
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import Optional
import logging
from datetime import datetime

from backend.app.core.database import get_db
from backend.app.models.xiaohongshu import XiaohongshuTrendAnalysis, XiaohongshuPost
from backend.app.schemas.xiaohongshu import (
    TrendAnalysisRequest,
    TrendAnalysisResponse,
    TrendAnalysisListResponse,
    TrendAnalysisSummary
)
from backend.app.scrapers.xiaohongshu_scraper import XiaohongshuScraper
from backend.app.analyzers.trend_analyzer import TrendAnalyzer
from backend.app.analyzers.creator_advisor import CreatorAdvisor

# 尝试导入OpenAI，如果失败则使用None
try:
    from openai import AsyncOpenAI
    from backend.app.core.config import settings
    openai_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY) if hasattr(settings, 'OPENAI_API_KEY') and settings.OPENAI_API_KEY else None
except Exception:
    openai_client = None

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/analyze-trend", response_model=TrendAnalysisResponse)
async def analyze_trend(
    request: TrendAnalysisRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    分析小红书热点领域趋势

    步骤：
    1. 采集指定主题的笔记数据
    2. 分析热点趋势（标签、主题、爆款等）
    3. 生成创作建议
    4. 保存到数据库
    """
    try:
        logger.info(f"开始分析小红书主题: {request.topic}")

        # 1. 数据采集
        scraper = XiaohongshuScraper()
        posts = await scraper.search(
            query=request.topic,
            max_results=request.max_posts,
            sort_by=request.sort_by
        )

        if not posts:
            raise HTTPException(
                status_code=404,
                detail=f"未找到关于 '{request.topic}' 的相关内容"
            )

        logger.info(f"成功采集 {len(posts)} 条笔记")

        # 2. 趋势分析
        trend_analyzer = TrendAnalyzer()
        trend_analysis = trend_analyzer.analyze_trends(posts)

        logger.info("趋势分析完成")

        # 3. 生成创作建议
        creator_advisor = CreatorAdvisor(openai_client)
        creator_advice = await creator_advisor.generate_advice(
            topic=request.topic,
            trend_analysis=trend_analysis,
            use_ai=request.use_ai and openai_client is not None
        )

        logger.info("创作建议生成完成")

        # 4. 保存到数据库
        analysis_record = XiaohongshuTrendAnalysis(
            topic=request.topic,
            max_posts=request.max_posts,
            sort_by=request.sort_by,
            total_posts=trend_analysis.get("total_posts", 0),
            total_likes=trend_analysis.get("statistics", {}).get("total_likes", 0),
            total_comments=trend_analysis.get("statistics", {}).get("total_comments", 0),
            total_collects=trend_analysis.get("statistics", {}).get("total_collects", 0),
            total_shares=trend_analysis.get("statistics", {}).get("total_shares", 0),
            total_views=trend_analysis.get("statistics", {}).get("total_views", 0),
            avg_likes=trend_analysis.get("statistics", {}).get("avg_likes", 0),
            avg_comments=trend_analysis.get("statistics", {}).get("avg_comments", 0),
            avg_collects=trend_analysis.get("statistics", {}).get("avg_collects", 0),
            avg_engagement_rate=trend_analysis.get("statistics", {}).get("avg_engagement_rate", 0),
            hot_tags=trend_analysis.get("hot_tags", []),
            themes=trend_analysis.get("themes", []),
            keywords=trend_analysis.get("keywords", []),
            viral_posts=trend_analysis.get("viral_posts", []),
            content_types=trend_analysis.get("content_types", {}),
            heat_trend=trend_analysis.get("heat_trend", []),
            creator_advice=creator_advice,
            ai_insights=creator_advice.get("ai_insights"),
            competition_level=creator_advice.get("overview", {}).get("competition_level", "中"),
            opportunity_score=creator_advice.get("overview", {}).get("opportunity_score", 0),
            success_rate=creator_advice.get("success_rate_prediction", {}).get("overall_success_rate", 0),
            raw_posts_data=posts[:10]  # 只保存前10条原始数据以节省空间
        )

        db.add(analysis_record)
        await db.commit()
        await db.refresh(analysis_record)

        logger.info(f"分析结果已保存，ID: {analysis_record.id}")

        # 5. 构造响应
        response = TrendAnalysisResponse(
            id=analysis_record.id,
            topic=analysis_record.topic,
            trend_analysis=trend_analysis,
            creator_advice=creator_advice,
            created_at=analysis_record.created_at
        )

        return response

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"趋势分析失败: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"分析失败: {str(e)}"
        )


@router.get("/analyses/{analysis_id}", response_model=TrendAnalysisResponse)
async def get_analysis(
    analysis_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    获取趋势分析详情
    """
    try:
        result = await db.execute(
            select(XiaohongshuTrendAnalysis).where(
                XiaohongshuTrendAnalysis.id == analysis_id
            )
        )
        analysis = result.scalar_one_or_none()

        if not analysis:
            raise HTTPException(
                status_code=404,
                detail=f"未找到ID为 {analysis_id} 的分析记录"
            )

        # 重构趋势分析数据
        trend_analysis = {
            "total_posts": analysis.total_posts,
            "statistics": {
                "total_likes": analysis.total_likes,
                "total_comments": analysis.total_comments,
                "total_collects": analysis.total_collects,
                "total_shares": analysis.total_shares,
                "total_views": analysis.total_views,
                "avg_likes": analysis.avg_likes,
                "avg_comments": analysis.avg_comments,
                "avg_collects": analysis.avg_collects,
                "avg_engagement_rate": analysis.avg_engagement_rate
            },
            "hot_tags": analysis.hot_tags,
            "themes": analysis.themes,
            "engagement": {},  # 可以从其他数据计算
            "viral_posts": analysis.viral_posts,
            "content_types": analysis.content_types,
            "heat_trend": analysis.heat_trend,
            "keywords": analysis.keywords,
            "analyzed_at": analysis.created_at.isoformat()
        }

        response = TrendAnalysisResponse(
            id=analysis.id,
            topic=analysis.topic,
            trend_analysis=trend_analysis,
            creator_advice=analysis.creator_advice,
            created_at=analysis.created_at
        )

        return response

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取分析详情失败: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"获取失败: {str(e)}"
        )


@router.get("/analyses", response_model=TrendAnalysisListResponse)
async def list_analyses(
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(20, ge=1, le=100, description="每页数量"),
    topic: Optional[str] = Query(None, description="主题筛选"),
    db: AsyncSession = Depends(get_db)
):
    """
    获取趋势分析列表
    """
    try:
        # 构建查询
        query = select(XiaohongshuTrendAnalysis)

        # 主题筛选
        if topic:
            query = query.where(XiaohongshuTrendAnalysis.topic.contains(topic))

        # 排序
        query = query.order_by(desc(XiaohongshuTrendAnalysis.created_at))

        # 获取总数
        count_query = select(func.count()).select_from(XiaohongshuTrendAnalysis)
        if topic:
            count_query = count_query.where(XiaohongshuTrendAnalysis.topic.contains(topic))

        total_result = await db.execute(count_query)
        total = total_result.scalar()

        # 分页
        offset = (page - 1) * page_size
        query = query.offset(offset).limit(page_size)

        result = await db.execute(query)
        analyses = result.scalars().all()

        # 构造摘要列表
        items = [
            TrendAnalysisSummary(
                id=analysis.id,
                topic=analysis.topic,
                total_posts=analysis.total_posts,
                avg_engagement_rate=analysis.avg_engagement_rate,
                competition_level=analysis.competition_level,
                opportunity_score=analysis.opportunity_score,
                success_rate=analysis.success_rate,
                created_at=analysis.created_at
            )
            for analysis in analyses
        ]

        return TrendAnalysisListResponse(
            items=items,
            total=total,
            page=page,
            page_size=page_size
        )

    except Exception as e:
        logger.error(f"获取分析列表失败: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"获取失败: {str(e)}"
        )


@router.delete("/analyses/{analysis_id}")
async def delete_analysis(
    analysis_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    删除趋势分析记录
    """
    try:
        result = await db.execute(
            select(XiaohongshuTrendAnalysis).where(
                XiaohongshuTrendAnalysis.id == analysis_id
            )
        )
        analysis = result.scalar_one_or_none()

        if not analysis:
            raise HTTPException(
                status_code=404,
                detail=f"未找到ID为 {analysis_id} 的分析记录"
            )

        await db.delete(analysis)
        await db.commit()

        return {"message": "删除成功", "id": analysis_id}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"删除分析记录失败: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"删除失败: {str(e)}"
        )


# 导入func用于count
from sqlalchemy import func
