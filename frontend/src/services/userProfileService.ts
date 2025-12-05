// 用户画像和记忆管理服务

import {
  UserProfile,
  UserMemory,
  InterestTag,
  Inspiration,
  CreationRecord,
  ExperienceDay,
} from '../types/firstLaunch';

// 本地存储键名
const STORAGE_KEYS = {
  USER_PROFILE: 'stepfun_user_profile',
  EXPERIENCE_DAY: 'stepfun_experience_day',
  ONBOARDING_COMPLETED: 'stepfun_onboarding_completed',
};

class UserProfileService {
  // 初始化用户画像
  initializeProfile(interests: InterestTag[]): UserProfile {
    const profile: UserProfile = {
      userId: `user_${Date.now()}`,
      interests,
      shootingStyle: {
        scenes: [],
        techniques: [],
        durationPreference: '',
      },
      contentConsumption: {
        viewedInspirations: [],
      },
      creationHistory: [],
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };

    this.saveProfile(profile);
    return profile;
  }

  // 保存用户画像
  saveProfile(profile: UserProfile): void {
    profile.lastUpdated = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  }

  // 获取用户画像
  getProfile(): UserProfile | null {
    const profileData = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (!profileData) return null;
    return JSON.parse(profileData);
  }

  // 更新兴趣标签
  updateInterests(newInterests: InterestTag[]): void {
    const profile = this.getProfile();
    if (!profile) return;

    profile.interests = [...new Set([...profile.interests, ...newInterests])];
    this.saveProfile(profile);
  }

  // 记录查看灵感
  recordInspirationView(inspiration: Inspiration, engagementScore: number): void {
    const profile = this.getProfile();
    if (!profile) return;

    profile.contentConsumption.viewedInspirations.push({
      id: inspiration.id,
      category: inspiration.category,
      engagement: engagementScore,
      timestamp: new Date().toISOString(),
    });

    this.saveProfile(profile);
  }

  // 添加创作记录
  addCreationRecord(creation: CreationRecord): void {
    const profile = this.getProfile();
    if (!profile) return;

    profile.creationHistory.push(creation);

    // 更新拍摄风格
    this.updateShootingStyle(creation);

    this.saveProfile(profile);
  }

  // 更新拍摄风格
  private updateShootingStyle(creation: CreationRecord): void {
    const profile = this.getProfile();
    if (!profile) return;

    // 根据创作记录推断风格（简化版）
    if (creation.theme && !profile.shootingStyle.scenes.includes(creation.theme)) {
      profile.shootingStyle.scenes.push(creation.theme);
    }

    if (creation.duration) {
      if (creation.duration <= 30) {
        profile.shootingStyle.durationPreference = '15-30s';
      } else if (creation.duration <= 60) {
        profile.shootingStyle.durationPreference = '30-60s';
      } else {
        profile.shootingStyle.durationPreference = '60s+';
      }
    }
  }

  // 获取用户记忆数据
  getUserMemory(): UserMemory {
    const profile = this.getProfile();
    if (!profile) {
      return {
        interests: [],
        creationCount: 0,
        recentCreations: [],
        savedInspirations: [],
      };
    }

    // 分析用户风格
    const styleAnalysis = this.analyzeUserStyle(profile);

    return {
      interests: profile.interests,
      creationCount: profile.creationHistory.length,
      recentCreations: profile.creationHistory.slice(-5),
      savedInspirations: [], // 需要从其他地方获取
      styleAnalysis,
    };
  }

  // 分析用户风格
  private analyzeUserStyle(profile: UserProfile): UserMemory['styleAnalysis'] {
    const themeCounts: Record<string, number> = {};

    profile.creationHistory.forEach((record) => {
      themeCounts[record.theme] = (themeCounts[record.theme] || 0) + 1;
    });

    const mainThemes = Object.entries(themeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([theme]) => theme);

    return {
      mainThemes,
      shootingPreferences: profile.shootingStyle.techniques,
      editingStyle: [], // 可以根据创作记录进一步分析
    };
  }

  // 设置体验天数
  setExperienceDay(day: ExperienceDay): void {
    localStorage.setItem(STORAGE_KEYS.EXPERIENCE_DAY, day.toString());
  }

  // 获取体验天数
  getExperienceDay(): ExperienceDay {
    const day = localStorage.getItem(STORAGE_KEYS.EXPERIENCE_DAY);
    return day ? (parseInt(day) as ExperienceDay) : 0;
  }

  // 设置开机引导完成
  setOnboardingCompleted(): void {
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
  }

  // 检查是否完成开机引导
  isOnboardingCompleted(): boolean {
    return localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED) === 'true';
  }

  // 重置所有数据（用于演示）
  reset(): void {
    localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
    localStorage.removeItem(STORAGE_KEYS.EXPERIENCE_DAY);
    localStorage.removeItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
  }
}

export const userProfileService = new UserProfileService();
