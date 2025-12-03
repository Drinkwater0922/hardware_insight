"""
创作建议生成器
基于热点趋势分析，为创作者提供内容创作建议
"""
import logging
from typing import List, Dict, Any, Optional
import json
from datetime import datetime

logger = logging.getLogger(__name__)


class CreatorAdvisor:
    """创作建议生成器"""

    def __init__(self, openai_client=None):
        """
        初始化创作建议生成器

        Args:
            openai_client: OpenAI客户端（可选）
        """
        self.openai_client = openai_client
        self.logger = logger

    async def generate_advice(
        self,
        topic: str,
        trend_analysis: Dict[str, Any],
        use_ai: bool = True
    ) -> Dict[str, Any]:
        """
        生成创作建议

        Args:
            topic: 主题/领域
            trend_analysis: 趋势分析结果
            use_ai: 是否使用AI生成深度建议

        Returns:
            创作建议数据
        """
        try:
            # 1. 基于规则的建议
            rule_based_advice = self._generate_rule_based_advice(topic, trend_analysis)

            # 2. AI生成的深度建议（如果启用）
            ai_advice = None
            if use_ai and self.openai_client:
                ai_advice = await self._generate_ai_advice(topic, trend_analysis)

            # 3. 内容建议
            content_suggestions = self._generate_content_suggestions(topic, trend_analysis)

            # 4. 标题建议
            title_suggestions = self._generate_title_suggestions(topic, trend_analysis)

            # 5. 标签建议
            tag_suggestions = self._generate_tag_suggestions(trend_analysis)

            # 6. 发布建议
            posting_tips = self._generate_posting_tips(trend_analysis)

            # 7. 竞品分析
            competitive_analysis = self._generate_competitive_analysis(trend_analysis)

            return {
                "topic": topic,
                "generated_at": datetime.now().isoformat(),
                "overview": rule_based_advice,
                "ai_insights": ai_advice,
                "content_suggestions": content_suggestions,
                "title_suggestions": title_suggestions,
                "tag_suggestions": tag_suggestions,
                "posting_tips": posting_tips,
                "competitive_analysis": competitive_analysis,
                "success_rate_prediction": self._predict_success_rate(trend_analysis)
            }

        except Exception as e:
            logger.error(f"生成创作建议失败: {str(e)}")
            return self._empty_advice(topic)

    def _generate_rule_based_advice(
        self,
        topic: str,
        trend_analysis: Dict[str, Any]
    ) -> Dict[str, Any]:
        """基于规则生成建议"""
        stats = trend_analysis.get("statistics", {})
        hot_tags = trend_analysis.get("hot_tags", [])
        themes = trend_analysis.get("themes", [])
        engagement = trend_analysis.get("engagement", {})

        # 分析当前领域的热度
        total_posts = trend_analysis.get("total_posts", 0)
        avg_engagement_rate = engagement.get("avg_engagement_rate", 0)

        # 判断竞争程度
        competition_level = "低"
        if total_posts > 100:
            competition_level = "高"
        elif total_posts > 50:
            competition_level = "中"

        # 判断内容机会
        opportunity_score = 0
        if avg_engagement_rate > 5:
            opportunity_score += 30
        if avg_engagement_rate > 10:
            opportunity_score += 30
        if len(themes) > 0:
            opportunity_score += 20
        if len(hot_tags) > 0:
            opportunity_score += 20

        # 确定最热门的内容类型
        top_theme = themes[0]["theme"] if themes else "测评"
        top_tags = [tag["tag"] for tag in hot_tags[:5]]

        return {
            "competition_level": competition_level,
            "opportunity_score": min(opportunity_score, 100),
            "recommended_content_type": top_theme,
            "trending_tags": top_tags,
            "avg_engagement_benchmark": avg_engagement_rate,
            "market_insights": self._generate_market_insights(
                competition_level,
                avg_engagement_rate,
                total_posts
            )
        }

    async def _generate_ai_advice(
        self,
        topic: str,
        trend_analysis: Dict[str, Any]
    ) -> Optional[str]:
        """使用AI生成深度建议"""
        if not self.openai_client:
            return None

        try:
            # 准备prompt
            prompt = self._build_ai_prompt(topic, trend_analysis)

            # 调用OpenAI API
            response = await self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {
                        "role": "system",
                        "content": "你是一位资深的小红书内容策略专家，擅长分析热点趋势并为创作者提供专业的内容创作建议。"
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.7,
                max_tokens=1500
            )

            return response.choices[0].message.content

        except Exception as e:
            logger.error(f"AI建议生成失败: {str(e)}")
            return None

    def _generate_content_suggestions(
        self,
        topic: str,
        trend_analysis: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """生成内容创作建议"""
        themes = trend_analysis.get("themes", [])
        viral_posts = trend_analysis.get("viral_posts", [])
        content_types = trend_analysis.get("content_types", {})

        suggestions = []

        # 1. 基于热门主题的建议
        for theme_data in themes[:3]:
            theme = theme_data["theme"]
            count = theme_data["count"]
            percentage = theme_data["percentage"]

            suggestion = {
                "type": theme,
                "priority": "高" if percentage > 20 else "中" if percentage > 10 else "低",
                "description": self._get_theme_description(theme, topic),
                "example_titles": [post["title"] for post in theme_data.get("top_posts", [])[:2]],
                "estimated_views": self._estimate_views(theme, trend_analysis)
            }
            suggestions.append(suggestion)

        # 2. 基于内容形式的建议
        video_percentage = content_types.get("video_percentage", 0)
        if video_percentage > 30:
            suggestions.append({
                "type": "视频内容",
                "priority": "高",
                "description": f"该领域视频内容占比{video_percentage}%，视频形式更受欢迎，建议制作短视频内容",
                "tips": ["控制在60秒以内", "前3秒抓住眼球", "添加字幕和背景音乐"],
                "estimated_views": "高于图文30%"
            })
        else:
            suggestions.append({
                "type": "图文内容",
                "priority": "高",
                "description": "该领域图文内容为主流，建议制作精美图文笔记",
                "tips": [
                    f"使用{content_types.get('avg_images_per_post', 5)}张左右的图片",
                    "首图要吸睛",
                    "排版清晰美观"
                ],
                "estimated_views": "标准"
            })

        # 3. 差异化机会
        all_themes = [t["theme"] for t in themes]
        missing_themes = set(["教程", "对比", "避坑", "深度"]) - set(all_themes)
        if missing_themes:
            suggestions.append({
                "type": "差异化内容",
                "priority": "中",
                "description": f"可以尝试较少人做的内容类型：{', '.join(missing_themes)}，竞争较小",
                "opportunity": "蓝海市场",
                "estimated_views": "潜力较大"
            })

        return suggestions

    def _generate_title_suggestions(
        self,
        topic: str,
        trend_analysis: Dict[str, Any]
    ) -> List[Dict[str, str]]:
        """生成标题建议"""
        hot_tags = trend_analysis.get("hot_tags", [])
        themes = trend_analysis.get("themes", [])
        viral_posts = trend_analysis.get("viral_posts", [])

        # 分析爆款标题的特征
        viral_titles = [post["title"] for post in viral_posts[:10]]

        # 标题模板
        title_templates = [
            {
                "template": f"{topic}测评｜真实使用体验分享",
                "type": "测评类",
                "appeal": "真实性",
                "example": f"{topic}深度测评｜30天使用报告"
            },
            {
                "template": f"保姆级{topic}选购指南｜新手必看",
                "type": "教程类",
                "appeal": "实用性",
                "example": f"2024{topic}选购攻略｜避坑指南"
            },
            {
                "template": f"{topic}对比｜哪款性价比最高？",
                "type": "对比类",
                "appeal": "决策帮助",
                "example": f"5款热门{topic}横评｜详细数据对比"
            },
            {
                "template": f"我为什么不推荐这款{topic}",
                "type": "避坑类",
                "appeal": "反向思维",
                "example": f"{topic}踩雷实录｜这些坑千万别踩"
            },
            {
                "template": f"{topic}隐藏功能｜99%的人不知道",
                "type": "技巧类",
                "appeal": "稀缺性",
                "example": f"解锁{topic}的10个隐藏玩法"
            },
            {
                "template": f"用了{topic}一个月，我发现...",
                "type": "分享类",
                "appeal": "真实体验",
                "example": f"{topic}长期使用报告｜优缺点汇总"
            }
        ]

        # 添加热门标签到标题建议中
        if hot_tags:
            top_tag = hot_tags[0]["tag"]
            title_templates.append({
                "template": f"{top_tag}｜{topic}推荐",
                "type": "标签热点",
                "appeal": "蹭热度",
                "example": f"#{top_tag}# {topic}种草清单"
            })

        return title_templates

    def _generate_tag_suggestions(
        self,
        trend_analysis: Dict[str, Any]
    ) -> Dict[str, Any]:
        """生成标签建议"""
        hot_tags = trend_analysis.get("hot_tags", [])

        # 分类标签
        must_use_tags = [tag["tag"] for tag in hot_tags[:5]]  # 必用标签
        recommended_tags = [tag["tag"] for tag in hot_tags[5:15]]  # 推荐标签
        niche_tags = [tag["tag"] for tag in hot_tags[15:25]]  # 小众标签

        return {
            "must_use": must_use_tags,
            "recommended": recommended_tags,
            "niche": niche_tags,
            "tag_strategy": {
                "optimal_count": "8-12个标签",
                "mix_strategy": "3个热门标签 + 4个中等标签 + 3个小众标签",
                "tips": [
                    "至少包含3个热门标签以获得曝光",
                    "添加小众标签以精准触达目标用户",
                    "结合当下热点话题标签",
                    "避免使用无关标签，影响推荐精准度"
                ]
            }
        }

    def _generate_posting_tips(
        self,
        trend_analysis: Dict[str, Any]
    ) -> Dict[str, Any]:
        """生成发布建议"""
        return {
            "best_posting_time": {
                "weekdays": ["19:00-21:00", "12:00-13:00", "7:00-9:00"],
                "weekends": ["10:00-12:00", "15:00-17:00", "20:00-22:00"],
                "explanation": "这些时段用户活跃度最高，更容易获得初始流量"
            },
            "content_optimization": {
                "cover_image": [
                    "使用高清图片，尺寸比例3:4",
                    "添加醒目标题文字",
                    "突出产品或主题",
                    "颜色鲜明，对比度高"
                ],
                "text_content": [
                    "前50字决定用户是否展开阅读",
                    "使用emoji增加可读性",
                    "分段清晰，每段3-5行",
                    "添加#话题标签#增加曝光"
                ],
                "interaction": [
                    "发布后前30分钟积极回复评论",
                    "引导用户点赞、收藏、分享",
                    "在评论区补充更多细节",
                    "使用问句结尾引导互动"
                ]
            },
            "initial_boost": {
                "strategy": "发布后立即引导初始流量",
                "actions": [
                    "分享到其他社交平台",
                    "引导朋友点赞评论",
                    "在相关群组分享",
                    "关注互动前期用户"
                ],
                "critical_period": "发布后1小时内的互动数据决定后续推荐"
            },
            "consistency": {
                "frequency": "保持每周3-5篇的更新频率",
                "timing": "固定时间发布，培养用户习惯",
                "quality": "宁可少发，不可降低质量"
            }
        }

    def _generate_competitive_analysis(
        self,
        trend_analysis: Dict[str, Any]
    ) -> Dict[str, Any]:
        """生成竞品分析"""
        viral_posts = trend_analysis.get("viral_posts", [])
        statistics = trend_analysis.get("statistics", {})

        # 分析爆款特征
        top_performers = viral_posts[:5]

        success_factors = []
        if top_performers:
            avg_likes = sum(p["likes"] for p in top_performers) / len(top_performers)
            avg_collects = sum(p["collects"] for p in top_performers) / len(top_performers)

            success_factors = [
                f"爆款笔记平均获赞{int(avg_likes)}+",
                f"平均收藏{int(avg_collects)}+",
                "高质量内容 + 精准标签 + 合适时机",
                "真实体验分享更容易获得认可"
            ]

        return {
            "top_performers": [
                {
                    "title": post["title"],
                    "author": post["author"],
                    "likes": post["likes"],
                    "collects": post["collects"],
                    "engagement_rate": round(
                        (post["likes"] + post["comments"] + post["collects"]) / post["views"] * 100,
                        2
                    ) if post["views"] > 0 else 0,
                    "success_factors": self._analyze_post_success_factors(post)
                }
                for post in top_performers
            ],
            "success_factors": success_factors,
            "benchmarks": {
                "avg_likes": statistics.get("avg_likes", 0),
                "avg_comments": statistics.get("avg_comments", 0),
                "avg_collects": statistics.get("avg_collects", 0),
                "target_engagement_rate": f"{statistics.get('avg_engagement_rate', 0)}%+"
            }
        }

    def _analyze_post_success_factors(self, post: Dict) -> List[str]:
        """分析单篇笔记的成功因素"""
        factors = []

        # 标题特征
        title = post.get("title", "")
        if "｜" in title or "|" in title:
            factors.append("标题结构清晰")
        if any(word in title for word in ["保姆级", "详细", "完整"]):
            factors.append("强调内容深度")
        if any(word in title for word in ["真实", "体验", "测评"]):
            factors.append("真实性背书")

        # 互动数据
        if post.get("has_video"):
            factors.append("视频内容")

        engagement_ratio = post.get("collects", 0) / post.get("likes", 1)
        if engagement_ratio > 0.3:
            factors.append("高价值内容（收藏率高）")

        return factors if factors else ["综合表现优秀"]

    def _predict_success_rate(
        self,
        trend_analysis: Dict[str, Any]
    ) -> Dict[str, Any]:
        """预测内容成功率"""
        statistics = trend_analysis.get("statistics", {})
        engagement = trend_analysis.get("engagement", {})
        total_posts = trend_analysis.get("total_posts", 0)

        # 计算竞争指数
        competition_index = min(total_posts / 100 * 100, 100)

        # 计算机会指数
        avg_engagement = engagement.get("avg_engagement_rate", 0)
        opportunity_index = min(avg_engagement * 10, 100)

        # 综合成功率
        success_rate = (opportunity_index + (100 - competition_index)) / 2

        return {
            "overall_success_rate": round(success_rate, 2),
            "competition_index": round(competition_index, 2),
            "opportunity_index": round(opportunity_index, 2),
            "recommendation": self._get_success_recommendation(success_rate),
            "factors": {
                "positive": self._get_positive_factors(trend_analysis),
                "negative": self._get_negative_factors(trend_analysis)
            }
        }

    def _get_theme_description(self, theme: str, topic: str) -> str:
        """获取主题描述"""
        descriptions = {
            "测评": f"用户对{topic}的真实测评内容需求高，可以分享使用体验、性能测试等",
            "教程": f"制作{topic}的使用教程、选购指南等实用内容，帮助新手快速上手",
            "对比": f"横向对比不同{topic}产品，帮助用户做出购买决策",
            "推荐": f"推荐优质{topic}产品，突出性价比和适用场景",
            "避坑": f"分享{topic}选购和使用中的注意事项，帮助用户避免踩雷",
            "开箱": f"展示{topic}产品的开箱过程和第一印象，满足用户好奇心",
            "日常": f"分享{topic}的日常使用场景和生活化内容",
            "深度": f"深入分析{topic}的行业趋势、技术特点等专业内容"
        }
        return descriptions.get(theme, f"创作{theme}类型的{topic}相关内容")

    def _estimate_views(self, theme: str, trend_analysis: Dict) -> str:
        """估算浏览量"""
        statistics = trend_analysis.get("statistics", {})
        avg_views = statistics.get("total_views", 0) / trend_analysis.get("total_posts", 1)

        if avg_views > 10000:
            return "10000+"
        elif avg_views > 5000:
            return "5000-10000"
        elif avg_views > 1000:
            return "1000-5000"
        else:
            return "1000以内"

    def _generate_market_insights(
        self,
        competition_level: str,
        avg_engagement: float,
        total_posts: int
    ) -> List[str]:
        """生成市场洞察"""
        insights = []

        if competition_level == "高":
            insights.append(f"该领域竞争激烈（共{total_posts}篇相关内容），需要差异化定位")
            insights.append("建议从细分角度切入，避免同质化内容")
        elif competition_level == "中":
            insights.append(f"该领域有一定竞争（共{total_posts}篇相关内容），但仍有机会")
            insights.append("优质内容仍能获得良好曝光")
        else:
            insights.append(f"该领域竞争较小（仅{total_posts}篇相关内容），是蓝海市场")
            insights.append("抓住机会快速占领市场")

        if avg_engagement > 10:
            insights.append(f"用户互动意愿强（平均互动率{avg_engagement}%），内容价值高")
        elif avg_engagement > 5:
            insights.append(f"用户互动适中（平均互动率{avg_engagement}%），有提升空间")
        else:
            insights.append(f"用户互动较低（平均互动率{avg_engagement}%），需要优化内容策略")

        return insights

    def _get_success_recommendation(self, success_rate: float) -> str:
        """获取成功率建议"""
        if success_rate >= 70:
            return "该领域机会很大，强烈推荐创作相关内容"
        elif success_rate >= 50:
            return "该领域有一定机会，建议尝试创作"
        elif success_rate >= 30:
            return "该领域竞争较大，需要有独特角度和优质内容"
        else:
            return "该领域竞争激烈，建议谨慎进入或寻找差异化定位"

    def _get_positive_factors(self, trend_analysis: Dict) -> List[str]:
        """获取积极因素"""
        factors = []
        engagement = trend_analysis.get("engagement", {})
        statistics = trend_analysis.get("statistics", {})

        if engagement.get("avg_engagement_rate", 0) > 5:
            factors.append("用户互动意愿强")
        if len(trend_analysis.get("hot_tags", [])) > 10:
            factors.append("话题标签丰富")
        if len(trend_analysis.get("themes", [])) > 5:
            factors.append("内容类型多样")

        return factors if factors else ["市场有基础流量"]

    def _get_negative_factors(self, trend_analysis: Dict) -> List[str]:
        """获取消极因素"""
        factors = []
        total_posts = trend_analysis.get("total_posts", 0)

        if total_posts > 100:
            factors.append("市场竞争激烈")
        if total_posts > 200:
            factors.append("内容同质化严重")

        engagement = trend_analysis.get("engagement", {})
        if engagement.get("avg_engagement_rate", 0) < 3:
            factors.append("用户互动率偏低")

        return factors if factors else ["需要高质量内容"]

    def _build_ai_prompt(self, topic: str, trend_analysis: Dict) -> str:
        """构建AI提示词"""
        return f"""
请基于以下小红书{topic}领域的数据分析，为创作者提供专业的内容创作建议：

数据概览：
- 总笔记数：{trend_analysis.get('total_posts', 0)}
- 平均点赞：{trend_analysis.get('statistics', {}).get('avg_likes', 0)}
- 平均互动率：{trend_analysis.get('engagement', {}).get('avg_engagement_rate', 0)}%

热门标签：{', '.join([tag['tag'] for tag in trend_analysis.get('hot_tags', [])[:5]])}

热门主题：{', '.join([theme['theme'] for theme in trend_analysis.get('themes', [])[:5]])}

请从以下角度提供建议：
1. 内容机会点：分析该领域的内容缺口和机会
2. 差异化策略：如何在竞争中脱颖而出
3. 内容创作建议：具体的选题和创作方向
4. 用户需求洞察：目标用户最关心什么
5. 变现潜力：该领域的商业化可能性

请用专业但易懂的语言，给出具体可执行的建议。
"""

    def _empty_advice(self, topic: str) -> Dict[str, Any]:
        """返回空的建议"""
        return {
            "topic": topic,
            "generated_at": datetime.now().isoformat(),
            "overview": {},
            "ai_insights": None,
            "content_suggestions": [],
            "title_suggestions": [],
            "tag_suggestions": {},
            "posting_tips": {},
            "competitive_analysis": {},
            "success_rate_prediction": {}
        }
