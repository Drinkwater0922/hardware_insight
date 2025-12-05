// 灵感推荐服务

import { Inspiration, InterestTag, UserProfile } from '../types/firstLaunch';

// 模拟灵感库
const INSPIRATION_DATABASE: Inspiration[] = [
  // 旅行类
  {
    id: 'ins_001',
    title: '秋日限定｜城市 Citywalk 拍摄手法',
    category: '旅行vlog',
    description: '逆光拍摄，捕捉落叶；低角度，营造氛围感；15秒短镜头，快节奏剪辑',
    tags: ['城市', '氛围感', '逆光', '秋季'],
    engagement: 0.85,
    trending: true,
    viewCount: 12500,
  },
  {
    id: 'ins_002',
    title: '旅行 vlog 开头 5 秒定律',
    category: '旅行vlog',
    description: '前5秒决定观众是否继续观看，学习如何设计吸引人的开头',
    tags: ['vlog', '剪辑技巧', '观众留存'],
    engagement: 0.78,
    trending: true,
    viewCount: 9800,
  },
  {
    id: 'ins_003',
    title: '周末 City Walk + 觅食记模板',
    category: '旅行vlog',
    description: '城市探索与美食结合的完整拍摄和剪辑模板',
    tags: ['城市', '美食', '综合'],
    engagement: 0.92,
    trending: true,
    viewCount: 15600,
  },

  // 美食类
  {
    id: 'ins_004',
    title: '法式餐厅氛围感拍摄',
    category: '美食探店',
    description: '如何在昏暗的餐厅环境中拍出氛围感大片',
    tags: ['美食', '打光', '氛围感', '餐厅'],
    engagement: 0.82,
    trending: true,
    viewCount: 8900,
  },
  {
    id: 'ins_005',
    title: '美食拍摄打光技巧',
    category: '美食探店',
    description: '利用自然光和补光灯，让食物看起来更诱人',
    tags: ['美食', '打光', '技巧'],
    engagement: 0.88,
    trending: false,
    viewCount: 11200,
  },
  {
    id: 'ins_006',
    title: '城市美食地图 vlog 拍摄指南',
    category: '美食探店',
    description: '结合旅行和美食，打造特色探店内容',
    tags: ['美食', '旅行', '探店'],
    engagement: 0.90,
    trending: true,
    viewCount: 14300,
  },

  // 宠物类
  {
    id: 'ins_007',
    title: '宠物拍摄构图法',
    category: '宠物日常',
    description: '抓住宠物最可爱的瞬间，掌握构图要点',
    tags: ['宠物', '构图', '摄影'],
    engagement: 0.75,
    trending: false,
    viewCount: 7600,
  },
  {
    id: 'ins_008',
    title: '猫咪日常 15s 短片剪辑模板',
    category: '宠物日常',
    description: '快速剪辑猫咪日常，配上可爱的音乐',
    tags: ['宠物', '猫咪', '短视频', '剪辑'],
    engagement: 0.80,
    trending: true,
    viewCount: 10500,
  },

  // 运动类
  {
    id: 'ins_009',
    title: '健身 vlog 拍摄角度指南',
    category: '运动健身',
    description: '展示训练成果的最佳拍摄角度',
    tags: ['健身', '运动', '拍摄技巧'],
    engagement: 0.72,
    trending: false,
    viewCount: 6400,
  },

  // 时尚类
  {
    id: 'ins_010',
    title: '秋冬穿搭拍摄全攻略',
    category: '时尚穿搭',
    description: '从场景选择到姿势指导，打造时尚大片',
    tags: ['时尚', '穿搭', '秋冬'],
    engagement: 0.83,
    trending: true,
    viewCount: 13200,
  },

  // 知识类
  {
    id: 'ins_011',
    title: '知识分享视频结构设计',
    category: '知识分享',
    description: '如何让知识类内容更有趣、更吸引人',
    tags: ['知识', '教学', '视频结构'],
    engagement: 0.70,
    trending: false,
    viewCount: 5800,
  },
];

class InspirationService {
  // 获取通用热门灵感
  getTrendingInspirations(limit: number = 5): Inspiration[] {
    return INSPIRATION_DATABASE.filter((ins) => ins.trending)
      .sort((a, b) => b.viewCount! - a.viewCount!)
      .slice(0, limit);
  }

