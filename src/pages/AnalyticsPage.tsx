import React, { useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Target, Layers, FileDigit } from 'lucide-react';

export default function AnalyticsPage() {
  const { savedJobs, skippedIds, jobPool, totalFetched } = useApp();

  // 1. KPI Metrics
  const totalSaved = savedJobs.length;
  const totalSkipped = skippedIds.size;
  const totalEngaged = totalSaved + totalSkipped;
  const matchRate = totalEngaged > 0 ? ((totalSaved / totalEngaged) * 100).toFixed(1) : '0.0';
  
  const activeApplications = savedJobs.filter(
    (j) => j.status === 'applied' || j.status === 'interview' || j.status === 'offer'
  ).length;

  // 2. Funnel Distribution chart
  const funnelData = useMemo(() => {
    const counts = { saved: 0, applied: 0, interview: 0, offer: 0, rejected: 0 };
    savedJobs.forEach((job) => {
      if (counts[job.status] !== undefined) {
        counts[job.status]++;
      }
    });

    return [
      { name: 'Saved', value: counts.saved, color: 'hsl(var(--primary))' },
      { name: 'Applied', value: counts.applied, color: 'hsl(var(--info))' },
      { name: 'Interview', value: counts.interview, color: 'hsl(var(--warning))' },
      { name: 'Offer', value: counts.offer, color: 'hsl(var(--success))' },
      { name: 'Rejected', value: counts.rejected, color: 'hsl(var(--destructive))' },
    ].filter(i => i.value > 0);
  }, [savedJobs]);


  return (
    <div className="min-h-screen bg-background pb-24 pt-4 px-4 overflow-y-auto">
      <div className="mb-6 z-10 sticky top-0 bg-background/80 py-2 backdrop-blur-md">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Analytics
        </h1>
        <p className="text-sm text-muted-foreground">Track your job search progress</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card className="glass border-none">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" /> Processed
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{totalFetched}</div>
            <p className="text-xs text-muted-foreground mt-1">Jobs fetched</p>
          </CardContent>
        </Card>
        
        <Card className="glass border-none">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="w-4 h-4 text-accent" /> Match Rate
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{matchRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">Saved vs Skipped</p>
          </CardContent>
        </Card>

        <Card className="glass border-none">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileDigit className="w-4 h-4 text-info" /> Applications
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{activeApplications}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently active</p>
          </CardContent>
        </Card>

        <Card className="glass border-none">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4 text-success" /> Swipes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{totalEngaged}</div>
            <p className="text-xs text-muted-foreground mt-1">Total interactions</p>
          </CardContent>
        </Card>
      </div>

      {funnelData.length > 0 && (
        <Card className="glass border-none mb-6">
          <CardHeader>
            <CardTitle className="text-base">Application Funnel</CardTitle>
            <CardDescription>Track your saved jobs status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={funnelData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {funnelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', background: 'hsl(var(--card))', color: 'hsl(var(--card-foreground))' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Custom Legend */}
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              {funnelData.map((entry, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-xs">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-muted-foreground">{entry.name} ({entry.value})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
