import axios from 'axios';
import type { AnalysisQuery, AnalysisReport, ReportListItem, PlatformStats } from '../types';

const api = axios.create({
  baseURL: '/api',
  timeout: 300000, // 5 minutes for scraping
});

export const sentimentApi = {
  // 分析产品舆情
  analyze: async (query: AnalysisQuery) => {
    const response = await api.post('/sentiment/analyze', query);
    return response.data;
  },

  // 获取报告详情
  getReport: async (reportId: number): Promise<AnalysisReport> => {
    const response = await api.get(`/sentiment/reports/${reportId}`);
    return response.data;
  },

  // 获取报告列表
  listReports: async (skip = 0, limit = 20): Promise<ReportListItem[]> => {
    const response = await api.get('/sentiment/reports', {
      params: { skip, limit },
    });
    return response.data;
  },

  // 获取平台统计
  getPlatformStats: async (productName: string): Promise<PlatformStats[]> => {
    const response = await api.get('/sentiment/stats/platforms', {
      params: { product_name: productName },
    });
    return response.data;
  },
};

export default api;
