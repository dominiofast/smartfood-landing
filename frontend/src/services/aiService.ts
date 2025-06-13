import api from '../api/axios';
import { AIMessage, AIAnalysis, AIInsight, AIRecommendation } from '../types';

interface ChatResponse {
  content: string;
  metadata?: {
    intent?: string;
    confidence?: number;
    suggestions?: string[];
  };
}

class AIService {
  // Chat with AI assistant
  async chat(message: string, history: AIMessage[]): Promise<ChatResponse> {
    const response = await api.post<ChatResponse>('/ai/chat', {
      message,
      history: history.slice(-10), // Send last 10 messages for context
    });
    return response.data;
  }

  // Analyze business data
  async analyzeData(type: AIAnalysis['type'], data: any): Promise<AIAnalysis> {
    const response = await api.post<{ success: boolean; data: AIAnalysis }>('/ai/analyze', {
      type,
      data,
    });
    return response.data.data;
  }

  // Generate intelligent reports
  async generateReport(storeId: string, period: { start: Date; end: Date }): Promise<AIAnalysis> {
    const response = await api.post<{ success: boolean; data: AIAnalysis }>('/ai/report', {
      storeId,
      period,
    });
    return response.data.data;
  }

  // Get real-time insights
  async getInsights(storeId?: string): Promise<AIInsight[]> {
    const response = await api.get<{ success: boolean; data: AIInsight[] }>('/ai/insights', {
      params: { storeId },
    });
    return response.data.data;
  }

  // Get AI recommendations
  async getRecommendations(storeId?: string): Promise<AIRecommendation[]> {
    const response = await api.get<{ success: boolean; data: AIRecommendation[] }>('/ai/recommendations', {
      params: { storeId },
    });
    return response.data.data;
  }

  // Analyze sales patterns
  async analyzeSalesPatterns(storeId: string, period: number = 30): Promise<AIAnalysis> {
    const response = await api.post<{ success: boolean; data: AIAnalysis }>('/ai/analyze/sales', {
      storeId,
      period,
    });
    return response.data.data;
  }

  // Predict future trends
  async predictTrends(storeId: string, metric: string): Promise<{
    predictions: Array<{ date: string; value: number; confidence: number }>;
    insights: string[];
  }> {
    const response = await api.post('/ai/predict', {
      storeId,
      metric,
    });
    return response.data.data;
  }

  // Analyze customer sentiment
  async analyzeCustomerSentiment(storeId: string): Promise<{
    overall: number;
    breakdown: { positive: number; neutral: number; negative: number };
    insights: string[];
  }> {
    const response = await api.post('/ai/sentiment', { storeId });
    return response.data.data;
  }

  // Generate menu optimization suggestions
  async optimizeMenu(storeId: string): Promise<{
    suggestions: Array<{
      item: string;
      action: 'add' | 'remove' | 'modify' | 'promote';
      reason: string;
      expectedImpact: string;
    }>;
  }> {
    const response = await api.post('/ai/optimize/menu', { storeId });
    return response.data.data;
  }

  // Analyze staff performance
  async analyzeStaffPerformance(storeId: string): Promise<AIAnalysis> {
    const response = await api.post<{ success: boolean; data: AIAnalysis }>('/ai/analyze/staff', {
      storeId,
    });
    return response.data.data;
  }

  // Generate marketing suggestions
  async generateMarketingSuggestions(storeId: string): Promise<{
    campaigns: Array<{
      type: string;
      target: string;
      message: string;
      expectedROI: number;
    }>;
    bestTimes: string[];
    insights: string[];
  }> {
    const response = await api.post('/ai/marketing/suggestions', { storeId });
    return response.data.data;
  }

  // Analyze competition
  async analyzeCompetition(storeId: string, location: { lat: number; lng: number }): Promise<{
    competitors: Array<{
      name: string;
      distance: number;
      strengths: string[];
      opportunities: string[];
    }>;
    recommendations: string[];
  }> {
    const response = await api.post('/ai/analyze/competition', { storeId, location });
    return response.data.data;
  }

  // Real-time anomaly detection
  async detectAnomalies(storeId: string, metric: string, value: number): Promise<{
    isAnomaly: boolean;
    severity: 'low' | 'medium' | 'high';
    explanation: string;
    suggestedActions: string[];
  }> {
    const response = await api.post('/ai/detect/anomaly', {
      storeId,
      metric,
      value,
    });
    return response.data.data;
  }

  // Upload and analyze documents (PDFs, images, etc.)
  async analyzeDocument(file: File, type: 'invoice' | 'receipt' | 'report' | 'other'): Promise<{
    extractedData: any;
    insights: string[];
    suggestions: string[];
  }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await api.post('/ai/analyze/document', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  }
}

export const aiService = new AIService(); 