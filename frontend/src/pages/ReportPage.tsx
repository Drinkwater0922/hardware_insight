import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Layout,
  Card,
  Typography,
  Space,
  Row,
  Col,
  Tag,
  List,
  Statistic,
  Button,
  Spin,
  message,
} from 'antd';
import {
  ArrowLeftOutlined,
  LikeOutlined,
  DislikeOutlined,
  MehOutlined,
  RedditOutlined,
  TwitterOutlined,
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { sentimentApi } from '../services/api';
import type { AnalysisReport } from '../types';

const { Header, Content } = Layout;
const { Title, Paragraph, Text } = Typography;

const ReportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<AnalysisReport | null>(null);

  useEffect(() => {
    loadReport();
  }, [id]);

  const loadReport = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const data = await sentimentApi.getReport(parseInt(id));
      setReport(data);
    } catch (error) {
      message.error('加载报告失败');
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (label: string) => {
    switch (label) {
      case 'positive':
        return 'green';
      case 'negative':
        return 'red';
      default:
        return 'default';
    }
  };

  const getSentimentIcon = (label: string) => {
    switch (label) {
      case 'positive':
        return <LikeOutlined />;
      case 'negative':
        return <DislikeOutlined />;
      default:
        return <MehOutlined />;
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'reddit':
        return <RedditOutlined />;
      case 'twitter':
        return <TwitterOutlined />;
      default:
        return null;
    }
  };

  const getPieChartOption = () => {
    if (!report) return {};

    const { summary } = report;
    return {
      title: {
        text: '情感分布',
        left: 'center',
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
      },
      legend: {
        orient: 'vertical',
        left: 'left',
      },
      series: [
        {
          type: 'pie',
          radius: '50%',
          data: [
            { value: summary.positive_count, name: '正面', itemStyle: { color: '#52c41a' } },
            { value: summary.negative_count, name: '负面', itemStyle: { color: '#ff4d4f' } },
            { value: summary.neutral_count, name: '中性', itemStyle: { color: '#d9d9d9' } },
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ],
    };
  };

  const getBarChartOption = () => {
    if (!report) return {};

    const { summary } = report;
    const platforms = Object.keys(summary.platform_distribution);
    const counts = Object.values(summary.platform_distribution);

    return {
      title: {
        text: '平台分布',
        left: 'center',
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      xAxis: {
        type: 'category',
        data: platforms,
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          data: counts,
          type: 'bar',
          itemStyle: {
            color: '#1890ff',
          },
        },
      ],
    };
  };

  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Content style={{ padding: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Spin size="large" />
        </Content>
      </Layout>
    );
  }

  if (!report) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Content style={{ padding: '50px' }}>
          <Card>
            <Paragraph>报告未找到</Paragraph>
            <Button onClick={() => navigate('/')}>返回首页</Button>
          </Card>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', padding: '0 50px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')}>
            返回首页
          </Button>
          <Title level={3} style={{ margin: 0 }}>
            分析报告
          </Title>
        </Space>
      </Header>

      <Content style={{ padding: '50px' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          {/* Title */}
          <Card style={{ marginBottom: 24 }}>
            <Title level={2}>{report.product_name || report.query}</Title>
            <Text type="secondary">查询: {report.query}</Text>
          </Card>

          {/* Statistics */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="总帖子数"
                  value={report.summary.total_posts}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="正面评价"
                  value={report.summary.positive_count}
                  valueStyle={{ color: '#52c41a' }}
                  prefix={<LikeOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="负面评价"
                  value={report.summary.negative_count}
                  valueStyle={{ color: '#ff4d4f' }}
                  prefix={<DislikeOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="平均情感分数"
                  value={report.summary.avg_sentiment_score}
                  precision={2}
                  valueStyle={{
                    color: report.summary.avg_sentiment_score > 0 ? '#52c41a' : '#ff4d4f',
                  }}
                />
              </Card>
            </Col>
          </Row>

          {/* Charts */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} md={12}>
              <Card>
                <ReactECharts option={getPieChartOption()} style={{ height: 400 }} />
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card>
                <ReactECharts option={getBarChartOption()} style={{ height: 400 }} />
              </Card>
            </Col>
          </Row>

          {/* Insights */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} md={12}>
              <Card title="主要优点" bordered={false}>
                <List
                  dataSource={report.top_positive_points}
                  renderItem={(item) => (
                    <List.Item>
                      <Tag color="green" icon={<LikeOutlined />}>
                        {item}
                      </Tag>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title="主要缺点" bordered={false}>
                <List
                  dataSource={report.top_negative_points}
                  renderItem={(item) => (
                    <List.Item>
                      <Tag color="red" icon={<DislikeOutlined />}>
                        {item}
                      </Tag>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>

          {/* Topics */}
          {report.trending_topics.length > 0 && (
            <Card title="热门话题" style={{ marginBottom: 24 }}>
              <Space wrap>
                {report.trending_topics.map((topic, index) => (
                  <Tag key={index} color="blue">
                    {topic}
                  </Tag>
                ))}
              </Space>
            </Card>
          )}

          {/* Full Report */}
          {report.full_report && (
            <Card title="完整报告" style={{ marginBottom: 24 }}>
              <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{report.full_report}</Paragraph>
            </Card>
          )}

          {/* Posts */}
          <Card title={`相关帖子 (${report.posts.length})`}>
            <List
              itemLayout="vertical"
              dataSource={report.posts}
              renderItem={(post) => (
                <List.Item
                  key={post.id}
                  extra={
                    <Space direction="vertical" align="end">
                      <Tag
                        color={getSentimentColor(post.sentiment_label)}
                        icon={getSentimentIcon(post.sentiment_label)}
                      >
                        {post.sentiment_label}
                      </Tag>
                      <Text type="secondary">Score: {post.sentiment_score.toFixed(2)}</Text>
                    </Space>
                  }
                >
                  <List.Item.Meta
                    avatar={getPlatformIcon(post.platform)}
                    title={
                      <Space>
                        <Tag>{post.platform}</Tag>
                        {post.title && <Text strong>{post.title}</Text>}
                      </Space>
                    }
                    description={
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Text>{post.content}</Text>
                        <Space>
                          {post.author && <Text type="secondary">By {post.author}</Text>}
                          <Text type="secondary">Upvotes: {post.score}</Text>
                          {post.post_url && (
                            <a href={post.post_url} target="_blank" rel="noopener noreferrer">
                              查看原帖
                            </a>
                          )}
                        </Space>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default ReportPage;
