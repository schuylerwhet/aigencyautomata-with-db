import React from 'react';
import PortalLayout from '../components/PortalLayout';
import { 
  FolderKanban, 
  ReceiptText, 
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../src/components/ui/card';
import { Button } from '../src/components/ui/button';
import { cn } from '../src/lib/utils';

const ClientDashboard: React.FC = () => {
  const activeProjects = [
    { id: '1', name: 'Website Optimization', status: 'In Progress', nextMilestone: 'SEO Audit', dueDate: 'Feb 24', progress: 45 },
    { id: '2', name: 'Email Marketing Flow', status: 'Review', nextMilestone: 'Client Feedback', dueDate: 'Feb 19', progress: 85 },
  ];

  const recentInvoices = [
    { id: 'INV-001', amount: '$1,200', date: 'Feb 10', status: 'Paid' },
    { id: 'INV-002', amount: '$2,500', date: 'Feb 15', status: 'Pending' },
  ];

  return (
    <PortalLayout type="client">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 bg-gradient-to-r from-red-600/10 to-transparent p-8 border border-red-600/20 rounded-xl overflow-hidden relative group">
        <div className="space-y-2 relative z-10">
          <h2 className="text-2xl font-bold tracking-tighter">Welcome back, Partner.</h2>
          <p className="text-xs text-gray-500 font-mono uppercase tracking-widest leading-relaxed max-w-lg">
            All your systems are operational. Your current campaigns are seeing a 
            <span className="text-green-500 font-bold ml-1">12.5% lift</span> in conversions compared to last week.
          </p>
        </div>
        <div className="flex space-x-4 relative z-10">
          <Button variant="default" className="bg-red-600 text-white hover:bg-red-700 h-10 px-6 font-bold uppercase tracking-widest text-[10px]">
            New Request
          </Button>
          <Button variant="outline" className="border-white/10 text-white h-10 px-6 font-bold uppercase tracking-widest text-[10px]">
            Schedule Sync
          </Button>
        </div>
        <Zap size={120} className="absolute -right-8 -bottom-8 text-red-600/5 group-hover:text-red-600/10 transition-colors duration-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="bg-black border-white/10">
            <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-4">
              <CardTitle className="text-xs uppercase tracking-widest flex items-center">
                <FolderKanban size={14} className="mr-2 text-red-600" />
                Active Projects
              </CardTitle>
              <button className="text-[10px] text-red-600 hover:underline uppercase tracking-widest font-bold">Manage All</button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-white/5">
                {activeProjects.map((project) => (
                  <div key={project.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:bg-white/5 transition-colors">
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-gray-300">{project.name}</p>
                      <div className="flex items-center space-x-3 text-[10px] text-gray-500 font-mono uppercase tracking-tighter">
                        <span className="flex items-center"><Calendar size={10} className="mr-1" /> Due {project.dueDate}</span>
                        <span className="flex items-center"><Zap size={10} className="mr-1 text-red-600" /> Next: {project.nextMilestone}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 w-full sm:w-auto">
                      <div className="flex flex-col items-end space-y-1 flex-1 sm:flex-none">
                        <span className="text-[10px] font-mono text-gray-400">{project.progress}%</span>
                        <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-red-600 transition-all duration-500" 
                            style={{ width: `${project.progress}%` }} 
                          />
                        </div>
                      </div>
                      <span className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-tighter",
                        project.status === 'Completed' ? "bg-green-500/10 text-green-500 border-green-500/20" : 
                        project.status === 'Review' ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" :
                        "bg-red-500/10 text-red-600 border-red-600/20"
                      )}>
                        {project.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-black border-white/10">
              <CardHeader className="border-b border-white/5 pb-4">
                <CardTitle className="text-xs uppercase tracking-widest flex items-center">
                  <MessageSquare size={14} className="mr-2 text-red-600" />
                  Recent Communications
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {[
                    { from: 'Agent Smith', msg: 'Draft proposal uploaded for review.', time: '2h ago' },
                    { from: 'Automation Bot', msg: 'System check complete. All nodes green.', time: '5h ago' },
                  ].map((chat, i) => (
                    <div key={i} className="flex flex-col space-y-1 p-3 bg-white/5 border border-white/10 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-red-600">{chat.from}</span>
                        <span className="text-[10px] text-gray-500 font-mono uppercase">{chat.time}</span>
                      </div>
                      <p className="text-xs text-gray-300 leading-relaxed">{chat.msg}</p>
                    </div>
                  ))}
                  <Button variant="ghost" className="w-full text-[10px] uppercase tracking-widest font-bold h-8 text-gray-500 hover:text-white">
                    Open Messages
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black border-white/10">
              <CardHeader className="border-b border-white/5 pb-4">
                <CardTitle className="text-xs uppercase tracking-widest flex items-center">
                  <FileText size={14} className="mr-2 text-red-600" />
                  Resources & Docs
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {['Service Agreement.pdf', 'Q1 Marketing Roadmap.xlsx', 'Brand Guidelines.zip'].map((doc, i) => (
                    <div key={i} className="flex items-center justify-between p-2 hover:bg-white/5 rounded transition-colors group">
                      <span className="text-xs text-gray-400 group-hover:text-gray-200">{doc}</span>
                      <button className="text-[10px] text-red-600 opacity-0 group-hover:opacity-100 uppercase font-bold transition-opacity">Download</button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-8">
          <Card className="bg-black border-white/10">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-xs uppercase tracking-widest flex items-center">
                <ReceiptText size={14} className="mr-2 text-red-600" />
                Invoices
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {recentInvoices.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-gray-300">{inv.id}</p>
                      <p className="text-[10px] text-gray-500 font-mono uppercase tracking-tighter">Dated: {inv.date}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-xs font-bold">{inv.amount}</p>
                      <span className={cn(
                        "text-[9px] px-1.5 py-0.5 rounded-full border uppercase tracking-widest font-bold",
                        inv.status === 'Paid' ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                      )}>
                        {inv.status}
                      </span>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full border-white/10 text-[10px] uppercase tracking-widest font-bold h-10 mt-4">
                  Invoice History
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-red-600/5 border border-red-600/20 overflow-hidden relative">
            <CardContent className="p-8 space-y-4">
              <Zap size={20} className="text-red-600" />
              <p className="text-xs font-bold tracking-tight text-gray-200">Agency Pro Support</p>
              <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest leading-relaxed">
                Unlock 24/7 dedicated Slack channel and priority system access.
              </p>
              <Button variant="default" className="bg-red-600 text-white hover:bg-red-700 w-full font-bold uppercase tracking-widest text-[9px]">
                Upgrade Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PortalLayout>
  );
};

export default ClientDashboard;