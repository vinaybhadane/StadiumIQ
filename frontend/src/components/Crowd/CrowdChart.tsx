import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { AttendanceTrend } from '../../types';

interface CrowdChartProps {
  trends: AttendanceTrend[];
}

export const CrowdChart: React.FC<CrowdChartProps> = ({ trends }) => {
  const chartData = trends.map((item) => ({
    name: item.match_id,
    attendance: item.attendance,
    revenue: item.gate_revenue,
  }));

  return (
    <section className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-xl p-6" aria-labelledby="chart-title">
      <h3 id="chart-title" className="text-lg font-semibold text-slate-100 mb-4">
        Tournament Attendance Analysis
      </h3>

      <div className="h-64 w-full" role="img" aria-label="Line graph tracing match attendance over the tournament.">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3875f6" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#3875f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: '11px' }} />
            <YAxis stroke="#64748b" style={{ fontSize: '11px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                color: '#f8fafc',
              }}
            />
            <Area
              type="monotone"
              dataKey="attendance"
              stroke="#3875f6"
              fillOpacity={1}
              fill="url(#colorAttendance)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};
