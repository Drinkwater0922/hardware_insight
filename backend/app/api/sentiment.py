from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
import logging
import re

from app.core.database import get_db
from app.models.sentiment import SentimentAnalysis, AnalysisReport
from app.schemas.sentiment import (
    AnalysisQuery,
    AnalysisReportResponse,
    SentimentResponse,
    PlatformStats,
)
from app.scrapers.reddit_scraper import RedditScraper
from app.scrapers.twitter_scraper import TwitterScraper
from app.scrapers.quora_scraper import QuoraScraper
from app.analyzers.sentiment_analyzer import SentimentAnalyzer
from app.analyzers.report_generator import ReportGenerator

router = APIRouter(prefix="/api/sentiment", tags=["sentiment"])
logger = logging.getLogger(__name__)


@router.post("/analyze", response_model=dict)
async def analyze_sentiment(query: AnalysisQuery, db: AsyncSession = Depends(get_db)):
    """
    分析产品舆情

    这是核心API，接收查询请求，执行以下步骤：
    1. 解析查询，提取产品名称
    2. 从多个平台采集数据
    3. 进行情感分析
    4. 生成分析报告
    """
    logger.info(f"Received analysis request: {query.query}")

    # 提取产品名称
    product_name = extract_product_name(query.query)
    logger.info(f"Extracted product name: {product_name}")

    # 初始化采集器
    scrapers = {
        "reddit": RedditScraper(),
        "twitter": TwitterScraper(),
        "quora": QuoraScraper(),
    }

    # 收集数据
    all_posts = []
    for platform in query.platforms:
        if platform not in scrapers:
            logger.warning(f"Unknown platform: {platform}")
            continue

        try:
            scraper = scrapers[platform]
            posts = await scraper.search(product_name, max_results=query.max_results)
            all_posts.extend(posts)
            logger.info(f"Collected {len(posts)} posts from {platform}")
        except Exception as e:
            logger.error(f"Error scraping {platform}: {e}")

    if not all_posts:
        raise HTTPException(status_code=404, detail="No posts found for the given query")

    # 情感分析
    analyzer = SentimentAnalyzer()
    analyzed_posts = []

    for post in all_posts:
        try:
            # 分析情感
            sentiment_result = await analyzer.analyze(post["content"])

            # 保存到数据库
            db_sentiment = SentimentAnalysis(
                query=query.query,
                product_name=product_name,
                platform=post["platform"],
                post_id=post["post_id"],
                post_url=post.get("post_url"),
                title=post.get("title"),
                content=post["content"],
                author=post.get("author"),
                score=post.get("score", 0),
                comments_count=post.get("comments_count", 0),
                views=post.get("views", 0),
                sentiment_score=sentiment_result["sentiment_score"],
                sentiment_label=sentiment_result["sentiment_label"],
                confidence=sentiment_result["confidence"],
                key_points=sentiment_result["key_points"],
                topics=sentiment_result["topics"],
                post_created_at=post.get("post_created_at"),
            )

            db.add(db_sentiment)
            analyzed_posts.append(
                {
                    **post,
                    **sentiment_result,
                }
            )
        except Exception as e:
            logger.error(f"Error analyzing post: {e}")

    await db.commit()

    # 生成报告
    report_gen = ReportGenerator()
    report_data = await report_gen.generate_report(query.query, product_name, analyzed_posts)

    # 保存报告
    db_report = AnalysisReport(
        query=query.query,
        product_name=product_name,
        total_posts=report_data["summary"]["total_posts"],
        positive_count=report_data["summary"]["positive_count"],
        negative_count=report_data["summary"]["negative_count"],
        neutral_count=report_data["summary"]["neutral_count"],
        avg_sentiment_score=report_data["summary"]["avg_sentiment_score"],
        avg_post_score=report_data["summary"]["avg_post_score"],
        platform_distribution=report_data["summary"]["platform_distribution"],
        top_positive_points=report_data["top_positive_points"],
        top_negative_points=report_data["top_negative_points"],
        trending_topics=report_data["trending_topics"],
        sentiment_trend=report_data["sentiment_trend"],
        full_report=report_data["full_report"],
    )

    db.add(db_report)
    await db.commit()
    await db.refresh(db_report)

    logger.info(f"Analysis completed. Report ID: {db_report.id}")

    return {
        "report_id": db_report.id,
        "message": "Analysis completed successfully",
        "summary": report_data["summary"],
    }


