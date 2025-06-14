import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAI } from '../contexts/AIContext';
import {
  PaperClipIcon,
  MicrophoneIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  DocumentTextIcon,
  ChartBarIcon,
  LightBulbIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import { useDropzone } from 'react-dropzone';
import ReactMarkdown from 'react-markdown';

export default function AIAssistant() {
  const {
    messages,
    isTyping,
    sendMessage,
    clearChat,
    isListening,
    startListening,
    stopListening,
    insights,
    recommendations,
    refreshInsights,
  } = useAI();

  const [input, setInput] = useState('');
  const [showInsights, setShowInsights] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    refreshInsights();
    const interval = setInterval(refreshInsights, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [refreshInsights]);

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input);
      setInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    onDrop: (acceptedFiles) => {
      // Handle file upload for analysis
      console.log('Files dropped:', acceptedFiles);
    },
  });

  return (
    <div className="h-[calc(100vh-64px)] flex">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-purple-600 rounded-lg flex items-center justify-center">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Assistente IA</h1>
                <p className="text-sm text-gray-500">Análise inteligente e insights em tempo real</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={clearChat}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Limpar Chat
              </button>
              <button
                onClick={() => setShowInsights(!showInsights)}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {showInsights ? 'Ocultar' : 'Mostrar'} Insights
              </button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50 px-6 py-4">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-900'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <ReactMarkdown className="prose prose-sm max-w-none">
                      {message.content}
                    </ReactMarkdown>
                  ) : (
                    <p className="text-sm">{message.content}</p>
                  )}
                  {message.metadata?.suggestions && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs font-medium mb-2">Sugestões:</p>
                      <div className="space-y-1">
                        {message.metadata.suggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => setInput(suggestion)}
                            className="block w-full text-left text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-white/70' : 'text-gray-500'}`}>
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </motion.div>
            ))}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-white border border-gray-200 rounded-lg px-4 py-3">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 px-6 py-4">
          <div {...getRootProps()} className="max-w-3xl mx-auto">
            <input {...getInputProps()} />
            {isDragActive && (
              <div className="absolute inset-0 bg-primary-50 bg-opacity-90 flex items-center justify-center z-10">
                <p className="text-primary-600 font-medium">Solte o arquivo aqui para análise...</p>
              </div>
            )}
            <div className="flex items-end space-x-3">
              <button className="text-gray-500 hover:text-gray-700">
                <PaperClipIcon className="w-5 h-5" />
              </button>
              <div className="flex-1">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite sua pergunta ou peça uma análise..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  rows={1}
                  style={{ minHeight: '44px', maxHeight: '120px' }}
                />
              </div>
              <button
                onClick={() => (isListening ? stopListening() : startListening())}
                className={`p-2 rounded-lg transition-colors ${
                  isListening
                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <MicrophoneIcon className="w-5 h-5" />
              </button>
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className={`p-2 rounded-lg transition-colors ${
                  input.trim()
                    ? 'bg-primary-600 text-white hover:bg-primary-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <PaperAirplaneIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Insights Sidebar */}
      <AnimatePresence>
        {showInsights && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 384, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="bg-white border-l border-gray-200 overflow-hidden"
          >
            <div className="w-96 h-full overflow-y-auto">
              <div className="p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Insights em Tempo Real</h2>

                {/* Quick Actions */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Ações Rápidas</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => sendMessage('Analise as vendas do último mês')}
                      className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700"
                    >
                      <ChartBarIcon className="w-4 h-4" />
                      <span>Análise de Vendas</span>
                    </button>
                    <button
                      onClick={() => sendMessage('Gere um relatório de performance')}
                      className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700"
                    >
                      <DocumentTextIcon className="w-4 h-4" />
                      <span>Relatório</span>
                    </button>
                    <button
                      onClick={() => sendMessage('Quais são as tendências atuais?')}
                      className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700"
                    >
                      <ArrowTrendingUpIcon className="w-4 h-4" />
                      <span>Tendências</span>
                    </button>
                    <button
                      onClick={() => sendMessage('Sugestões de melhorias')}
                      className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700"
                    >
                      <LightBulbIcon className="w-4 h-4" />
                      <span>Sugestões</span>
                    </button>
                  </div>
                </div>

                {/* Latest Insights */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Últimos Insights</h3>
                  <div className="space-y-3">
                    {insights.slice(0, 3).map((insight) => (
                      <div
                        key={insight.id}
                        className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                        onClick={() => sendMessage(`Me conte mais sobre: ${insight.title}`)}
                      >
                        <div className="flex items-start justify-between">
                          <h4 className="text-sm font-medium text-gray-900">{insight.title}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            insight.impact === 'high'
                              ? 'bg-red-100 text-red-700'
                              : insight.impact === 'medium'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {insight.impact === 'high' ? 'Alto' : insight.impact === 'medium' ? 'Médio' : 'Baixo'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{insight.description}</p>
                        {insight.metric && (
                          <div className="mt-2 flex items-center space-x-1">
                            <span className="text-lg font-bold text-gray-900">
                              {insight.metric.value}
                              {insight.metric.unit}
                            </span>
                            <span className={`text-xs ${
                              insight.metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {insight.metric.trend === 'up' ? '↑' : '↓'}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Recomendações</h3>
                  <div className="space-y-3">
                    {recommendations.slice(0, 2).map((rec) => (
                      <div
                        key={rec.id}
                        className="p-3 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100"
                        onClick={() => sendMessage(`Como implementar: ${rec.title}`)}
                      >
                        <h4 className="text-sm font-medium text-blue-900">{rec.title}</h4>
                        <p className="text-xs text-blue-700 mt-1">{rec.description}</p>
                        {rec.estimatedImpact && (
                          <p className="text-xs text-blue-600 mt-2">
                            Impacto estimado: {rec.estimatedImpact}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 