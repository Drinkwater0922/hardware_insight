import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layout,
  Input,
  Button,
  Card,
  Typography,
  Space,
  message,
  Checkbox,
  Row,
  Col,
  Spin,
} from 'antd';
import {
  SearchOutlined,
  RocketOutlined,
  BarChartOutlined,
  GlobalOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import { sentimentApi } from '../services/api';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';

const { Header, Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [platforms, setPlatforms] = useState(['reddit', 'twitter', 'quora']);

  const handlePlatformChange = (platform: string) => (e: CheckboxChangeEvent) => {
    if (e.target.checked) {
      setPlatforms([...platforms, platform]);
    } else {
      setPlatforms(platforms.filter((p) => p !== platform));
    }
  };

  const handleAnalyze = async () => {
    if (!query.trim()) {
      message.warning('请输入查询内容');
      return;
    }

    if (platforms.length === 0) {
      message.warning('请至少选择一个平台');
      return;
    }

    setLoading(true);
    try {
      const result = await sentimentApi.analyze({
        query,
        platforms,
        max_results: 100,
      });

      message.success('分析完成！');
      navigate(`/report/${result.report_id}`);
    } catch (error: any) {
      message.error(error.response?.data?.detail || '分析失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const examples = [
    '帮我找到关于 vivo X300 的用户舆情',
    'iPhone 15 Pro sentiment analysis',
    'Samsung Galaxy S24 user feedback',
    'NVIDIA RTX 4090 reviews',
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', padding: '0 50px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Space>
            <RocketOutlined style={{ fontSize: 24, color: '#1890ff' }} />
            <Title level={3} style={{ margin: 0 }}>
              Hardware Insight
            </Title>
          </Space>
          <Space>
            <Button
              type="primary"
              icon={<RocketOutlined />}
              onClick={() => navigate('/first-launch')}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
              }}
            >
              首次开机体验
            </Button>
            <Button icon={<HistoryOutlined />} onClick={() => navigate('/history')}>
              历史记录
            </Button>
          </Space>
        </div>
      </Header>

      <Content style={{ padding: '50px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Hero Section */}
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <Title level={1} style={{ fontSize: 48, marginBottom: 20 }}>
              AI硬件舆情分析平台
            </Title>
            <Paragraph style={{ fontSize: 18, color: '#666' }}>
              一键获取海外社交媒体上的产品反馈，智能分析用户情感和观点
            </Paragraph>
          </div>

          {/* Search Card */}
          <Card
            style={{
              marginBottom: 40,
              borderRadius: 12,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <Text strong style={{ fontSize: 16 }}>
                  输入您的查询
                </Text>
                <TextArea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="例如：帮我找到关于 vivo X300 的用户舆情"
                  autoSize={{ minRows: 3, maxRows: 6 }}
                  style={{ marginTop: 10, fontSize: 16 }}
                  disabled={loading}
                />
              </div>

              <div>
                <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 10 }}>
                  选择平台
                </Text>
                <Space size="large">
                  <Checkbox
                    checked={platforms.includes('reddit')}
                    onChange={handlePlatformChange('reddit')}
                    disabled={loading}
                  >
                    Reddit
                  </Checkbox>
                  <Checkbox
                    checked={platforms.includes('twitter')}
                    onChange={handlePlatformChange('twitter')}
                    disabled={loading}
                  >
                    Twitter/X
                  </Checkbox>
                  <Checkbox
                    checked={platforms.includes('quora')}
                    onChange={handlePlatformChange('quora')}
                    disabled={loading}
                  >
                    Quora
                  </Checkbox>
                </Space>
              </div>

              <Button
                type="primary"
                size="large"
                icon={<SearchOutlined />}
                onClick={handleAnalyze}
                loading={loading}
                block
                style={{ height: 50, fontSize: 18 }}
              >
                {loading ? '正在分析中...' : '开始分析'}
              </Button>

              {loading && (
                <div style={{ textAlign: 'center', padding: 20 }}>
                  <Spin size="large" />
                  <Paragraph style={{ marginTop: 20, color: '#666' }}>
                    正在从多个平台采集数据并进行AI分析，请稍候...
                    <br />
                    这可能需要1-3分钟
                  </Paragraph>
                </div>
              )}
            </Space>
          </Card>

          {/* Example Queries */}
          <Card title="示例查询" style={{ marginBottom: 40 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              {examples.map((example, index) => (
                <Button
                  key={index}
                  type="link"
                  onClick={() => setQuery(example)}
                  style={{ textAlign: 'left', padding: 0 }}
                >
                  {example}
                </Button>
              ))}
            </Space>
          </Card>

          {/* Features */}
          <Row gutter={[24, 24]}>
            <Col xs={24} md={8}>
              <Card>
                <Space direction="vertical" align="center" style={{ width: '100%' }}>
                  <GlobalOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                  <Title level={4}>多平台采集</Title>
                  <Paragraph style={{ textAlign: 'center' }}>
                    支持Reddit、Twitter、Quora等主流海外社交平台
                  </Paragraph>
                </Space>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card>
                <Space direction="vertical" align="center" style={{ width: '100%' }}>
                  <BarChartOutlined style={{ fontSize: 48, color: '#52c41a' }} />
                  <Title level={4}>AI智能分析</Title>
                  <Paragraph style={{ textAlign: 'center' }}>
                    使用先进的NLP技术进行情感分析和观点提取
                  </Paragraph>
                </Space>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card>
                <Space direction="vertical" align="center" style={{ width: '100%' }}>
                  <RocketOutlined style={{ fontSize: 48, color: '#fa8c16' }} />
                  <Title level={4}>快速洞察</Title>
                  <Paragraph style={{ textAlign: 'center' }}>
                    一键生成可视化报告，快速了解产品舆情
                  </Paragraph>
                </Space>
              </Card>
            </Col>
          </Row>
        </div>
      </Content>

      <Footer style={{ textAlign: 'center', background: '#f0f2f5' }}>
        Hardware Insight © 2024 - AI硬件舆情分析平台
      </Footer>
    </Layout>
  );
};

export default HomePage;