@router.get("/reports/{report_id}", response_model=dict)
async def get_report(report_id: int, db: AsyncSession = Depends(get_db)):
    """获取分析报告详情"""
    result = await db.execute(select(AnalysisReport).where(AnalysisReport.id == report_id))
    report = result.scalar_one_or_none()

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    # 获取相关的帖子
    posts_result = await db.execute(
        select(SentimentAnalysis).where(SentimentAnalysis.query == report.query).limit(100)
    )
    posts = posts_result.scalars().all()

    return {
        "id": report.id,
        "query": report.query,
        "product_name": report.product_name,
        "summary": {
            "total_posts": report.total_posts,
            "positive_count": report.positive_count,
            "negative_count": report.negative_count,
            "neutral_count": report.neutral_count,
            "avg_sentiment_score": report.avg_sentiment_score,
            "avg_post_score": report.avg_post_score,
            "platform_distribution": report.platform_distribution,
        },
        "top_positive_points": report.top_positive_points,
        "top_negative_points": report.top_negative_points,
        "trending_topics": report.trending_topics,
        "sentiment_trend": report.sentiment_trend,
        "full_report": report.full_report,
        "posts": [
            {
                "id": p.id,
                "platform": p.platform,
                "title": p.title,
                "content": p.content[:200] + "..." if len(p.content) > 200 else p.content,
                "author": p.author,
                "score": p.score,
                "sentiment_label": p.sentiment_label,
                "sentiment_score": p.sentiment_score,
                "post_url": p.post_url,
            }
            for p in posts
        ],
        "created_at": report.created_at,
    }


@router.get("/reports")
async def list_reports(skip: int = 0, limit: int = 20, db: AsyncSession = Depends(get_db)):
    """获取报告列表"""
    result = await db.execute(select(AnalysisReport).offset(skip).limit(limit).order_by(AnalysisReport.created_at.desc()))
    reports = result.scalars().all()

    return [
        {
            "id": r.id,
            "query": r.query,
            "product_name": r.product_name,
            "total_posts": r.total_posts,
            "avg_sentiment_score": r.avg_sentiment_score,
            "created_at": r.created_at,
        }
        for r in reports
    ]


@router.get("/stats/platforms")
async def get_platform_stats(product_name: str, db: AsyncSession = Depends(get_db)):
    """获取各平台统计信息"""
    result = await db.execute(
        select(SentimentAnalysis).where(SentimentAnalysis.product_name == product_name)
    )
    posts = result.scalars().all()

    if not posts:
        raise HTTPException(status_code=404, detail="No data found for this product")

    # 按平台分组统计
    platform_stats = {}
    for post in posts:
        platform = post.platform
        if platform not in platform_stats:
            platform_stats[platform] = {
                "total": 0,
                "positive": 0,
                "negative": 0,
                "neutral": 0,
                "scores": [],
            }

        platform_stats[platform]["total"] += 1
        platform_stats[platform]["scores"].append(post.sentiment_score)

        if post.sentiment_label == "positive":
            platform_stats[platform]["positive"] += 1
        elif post.sentiment_label == "negative":
            platform_stats[platform]["negative"] += 1
        else:
            platform_stats[platform]["neutral"] += 1

    # 计算统计数据
    result_stats = []
    for platform, stats in platform_stats.items():
        total = stats["total"]
        avg_sentiment = sum(stats["scores"]) / total if total > 0 else 0

        result_stats.append(
            {
                "platform": platform,
                "total_posts": total,
                "avg_sentiment": round(avg_sentiment, 3),
                "positive_ratio": round(stats["positive"] / total, 3),
                "negative_ratio": round(stats["negative"] / total, 3),
                "neutral_ratio": round(stats["neutral"] / total, 3),
            }
        )

    return result_stats


def extract_product_name(query: str) -> str:
    """从查询中提取产品名称"""
    # 简单的正则提取
    # 例如："帮我找到关于 vivo X300 的用户舆情" -> "vivo X300"

    patterns = [
        r"关于\s*([^\s的]+)\s*的",  # 中文模式
        r"about\s+([^\s]+)",  # 英文模式
        r"([A-Za-z0-9\s]+)\s+sentiment",
    ]

    for pattern in patterns:
        match = re.search(pattern, query, re.IGNORECASE)
        if match:
            return match.group(1).strip()

    # 如果没有匹配到，返回整个查询（去除常见词）
    common_words = ["帮我", "找到", "关于", "的", "用户", "舆情", "sentiment", "analysis", "find", "about"]
    words = query.split()
    filtered = [w for w in words if w not in common_words]

    return " ".join(filtered).strip() if filtered else query
