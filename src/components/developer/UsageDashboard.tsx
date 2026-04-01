'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
}

interface UsageDashboardProps {
  apiKeys: ApiKey[];
  userId: string;
}

interface UsageData {
  summary: {
    totalRequests: number;
    uniqueEndpoints: number;
    averageRequestsPerHour: number;
    peakHour: string;
  };
  byDay: Array<{
    date: string;
    requests: number;
    successRate: number;
  }>;
  byEndpoint: Array<{
    endpoint: string;
    requests: number;
    percentage: number;
  }>;
  byHour: Array<{
    hour: string;
    requests: number;
  }>;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#6366f1', '#f97316'];

export default function UsageDashboard({ apiKeys, userId }: UsageDashboardProps) {
  const [selectedKeyId, setSelectedKeyId] = useState<string>(apiKeys[0]?.id || '');
  const [days, setDays] = useState(7);
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!selectedKeyId) return;
    
    const fetchUsage = async () => {
      setLoading(true);
      setError('');
      
      try {
        const response = await fetch(
          `/api/v1/usage?apiKeyId=${selectedKeyId}&days=${days}&groupBy=day`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch usage data');
        }
        
        const data = await response.json();
        setUsageData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsage();
  }, [selectedKeyId, days]);

  const handleExportCSV = () => {
    if (!usageData) return;
    
    const csv = [
      ['Date', 'Requests', 'Success Rate'],
      ...usageData.byDay.map((day) => [
        day.date,
        day.requests.toString(),
        `${day.successRate.toFixed(2)}%`,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `api-usage-${selectedKeyId}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
          <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-slate-600 dark:text-slate-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Usage Analytics
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Monitor API usage across all your endpoints
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            API Key
          </label>
          <select
            value={selectedKeyId}
            onChange={(e) => setSelectedKeyId(e.target.value)}
            className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
          >
            {apiKeys.map((key) => (
              <option key={key.id} value={key.id}>
                {key.name} ({key.keyPrefix}...)
              </option>
            ))}
          </select>
        </div>
        <div className="w-48">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Time Range
          </label>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
          >
            <option value={1}>Last 24 hours</option>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>
      </div>

      {usageData && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                Total Requests
              </div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {usageData.summary.totalRequests.toLocaleString()}
              </div>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="text-sm font-medium text-purple-900 dark:text-purple-100 mb-1">
                Unique Endpoints
              </div>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {usageData.summary.uniqueEndpoints}
              </div>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <div className="text-sm font-medium text-emerald-900 dark:text-emerald-100 mb-1">
                Avg Requests/Hour
              </div>
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {usageData.summary.averageRequestsPerHour.toFixed(1)}
              </div>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="text-sm font-medium text-orange-900 dark:text-orange-100 mb-1">
                Peak Hour
              </div>
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {usageData.summary.peakHour}
              </div>
            </div>
          </div>

          {/* Requests Over Time Chart */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Requests Over Time
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={usageData.byDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} />
                <XAxis 
                  dataKey="date" 
                  stroke="#64748b"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#64748b"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="requests" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Requests"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Endpoint Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pie Chart */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Requests by Endpoint
              </h3>
              {usageData.byEndpoint.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={usageData.byEndpoint}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }: any) => `${name} (${(percent * 100).toFixed(1)}%)`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="requests"
                      nameKey="endpoint"
                    >
                      {usageData.byEndpoint.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                  No endpoint data available
                </div>
              )}
            </div>

            {/* Bar Chart */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Top Endpoints
              </h3>
              {usageData.byEndpoint.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={usageData.byEndpoint.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} />
                    <XAxis 
                      dataKey="endpoint" 
                      stroke="#64748b"
                      style={{ fontSize: '12px' }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      stroke="#64748b"
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                    <Bar dataKey="requests" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                  No endpoint data available
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
