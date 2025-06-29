import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  MessageSquare, 
  Users, 
  TrendingUp, 
  Clock, 
  Smile, 
  Frown, 
  Meh,
  Activity,
  Zap,
  Target
} from 'lucide-react';

interface ChatbotAnalytics {
  totalConversations: number;
  activeSessions: number;
  averageResponseTime: number;
  satisfactionRate: number;
  escalationRate: number;
  intentDistribution: Array<{ intent: string; count: number; percentage: number }>;
  sentimentTrend: Array<{ date: string; positive: number; negative: number; neutral: number }>;
  hourlyActivity: Array<{ hour: number; conversations: number }>;
  topIntents: Array<{ intent: string; count: number }>;
  userExperience: {
    beginner: number;
    intermediate: number;
    expert: number;
  };
  performanceMetrics: {
    accuracy: number;
    resolutionRate: number;
    avgSessionDuration: number;
    messagesPerSession: number;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const ChatbotAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<ChatbotAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('24h');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockAnalytics: ChatbotAnalytics = {
        totalConversations: 1247,
        activeSessions: 23,
        averageResponseTime: 2.3,
        satisfactionRate: 87.5,
        escalationRate: 12.3,
        intentDistribution: [
          { intent: 'product_inquiry', count: 456, percentage: 36.6 },
          { intent: 'care_advice', count: 234, percentage: 18.8 },
          { intent: 'order_support', count: 189, percentage: 15.2 },
          { intent: 'greeting', count: 156, percentage: 12.5 },
          { intent: 'company_info', count: 98, percentage: 7.9 },
          { intent: 'other', count: 114, percentage: 9.1 }
        ],
        sentimentTrend: [
          { date: '00:00', positive: 45, negative: 12, neutral: 23 },
          { date: '04:00', positive: 38, negative: 8, neutral: 18 },
          { date: '08:00', positive: 67, negative: 15, neutral: 28 },
          { date: '12:00', positive: 89, negative: 22, neutral: 34 },
          { date: '16:00', positive: 76, negative: 18, neutral: 31 },
          { date: '20:00', positive: 52, negative: 14, neutral: 25 }
        ],
        hourlyActivity: [
          { hour: 0, conversations: 12 }, { hour: 1, conversations: 8 },
          { hour: 2, conversations: 5 }, { hour: 3, conversations: 3 },
          { hour: 4, conversations: 4 }, { hour: 5, conversations: 6 },
          { hour: 6, conversations: 15 }, { hour: 7, conversations: 28 },
          { hour: 8, conversations: 45 }, { hour: 9, conversations: 67 },
          { hour: 10, conversations: 89 }, { hour: 11, conversations: 92 },
          { hour: 12, conversations: 78 }, { hour: 13, conversations: 85 },
          { hour: 14, conversations: 91 }, { hour: 15, conversations: 88 },
          { hour: 16, conversations: 76 }, { hour: 17, conversations: 65 },
          { hour: 18, conversations: 52 }, { hour: 19, conversations: 38 },
          { hour: 20, conversations: 29 }, { hour: 21, conversations: 22 },
          { hour: 22, conversations: 18 }, { hour: 23, conversations: 14 }
        ],
        topIntents: [
          { intent: 'product_inquiry', count: 456 },
          { intent: 'care_advice', count: 234 },
          { intent: 'order_support', count: 189 },
          { intent: 'greeting', count: 156 },
          { intent: 'company_info', count: 98 }
        ],
        userExperience: {
          beginner: 45.2,
          intermediate: 38.7,
          expert: 16.1
        },
        performanceMetrics: {
          accuracy: 92.3,
          resolutionRate: 87.5,
          avgSessionDuration: 4.2,
          messagesPerSession: 6.8
        }
      };
      
      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Chatbot Analytics</h1>
          <p className="text-gray-600">Monitor chatbot performance and user interactions</p>
        </div>
        <div className="flex gap-2">
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              timeRange === '24h' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setTimeRange('24h')}
          >
            24h
          </button>
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              timeRange === '7d' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setTimeRange('7d')}
          >
            7d
          </button>
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              timeRange === '30d' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setTimeRange('30d')}
          >
            30d
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Conversations</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalConversations.toLocaleString()}</p>
              <p className="text-xs text-gray-500">+12% from last period</p>
            </div>
            <MessageSquare className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.activeSessions}</p>
              <p className="text-xs text-gray-500">Currently online</p>
            </div>
            <Users className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.averageResponseTime}s</p>
              <p className="text-xs text-gray-500">Target: &lt;3s</p>
            </div>
            <Clock className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Satisfaction Rate</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.satisfactionRate}%</p>
              <p className="text-xs text-gray-500">+5% from last period</p>
            </div>
            <Smile className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Intent Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Intent Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.intentDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props: any) => `${props.intent}: ${props.percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {analytics.intentDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Sentiment Trend */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sentiment Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.sentimentTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="positive" stroke="#10B981" strokeWidth={2} />
              <Line type="monotone" dataKey="negative" stroke="#EF4444" strokeWidth={2} />
              <Line type="monotone" dataKey="neutral" stroke="#6B7280" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Hourly Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hourly Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.hourlyActivity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="conversations" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Accuracy</span>
              <span className="text-lg font-semibold text-gray-900">{analytics.performanceMetrics.accuracy}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${analytics.performanceMetrics.accuracy}%` }}
              ></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Resolution Rate</span>
              <span className="text-lg font-semibold text-gray-900">{analytics.performanceMetrics.resolutionRate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ width: `${analytics.performanceMetrics.resolutionRate}%` }}
              ></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Avg Session Duration</span>
              <span className="text-lg font-semibold text-gray-900">{analytics.performanceMetrics.avgSessionDuration}m</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Messages per Session</span>
              <span className="text-lg font-semibold text-gray-900">{analytics.performanceMetrics.messagesPerSession}</span>
            </div>
          </div>
        </div>
      </div>

      {/* User Experience Distribution */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">User Experience Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{analytics.userExperience.beginner}%</div>
            <div className="text-sm text-gray-600">Beginner</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{analytics.userExperience.intermediate}%</div>
            <div className="text-sm text-gray-600">Intermediate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{analytics.userExperience.expert}%</div>
            <div className="text-sm text-gray-600">Expert</div>
          </div>
        </div>
      </div>
    </div>
  );
}; 