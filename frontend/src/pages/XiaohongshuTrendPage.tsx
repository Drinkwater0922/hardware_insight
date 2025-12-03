import React, { useState } from 'react';
import {
  Input,
  Button,
  Card,
  Space,
  Typography,
  Tag,
  Spin,
  Alert,
  Divider,
  List,
  Progress,
  Collapse,
  Badge,
  Empty,
  Statistic,
  Row,
  Col,
  message
} from 'antd';
import {
  SearchOutlined,
  FireOutlined,
  BulbOutlined,
  TrophyOutlined,
  TagsOutlined,
  RiseOutlined,
  ThunderboltOutlined,
  StarOutlined,
  HeartOutlined,
  CommentOutlined
} from '@ant-design/icons';
import axios from 'axios';
import './XiaohongshuTrendPage.css';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Panel } = Collapse;

interface TrendAnalysisResult {
  id: number;
  topic: string;
  trend_analysis: any;
  creator_advice: any;
  created_at: string;
}

const XiaohongshuTrendPage: React.FC = () => {
  const [topic, setTopic] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<TrendAnalysisResult | null>(null);
  const [error, setError] = useState<string>('');

  // 热门领域示例
  const exampleTopics = [
    '智能手表',
    'AI耳机',
    '降噪耳机',
    '平板电脑',
    '机械键盘',
    '智能家居'
  ];

  const handleAnalyze = async () => {
    if (!topic.trim()) {
      message.warning('请输入要分析的热点领域');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await axios.post('/api/xiaohongshu/analyze-trend', {
        topic: topic.trim(),
        max_posts: 50,
        sort_by: 'hot',
        use_ai: true
      });

      setResult(response.data);
      message.success('分析完成！');
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || '分析失败，请重试';
      setError(errorMsg);
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (exampleTopic: string) => {
    setTopic(exampleTopic);
  };

  const renderSearchSection = () => (
    <Card className="search-card">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div className="search-header">
          <Title level={3} style={{ margin: 0 }}>
            <FireOutlined style={{ color: '#ff4d4f' }} /> 小红书热点分析
          </Title>
          <Text type="secondary">输入领域，获取深度创作建议</Text>
        </div>

        <Input
          size="large"
          placeholder="输入热点领域，如：智能手表、AI耳机..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onPressEnter={handleAnalyze}
          prefix={<SearchOutlined />}
          className="search-input"
        />

        <Button
          type="primary"
          size="large"
          block
          loading={loading}
          onClick={handleAnalyze}
          icon={<ThunderboltOutlined />}
          className="analyze-button"
        >
          {loading ? '分析中...' : '开始分析'}
        </Button>

        <div className="example-topics">
          <Text type="secondary" style={{ fontSize: '12px' }}>热门领域：</Text>
          <Space wrap style={{ marginTop: 8 }}>
            {exampleTopics.map((example) => (
              <Tag
                key={example}
                onClick={() => handleExampleClick(example)}
                style={{ cursor: 'pointer', fontSize: '13px', padding: '4px 12px' }}
                color="blue"
              >
                {example}
              </Tag>
            ))}
          </Space>
        </div>
      </Space>
    </Card>
  );

  const renderStatistics = () => {
    if (!result) return null;

    const { trend_analysis, creator_advice } = result;
    const stats = trend_analysis.statistics;
    const overview = creator_advice.overview;

    return (
      <Card className="statistics-card">
        <Title level={4}>
          <RiseOutlined /> 数据概览
        </Title>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Statistic
              title="总笔记数"
              value={trend_analysis.total_posts}
              suffix="篇"
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
          <Col span={12}>
            <Statistic
              title="平均点赞"
              value={stats.avg_likes}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Col>
          <Col span={12}>
            <Statistic
              title="互动率"
              value={stats.avg_engagement_rate}
              precision={2}
              suffix="%"
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col span={12}>
            <Statistic
              title="机会分数"
              value={overview.opportunity_score}
              precision={0}
              suffix="/100"
              valueStyle={{ color: '#faad14' }}
            />
          </Col>
        </Row>
        <Divider />
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>竞争程度：</Text>
            <Tag color={
              overview.competition_level === '低' ? 'green' :
              overview.competition_level === '中' ? 'orange' : 'red'
            }>
              {overview.competition_level}
            </Tag>
          </div>
          <div>
            <Text strong>推荐内容类型：</Text>
            <Tag color="blue">{overview.recommended_content_type}</Tag>
          </div>
        </Space>
      </Card>
    );
  };

  const renderHotTags = () => {
    if (!result) return null;

    const hotTags = result.trend_analysis.hot_tags.slice(0, 15);

    return (
      <Card className="hot-tags-card">
        <Title level={4}>
          <TagsOutlined /> 热门标签 TOP15
        </Title>
        <Space wrap>
          {hotTags.map((tag: any, index: number) => (
            <Badge
              key={index}
              count={index < 3 ? index + 1 : 0}
              style={{ backgroundColor: '#ff4d4f' }}
            >
              <Tag
                color="blue"
                style={{
                  fontSize: '14px',
                  padding: '6px 12px',
                  borderRadius: '16px'
                }}
              >
                #{tag.tag} ({tag.count})
              </Tag>
            </Badge>
          ))}
        </Space>
      </Card>
    );
  };

  const renderContentSuggestions = () => {
    if (!result) return null;

    const suggestions = result.creator_advice.content_suggestions;

    return (
      <Card className="suggestions-card">
        <Title level={4}>
          <BulbOutlined /> 内容创作建议
        </Title>
        <List
          dataSource={suggestions}
          renderItem={(item: any) => (
            <List.Item>
              <Card
                size="small"
                style={{ width: '100%' }}
                className={`suggestion-item priority-${item.priority}`}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Tag color={
                      item.priority === '高' ? 'red' :
                      item.priority === '中' ? 'orange' : 'default'
                    }>
                      {item.priority}优先级
                    </Tag>
                    <Text strong style={{ fontSize: '15px' }}>{item.type}</Text>
                  </div>
                  <Text>{item.description}</Text>
                  {item.tips && item.tips.length > 0 && (
                    <div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>技巧：</Text>
                      <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                        {item.tips.map((tip: string, idx: number) => (
                          <li key={idx}>
                            <Text style={{ fontSize: '12px' }}>{tip}</Text>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {item.example_titles && item.example_titles.length > 0 && (
                    <div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>示例：</Text>
                      {item.example_titles.map((title: string, idx: number) => (
                        <div key={idx} style={{ marginTop: 4 }}>
                          <Text style={{ fontSize: '12px' }} italic>「{title}」</Text>
                        </div>
                      ))}
                    </div>
                  )}
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    预估浏览量：{item.estimated_views}
                  </Text>
                </Space>
              </Card>
            </List.Item>
          )}
        />
      </Card>
    );
  };

  const renderTitleSuggestions = () => {
    if (!result) return null;

    const suggestions = result.creator_advice.title_suggestions;

    return (
      <Card className="title-suggestions-card">
        <Title level={4}>
          <StarOutlined /> 爆款标题模板
        </Title>
        <Collapse ghost>
          {suggestions.map((item: any, index: number) => (
            <Panel
              header={
                <Space>
                  <Tag color="purple">{item.type}</Tag>
                  <Text strong>{item.template}</Text>
                </Space>
              }
              key={index}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text type="secondary">吸引力：</Text>
                  <Tag color="green">{item.appeal}</Tag>
                </div>
                <div>
                  <Text type="secondary">示例：</Text>
                  <Text copyable style={{ display: 'block', marginTop: 4 }}>
                    {item.example}
                  </Text>
                </div>
              </Space>
            </Panel>
          ))}
        </Collapse>
      </Card>
    );
  };

  const renderTagStrategy = () => {
    if (!result) return null;

    const tagSuggestions = result.creator_advice.tag_suggestions;

    return (
      <Card className="tag-strategy-card">
        <Title level={4}>
          <TagsOutlined /> 标签使用策略
        </Title>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <Text strong style={{ color: '#ff4d4f' }}>必用标签：</Text>
            <div style={{ marginTop: 8 }}>
              <Space wrap>
                {tagSuggestions.must_use.map((tag: string, idx: number) => (
                  <Tag key={idx} color="red" style={{ fontSize: '13px' }}>
                    #{tag}
                  </Tag>
                ))}
              </Space>
            </div>
          </div>

          <div>
            <Text strong style={{ color: '#1890ff' }}>推荐标签：</Text>
            <div style={{ marginTop: 8 }}>
              <Space wrap>
                {tagSuggestions.recommended.map((tag: string, idx: number) => (
                  <Tag key={idx} color="blue" style={{ fontSize: '13px' }}>
                    #{tag}
                  </Tag>
                ))}
              </Space>
            </div>
          </div>

          <div>
            <Text strong style={{ color: '#52c41a' }}>小众标签：</Text>
            <div style={{ marginTop: 8 }}>
              <Space wrap>
                {tagSuggestions.niche.map((tag: string, idx: number) => (
                  <Tag key={idx} color="green" style={{ fontSize: '13px' }}>
                    #{tag}
                  </Tag>
                ))}
              </Space>
            </div>
          </div>

          <Divider />

          <Alert
            message="标签使用建议"
            description={
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {tagSuggestions.tag_strategy.tips.map((tip: string, idx: number) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            }
            type="info"
            showIcon
          />
        </Space>
      </Card>
    );
  };

  const renderSuccessPrediction = () => {
    if (!result) return null;

    const prediction = result.creator_advice.success_rate_prediction;

    return (
      <Card className="success-prediction-card">
        <Title level={4}>
          <TrophyOutlined /> 成功率预测
        </Title>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Text strong style={{ fontSize: '16px' }}>综合成功率</Text>
            <Progress
              percent={prediction.overall_success_rate}
              status={
                prediction.overall_success_rate >= 70 ? 'success' :
                prediction.overall_success_rate >= 40 ? 'normal' : 'exception'
              }
              strokeColor={
                prediction.overall_success_rate >= 70 ? '#52c41a' :
                prediction.overall_success_rate >= 40 ? '#1890ff' : '#ff4d4f'
              }
            />
          </div>

          <Row gutter={16}>
            <Col span={12}>
              <Text type="secondary">竞争指数</Text>
              <Progress
                percent={prediction.competition_index}
                size="small"
                strokeColor="#ff4d4f"
              />
            </Col>
            <Col span={12}>
              <Text type="secondary">机会指数</Text>
              <Progress
                percent={prediction.opportunity_index}
                size="small"
                strokeColor="#52c41a"
              />
            </Col>
          </Row>

          <Alert
            message={prediction.recommendation}
            type={
              prediction.overall_success_rate >= 70 ? 'success' :
              prediction.overall_success_rate >= 40 ? 'info' : 'warning'
            }
            showIcon
          />

          <Row gutter={16}>
            <Col span={12}>
              <Card size="small" style={{ background: '#f6ffed' }}>
                <Text strong style={{ color: '#52c41a' }}>积极因素</Text>
                <ul style={{ margin: '8px 0 0', paddingLeft: 20 }}>
                  {prediction.factors.positive.map((factor: string, idx: number) => (
                    <li key={idx}><Text style={{ fontSize: '12px' }}>{factor}</Text></li>
                  ))}
                </ul>
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small" style={{ background: '#fff7e6' }}>
                <Text strong style={{ color: '#faad14' }}>注意事项</Text>
                <ul style={{ margin: '8px 0 0', paddingLeft: 20 }}>
                  {prediction.factors.negative.map((factor: string, idx: number) => (
                    <li key={idx}><Text style={{ fontSize: '12px' }}>{factor}</Text></li>
                  ))}
                </ul>
              </Card>
            </Col>
          </Row>
        </Space>
      </Card>
    );
  };

  const renderAIInsights = () => {
    if (!result || !result.creator_advice.ai_insights) return null;

    return (
      <Card className="ai-insights-card">
        <Title level={4}>
          <BulbOutlined /> AI深度洞察
        </Title>
        <Paragraph style={{ whiteSpace: 'pre-wrap', fontSize: '14px' }}>
          {result.creator_advice.ai_insights}
        </Paragraph>
      </Card>
    );
  };

  return (
    <div className="xiaohongshu-trend-page">
      <div className="page-container">
        {renderSearchSection()}

        {error && (
          <Alert
            message="分析失败"
            description={error}
            type="error"
            showIcon
            closable
            style={{ marginTop: 16 }}
          />
        )}

        {loading && (
          <Card style={{ marginTop: 16, textAlign: 'center' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>
              <Text>正在分析 "{topic}" 的热点趋势...</Text>
            </div>
          </Card>
        )}

        {result && !loading && (
          <div className="result-section">
            {renderStatistics()}
            {renderHotTags()}
            {renderContentSuggestions()}
            {renderTitleSuggestions()}
            {renderTagStrategy()}
            {renderSuccessPrediction()}
            {renderAIInsights()}
          </div>
        )}

        {!result && !loading && !error && (
          <Card style={{ marginTop: 16 }}>
            <Empty
              description="输入热点领域，开始分析"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </Card>
        )}
      </div>
    </div>
  );
};

export default XiaohongshuTrendPage;
