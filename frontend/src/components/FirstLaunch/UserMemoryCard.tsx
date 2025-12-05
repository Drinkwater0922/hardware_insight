import React from 'react';
import { Card, Button, Tag, Space, Typography, Progress, Badge } from 'antd';
import {
  BulbOutlined,
  CameraOutlined,
  TrophyOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { UserMemory, CreationRecord } from '../../types/firstLaunch';

const { Title, Text } = Typography;

interface UserMemoryCardProps {
  memory: UserMemory;
  isInitial: boolean;
  hasNewUpdate?: boolean;
  onViewProfile: () => void;
  onSetupInterests: () => void;
}

export const UserMemoryCard: React.FC<UserMemoryCardProps> = ({
  memory,
  isInitial,
  hasNewUpdate,
  onViewProfile,
  onSetupInterests,
}) => {
  // 初始状态
  if (isInitial) {
    return (
      <Card
        className="user-memory-card card-animated"
        style={{
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          marginBottom: '20px',
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Title level={4} style={{ marginBottom: 4 }}>
              🧠 用户记忆
            </Title>
            <Text type="secondary">AI 正在了解你...</Text>
          </div>

          <div
            style={{
              padding: '32px',
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              borderRadius: '12px',
              textAlign: 'center',
              color: 'white',
            }}
          >
            <BulbOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
            <Title level={5} style={{ color: 'white', marginBottom: '8px' }}>
              帮助 AI 更懂你
            </Title>
            <Text style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              告诉我们你的兴趣，让系统为你推荐更精准的内容
            </Text>
          </div>

          <Button
            type="primary"
            size="large"
            block
            onClick={onSetupInterests}
            style={{ fontWeight: 'bold' }}
          >
            告诉 AI 你的兴趣
          </Button>
        </Space>
      </Card>
    );
  }

  // 有数据的状态
  return (
    <Card
      className="user-memory-card card-animated"
      style={{
        borderRadius: '16px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        marginBottom: '20px',
        border: hasNewUpdate ? '2px solid #52c41a' : undefined,
      }}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* 卡片标题 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={4} style={{ marginBottom: 4 }}>
              🧠 用户记忆
            </Title>
            <Text type="secondary">AI 正在学习你的创作风格</Text>
          </div>
          {hasNewUpdate && (
            <Badge status="success" text="新记录" style={{ fontSize: '12px' }} />
          )}
        </div>

        {/* 兴趣标签 */}
        <div>
          <Space style={{ marginBottom: 8 }}>
            <Text strong>🎯 你关注的主题</Text>
          </Space>
          <Space wrap>
            {memory.interests.map((interest, index) => (
              <Tag
                key={interest}
                color={index < 2 ? 'red' : 'default'}
                style={{ fontSize: '14px', padding: '4px 12px' }}
              >
                {interest}
                {index < 2 && ' 🔥'}
              </Tag>
            ))}
          </Space>
        </div>

        {/* 创作记录 */}
        {memory.creationCount > 0 && (
          <div>
            <Space style={{ marginBottom: 8 }}>
              <CameraOutlined />
              <Text strong>创作记录</Text>
            </Space>
            <div
              style={{
                padding: '12px',
                background: '#f0f7ff',
                borderRadius: '8px',
              }}
            >
              <Text>
                你已创作 <Text strong style={{ color: '#1890ff', fontSize: '20px' }}>
                  {memory.creationCount}
                </Text> 个作品
              </Text>

              {memory.recentCreations.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    最近创作：
                  </Text>
                  <Space direction="vertical" size="small" style={{ width: '100%', marginTop: 8 }}>
                    {memory.recentCreations.slice(0, 3).map((creation: CreationRecord) => (
                      <Text key={creation.id} style={{ fontSize: '13px' }}>
                        • {creation.theme}
                        {creation.inspirationUsed && (
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {' '}
                            (应用了灵感)
                          </Text>
                        )}
                      </Text>
                    ))}
                  </Space>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 风格分析 */}
        {memory.styleAnalysis && memory.styleAnalysis.mainThemes.length > 0 && (
          <div>
            <Space style={{ marginBottom: 8 }}>
              <TrophyOutlined />
              <Text strong>你的创作风格</Text>
            </Space>
            <div
              style={{
                padding: '12px',
                background: '#fffbe6',
                borderRadius: '8px',
              }}
            >
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    擅长主题：
                  </Text>
                  <Space wrap style={{ marginTop: 4 }}>
                    {memory.styleAnalysis.mainThemes.map((theme) => (
                      <Tag key={theme} color="gold">
                        {theme}
                      </Tag>
                    ))}
                  </Space>
                </div>

                {memory.creationCount >= 3 && (
                  <div style={{ marginTop: 8 }}>
                    <Text style={{ fontSize: '13px' }}>
                      💡 AI 建议：你的创作风格正在形成，继续保持！
                    </Text>
                  </div>
                )}
              </Space>
            </div>
          </div>
        )}

        {/* 成长进度 */}
        {memory.creationCount > 0 && (
          <div>
            <Space style={{ marginBottom: 8 }}>
              <Text strong>创作成长</Text>
            </Space>
            <Progress
              percent={Math.min((memory.creationCount / 10) * 100, 100)}
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
              format={() => `${memory.creationCount}/10 作品`}
            />
            {memory.creationCount < 10 && (
              <Text type="secondary" style={{ fontSize: '12px', marginTop: 4 }}>
                完成 10 个作品解锁详细画像分析
              </Text>
            )}
          </div>
        )}

        {/* 查看详情按钮 */}
        <Button type="link" onClick={onViewProfile} style={{ padding: 0 }}>
          {memory.creationCount >= 10 ? '查看我的创作画像' : '查看创作轨迹'} <RightOutlined />
        </Button>
      </Space>
    </Card>
  );
};
