import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layout,
  Card,
  Typography,
  List,
  Button,
  Space,
  Tag,
  Empty,
  Spin,
  message,
} from 'antd';
import {
  ArrowLeftOutlined,
  EyeOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { sentimentApi } from '../services/api';
import type { ReportListItem } from '../types';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<ReportListItem[]>([]);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await sentimentApi.listReports(0, 50);
      setReports(data);
    } catch (error) {
      message.error('加载历史记录失败');
    } finally {
      setLoading(false);
    }
  };

  const getSentimentTag = (score: number) => {
    if (score > 0.1) {
      return <Tag color="green">正面</Tag>;
    } else if (score < -0.1) {
      return <Tag color="red">负面</Tag>;
    } else {
      return <Tag color="default">中性</Tag>;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', padding: '0 50px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')}>
            返回首页
          </Button>
          <Title level={3} style={{ margin: 0 }}>
            历史记录
          </Title>
        </Space>
      </Header>

      <Content style={{ padding: '50px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Card>
            {loading ? (
              <div style={{ textAlign: 'center', padding: 50 }}>
                <Spin size="large" />
              </div>
            ) : reports.length === 0 ? (
              <Empty description="暂无历史记录" />
            ) : (
              <List
                itemLayout="horizontal"
                dataSource={reports}
                renderItem={(report) => (
                  <List.Item
                    actions={[
                      <Button
                        type="primary"
                        icon={<EyeOutlined />}
                        onClick={() => navigate(`/report/${report.id}`)}
                      >
                        查看详情
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <Space>
                          <Text strong>{report.product_name || report.query}</Text>
                          {getSentimentTag(report.avg_sentiment_score)}
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size="small">
                          <Text type="secondary">{report.query}</Text>
                          <Space>
                            <Tag>帖子数: {report.total_posts}</Tag>
                            <Tag>平均分: {report.avg_sentiment_score.toFixed(2)}</Tag>
                            <Space size="small">
                              <ClockCircleOutlined />
                              <Text type="secondary">
                                {dayjs(report.created_at).format('YYYY-MM-DD HH:mm')}
                              </Text>
                            </Space>
                          </Space>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default HistoryPage;
