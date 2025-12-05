import React from 'react';
import { Modal, Space, Typography, Button, Tag, Divider } from 'antd';
import {
  PlayCircleOutlined,
  BookOutlined,
  RocketOutlined,
  HeartOutlined,
} from '@ant-design/icons';
import { Inspiration } from '../../types/firstLaunch';

const { Title, Text, Paragraph } = Typography;

interface InspirationDetailModalProps {
  inspiration: Inspiration | null;
  visible: boolean;
  onClose: () => void;
  onStartCreation: (inspiration: Inspiration) => void;
  onSave: (inspiration: Inspiration) => void;
}

export const InspirationDetailModal: React.FC<InspirationDetailModalProps> = ({
  inspiration,
  visible,
  onClose,
  onStartCreation,
  onSave,
}) => {
  if (!inspiration) return null;

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={700}
      centered
      bodyStyle={{ padding: '32px' }}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* 标题区域 */}
        <div>
          <Space style={{ marginBottom: 8 }}>
            <Tag color="red">热门</Tag>
            <Text type="secondary">{inspiration.viewCount?.toLocaleString()} 次观看</Text>
          </Space>
          <Title level={3} style={{ marginBottom: 8 }}>
            {inspiration.title}
          </Title>
          <Space wrap>
            {inspiration.tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </Space>
        </div>

        <Divider style={{ margin: '8px 0' }} />

        {/* 教程视频预览 */}
        <div
          style={{
            width: '100%',
            height: '300px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          <Space direction="vertical" align="center">
            <PlayCircleOutlined style={{ fontSize: '64px' }} />
            <Text style={{ color: 'white', fontSize: '16px' }}>点击播放教程视频（3 分钟）</Text>
          </Space>
        </div>

        {/* 核心要点 */}
        <div>
          <Space style={{ marginBottom: 12 }}>
            <BookOutlined />
            <Text strong>核心要点</Text>
          </Space>
          <div
            style={{
              padding: '16px',
              background: '#f5f5f5',
              borderRadius: '8px',
            }}
          >
            <Paragraph style={{ marginBottom: 0 }}>{inspiration.description}</Paragraph>
          </div>
        </div>

        {/* 拍摄技巧详解 */}
        <div>
          <Text strong style={{ display: 'block', marginBottom: 12 }}>
            📸 拍摄技巧详解
          </Text>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <div
              style={{
                padding: '12px',
                background: '#fff7e6',
                borderRadius: '8px',
              }}
            >
              <Text strong style={{ color: '#fa8c16' }}>
                1. 场景选择
              </Text>
              <Paragraph style={{ marginTop: 4, marginBottom: 0 }}>
                选择光线充足的环境，避免过于昏暗或过曝的场景
              </Paragraph>
            </div>

            <div
              style={{
                padding: '12px',
                background: '#e6f7ff',
                borderRadius: '8px',
              }}
            >
              <Text strong style={{ color: '#1890ff' }}>
                2. 拍摄角度
              </Text>
              <Paragraph style={{ marginTop: 4, marginBottom: 0 }}>
                尝试从低角度或高角度拍摄，营造不同的视觉效果
              </Paragraph>
            </div>

            <div
              style={{
                padding: '12px',
                background: '#f6ffed',
                borderRadius: '8px',
              }}
            >
              <Text strong style={{ color: '#52c41a' }}>
                3. 剪辑节奏
              </Text>
              <Paragraph style={{ marginTop: 4, marginBottom: 0 }}>
                保持快节奏，每个镜头不超过 3-5 秒，配合节奏感强的音乐
              </Paragraph>
            </div>
          </Space>
        </div>

        {/* 操作按钮 */}
        <Space style={{ width: '100%', justifyContent: 'space-between', marginTop: '16px' }}>
          <Button
            size="large"
            icon={<HeartOutlined />}
            onClick={() => onSave(inspiration)}
          >
            保存到灵感库
          </Button>
          <Button
            type="primary"
            size="large"
            icon={<RocketOutlined />}
            onClick={() => onStartCreation(inspiration)}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
            }}
          >
            立即尝试拍摄
          </Button>
        </Space>
      </Space>
    </Modal>
  );
};
