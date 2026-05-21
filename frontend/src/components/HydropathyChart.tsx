import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';
import html2canvas from 'html2canvas';

// hydropathy chart 
interface HydropathyChartProps {
  data: { position: number; score: number }[];
  threshold: number;
}

export default function HydropathyChart({ data, threshold }: HydropathyChartProps) {
  const thresholdLabel = `Threshold (${threshold})`;

  const handleSaveImage = async () => {
    const chartNode = document.getElementById('hydropathy-chart-container');
    if (chartNode) {
      const canvas = await html2canvas(chartNode, { backgroundColor: '#ffffff', scale: 2 });
      const link = document.createElement('a');
      link.download = 'hydropathy-chart.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  return (
    <div className="relative w-full min-w-0">
      <div className="flex justify-stretch sm:justify-end mb-2">
        <button 
          onClick={handleSaveImage}
          className="w-full sm:w-auto inline-flex items-center justify-center px-3 py-2 sm:py-1.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-medium rounded-md transition-colors"
        >
          Save Chart as PNG
        </button>
      </div>
      <div id="hydropathy-chart-container" className="w-full min-w-0 h-64 sm:h-80 pt-2 bg-white rounded-lg overflow-hidden">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 16, right: 12, left: 4, bottom: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis 
              dataKey="position" 
              tick={{ fontSize: 10, fill: '#6b7280' }} 
              tickMargin={8}
              minTickGap={24}
              label={{ value: 'Amino Acid Position', position: 'insideBottom', offset: -6, fill: '#374151', fontSize: 11 }}
            />
            <YAxis 
              domain={[-5, 5]} 
              width={36}
              tick={{ fontSize: 10, fill: '#6b7280' }}
              label={{ value: 'Hydropathy Score', angle: -90, position: 'insideLeft', fill: '#374151', fontSize: 11 }}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
              labelStyle={{ fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}
              formatter={(value: number) => [`${value.toFixed(3)}`, 'Score']}
              labelFormatter={(label) => `Position: ${label}`}
            />
            <ReferenceLine
              y={threshold}
              stroke="#ef4444"
              strokeDasharray="5 5"
              label={{ position: 'insideTopRight', value: thresholdLabel, fill: '#ef4444', fontSize: 10 }}
            />
            <Line 
              type="monotone" 
              dataKey="score" 
              stroke="#0ea5e9" 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, fill: '#0284c7', stroke: '#fff', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
