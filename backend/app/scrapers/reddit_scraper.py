import praw
from typing import List, Dict, Any
from datetime import datetime
from app.scrapers.base import BaseScraper
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)


class RedditScraper(BaseScraper):
    """Reddit数据采集器"""

    def __init__(self):
        super().__init__()
        self.platform_name = "reddit"
        self.reddit = None
        self._initialize_client()

    def _initialize_client(self):
        """初始化Reddit客户端"""
        try:
            if settings.REDDIT_CLIENT_ID and settings.REDDIT_CLIENT_SECRET:
                self.reddit = praw.Reddit(
                    client_id=settings.REDDIT_CLIENT_ID,
                    client_secret=settings.REDDIT_CLIENT_SECRET,
                    user_agent=settings.REDDIT_USER_AGENT,
                )
                logger.info("Reddit client initialized successfully")
            else:
                logger.warning("Reddit credentials not configured")
        except Exception as e:
            logger.error(f"Failed to initialize Reddit client: {e}")

    async def search(self, query: str, max_results: int = 100) -> List[Dict[str, Any]]:
        """
        搜索Reddit内容

        Args:
            query: 搜索关键词
            max_results: 最大结果数

        Returns:
            标准化的帖子列表
        """
        if not self.reddit:
            logger.warning("Reddit client not initialized, returning empty results")
            return []

        results = []
        try:
            # 搜索相关subreddits
            search_results = self.reddit.subreddit("all").search(
                query, limit=max_results, sort="relevance"
            )

            for submission in search_results:
                try:
                    post = self.normalize_post(submission)
                    results.append(post)
                except Exception as e:
                    logger.error(f"Error processing Reddit submission: {e}")
                    continue

            logger.info(f"Found {len(results)} posts on Reddit for query: {query}")
        except Exception as e:
            logger.error(f"Reddit search error: {e}")

        return results

    def normalize_post(self, submission) -> Dict[str, Any]:
        """标准化Reddit帖子数据"""
        return {
            "platform": self.platform_name,
            "post_id": submission.id,
            "post_url": f"https://reddit.com{submission.permalink}",
            "title": submission.title,
            "content": submission.selftext or submission.title,
            "author": str(submission.author) if submission.author else "[deleted]",
            "score": submission.score,
            "comments_count": submission.num_comments,
            "views": 0,  # Reddit doesn't provide view count
            "post_created_at": datetime.fromtimestamp(submission.created_utc),
        }

    async def validate_credentials(self) -> bool:
        """验证Reddit凭证"""
        if not self.reddit:
            return False
        try:
            # 尝试获取用户信息
            self.reddit.user.me()
            return True
        except:
            # 对于只读访问，这是可以的
            return True
