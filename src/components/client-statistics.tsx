"use client";

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { Scale, Ruler, Activity, TrendingDown, Target } from 'lucide-react';

interface ClientStatisticsProps {
  client: any;
}

export function ClientStatistics({ client }: ClientStatisticsProps) {
  if (!client.measurements || client.measurements.length === 0) {
    return (
      <div className="bg-white border border-[rgba(47,44,40,0.08)] p-12 text-center">
        <Activity size={48} className="text-[var(--muted)] opacity-20 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-[var(--ink)]">Yeterli Veri Yok</h3>
        <p className="text-sm text-[var(--muted)] max-w-xs mx-auto mt-2">
          İstatistiklerin oluşması için en az iki farklı tarihte ölçüm girilmiş olması gerekmektedir.
        </p>
      </div>
    );
  }

  // Veriyi grafik için hazırla (Tarihe göre eskiden yeniye)
  const chartData = [...client.measurements]
    .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime())
    .map(m => ({
      id: m.id, // Benzersiz anahtar
      name: m.date,
      kilo: m.weight,
      bel: m.waist,
      kalca: m.hip,
      vki: parseFloat(((m.weight) / (Math.pow(client.heightCm / 100, 2))).toFixed(1))
    }));

  const latest = client.measurements[0];
  const first = client.measurements[client.measurements.length - 1];
  const totalLoss = (first.weight - latest.weight).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Özet İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[rgba(47,44,40,0.08)] p-5">
          <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--muted)] mb-1">Toplam Değişim</p>
          <div className="flex items-end gap-2">
            <span className={`text-2xl font-bold ${parseFloat(totalLoss) >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {parseFloat(totalLoss) > 0 ? '-' : ''}{Math.abs(parseFloat(totalLoss))} kg
            </span>
            <TrendingDown size={18} className="text-emerald-500 mb-1" />
          </div>
        </div>
        <div className="bg-white border border-[rgba(47,44,40,0.08)] p-5">
          <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--muted)] mb-1">Güncel Bel</p>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold text-[var(--ink)]">{latest.waist || '—'} cm</span>
            <Ruler size={18} className="text-blue-500 mb-1" />
          </div>
        </div>
        <div className="bg-white border border-[rgba(47,44,40,0.08)] p-5">
          <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--muted)] mb-1">Güncel VKI</p>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold text-[var(--accent)]">
              {latest.weight ? ((latest.weight) / (Math.pow(client.heightCm / 100, 2))).toFixed(1) : '—'}
            </span>
            <Activity size={18} className="text-[var(--accent)] mb-1" />
          </div>
        </div>
        <div className="bg-white border border-[rgba(47,44,40,0.08)] p-5">
          <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--muted)] mb-1">Hedef Kilo</p>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold text-amber-600">{client.anamnesis?.target_weight || '—'} kg</span>
            <Target size={18} className="text-amber-500 mb-1" />
          </div>
        </div>
      </div>

      {/* Ana Kilo Grafiği */}
      <div className="bg-white border border-[rgba(47,44,40,0.08)] p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h4 className="text-sm font-bold text-[var(--ink)]">Ayrıntılı Kilo Takibi</h4>
            <p className="text-xs text-[var(--muted)]">Süreç içerisindeki kilo değişimi grafiği</p>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest">
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[var(--accent)] rounded-full" />
                <span>Kilo (kg)</span>
             </div>
          </div>
        </div>
        
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorKilo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
              <XAxis 
                dataKey="id" 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 10, fill: '#9ca3af'}}
                dy={10}
                tickFormatter={(id) => chartData.find(d => d.id === id)?.name || ''}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 10, fill: '#9ca3af'}}
                domain={['dataMin - 5', 'dataMax + 5']}
              />
              <Tooltip 
                cursor={{ stroke: 'var(--accent)', strokeWidth: 1 }}
                labelFormatter={(id) => chartData.find(d => d.id === id)?.name || ''}
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              />
              <Area 
                type="linear" 
                dataKey="kilo" 
                stroke="var(--accent)" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorKilo)" 
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bel & Kalça Karşılaştırması */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-[rgba(47,44,40,0.08)] p-6">
          <h4 className="text-sm font-bold text-[var(--ink)] mb-6">Vücut Ölçüleri (cm)</h4>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis 
                  dataKey="id" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10}} 
                  tickFormatter={(id) => chartData.find(d => d.id === id)?.name || ''}
                />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                <Tooltip 
                  labelFormatter={(id) => chartData.find(d => d.id === id)?.name || ''}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 10, paddingTop: 20 }} />
                <Line type="linear" dataKey="bel" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="linear" dataKey="kalca" stroke="#f43f5e" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-[rgba(47,44,40,0.08)] p-6">
          <h4 className="text-sm font-bold text-[var(--ink)] mb-6">VKI Analizi</h4>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis 
                  dataKey="id" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10}} 
                  tickFormatter={(id) => chartData.find(d => d.id === id)?.name || ''}
                />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                <Tooltip 
                  labelFormatter={(id) => chartData.find(d => d.id === id)?.name || ''}
                />
                <Bar dataKey="vki" fill="var(--accent)" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
