'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import io, { Socket } from 'socket.io-client';

type AlertFormData = {
  ticker: string;
  condition: 'above' | 'below';
  targetPrice: number;
  notifyEmail: boolean;
  notifySms: boolean;
};

let socket: Socket;

export default function AlertForm() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<AlertFormData>();
  const [status, setStatus] = useState<string>('');
  const [liveAlerts, setLiveAlerts] = useState<any[]>([]);
  // We'll use a mock user ID for frontend since auth might not be logged in immediately
  const mockUserId = '650e8a7c93e4f1a0b3f5c2b0';

  useEffect(() => {
    // We connect to the socket.io server which runs on the same domain
    if (!socket) {
      socket = io({ path: '/socket.io' });
    }

    socket.on('connect', () => {
      setStatus('Connected to Real-Time Alerts');
      socket.emit('join_room', mockUserId);
    });

    socket.on('alert:status', (data) => {
      console.log('Socket status:', data.message);
    });

    socket.on('alert:triggered', (data) => {
      setLiveAlerts(prev => [...prev, data]);
      // Show browser alert for immediate feedback
      alert(`[REAL-TIME ALERT] ${data.stock}: ${data.message}`);
    });

    socket.on('disconnect', () => {
      setStatus('Disconnected from real-time service');
    });

    return () => {
      socket.off('connect');
      socket.off('alert:status');
      socket.off('alert:triggered');
      socket.off('disconnect');
    };
  }, []);

  const onSubmit = async (data: AlertFormData) => {
    setStatus('Creating alert...');
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create alert');
      }

      setStatus(`Alert for ${data.ticker} created successfully!`);
      reset();
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-900 rounded-lg shadow-xl border border-gray-800 text-white">
      <h2 className="text-2xl font-bold mb-4">Stock Alerts (Premium & Free)</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Ticker (e.g. BBCA)</label>
          <input 
            {...register('ticker', { required: 'Ticker is required' })} 
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="BBCA"
          />
          {errors.ticker && <p className="text-red-500 text-sm mt-1">{errors.ticker.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Condition</label>
            <select 
              {...register('condition', { required: true })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded"
            >
              <option value="above">Above</option>
              <option value="below">Below</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Target Price</label>
            <input 
              type="number"
              {...register('targetPrice', { required: 'Target price is required', valueAsNumber: true })} 
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded"
              placeholder="5500"
            />
            {errors.targetPrice && <p className="text-red-500 text-sm mt-1">{errors.targetPrice.message}</p>}
          </div>
        </div>

        <div className="pt-2">
          <p className="font-semibold text-sm mb-2 text-yellow-400">Premium Notifications</p>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input type="checkbox" {...register('notifyEmail')} className="mr-2 rounded bg-gray-800 border-gray-700 text-blue-500 focus:ring-blue-500" />
              Email
            </label>
            <label className="flex items-center">
              <input type="checkbox" {...register('notifySms')} className="mr-2 rounded bg-gray-800 border-gray-700 text-blue-500 focus:ring-blue-500" />
              SMS
            </label>
          </div>
        </div>

        <button 
          type="submit"
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded flex justify-center items-center font-inter transition-colors"
        >
          Create Alert
        </button>
      </form>

      {status && (
        <div className="mt-4 p-3 bg-gray-800 rounded text-sm text-center">
          {status}
        </div>
      )}

      {liveAlerts.length > 0 && (
        <div className="mt-6">
          <h3 className="font-bold mb-2">Live Alert Triggers</h3>
          <ul className="space-y-2">
            {liveAlerts.map((alert, i) => (
              <li key={i} className="p-2 bg-green-900 border border-green-700 text-green-100 rounded text-sm animate-pulse">
                {alert.stock}: {alert.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
