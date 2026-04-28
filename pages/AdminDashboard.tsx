import React from 'react';
import PortalLayout from '../components/PortalLayout';
import { 
  FolderKanban, 
  Users, 
  ReceiptText, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../src/components/ui/card';
import { Button } from '../src/components/ui/button';
import { cn } from '../src/lib/utils';

const AdminDashboard: React.FC = () => {
  const stats = [
    { label: 'Active Projects', value: '12', icon: FolderKanban, trend: '+2 this month', trendType: 'up' },
    { label: 'New Leads', value: '48', icon: Users, trend: '+15% from last week', trendType: 'up' },
    { label: 'Total Revenue', value: '$45,200', icon: ReceiptText, trend: '+8.2% vs last month', trendType: 'up' },
    { label: 'Avg. ROI', value: '340%', icon: TrendingUp, trend: '+12% optimized', trendType: 'up' },
  ];

  const recentProjects = [
    { id: '1', name: 'Global Brand Refresh', client: 'Acme Corp', status: 'In Progress', progress: 65 },
    { id: '2', name: 'AI Chatbot Integration', client: 'Z-Tech Solutions', status: 'In Progress', progress: 30 },
    { id: '3', name: 'SEO Strategy V2', client: 'Nova Digital', status: 'Completed', progress: 100 },
    { id: '4', name: 'Social Media Campaign', client: 'E-Shop Global', status: 'Review', progress: 90 },
  ];

  return (
    <PortalLayout type="admin">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="bg-black border-white/10 hover:border-red-600/50 transition-colors group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[10px] font-mono uppercase tracking-widest text-gray-500">{stat.label}</CardTitle>
              <stat.icon size={16} className="text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tighter mb-1">{stat.value}</div>
              <div className="flex items-center space-x-1">
                {stat.trendType === 'up' ? <ArrowUpRight size={12} className="text-green-500" /> : <ArrowDownRight size={12} className="text-red-500" />}
                <span className="text-[10px] text-gray-500 font-mono">{stat.trend}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 bg-black border-white/10">
          <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-4">
            <CardTitle className="text-xs uppercase tracking-widest flex items-center">
              <Clock size={14} className="mr-2 text-red-600" />
              Active Projects
            </CardTitle>
            <button className="text-[10px] text-red-600 hover:underline uppercase tracking-widest font-bold">View All</button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-white/5">
              {recentProjects.map((project) => (
                <div key={project.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-gray-300">{project.name}</p>
                    <p className="text-xs text-gray-500 font-mono uppercase tracking-tighter">{project.client}</p>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-tighter",
                        project.status === 'Completed' ? "bg-green-500/10 text-green-500 border-green-500/20" : 
                        project.status === 'Review' ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" :
                        "bg-red-500/10 text-red-600 border-red-600/20"
                      )}>
                        {project.status}
                      </span>
                      <span className="text-xs font-mono text-gray-400">{project.progress}%</span>
                    </div>
                    <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-red-600 transition-all duration-500" 
                        style={{ width: `${project.progress}%` }} 
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black border-white/10">
          <CardHeader className="border-b border-white/5 pb-4">
            <CardTitle className="text-xs uppercase tracking-widest flex items-center">
              <AlertCircle size={14} className="mr-2 text-red-600" />
              Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {[
                { title: 'Project Proposal', due: 'Today, 5 PM', priority: 'High' },
                { title: 'Client Meeting', due: 'Tomorrow, 10 AM', priority: 'Medium' },
                { title: 'Social Media Assets', due: 'Feb 20', priority: 'Low' },
              ].map((item, i) => (
                <div key={i} className="flex items-start space-x-4">
                  <div className={cn(
                    "mt-1 w-2 h-2 rounded-full",
                    item.priority === 'High' ? "bg-red-600" :
                    item.priority === 'Medium' ? "bg-yellow-500" : "bg-blue-500"
                  )} />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-300">{item.title}</p>
                    <p className="text-[10px] text-gray-500 font-mono uppercase tracking-tighter">Due: {item.due}</p>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full border-white/10 text-[10px] uppercase tracking-widest font-bold h-8 mt-4">
                Schedule Tasks
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
};

export default AdminDashboard;