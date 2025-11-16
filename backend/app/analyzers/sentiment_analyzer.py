import openai
from typing import Dict, Any, List
from textblob import TextBlob
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)


class SentimentAnalyzer:
    """情感分析器"""

    def __init__(self):
        self.openai_available = bool(settings.OPENAI_API_KEY)
        if self.openai_available:
            openai.api_key = settings.OPENAI_API_KEY

    async def analyze(self, text: str) -> Dict[str, Any]:
        """
        分析文本情感

        Args:
            text: 要分析的文本

        Returns:
            情感分析结果
        """
        if not text or len(text.strip()) == 0:
            return self._default_result()

        # 优先使用OpenAI，否则使用TextBlob
        if self.openai_available:
            try:
                result = await self._analyze_with_openai(text)
                return result
            except Exception as e:
                logger.error(f"OpenAI analysis failed, falling back to TextBlob: {e}")

        # 使用TextBlob进行基础情感分析
        return self._analyze_with_textblob(text)

    async def _analyze_with_openai(self, text: str) -> Dict[str, Any]:
        """使用OpenAI进行高级情感分析"""
        prompt = f"""
        请分析以下文本的情感倾向，并提取关键观点和主题。

        文本：
        {text[:1000]}  # 限制长度

        请以JSON格式返回：
        {{
            "sentiment_score": <-1到1之间的数值，负面为负，正面为正>,
            "sentiment_label": "<positive/negative/neutral>",
            "confidence": <0到1之间的置信度>,
            "key_points": [<关键观点列表>],
            "topics": [<主题标签列表>]
        }}
        """

        response = openai.ChatCompletion.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "你是一个专业的情感分析助手。"},
                {"role": "user", "content": prompt},
            ],
            temperature=0.3,
        )

        import json

        result_text = response.choices[0].message.content
        # 尝试解析JSON
        try:
            result = json.loads(result_text)
            return result
        except:
            # 如果解析失败，使用TextBlob
            logger.warning("Failed to parse OpenAI response, using TextBlob")
            return self._analyze_with_textblob(text)

    def _analyze_with_textblob(self, text: str) -> Dict[str, Any]:
        """使用TextBlob进行基础情感分析"""
        try:
            blob = TextBlob(text)
            polarity = blob.sentiment.polarity  # -1到1
            subjectivity = blob.sentiment.subjectivity  # 0到1

            # 确定情感标签
            if polarity > 0.1:
                label = "positive"
            elif polarity < -0.1:
                label = "negative"
            else:
                label = "neutral"

            # 提取关键词（简单方法）
            words = blob.words
            key_words = [
                word for word in words if len(word) > 4 and word.lower() not in self._get_stop_words()
            ][:5]

            return {
                "sentiment_score": polarity,
                "sentiment_label": label,
                "confidence": abs(polarity),  # 使用极性的绝对值作为置信度
                "key_points": key_words,
                "topics": [],
            }
        except Exception as e:
            logger.error(f"TextBlob analysis failed: {e}")
            return self._default_result()

    def _default_result(self) -> Dict[str, Any]:
        """默认结果"""
        return {
            "sentiment_score": 0.0,
            "sentiment_label": "neutral",
            "confidence": 0.0,
            "key_points": [],
            "topics": [],
        }

    def _get_stop_words(self) -> set:
        """获取停用词列表"""
        return {
            "the",
            "a",
            "an",
            "and",
            "or",
            "but",
            "in",
            "on",
            "at",
            "to",
            "for",
            "of",
            "with",
            "by",
            "from",
            "is",
            "are",
            "was",
            "were",
            "be",
            "been",
            "being",
            "have",
            "has",
            "had",
            "do",
            "does",
            "did",
            "will",
            "would",
            "should",
            "could",
            "may",
            "might",
            "must",
            "can",
            "this",
            "that",
            "these",
            "those",
        }

    async def batch_analyze(self, texts: List[str]) -> List[Dict[str, Any]]:
        """批量分析文本"""
        results = []
        for text in texts:
            result = await self.analyze(text)
            results.append(result)
        return results
