// 首次开机体验相关类型定义

// 用户兴趣类型
export type InterestTag = '旅行vlog' | '美食探店' | '运动健身' | '宠物日常' | '时尚穿搭' | '知识分享';

// 拍摄风格
export interface ShootingStyle {
  scenes: string[];
  techniques: string[];
  durationPreference: string;
}

// 灵感类型
export interface Inspiration {
  id: string;
  title: string;
  category: string;
  description: string;
  tutorialUrl?: string;
  thumbnail?: string;
  tags: string[];
  engagement: number;
  trending: boolean;
  viewCount?: number;
}

// 创作记录
export interface CreationRecord {
  id: string;
  date: string;
  type: 'vlog' | 'photo' | 'story';
  theme: string;
  duration?: number;
  inspirationUsed?: string;
  published: boolean;
  platform?: string[];
  viewCount?: number;
}

// 用户画像
export interface UserProfile {
  userId: string;
  interests: InterestTag[];
  shootingStyle: ShootingStyle;
  contentConsumption: {
    viewedInspirations: Array<{
      id: string;
      category: string;
      engagement: number;
      timestamp: string;
    }>;
  };
  creationHistory: CreationRecord[];
  createdAt: string;
  lastUpdated: string;
}

// 用户记忆数据
export interface UserMemory {
  interests: InterestTag[];
  creationCount: number;
  recentCreations: CreationRecord[];
  savedInspirations: Inspiration[];
  styleAnalysis?: {
    mainThemes: string[];
    shootingPreferences: string[];
    editingStyle: string[];
  };
}

// 创作任务
export interface CreationTask {
  id: string;
  title: string;
  description: string;
  inspirationId?: string;
  checklist: Array<{
    id: string;
    content: string;
    completed: boolean;
  }>;
  status: 'pending' | 'in_progress' | 'completed';
  progress: number;
}

// 卡片状态
export type CardState = 'initial' | 'personalized' | 'active';

// 首次开机阶段
export type OnboardingStage =
  | 'welcome'
  | 'interest_selection'
  | 'first_inspiration'
  | 'first_creation'
  | 'building_memory'
  | 'personalized_experience';

// 体验天数
export type ExperienceDay = 0 | 1 | 3 | 7;
