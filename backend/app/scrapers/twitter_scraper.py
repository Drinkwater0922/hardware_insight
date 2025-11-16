import tweepy
from typing import List, Dict, Any
from datetime import datetime
from app.scrapers.base import BaseScraper
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)


class TwitterScraper(BaseScraper):
    """Twitter/X数据采集器"""

    def __init__(self):
        super().__init__()
        self.platform_name = "twitter"
        self.client = None
        self._initialize_client()

    def _initialize_client(self):
        """初始化Twitter客户端"""
        try:
            if settings.TWITTER_BEARER_TOKEN:
                self.client = tweepy.Client(bearer_token=settings.TWITTER_BEARER_TOKEN)
                logger.info("Twitter client initialized successfully")
            else:
                logger.warning("Twitter credentials not configured")
        except Exception as e:
            logger.error(f"Failed to initialize Twitter client: {e}")

    async def search(self, query: str, max_results: int = 100) -> List[Dict[str, Any]]:
        """
        搜索Twitter内容

        Args:
            query: 搜索关键词
            max_results: 最大结果数（Twitter API限制每次最多100）

        Returns:
            标准化的帖子列表
        """
        if not self.client:
            logger.warning("Twitter client not initialized, returning empty results")
            return []

        results = []
        try:
            # Twitter API v2 搜索
            tweets = self.client.search_recent_tweets(
                query=query,
                max_results=min(max_results, 100),  # API限制
                tweet_fields=["created_at", "public_metrics", "author_id"],
                expansions=["author_id"],
                user_fields=["username"],
            )

            if not tweets.data:
                logger.info(f"No tweets found for query: {query}")
                return []

            # 构建用户映射
            users = {user.id: user for user in tweets.includes.get("users", [])}

            for tweet in tweets.data:
                try:
                    post = self.normalize_post(tweet, users)
                    results.append(post)
                except Exception as e:
                    logger.error(f"Error processing tweet: {e}")
                    continue

            logger.info(f"Found {len(results)} tweets for query: {query}")
        except Exception as e:
            logger.error(f"Twitter search error: {e}")

        return results

    def normalize_post(self, tweet, users: Dict) -> Dict[str, Any]:
        """标准化Twitter帖子数据"""
        author = users.get(tweet.author_id)
        metrics = tweet.public_metrics or {}

        return {
            "platform": self.platform_name,
            "post_id": str(tweet.id),
            "post_url": f"https://twitter.com/i/web/status/{tweet.id}",
            "title": "",  # Twitter没有标题
            "content": tweet.text,
            "author": author.username if author else "unknown",
            "score": metrics.get("like_count", 0),
            "comments_count": metrics.get("reply_count", 0),
            "views": metrics.get("impression_count", 0),
            "post_created_at": tweet.created_at,
        }

    async def validate_credentials(self) -> bool:
        """验证Twitter凭证"""
        if not self.client:
            return False
        try:
            self.client.get_me()
            return True
        except:
            return False
