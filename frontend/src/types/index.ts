export interface AnalysisQuery {
  query: string;
  platforms?: string[];
  max_results?: number;
  language?: string;
}

export interface SentimentSummary {
  total_posts: number;
  positive_count: number;
  negative_count: number;
  neutral_count: number;
  avg_sentiment_score: number;
  avg_post_score: number;
  platform_distribution: Record<string, number>;
}

export interface SentimentPost {
  id: number;
  platform: string;
  title?: string;
  content: string;
  author?: string;
  score: number;
  sentiment_label: string;
  sentiment_score: number;
  post_url?: string;
}

export interface AnalysisReport {
  id: number;
  query: string;
  product_name?: string;
  summary: SentimentSummary;
  top_positive_points: string[];
  top_negative_points: string[];
  trending_topics: string[];
  sentiment_trend?: any;
  full_report?: string;
  posts: SentimentPost[];
  created_at: string;
}

export interface ReportListItem {
  id: number;
  query: string;
  product_name?: string;
  total_posts: number;
  avg_sentiment_score: number;
  created_at: string;
}

export interface PlatformStats {
  platform: string;
  total_posts: number;
  avg_sentiment: number;
  positive_ratio: number;
  negative_ratio: number;
  neutral_ratio: number;
}
