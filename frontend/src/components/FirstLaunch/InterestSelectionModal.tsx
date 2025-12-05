import React, { useState } from 'react';
import { Modal, Space, Typography, Button } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { InterestTag } from '../../types/firstLaunch';

const { Title, Text } = Typography;

interface InterestSelectionModalProps {
  visible: boolean;
  onComplete: (selectedInterests: InterestTag[]) => void;
  onSkip: () => void;
}

const AVAILABLE_INTERESTS: Array<{ tag: InterestTag; icon: string; description: string }> = [
  { tag: '旅行vlog', icon: '✈️', description: '记录旅途精彩瞬间' },
  { tag: '美食探店', icon: '🍜', description: '发现城市美味' },
  { tag: '运动健身', icon: '💪', description: '展示健康生活' },
  { tag: '宠物日常', icon: '🐱', description: '分享萌宠时刻' },
  { tag: '时尚穿搭', icon: '👗', description: '展示时尚品味' },
  { tag: '知识分享', icon: '📚', description: '传播有价值的内容' },
];

export const InterestSelectionModal: React.FC<InterestSelectionModalProps> = ({
  visible,
  onComplete,
  onSkip,
}) => {
  const [selectedInterests, setSelectedInterests] = useState<InterestTag[]>([]);

  const toggleInterest = (interest: InterestTag) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleComplete = () => {
    if (selectedInterests.length > 0) {
      onComplete(selectedInterests);
    }
  };

  return (
    <Modal
      open={visible}
      footer={null}
      closable={false}
      width={600}
      centered
      bodyStyle={{ padding: '32px' }}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* 标题 */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
          <Title level={3} style={{ marginBottom: '8px' }}>
            帮我了解你的创作兴趣
          </Title>
          <Text type="secondary">
            选择你感兴趣的主题，AI 将为你推荐相关创作灵感（可多选）
          </Text>
        </div>

        {/* 兴趣选择 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
            marginTop: '24px',
          }}
        >
          {AVAILABLE_INTERESTS.map((item) => {
            const isSelected = selectedInterests.includes(item.tag);
            return (
              <div
                key={item.tag}
                onClick={() => toggleInterest(item.tag)}
                style={{
                  padding: '16px',
                  border: `2px solid ${isSelected ? '#1890ff' : '#d9d9d9'}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  background: isSelected ? '#e6f7ff' : 'white',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = '#40a9ff';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = '#d9d9d9';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                {isSelected && (
                  <CheckOutlined
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      color: '#1890ff',
                      fontSize: '16px',
                    }}
                  />
                )}
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>{item.icon}</div>
                <Text strong style={{ display: 'block', marginBottom: '4px' }}>
                  {item.tag}
                </Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {item.description}
                </Text>
              </div>
            );
          })}
        </div>

        {/* 已选择提示 */}
        {selectedInterests.length > 0 && (
          <div
            style={{
              padding: '12px 16px',
              background: '#f0f7ff',
              borderRadius: '8px',
              textAlign: 'center',
            }}
          >
            <Text>
              已选择 <Text strong style={{ color: '#1890ff' }}>{selectedInterests.length}</Text> 个兴趣
            </Text>
          </div>
        )}

        {/* 操作按钮 */}
        <Space style={{ width: '100%', justifyContent: 'center', marginTop: '16px' }}>
          <Button size="large" onClick={onSkip}>
            跳过
          </Button>
          <Button
            type="primary"
            size="large"
            onClick={handleComplete}
            disabled={selectedInterests.length === 0}
            style={{ minWidth: '120px' }}
          >
            确认（{selectedInterests.length}）
          </Button>
        </Space>
      </Space>
    </Modal>
  );
};
