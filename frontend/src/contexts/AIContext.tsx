import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AIMessage, AIAnalysis, AIInsight, AIRecommendation } from '../types';
import { aiService } from '../services/aiService';
import toast from 'react-hot-toast';

interface AIContextData {
  // Chat AI
  messages: AIMessage[];
  isTyping: boolean;
  sendMessage: (content: string) => Promise<void>;
  clearChat: () => void;
  
  // Analysis AI
  analyses: AIAnalysis[];
  isAnalyzing: boolean;
  analyzeData: (type: AIAnalysis['type'], data: any) => Promise<AIAnalysis>;
  generateReport: (storeId: string, period: { start: Date; end: Date }) => Promise<AIAnalysis>;
  
  // Voice Assistant
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  
  // Real-time Insights
  insights: AIInsight[];
  recommendations: AIRecommendation[];
  refreshInsights: () => Promise<void>;
}

const AIContext = createContext<AIContextData>({} as AIContextData);

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};

interface AIProviderProps {
  children: ReactNode;
}

export const AIProvider: React.FC<AIProviderProps> = ({ children }) => {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Olá! Sou seu assistente de IA do DomínioTech. Como posso ajudar você hoje? Posso analisar dados, gerar relatórios, dar sugestões de melhorias ou responder suas perguntas sobre o negócio.',
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [analyses, setAnalyses] = useState<AIAnalysis[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);

  const sendMessage = useCallback(async (content: string) => {
    try {
      // Add user message
      const userMessage: AIMessage = {
        id: Date.now().toString(),
        role: 'user',
        content,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMessage]);
      setIsTyping(true);

      // Get AI response
      const response = await aiService.chat(content, messages);
      
      const aiMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        metadata: response.metadata,
      };
      
      setMessages(prev => [...prev, aiMessage]);

      // If AI suggests actions, show them
      if (response.metadata?.suggestions?.length) {
        toast.success('Tenho algumas sugestões para você!', {
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Erro ao processar mensagem. Tente novamente.');
    } finally {
      setIsTyping(false);
    }
  }, [messages]);

  const clearChat = useCallback(() => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: 'Chat limpo! Como posso ajudar você?',
        timestamp: new Date(),
      },
    ]);
  }, []);

  const analyzeData = useCallback(async (type: AIAnalysis['type'], data: any): Promise<AIAnalysis> => {
    try {
      setIsAnalyzing(true);
      toast.loading('Analisando dados com IA...', { id: 'analyzing' });

      const analysis = await aiService.analyzeData(type, data);
      
      setAnalyses(prev => [analysis, ...prev]);
      
      toast.success('Análise concluída!', { id: 'analyzing' });
      
      // Show key insights
      if (analysis.insights.length > 0) {
        const highImpactInsights = analysis.insights.filter(i => i.impact === 'high');
        if (highImpactInsights.length > 0) {
          toast.success(
            `${highImpactInsights.length} insights de alto impacto encontrados!`,
            { duration: 5000 }
          );
        }
      }

      return analysis;
    } catch (error) {
      console.error('Error analyzing data:', error);
      toast.error('Erro ao analisar dados', { id: 'analyzing' });
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const generateReport = useCallback(async (storeId: string, period: { start: Date; end: Date }): Promise<AIAnalysis> => {
    try {
      setIsAnalyzing(true);
      toast.loading('Gerando relatório inteligente...', { id: 'report' });

      const report = await aiService.generateReport(storeId, period);
      
      setAnalyses(prev => [report, ...prev]);
      
      toast.success('Relatório gerado com sucesso!', { id: 'report' });

      return report;
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Erro ao gerar relatório', { id: 'report' });
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const startListening = useCallback(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsListening(true);
      
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = 'pt-BR';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        sendMessage(transcript);
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        toast.error('Erro ao reconhecer voz');
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      toast.error('Seu navegador não suporta reconhecimento de voz');
    }
  }, [sendMessage]);

  const stopListening = useCallback(() => {
    setIsListening(false);
  }, []);

  const refreshInsights = useCallback(async () => {
    try {
      const [newInsights, newRecommendations] = await Promise.all([
        aiService.getInsights(),
        aiService.getRecommendations(),
      ]);

      setInsights(newInsights);
      setRecommendations(newRecommendations);

      if (newInsights.some(i => i.impact === 'high')) {
        toast.success('Novos insights importantes disponíveis!');
      }
    } catch (error) {
      console.error('Error refreshing insights:', error);
    }
  }, []);

  return (
    <AIContext.Provider
      value={{
        messages,
        isTyping,
        sendMessage,
        clearChat,
        analyses,
        isAnalyzing,
        analyzeData,
        generateReport,
        isListening,
        startListening,
        stopListening,
        insights,
        recommendations,
        refreshInsights,
      }}
    >
      {children}
    </AIContext.Provider>
  );
}; 