import React, { useEffect, useState } from 'react';
import PortalLayout from '../components/PortalLayout';
import { blink } from '../src/lib/blink';
import { 
  ReceiptText, 
  Calendar,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  Search,
  Zap,
  LayoutDashboard,
  FileText,
  CreditCard,
  Building2
} from 'lucide-react';
import { Button } from '../src/components/ui/button';
import { Input } from '../src/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../src/components/ui/card';
import { toast } from 'sonner';
import { cn } from '../src/lib/utils';
import { useAuth } from '../src/hooks/useAuth';

interface Invoice {
  id: string;
  project_id: string;
  user_id: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  due_date: string;
  created_at: string;
}

interface Project {
  id: string;
  name: string;
}

const ClientInvoices: React.FC = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      // Security policy handles user_id filtering for client tokens
      const [invData, projData] = await Promise.all([
        blink.db.table<Invoice>('invoices').list({
          where: { user_id: user.id },
          orderBy: { created_at: 'desc' }
        }),
        blink.db.table<Project>('projects').list({
          where: { user_id: user.id }
        })
      ]);
      setInvoices(invData);
      setProjects(projData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load financial data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const filteredInvoices = invoices.filter(inv => {
    const project = projects.find(p => p.id === inv.project_id);
    return (
      inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return "bg-green-500/10 text-green-500 border-green-500/20";
      case 'overdue': return "bg-red-500/10 text-red-600 border-red-600/20";
      case 'cancelled': return "bg-gray-500/10 text-gray-500 border-gray-500/20";
      default: return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    }
  };

  return (
    <PortalLayout type="client">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tighter">Invoices</h2>
          <p className="text-xs text-gray-500 font-mono uppercase tracking-widest mt-1">Financial records and billing synchronization.</p>
        </div>
        
        <div className="relative w-full md:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <Input 
            placeholder="Search ID or project..." 
            className="pl-10 bg-black border-white/10 text-sm h-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <Card className="bg-gradient-to-br from-red-600/10 to-transparent border-red-600/20 relative group overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] uppercase tracking-widest text-gray-500 font-mono">Outstanding Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black tracking-tighter text-white mb-1">
              ${invoices.filter(i => i.status === 'pending' || i.status === 'overdue').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
            </div>
            <p className="text-[10px] text-gray-500 font-mono uppercase tracking-tighter">System sync active</p>
            <Zap size={64} className="absolute -right-4 -bottom-4 text-red-600/5 group-hover:text-red-600/10 transition-colors" />
          </CardContent>
        </Card>

        <Card className="bg-black border-white/10 group overflow-hidden relative">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] uppercase tracking-widest text-gray-500 font-mono">Paid to Date</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black tracking-tighter text-white mb-1">
              ${invoices.filter(i => i.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
            </div>
            <p className="text-[10px] text-gray-500 font-mono uppercase tracking-tighter">Total lifetime value</p>
            <CheckCircle2 size={64} className="absolute -right-4 -bottom-4 text-white/5 group-hover:text-white/10 transition-colors" />
          </CardContent>
        </Card>

        <Card className="bg-black border-white/10 group overflow-hidden relative">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] uppercase tracking-widest text-gray-500 font-mono">Agency Support</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col justify-end">
            <Button variant="outline" className="w-full border-white/10 text-white font-bold uppercase tracking-widest text-[10px] h-10 mt-2">
              Billing Inquiries
            </Button>
            <Building2 size={64} className="absolute -right-4 -bottom-4 text-white/5 group-hover:text-white/10 transition-colors" />
          </CardContent>
        </Card>
      </div>

      <Card className="bg-black border-white/10 overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5 font-mono text-[9px] uppercase tracking-widest text-gray-600 font-bold">
                  <th className="p-6">Invoice ID</th>
                  <th className="p-6">Project Context</th>
                  <th className="p-6">Amount</th>
                  <th className="p-6">Due Date</th>
                  <th className="p-6">Status</th>
                  <th className="p-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-gray-400">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="p-16 text-center font-mono uppercase tracking-widest text-gray-600 animate-pulse">Requesting Data Fragments...</td>
                  </tr>
                ) : filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-16 text-center text-gray-600">No invoicing data detected in your environment.</td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="p-6 font-mono text-gray-500 uppercase">{inv.id.slice(0, 8)}</td>
                      <td className="p-6 font-bold text-gray-300">
                        {projects.find(p => p.id === inv.project_id)?.name || 'General Services'}
                      </td>
                      <td className="p-6 font-bold text-white text-base tracking-tighter">${inv.amount.toLocaleString()}</td>
                      <td className="p-6 font-mono">{inv.due_date ? new Date(inv.due_date).toLocaleDateString() : 'N/A'}</td>
                      <td className="p-6">
                        <span className={cn(
                          "px-2 py-0.5 rounded-full border text-[9px] uppercase tracking-widest font-black",
                          getStatusColor(inv.status)
                        )}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="p-6 text-right">
                        <div className="flex items-center justify-end space-x-3">
                          <button className="text-gray-600 hover:text-white transition-colors" title="Download Statement"><Download size={16} /></button>
                          {inv.status !== 'paid' && (
                            <Button className="bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-widest text-[9px] h-8 px-4">
                              <CreditCard size={12} className="mr-2" /> Pay Now
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-6 p-6 border border-white/5 bg-white/[0.01] rounded-xl">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded bg-red-600/10 flex items-center justify-center text-red-600">
            <FileText size={20} />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">Financial Summary</p>
            <p className="text-[10px] text-gray-600 font-mono">Download your Q1 system usage statement.</p>
          </div>
        </div>
        <Button variant="ghost" className="text-[10px] uppercase font-bold tracking-widest text-red-600 hover:text-red-500 hover:bg-red-600/5 h-10 px-6">
          <Download size={14} className="mr-2" /> Export Statement
        </Button>
      </div>
    </PortalLayout>
  );
};

export default ClientInvoices;