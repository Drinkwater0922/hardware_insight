import React from 'react';
import { Card, Button, Tag, Space, Typography } from 'antd';
import { FireOutlined, RiseOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Inspiration } from '../../types/firstLaunch';

const { Title, Text, Paragraph } = Typography;

interface InspirationTrendsCardProps {
  inspirations: Array<Inspiration & { reason?: string }>;
  isPersonalized: boolean;
  onViewInspiration: (inspiration: Inspiration) => void;
  onViewMore: () => void;
}

export const InspirationTrendsCard: React.FC<InspirationTrendsCardProps> = ({
  inspirations,
  isPersonalized,
  onViewInspiration,
  onViewMore,
}) => {
  const topInspiration = inspirations[0];
  const relatedInspirations = inspirations.slice(1, 3);

  return (
    <Card
      className="inspiration-trends-card card-animated"
      style={{
        borderRadius: '16px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        marginBottom: '20px',
      }}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* 卡片标题 */}
        <div>
          <Title level={4} style={{ marginBottom: 4 }}>
            🌟 灵感趋势
          </Title>
          <Text type="secondary">
            {isPersonalized ? '为你推荐（基于你的兴趣）' : '发现正在流行的创作灵感'}
          </Text>
        </div>

        {/* 主要推荐 */}
        {topInspiration && (
          <div
            className="main-inspiration"
            style={{
              padding: '16px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '12px',
              color: 'white',
            }}
          >
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Space>
                <FireOutlined style={{ fontSize: '18px' }} />
                <Text strong style={{ color: 'white' }}>
                  {isPersonalized ? '为你推荐' : '最近爆火'}
                </Text>
              </Space>

              <Title level={5} style={{ color: 'white', marginTop: 8, marginBottom: 8 }}>
                {topInspiration.title}
              </Title>

              {topInspiration.reason && (
                <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '13px' }}>
                  <ThunderboltOutlined /> {topInspiration.reason}
                </Text>
              )}

              <Paragraph
                style={{ color: 'rgba(255, 255, 255, 0.85)', marginTop: 8, marginBottom: 12 }}
              >
                {topInspiration.description}
              </Paragraph>

              <Space wrap>
                {topInspiration.tags.slice(0, 3).map((tag) => (
                  <Tag key={tag} color="rgba(255, 255, 255, 0.2)" style={{ border: 'none' }}>
                    {tag}
                  </Tag>
                ))}
              </Space>

              <Button
                type="primary"
                size="large"
                block
                style={{
                  marginTop: '12px',
                  background: 'white',
                  color: '#667eea',
                  border: 'none',
                  fontWeight: 'bold',
                }}
                onClick={() => onViewInspiration(topInspiration)}
              >
                查看教程
              </Button>
            </Space>
          </div>
        )}

        {/* 相关趋势 */}
        {relatedInspirations.length > 0 && (
          <div>
            <Space style={{ marginBottom: 12 }}>
              <RiseOutlined />
              <Text strong>相关趋势</Text>
            </Space>

            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              {relatedInspirations.map((inspiration) => (
                <div
                  key={inspiration.id}
                  className="related-inspiration"
                  style={{
                    padding: '12px',
                    background: '#f5f5f5',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                  }}
                  onClick={() => onViewInspiration(inspiration)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#e6e6e6';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f5f5f5';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <Text strong style={{ display: 'block', marginBottom: 4 }}>
                    • {inspiration.title}
                  </Text>
                  {inspiration.reason && (
                    <Text
                      type="secondary"
                      style={{ fontSize: '12px', color: '#ff6b6b', fontWeight: 500 }}
                    >
                      💡 {inspiration.reason}
                    </Text>
                  )}
                </div>
              ))}
            </Space>
          </div>
        )}

        {/* 查看更多 */}
        <Button type="link" onClick={onViewMore} style={{ padding: 0 }}>
          查看更多 →
        </Button>
      </Space>
    </Card>
  );
};
