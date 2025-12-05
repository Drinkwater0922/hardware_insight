import React from 'react';
import { Card, Button, Space, Typography, Checkbox, Progress } from 'antd';
import {
  CameraOutlined,
  CheckCircleOutlined,
  PlayCircleOutlined,
  RocketOutlined,
} from '@ant-design/icons';
import { CreationTask } from '../../types/firstLaunch';

const { Title, Text, Paragraph } = Typography;

interface CreationCardProps {
  task?: CreationTask;
  isInitial: boolean;
  onStartFirstCreation: () => void;
  onStartShooting: () => void;
  onViewChecklist: () => void;
  onToggleChecklistItem?: (itemId: string) => void;
}

export const CreationCard: React.FC<CreationCardProps> = ({
  task,
  isInitial,
  onStartFirstCreation,
  onStartShooting,
  onViewChecklist,
  onToggleChecklistItem,
}) => {
  // 初始状态
  if (isInitial && !task) {
    return (
      <Card
        className="creation-card card-animated"
        style={{
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          marginBottom: '20px',
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Title level={4} style={{ marginBottom: 4 }}>
              ✨ 创作
            </Title>
            <Text type="secondary">准备好创作你的第一个作品了吗？</Text>
          </div>

          <div
            style={{
              padding: '32px',
              background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
              borderRadius: '12px',
              textAlign: 'center',
              color: 'white',
            }}
          >
            <CameraOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
            <Title level={5} style={{ color: 'white', marginBottom: '8px' }}>
              开始你的创作之旅
            </Title>
            <Text style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              从一张照片或一段视频开始，AI 将全程协助你
            </Text>
          </div>

          <Button
            type="primary"
            size="large"
            block
            icon={<RocketOutlined />}
            onClick={onStartFirstCreation}
            style={{
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
              border: 'none',
            }}
          >
            拍摄第一张照片
          </Button>
        </Space>
      </Card>
    );
  }

  // 无任务状态
  if (!task) {
    return (
      <Card
        className="creation-card card-animated"
        style={{
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          marginBottom: '20px',
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Title level={4} style={{ marginBottom: 4 }}>
              ✨ 创作
            </Title>
            <Text type="secondary">从灵感趋势中选择一个开始创作</Text>
          </div>

          <div
            style={{
              padding: '24px',
              background: '#f5f5f5',
              borderRadius: '8px',
              textAlign: 'center',
            }}
          >
            <PlayCircleOutlined style={{ fontSize: '36px', color: '#1890ff', marginBottom: '8px' }} />
            <Text>浏览灵感趋势，找到你感兴趣的内容</Text>
          </div>
        </Space>
      </Card>
    );
  }

  // 任务进行中
  if (task.status === 'in_progress' || task.status === 'pending') {
    return (
      <Card
        className="creation-card card-animated"
        style={{
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          marginBottom: '20px',
          borderLeft: '4px solid #1890ff',
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Title level={4} style={{ marginBottom: 4 }}>
              ✨ 创作任务进行中
            </Title>
            <Text type="secondary">{task.title}</Text>
          </div>

          {/* 任务描述 */}
          <div
            style={{
              padding: '16px',
              background: '#e6f7ff',
              borderRadius: '8px',
            }}
          >
            <Paragraph style={{ marginBottom: 0 }}>{task.description}</Paragraph>
          </div>

          {/* 进度条 */}
          <div>
            <Space style={{ marginBottom: 8 }}>
              <Text strong>拍摄进度</Text>
            </Space>
            <Progress
              percent={task.progress}
              strokeColor="#1890ff"
              format={() => `${task.checklist.filter((item) => item.completed).length}/${
                task.checklist.length
              } 完成`}
            />
          </div>

          {/* 检查清单 */}
          <div>
            <Space style={{ marginBottom: 12 }}>
              <Text strong>📋 拍摄清单</Text>
            </Space>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              {task.checklist.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: '8px 12px',
                    background: item.completed ? '#f6ffed' : '#ffffff',
                    border: `1px solid ${item.completed ? '#b7eb8f' : '#d9d9d9'}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                  onClick={() => onToggleChecklistItem?.(item.id)}
                >
                  <Checkbox checked={item.completed}>
                    <Text
                      style={{
                        textDecoration: item.completed ? 'line-through' : 'none',
                        color: item.completed ? '#52c41a' : 'inherit',
                      }}
                    >
                      {item.content}
                    </Text>
                  </Checkbox>
                </div>
              ))}
            </Space>
          </div>

          {/* 操作按钮 */}
          <Space style={{ width: '100%' }} direction="vertical">
            <Button
              type="primary"
              size="large"
              block
              icon={<CameraOutlined />}
              onClick={onStartShooting}
            >
              {task.progress === 0 ? '开始拍摄' : '继续拍摄'}
            </Button>
            <Button size="large" block onClick={onViewChecklist}>
              查看参考样片
            </Button>
          </Space>
        </Space>
      </Card>
    );
  }

  // 任务完成
  if (task.status === 'completed') {
    return (
      <Card
        className="creation-card card-animated"
        style={{
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          marginBottom: '20px',
          borderLeft: '4px solid #52c41a',
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Title level={4} style={{ marginBottom: 4 }}>
              ✨ 创作完成
            </Title>
            <Text type="secondary">恭喜！你的作品已经准备好了</Text>
          </div>

          <div
            style={{
              padding: '24px',
              background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
              borderRadius: '12px',
              textAlign: 'center',
            }}
          >
            <CheckCircleOutlined
              style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }}
            />
            <Title level={5} style={{ marginBottom: '8px' }}>
              🎉 你的"{task.title}"做好了！
            </Title>
            <Text style={{ fontSize: '13px' }}>
              AI 已为你完成自动剪辑，配上了适合的 BGM
            </Text>
          </div>

          {/* 数据对比 */}
          <div
            style={{
              padding: '16px',
              background: '#f0f7ff',
              borderRadius: '8px',
            }}
          >
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              📊 效率提升
            </Text>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Text type="secondary" style={{ fontSize: '13px' }}>
                • 传统方式：选片 15 分钟 + 剪辑 40 分钟
              </Text>
              <Text style={{ fontSize: '13px', color: '#52c41a', fontWeight: 500 }}>
                • AI OS 方式：自动完成，用时 2 分钟 ⚡
              </Text>
            </Space>
          </div>

          {/* 发布建议 */}
          <div
            style={{
              padding: '16px',
              background: '#fffbe6',
              borderRadius: '8px',
            }}
          >
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              💡 发布建议
            </Text>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Text style={{ fontSize: '13px' }}>标题："周末 City Walk + 觅食记"</Text>
              <Text style={{ fontSize: '13px' }}>话题：#城市漫游 #美食探店</Text>
              <Text style={{ fontSize: '13px' }}>最佳发布时间：今晚 8 点</Text>
            </Space>
          </div>

          <Space style={{ width: '100%' }} direction="vertical">
            <Button type="primary" size="large" block>
              预览视频
            </Button>
            <Button size="large" block>
              立即发布
            </Button>
          </Space>
        </Space>
      </Card>
    );
  }

  return null;
};
