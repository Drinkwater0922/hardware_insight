import React, { useState, useEffect } from 'react';
import { Layout, Space, Button, message, Segmented, FloatButton } from 'antd';
import {
  ReloadOutlined,
  SettingOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { InspirationTrendsCard } from '../components/FirstLaunch/InspirationTrendsCard';
import { UserMemoryCard } from '../components/FirstLaunch/UserMemoryCard';
import { CreationCard } from '../components/FirstLaunch/CreationCard';
import { InterestSelectionModal } from '../components/FirstLaunch/InterestSelectionModal';
import { InspirationDetailModal } from '../components/FirstLaunch/InspirationDetailModal';
import { userProfileService } from '../services/userProfileService';
import { inspirationService } from '../services/inspirationService';
import {
  Inspiration,
  InterestTag,
  CreationTask,
  ExperienceDay,
  UserMemory,
} from '../types/firstLaunch';

const { Content } = Layout;

export const FirstLaunchExperience: React.FC = () => {
  // 状态管理
  const [experienceDay, setExperienceDay] = useState<ExperienceDay>(0);
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [showInspirationDetail, setShowInspirationDetail] = useState(false);
  const [selectedInspiration, setSelectedInspiration] = useState<Inspiration | null>(null);
  const [userMemory, setUserMemory] = useState<UserMemory>(
    userProfileService.getUserMemory()
  );
  const [inspirations, setInspirations] = useState<Array<Inspiration & { reason?: string }>>(
    []
  );
  const [currentTask, setCurrentTask] = useState<CreationTask | undefined>();
  const [hasMemoryUpdate, setHasMemoryUpdate] = useState(false);

  // 初始化
  useEffect(() => {
    loadExperience();
  }, []);

  // 加载体验数据
  const loadExperience = () => {
    const day = userProfileService.getExperienceDay();
    setExperienceDay(day);

    const profile = userProfileService.getProfile();
    const memory = userProfileService.getUserMemory();
    setUserMemory(memory);

    // 根据用户画像加载灵感
    if (profile && profile.interests.length > 0) {
      if (day >= 7) {
        // Day 7: 深度个性化推荐
        const deepPersonalized = inspirationService.getDeepPersonalizedInspirations(
          profile,
          3
        );
        setInspirations(deepPersonalized);
      } else if (day >= 1) {
        // Day 1-6: 基于兴趣的个性化
        const personalized = inspirationService.getPersonalizedInspirations(
          profile.interests,
          5
        ).map(ins => ({ ...ins, reason: `你关注的${ins.category}内容` }));
        setInspirations(personalized);
      } else {
        // Day 0: 初始推荐
        const trending = inspirationService.getTrendingInspirations(5).map(ins => ({
          ...ins,
        }));
        setInspirations(trending);
      }
    } else {
      // 无画像，显示热门
      const trending = inspirationService.getTrendingInspirations(5).map(ins => ({ ...ins }));
      setInspirations(trending);
    }

    // 检查是否需要显示兴趣问卷
    if (day === 0 && !profile) {
      setTimeout(() => {
        setShowInterestModal(true);
      }, 1000);
    }
  };

  // 完成兴趣选择
  const handleInterestSelection = (interests: InterestTag[]) => {
    userProfileService.initializeProfile(interests);
    setShowInterestModal(false);
    message.success('已保存你的兴趣偏好！');

    // 立即刷新灵感推荐
    setTimeout(() => {
      loadExperience();
      setHasMemoryUpdate(true);
      setTimeout(() => setHasMemoryUpdate(false), 3000);
    }, 500);
  };

  // 跳过兴趣选择
  const handleSkipInterestSelection = () => {
    userProfileService.initializeProfile([]);
    setShowInterestModal(false);
    message.info('你可以稍后在设置中补充兴趣');
  };

  // 查看灵感详情
  const handleViewInspiration = (inspiration: Inspiration) => {
    setSelectedInspiration(inspiration);
    setShowInspirationDetail(true);

    // 记录查看行为
    const profile = userProfileService.getProfile();
    if (profile) {
      userProfileService.recordInspirationView(inspiration, 0.7);
    }
  };

  // 开始创作
  const handleStartCreation = (inspiration: Inspiration) => {
    const checklist = inspirationService.generateCreationChecklist(inspiration);

    const task: CreationTask = {
      id: `task_${Date.now()}`,
      title: inspiration.title,
      description: inspiration.description,
      inspirationId: inspiration.id,
      checklist,
      status: 'pending',
      progress: 0,
    };

    setCurrentTask(task);
    setShowInspirationDetail(false);
    message.success('创作任务已启动！');

    // 更新用户记忆
    setHasMemoryUpdate(true);
    setTimeout(() => setHasMemoryUpdate(false), 3000);
  };

  // 保存灵感
  const handleSaveInspiration = (inspiration: Inspiration) => {
    message.success(`已保存"${inspiration.title}"到灵感库`);
  };

  // 切换检查清单项
  const handleToggleChecklistItem = (itemId: string) => {
    if (!currentTask) return;

    const updatedChecklist = currentTask.checklist.map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );

    const completedCount = updatedChecklist.filter((item) => item.completed).length;
    const progress = Math.round((completedCount / updatedChecklist.length) * 100);

    setCurrentTask({
      ...currentTask,
      checklist: updatedChecklist,
      progress,
      status: progress === 100 ? 'completed' : 'in_progress',
    });

    if (progress === 100) {
      // 任务完成，添加到创作记录
      const profile = userProfileService.getProfile();
      if (profile) {
        userProfileService.addCreationRecord({
          id: `creation_${Date.now()}`,
          date: new Date().toISOString(),
          type: 'vlog',
          theme: currentTask.title,
          duration: 25,
          inspirationUsed: currentTask.inspirationId,
          published: false,
        });

        // 刷新用户记忆
        setUserMemory(userProfileService.getUserMemory());
        setHasMemoryUpdate(true);
        setTimeout(() => setHasMemoryUpdate(false), 3000);

        message.success('🎉 恭喜！创作任务已完成');
      }
    }
  };

  // 模拟相机拍摄
  const handleStartShooting = () => {
    message.info('📸 相机功能演示：实际使用时会打开相机');
  };

  // 切换体验天数（演示用）
  const handleDayChange = (value: string | number) => {
    const day = parseInt(value.toString()) as ExperienceDay;
    setExperienceDay(day);
    userProfileService.setExperienceDay(day);

    // 模拟不同天数的数据
    const profile = userProfileService.getProfile();
    if (profile && day > 0) {
      // 模拟添加一些创作记录
      if (day >= 1 && profile.creationHistory.length === 0) {
        userProfileService.addCreationRecord({
          id: 'creation_demo_1',
          date: new Date().toISOString(),
          type: 'vlog',
          theme: '秋日街景',
          duration: 20,
          inspirationUsed: 'ins_001',
          published: false,
        });
      }

      if (day >= 3 && profile.creationHistory.length < 3) {
        userProfileService.addCreationRecord({
          id: 'creation_demo_2',
          date: new Date().toISOString(),
          type: 'vlog',
          theme: '日料店探店',
          duration: 30,
          published: false,
        });
        userProfileService.addCreationRecord({
          id: 'creation_demo_3',
          date: new Date().toISOString(),
          type: 'vlog',
          theme: '公园宠物猫',
          duration: 15,
          published: false,
        });
      }

      if (day >= 7 && profile.creationHistory.length < 8) {
        for (let i = 0; i < 5; i++) {
          userProfileService.addCreationRecord({
            id: `creation_demo_${4 + i}`,
            date: new Date().toISOString(),
            type: 'vlog',
            theme: `创作作品 ${4 + i}`,
            duration: 25,
            published: true,
            platform: ['小红书'],
          });
        }
      }
    }

    loadExperience();
  };

  // 重置演示
  const handleReset = () => {
    userProfileService.reset();
    setExperienceDay(0);
    setCurrentTask(undefined);
    loadExperience();
    message.success('已重置，请重新开始体验');
    setTimeout(() => {
      setShowInterestModal(true);
    }, 500);
  };

  const isPersonalized =
    userMemory.interests.length > 0 || (experienceDay as number) >= 1;

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content style={{ padding: '24px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* 顶部控制栏 */}
          <div
            style={{
              background: 'white',
              padding: '16px 24px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ margin: 0, marginBottom: '8px' }}>
                  StepFun AI OS 首次开机体验
                </h2>
                <Space>
                  <ClockCircleOutlined />
                  <span>体验天数：</span>
                  <Segmented
                    options={[
                      { label: 'Day 0', value: '0' },
                      { label: 'Day 1', value: '1' },
                      { label: 'Day 3', value: '3' },
                      { label: 'Day 7', value: '7' },
                    ]}
                    value={experienceDay.toString()}
                    onChange={handleDayChange}
                  />
                </Space>
              </div>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleReset}
                danger
              >
                重置演示
              </Button>
            </Space>
          </div>

          {/* 三卡片系统 */}
          <InspirationTrendsCard
            inspirations={inspirations}
            isPersonalized={isPersonalized}
            onViewInspiration={handleViewInspiration}
            onViewMore={() => message.info('查看更多灵感')}
          />

          <UserMemoryCard
            memory={userMemory}
            isInitial={userMemory.interests.length === 0 && experienceDay === 0}
            hasNewUpdate={hasMemoryUpdate}
            onViewProfile={() => message.info('查看完整创作画像')}
            onSetupInterests={() => setShowInterestModal(true)}
          />

          <CreationCard
            task={currentTask}
            isInitial={experienceDay === 0 && !currentTask}
            onStartFirstCreation={() => message.info('打开相机准备拍摄')}
            onStartShooting={handleStartShooting}
            onViewChecklist={() => message.info('查看参考样片')}
            onToggleChecklistItem={handleToggleChecklistItem}
          />
        </Space>
      </Content>

      {/* 浮动按钮 */}
      <FloatButton
        icon={<SettingOutlined />}
        tooltip="设置"
        style={{ right: 24, bottom: 24 }}
      />

      {/* 模态框 */}
      <InterestSelectionModal
        visible={showInterestModal}
        onComplete={handleInterestSelection}
        onSkip={handleSkipInterestSelection}
      />

      <InspirationDetailModal
        inspiration={selectedInspiration}
        visible={showInspirationDetail}
        onClose={() => setShowInspirationDetail(false)}
        onStartCreation={handleStartCreation}
        onSave={handleSaveInspiration}
      />
    </Layout>
  );
};

export default FirstLaunchExperience;
