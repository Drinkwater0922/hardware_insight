"""
热点趋势分析器
分析小红书领域热点，识别趋势和热门话题
"""
import logging
from typing import List, Dict, Any, Optional
from collections import Counter, defaultdict
from datetime import datetime, timedelta
import statistics

logger = logging.getLogger(__name__)


class TrendAnalyzer:
    """热点趋势分析器"""

    def __init__(self):
        self.logger = logger

    def analyze_trends(self, posts: List[Dict]) -> Dict[str, Any]:
        """
        分析笔记数据，提取热点趋势

        Args:
            posts: 标准化的笔记数据列表

        Returns:
            趋势分析结果
        """
        if not posts:
            return self._empty_analysis()

        try:
            # 1. 基础统计
            stats = self._calculate_statistics(posts)

            # 2. 热门标签分析
            hot_tags = self._analyze_tags(posts)

            # 3. 内容主题分析
            themes = self._analyze_themes(posts)

            # 4. 互动数据分析
            engagement = self._analyze_engagement(posts)

            # 5. 爆款内容识别
            viral_posts = self._identify_viral_posts(posts)

            # 6. 内容类型分布
            content_types = self._analyze_content_types(posts)

            # 7. 热度趋势
            heat_trend = self._analyze_heat_trend(posts)

            # 8. 关键词云
            keywords = self._extract_keywords(posts)

            return {
                "total_posts": len(posts),
                "statistics": stats,
                "hot_tags": hot_tags,
                "themes": themes,
                "engagement": engagement,
                "viral_posts": viral_posts,
                "content_types": content_types,
                "heat_trend": heat_trend,
                "keywords": keywords,
                "analyzed_at": datetime.now().isoformat()
            }

        except Exception as e:
            logger.error(f"趋势分析失败: {str(e)}")
            return self._empty_analysis()

    def _calculate_statistics(self, posts: List[Dict]) -> Dict[str, Any]:
        """计算基础统计数据"""
        total_likes = sum(post.get("score", 0) for post in posts)
        total_comments = sum(post.get("comments_count", 0) for post in posts)
        total_collects = sum(post.get("collects", 0) for post in posts)
        total_shares = sum(post.get("shares", 0) for post in posts)
        total_views = sum(post.get("views", 0) for post in posts)

        avg_likes = total_likes / len(posts) if posts else 0
        avg_comments = total_comments / len(posts) if posts else 0
        avg_collects = total_collects / len(posts) if posts else 0
        avg_engagement_rate = (total_likes + total_comments + total_collects) / total_views if total_views > 0 else 0

        return {
            "total_likes": total_likes,
            "total_comments": total_comments,
            "total_collects": total_collects,
            "total_shares": total_shares,
            "total_views": total_views,
            "avg_likes": round(avg_likes, 2),
            "avg_comments": round(avg_comments, 2),
            "avg_collects": round(avg_collects, 2),
            "avg_engagement_rate": round(avg_engagement_rate * 100, 2)  # 百分比
        }

    def _analyze_tags(self, posts: List[Dict], top_n: int = 20) -> List[Dict[str, Any]]:
        """分析热门标签"""
        tag_counter = Counter()
        tag_metrics = defaultdict(lambda: {"likes": 0, "comments": 0, "collects": 0, "count": 0})

        for post in posts:
            tags = post.get("tags", [])
            likes = post.get("score", 0)
            comments = post.get("comments_count", 0)
            collects = post.get("collects", 0)

            for tag in tags:
                tag_counter[tag] += 1
                tag_metrics[tag]["likes"] += likes
                tag_metrics[tag]["comments"] += comments
                tag_metrics[tag]["collects"] += collects
                tag_metrics[tag]["count"] += 1

        # 计算每个标签的平均互动
        hot_tags = []
        for tag, count in tag_counter.most_common(top_n):
            metrics = tag_metrics[tag]
            hot_tags.append({
                "tag": tag,
                "count": count,
                "avg_likes": round(metrics["likes"] / metrics["count"], 2),
                "avg_comments": round(metrics["comments"] / metrics["count"], 2),
                "avg_collects": round(metrics["collects"] / metrics["count"], 2),
                "heat_score": self._calculate_heat_score(metrics, metrics["count"])
            })

        # 按热度分数排序
        hot_tags.sort(key=lambda x: x["heat_score"], reverse=True)
        return hot_tags

    def _analyze_themes(self, posts: List[Dict]) -> List[Dict[str, Any]]:
        """分析内容主题"""
        # 从标题中提取主题关键词
        theme_keywords = {
            "测评": ["测评", "评测", "体验", "使用感受", "真实"],
            "教程": ["教程", "指南", "攻略", "方法", "技巧", "保姆级"],
            "对比": ["对比", "横评", "比较", "PK"],
            "推荐": ["推荐", "种草", "好物", "清单", "必买"],
            "避坑": ["避坑", "踩雷", "不推荐", "翻车", "注意"],
            "开箱": ["开箱", "晒单", "到货", "入手"],
            "日常": ["日常", "分享", "记录", "vlog"],
            "深度": ["深度", "分析", "解读", "观察", "趋势"]
        }

        theme_counter = defaultdict(lambda: {"count": 0, "posts": []})

        for post in posts:
            title = post.get("title", "")
            content = post.get("content", "")
            text = title + " " + content

            for theme, keywords in theme_keywords.items():
                if any(keyword in text for keyword in keywords):
                    theme_counter[theme]["count"] += 1
                    theme_counter[theme]["posts"].append({
                        "title": post.get("title"),
                        "likes": post.get("score", 0),
                        "url": post.get("post_url")
                    })

        # 整理主题数据
        themes = []
        for theme, data in theme_counter.items():
            if data["count"] > 0:
                # 取热度最高的3篇作为代表
                top_posts = sorted(data["posts"], key=lambda x: x["likes"], reverse=True)[:3]
                themes.append({
                    "theme": theme,
                    "count": data["count"],
                    "percentage": round(data["count"] / len(posts) * 100, 2),
                    "top_posts": top_posts
                })

        themes.sort(key=lambda x: x["count"], reverse=True)
        return themes

    def _analyze_engagement(self, posts: List[Dict]) -> Dict[str, Any]:
        """分析互动数据"""
        engagement_scores = []

        for post in posts:
            likes = post.get("score", 0)
            comments = post.get("comments_count", 0)
            collects = post.get("collects", 0)
            views = post.get("views", 1)  # 避免除零

            # 计算互动率
            engagement_rate = (likes + comments * 2 + collects * 3) / views
            engagement_scores.append(engagement_rate)

        if not engagement_scores:
            return {}

        return {
            "avg_engagement_rate": round(statistics.mean(engagement_scores) * 100, 2),
            "median_engagement_rate": round(statistics.median(engagement_scores) * 100, 2),
            "max_engagement_rate": round(max(engagement_scores) * 100, 2),
            "min_engagement_rate": round(min(engagement_scores) * 100, 2),
            "high_engagement_posts": len([s for s in engagement_scores if s > statistics.mean(engagement_scores)])
        }

    def _identify_viral_posts(self, posts: List[Dict], top_n: int = 10) -> List[Dict[str, Any]]:
        """识别爆款内容"""
        # 计算每篇笔记的综合热度分数
        scored_posts = []

        for post in posts:
            heat_score = self._calculate_post_heat_score(post)
            scored_posts.append({
                "title": post.get("title", ""),
                "author": post.get("author", ""),
                "url": post.get("post_url", ""),
                "likes": post.get("score", 0),
                "comments": post.get("comments_count", 0),
                "collects": post.get("collects", 0),
                "shares": post.get("shares", 0),
                "views": post.get("views", 0),
                "tags": post.get("tags", []),
                "has_video": post.get("has_video", False),
                "heat_score": heat_score
            })

        # 按热度排序
        scored_posts.sort(key=lambda x: x["heat_score"], reverse=True)
        return scored_posts[:top_n]

    def _analyze_content_types(self, posts: List[Dict]) -> Dict[str, Any]:
        """分析内容类型分布"""
        video_count = sum(1 for post in posts if post.get("has_video", False))
        image_only_count = len(posts) - video_count

        # 统计图片数量分布
        image_counts = [post.get("images_count", 0) for post in posts if not post.get("has_video", False)]
        avg_images = round(statistics.mean(image_counts), 2) if image_counts else 0

        return {
            "video_posts": video_count,
            "image_posts": image_only_count,
            "video_percentage": round(video_count / len(posts) * 100, 2),
            "image_percentage": round(image_only_count / len(posts) * 100, 2),
            "avg_images_per_post": avg_images
        }

    def _analyze_heat_trend(self, posts: List[Dict]) -> List[Dict[str, Any]]:
        """分析热度趋势"""
        # 按发布时间分组统计
        # 这里简化处理，实际应用中需要根据实际时间戳分析
        trend_data = []

        # 将数据分成5个时间段
        segment_size = max(len(posts) // 5, 1)

        for i in range(5):
            start_idx = i * segment_size
            end_idx = min(start_idx + segment_size, len(posts))
            segment_posts = posts[start_idx:end_idx]

            if segment_posts:
                avg_likes = sum(p.get("score", 0) for p in segment_posts) / len(segment_posts)
                avg_engagement = sum(
                    p.get("score", 0) + p.get("comments_count", 0) + p.get("collects", 0)
                    for p in segment_posts
                ) / len(segment_posts)

                trend_data.append({
                    "period": f"阶段{i + 1}",
                    "post_count": len(segment_posts),
                    "avg_likes": round(avg_likes, 2),
                    "avg_engagement": round(avg_engagement, 2)
                })

        return trend_data

    def _extract_keywords(self, posts: List[Dict], top_n: int = 30) -> List[Dict[str, Any]]:
        """提取关键词（简化版，实际应使用NLP分词）"""
        # 收集所有标题和内容
        all_text = ""
        for post in posts:
            all_text += post.get("title", "") + " " + post.get("content", "") + " "

        # 简单的关键词提取（实际应使用jieba分词等工具）
        # 这里使用标签作为关键词
        keyword_counter = Counter()

        for post in posts:
            tags = post.get("tags", [])
            for tag in tags:
                keyword_counter[tag] += 1

            # 从标题中提取一些关键词
            title = post.get("title", "")
            for word in ["测评", "教程", "推荐", "避坑", "对比", "开箱", "分享", "新品", "性价比"]:
                if word in title:
                    keyword_counter[word] += 1

        keywords = []
        for word, count in keyword_counter.most_common(top_n):
            keywords.append({
                "word": word,
                "count": count,
                "weight": round(count / len(posts) * 100, 2)
            })

        return keywords

    def _calculate_heat_score(self, metrics: Dict, count: int) -> float:
        """计算热度分数"""
        # 权重：点赞 1，评论 2，收藏 3
        total_score = (
            metrics.get("likes", 0) * 1 +
            metrics.get("comments", 0) * 2 +
            metrics.get("collects", 0) * 3
        )
        avg_score = total_score / count if count > 0 else 0
        return round(avg_score, 2)

    def _calculate_post_heat_score(self, post: Dict) -> float:
        """计算单篇笔记的热度分数"""
        likes = post.get("score", 0)
        comments = post.get("comments_count", 0)
        collects = post.get("collects", 0)
        shares = post.get("shares", 0)

        # 综合热度分数 = 点赞*1 + 评论*2 + 收藏*3 + 分享*2
        heat_score = likes * 1 + comments * 2 + collects * 3 + shares * 2

        # 视频内容加权
        if post.get("has_video", False):
            heat_score *= 1.2

        return round(heat_score, 2)

    def _empty_analysis(self) -> Dict[str, Any]:
        """返回空的分析结果"""
        return {
            "total_posts": 0,
            "statistics": {},
            "hot_tags": [],
            "themes": [],
            "engagement": {},
            "viral_posts": [],
            "content_types": {},
            "heat_trend": [],
            "keywords": [],
            "analyzed_at": datetime.now().isoformat()
        }
