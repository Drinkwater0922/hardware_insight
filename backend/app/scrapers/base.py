from abc import ABC, abstractmethod
from typing import List, Dict, Any
from datetime import datetime


class BaseScraper(ABC):
    """数据采集器基类"""

    def __init__(self):
        self.platform_name = ""

    @abstractmethod
    async def search(self, query: str, max_results: int = 100) -> List[Dict[str, Any]]:
        """
        搜索内容

        Args:
            query: 搜索关键词
            max_results: 最大结果数

        Returns:
            帖子列表
        """
        pass

    def normalize_post(self, raw_post: Any) -> Dict[str, Any]:
        """
        标准化帖子数据

        Args:
            raw_post: 原始帖子数据

        Returns:
            标准化的帖子字典
        """
        return {
            "platform": self.platform_name,
            "post_id": "",
            "post_url": "",
            "title": "",
            "content": "",
            "author": "",
            "score": 0,
            "comments_count": 0,
            "views": 0,
            "post_created_at": datetime.now(),
        }

    async def validate_credentials(self) -> bool:
        """验证API凭证是否有效"""
        return True
