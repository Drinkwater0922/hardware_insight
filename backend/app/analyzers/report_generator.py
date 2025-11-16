import openai
from typing import List, Dict, Any
from collections import Counter
from datetime import datetime
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)


class ReportGenerator:
    """分析报告生成器"""

    def __init__(self):
        self.openai_available = bool(settings.OPENAI_API_KEY)
        if self.openai_available:
            openai.api_key = settings.OPENAI_API_KEY

    async def generate_report(
        self, query: str, product_name: str, sentiments: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        生成分析报告

        Args:
            query: 查询关键词
            product_name: 产品名称
            sentiments: 情感分析结果列表

        Returns:
            完整的分析报告
        """
        if not sentiments:
            return self._empty_report(query, product_name)

        # 计算统计数据
        stats = self._calculate_statistics(sentiments)

        # 提取关键发现
        insights = self._extract_insights(sentiments)

        # 生成文字报告
        full_report = await self._generate_text_report(query, product_name, stats, insights)

        return {
            "query": query,
            "product_name": product_name,
            "summary": stats,
            "top_positive_points": insights["positive_points"],
            "top_negative_points": insights["negative_points"],
            "trending_topics": insights["topics"],
            "sentiment_trend": self._calculate_trend(sentiments),
            "full_report": full_report,
        }

    def _calculate_statistics(self, sentiments: List[Dict[str, Any]]) -> Dict[str, Any]:
        """计算统计数据"""
        total = len(sentiments)
        positive = sum(1 for s in sentiments if s.get("sentiment_label") == "positive")
        negative = sum(1 for s in sentiments if s.get("sentiment_label") == "negative")
        neutral = sum(1 for s in sentiments if s.get("sentiment_label") == "neutral")

        # 计算平均分数
        sentiment_scores = [s.get("sentiment_score", 0) for s in sentiments]
        avg_sentiment = sum(sentiment_scores) / total if total > 0 else 0

        post_scores = [s.get("score", 0) for s in sentiments]
        avg_post_score = sum(post_scores) / total if total > 0 else 0

        # 平台分布
        platforms = [s.get("platform", "unknown") for s in sentiments]
        platform_dist = dict(Counter(platforms))

        return {
            "total_posts": total,
            "positive_count": positive,
            "negative_count": negative,
            "neutral_count": neutral,
            "avg_sentiment_score": round(avg_sentiment, 3),
            "avg_post_score": round(avg_post_score, 2),
            "platform_distribution": platform_dist,
        }

    def _extract_insights(self, sentiments: List[Dict[str, Any]]) -> Dict[str, Any]:
        """提取关键发现"""
        positive_posts = [s for s in sentiments if s.get("sentiment_label") == "positive"]
        negative_posts = [s for s in sentiments if s.get("sentiment_label") == "negative"]

        # 提取正面观点
        positive_points = []
        for post in positive_posts[:10]:  # 取前10个正面帖子
            points = post.get("key_points", [])
            positive_points.extend(points)

        # 提取负面观点
        negative_points = []
        for post in negative_posts[:10]:  # 取前10个负面帖子
            points = post.get("key_points", [])
            negative_points.extend(points)

        # 统计所有主题
        all_topics = []
        for s in sentiments:
            topics = s.get("topics", [])
            all_topics.extend(topics)

        # 返回最常见的观点和主题
        positive_counter = Counter(positive_points)
        negative_counter = Counter(negative_points)
        topic_counter = Counter(all_topics)

        return {
            "positive_points": [p for p, _ in positive_counter.most_common(5)],
            "negative_points": [p for p, _ in negative_counter.most_common(5)],
            "topics": [t for t, _ in topic_counter.most_common(10)],
        }

    def _calculate_trend(self, sentiments: List[Dict[str, Any]]) -> Dict[str, Any]:
        """计算情感趋势"""
        # 按时间分组（简化版本）
        # 实际应用中可以按天/周/月分组
        trend_data = {
            "labels": [],
            "positive": [],
            "negative": [],
            "neutral": [],
        }

        # 这里返回空趋势，实际应用中需要根据时间戳计算
        return trend_data

    async def _generate_text_report(
        self, query: str, product_name: str, stats: Dict, insights: Dict
    ) -> str:
        """生成文字报告"""
        if self.openai_available:
            try:
                return await self._generate_ai_report(query, product_name, stats, insights)
            except Exception as e:
                logger.error(f"Failed to generate AI report: {e}")

        # 生成基础文字报告
        return self._generate_basic_report(query, product_name, stats, insights)

    async def _generate_ai_report(
        self, query: str, product_name: str, stats: Dict, insights: Dict
    ) -> str:
        """使用AI生成报告"""
        prompt = f"""
        请根据以下数据生成一份关于 {product_name} 的舆情分析报告。

        统计数据：
        - 总帖子数：{stats['total_posts']}
        - 正面评价：{stats['positive_count']} ({stats['positive_count']/stats['total_posts']*100:.1f}%)
        - 负面评价：{stats['negative_count']} ({stats['negative_count']/stats['total_posts']*100:.1f}%)
        - 中性评价：{stats['neutral_count']} ({stats['neutral_count']/stats['total_posts']*100:.1f}%)
        - 平均情感分数：{stats['avg_sentiment_score']}

        主要优点：
        {', '.join(insights['positive_points'][:5])}

        主要缺点：
        {', '.join(insights['negative_points'][:5])}

        热门话题：
        {', '.join(insights['topics'][:5])}

        请生成一份专业、简洁的分析报告（200-300字），包括：
        1. 总体舆情概况
        2. 用户主要关注点
        3. 产品优势和不足
        4. 建议和结论
        """

        response = openai.ChatCompletion.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "你是一个专业的市场分析师。"},
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
        )

        return response.choices[0].message.content

    def _generate_basic_report(
        self, query: str, product_name: str, stats: Dict, insights: Dict
    ) -> str:
        """生成基础文字报告"""
        total = stats["total_posts"]
        positive_pct = (stats["positive_count"] / total * 100) if total > 0 else 0
        negative_pct = (stats["negative_count"] / total * 100) if total > 0 else 0

        report = f"""
# {product_name} 舆情分析报告

## 总体概况
本次分析共收集到 {total} 条相关讨论。整体情感倾向为 {"正面" if stats['avg_sentiment_score'] > 0.1 else "负面" if stats['avg_sentiment_score'] < -0.1 else "中性"}。

## 情感分布
- 正面评价：{stats['positive_count']} 条 ({positive_pct:.1f}%)
- 负面评价：{stats['negative_count']} 条 ({negative_pct:.1f}%)
- 中性评价：{stats['neutral_count']} 条

## 主要发现
### 产品优势
{chr(10).join(f"- {p}" for p in insights['positive_points'][:3])}

### 需要改进
{chr(10).join(f"- {p}" for p in insights['negative_points'][:3])}

## 热门话题
{', '.join(insights['topics'][:5])}

## 结论
基于收集的数据，{product_name} 在用户中获得了 {"较好" if positive_pct > 50 else "一般" if positive_pct > 30 else "较差"} 的反响。
建议重点关注用户反馈中的关键问题，持续改进产品体验。
        """.strip()

        return report

    def _empty_report(self, query: str, product_name: str) -> Dict[str, Any]:
        """空报告"""
        return {
            "query": query,
            "product_name": product_name,
            "summary": {
                "total_posts": 0,
                "positive_count": 0,
                "negative_count": 0,
                "neutral_count": 0,
                "avg_sentiment_score": 0.0,
                "avg_post_score": 0.0,
                "platform_distribution": {},
            },
            "top_positive_points": [],
            "top_negative_points": [],
            "trending_topics": [],
            "sentiment_trend": {},
            "full_report": f"未找到关于 {product_name} 的相关讨论。",
        }