  // 根据兴趣获取个性化灵感
  getPersonalizedInspirations(
    interests: InterestTag[],
    limit: number = 5
  ): Inspiration[] {
    // 过滤出匹配用户兴趣的灵感
    const matchedInspirations = INSPIRATION_DATABASE.filter((ins) =>
      interests.includes(ins.category as InterestTag)
    );

    // 按engagement和viewCount排序
    return matchedInspirations
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, limit);
  }

  // 基于用户画像的深度个性化推荐
  getDeepPersonalizedInspirations(
    profile: UserProfile,
    limit: number = 3
  ): Array<Inspiration & { reason: string }> {
    const recommendations: Array<Inspiration & { reason: string }> = [];

    // 1. 基于兴趣推荐
    const interestBased = this.getPersonalizedInspirations(profile.interests, 2);
    interestBased.forEach((ins) => {
      recommendations.push({
        ...ins,
        reason: `你关注的${ins.category}内容`,
      });
    });

    // 2. 基于创作历史推荐进阶内容
    if (profile.creationHistory.length > 0) {
      const recentThemes = profile.creationHistory
        .slice(-3)
        .map((c) => c.theme);

      const advancedContent = INSPIRATION_DATABASE.find(
        (ins) =>
          recentThemes.some((theme) =>
            ins.tags.some((tag) => theme.includes(tag))
          ) && !recommendations.find((r) => r.id === ins.id)
      );

      if (advancedContent) {
        recommendations.push({
          ...advancedContent,
          reason: '这个和你最近拍的很搭！',
        });
      }
    }

    // 3. 组合推荐（如果用户有多个兴趣）
    if (profile.interests.length >= 2) {
      const combinedInspiration = INSPIRATION_DATABASE.find(
        (ins) =>
          profile.interests.filter((interest) =>
            ins.tags.some((tag) => interest.includes(tag))
          ).length >= 2 && !recommendations.find((r) => r.id === ins.id)
      );

      if (combinedInspiration) {
        recommendations.push({
          ...combinedInspiration,
          reason: `结合你的${profile.interests.slice(0, 2).join('和')}兴趣`,
        });
      }
    }

    return recommendations.slice(0, limit);
  }

  // 根据 ID 获取灵感详情
  getInspirationById(id: string): Inspiration | undefined {
    return INSPIRATION_DATABASE.find((ins) => ins.id === id);
  }

  // 搜索灵感
  searchInspirations(keyword: string): Inspiration[] {
    const lowerKeyword = keyword.toLowerCase();
    return INSPIRATION_DATABASE.filter(
      (ins) =>
        ins.title.toLowerCase().includes(lowerKeyword) ||
        ins.description.toLowerCase().includes(lowerKeyword) ||
        ins.tags.some((tag) => tag.toLowerCase().includes(lowerKeyword))
    );
  }

  // 获取相关灵感
  getRelatedInspirations(inspiration: Inspiration, limit: number = 3): Inspiration[] {
    return INSPIRATION_DATABASE.filter(
      (ins) =>
        ins.id !== inspiration.id &&
        (ins.category === inspiration.category ||
          ins.tags.some((tag) => inspiration.tags.includes(tag)))
    )
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, limit);
  }

  // 为创作任务生成检查清单
  generateCreationChecklist(inspiration: Inspiration): Array<{
    id: string;
    content: string;
    completed: boolean;
  }> {
    // 根据灵感类型生成不同的检查清单
    const baseChecklist = [
      { id: 'check_1', content: '准备拍摄设备', completed: false },
      { id: 'check_2', content: '选择拍摄场景', completed: false },
    ];

    if (inspiration.category === '旅行vlog') {
      return [
        ...baseChecklist,
        { id: 'check_3', content: '城市街景逆光镜头', completed: false },
        { id: 'check_4', content: '特色建筑低角度', completed: false },
        { id: 'check_5', content: '氛围感人物镜头', completed: false },
      ];
    } else if (inspiration.category === '美食探店') {
      return [
        ...baseChecklist,
        { id: 'check_3', content: '美食店外观', completed: false },
        { id: 'check_4', content: '食物特写（打光）', completed: false },
        { id: 'check_5', content: '餐厅氛围感', completed: false },
      ];
    }

    return baseChecklist;
  }
}

export const inspirationService = new InspirationService();
