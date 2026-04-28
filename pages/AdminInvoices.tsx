import React, { useEffect, useState } from 'react';
import PortalLayout from '../components/PortalLayout';
import { blink } from '../src/lib/blink';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Calendar,
  DollarSign,
  User,
  CheckCircle2,
  Clock,
  AlertCircle,
  ReceiptText,
  FileText,
  Download
} from 'lucide-react';
import { Button } from '../src/components/ui/button';
import { Input } from '../src/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../src/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '../src/components/ui/dialog';
import { toast } from 'sonner';
import { cn } from '../src/lib/utils';

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
  user_id: string;
}

const AdminInvoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    projectId: '',
    amount: '',
    dueDate: ''
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [invData, projData] = await Promise.all([
        blink.db.table<Invoice>('invoices').list({ orderBy: { created_at: 'desc' } }),
        blink.db.table<Project>('projects').list()
      ]);
      setInvoices(invData);
      setProjects(projData);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvoice.projectId || !newInvoice.amount) {
      toast.error('Project and Amount are required');
      return;
    }

    const project = projects.find(p => p.id === newInvoice.projectId);
    if (!project) return;

    try {
      await blink.db.table<Invoice>('invoices').create({
        project_id: newInvoice.projectId,
        user_id: project.user_id,
        amount: parseFloat(newInvoice.amount) || 0,
        status: 'pending',
        due_date: newInvoice.dueDate
      });
      toast.success('Invoice issued successfully');
      setIsCreateOpen(false);
      fetchData();
      setNewInvoice({ projectId: '', amount: '', dueDate: '' });
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error('Failed to issue invoice');
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    const project = projects.find(p => p.id === inv.project_id);
    return (
      inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.user_id.toLowerCase().includes(searchTerm.toLowerCase())
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
    <PortalLayout type="admin">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tighter">Invoices</h2>
          <p className="text-xs text-gray-500 font-mono uppercase tracking-widest mt-1">Manage billing and financial records.</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 text-white hover:bg-red-700 h-10 px-6 font-bold uppercase tracking-widest text-[10px]">
              <Plus size={16} className="mr-2" /> Issue Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-black border-white/10 text-white">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold tracking-tighter uppercase">New Billing Document</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateInvoice} className="space-y-4 py-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Select Project</label>
                <select 
                  value={newInvoice.projectId}
                  onChange={(e) => setNewInvoice({...newInvoice, projectId: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-md p-3 text-sm focus:outline-none focus:border-red-600 transition-colors"
                >
                  <option value="" className="bg-black text-gray-500">Choose a project...</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id} className="bg-black text-white">{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Amount ($)</label>
                  <Input 
                    type="number"
                    value={newInvoice.amount}
                    onChange={(e) => setNewInvoice({...newInvoice, amount: e.target.value})}
                    className="bg-white/5 border-white/10 text-sm h-10"
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Due Date</label>
                  <Input 
                    type="date"
                    value={newInvoice.dueDate}
                    onChange={(e) => setNewInvoice({...newInvoice, dueDate: e.target.value})}
                    className="bg-white/5 border-white/10 text-sm h-10"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 font-bold uppercase tracking-widest text-xs h-12 mt-4">
                Execute Invoice
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-black border-white/10">
        <CardHeader className="border-b border-white/5 pb-4 px-6 flex flex-row items-center justify-between">
          <div className="relative w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <Input 
              placeholder="Search ID, Client or Project..." 
              className="pl-8 bg-white/5 border-white/10 text-xs h-8 h-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" className="border-white/10 text-gray-400 text-[10px] h-8 px-3 uppercase font-bold tracking-widest">
              <Download size={14} className="mr-1" /> Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5">
                <th className="p-4 text-[10px] uppercase tracking-widest text-gray-600 font-bold">Invoice ID</th>
                <th className="p-4 text-[10px] uppercase tracking-widest text-gray-600 font-bold">Project</th>
                <th className="p-4 text-[10px] uppercase tracking-widest text-gray-600 font-bold">Client</th>
                <th className="p-4 text-[10px] uppercase tracking-widest text-gray-600 font-bold">Amount</th>
                <th className="p-4 text-[10px] uppercase tracking-widest text-gray-600 font-bold">Due Date</th>
                <th className="p-4 text-[10px] uppercase tracking-widest text-gray-600 font-bold">Status</th>
                <th className="p-4 text-[10px] uppercase tracking-widest text-gray-600 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-gray-400">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center font-mono uppercase tracking-widest text-gray-600 animate-pulse">Synchronizing Ledgers...</td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-gray-600">No invoicing records found.</td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-4 font-mono text-gray-500 uppercase">{inv.id.slice(0, 8)}</td>
                    <td className="p-4 font-bold text-gray-300">{projects.find(p => p.id === inv.project_id)?.name || 'Unknown'}</td>
                    <td className="p-4 font-mono">{inv.user_id.slice(0, 8)}...</td>
                    <td className="p-4 font-bold text-green-500">${inv.amount.toLocaleString()}</td>
                    <td className="p-4 font-mono">{inv.due_date ? new Date(inv.due_date).toLocaleDateString() : 'N/A'}</td>
                    <td className="p-4">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full border text-[9px] uppercase tracking-widest font-bold",
                        getStatusColor(inv.status)
                      )}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <button className="p-1 hover:text-white transition-colors" title="Download PDF"><Download size={14} /></button>
                        <button className="p-1 hover:text-white transition-colors" title="View Details"><FileText size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </PortalLayout>
  );
};

export default AdminInvoices;