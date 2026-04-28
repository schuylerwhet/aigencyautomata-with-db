import React, { useEffect, useState } from 'react';
import PortalLayout from '../components/PortalLayout';
import { blink } from '../src/lib/blink';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Calendar,
  User,
  Shield,
  Mail,
  Zap,
  CheckCircle2,
  AlertCircle,
  Database,
  Building2,
  Phone
} from 'lucide-react';
import { Button } from '../src/components/ui/button';
import { Input } from '../src/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../src/components/ui/card';
import { toast } from 'sonner';
import { cn } from '../src/lib/utils';
import { UserProfile } from '../src/hooks/useProfile';

interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
  bottleneck: string;
  source: string;
  created_at: string;
}

const AdminClients: React.FC = () => {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'profiles' | 'leads'>('profiles');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [profData, leadData] = await Promise.all([
        blink.db.table<UserProfile>('user_profiles').list({ orderBy: { created_at: 'desc' } }),
        blink.db.table<Lead>('leads').list({ orderBy: { created_at: 'desc' } })
      ]);
      setProfiles(profData);
      setLeads(leadData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const promoteToAdmin = async (userId: string) => {
    try {
      await blink.db.table<UserProfile>('user_profiles').update(userId, { role: 'admin' });
      toast.success('User promoted to admin');
      fetchData();
    } catch (error) {
      console.error('Error promoting user:', error);
      toast.error('Failed to promote user');
    }
  };

  const filteredProfiles = profiles.filter(p => 
    p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.display_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLeads = leads.filter(l => 
    l.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PortalLayout type="admin">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tighter">Identity Management</h2>
          <p className="text-xs text-gray-500 font-mono uppercase tracking-widest mt-1">Clients, Users, and Inbound Leads.</p>
        </div>
        
        <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
          <button 
            onClick={() => setActiveTab('profiles')}
            className={cn(
              "px-4 py-1.5 text-[10px] uppercase font-bold tracking-widest transition-all rounded-md",
              activeTab === 'profiles' ? "bg-red-600 text-white" : "text-gray-500 hover:text-white"
            )}
          >
            Users
          </button>
          <button 
            onClick={() => setActiveTab('leads')}
            className={cn(
              "px-4 py-1.5 text-[10px] uppercase font-bold tracking-widest transition-all rounded-md",
              activeTab === 'leads' ? "bg-red-600 text-white" : "text-gray-500 hover:text-white"
            )}
          >
            Leads
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <Input 
            placeholder={activeTab === 'profiles' ? "Search users by email or name..." : "Search leads by company or name..."}
            className="pl-10 bg-black border-white/10 text-sm h-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="border-white/10 text-gray-400 text-xs h-10 px-4">
          <Filter size={16} className="mr-2" /> Filter
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-10 h-10 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-[10px] font-mono uppercase text-gray-500 animate-pulse">Scanning Databases...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTab === 'profiles' ? (
            filteredProfiles.map((p) => (
              <Card key={p.user_id} className="bg-black border-white/10 hover:border-red-600/30 transition-all group overflow-hidden relative">
                <div className={cn(
                  "absolute top-0 right-0 px-3 py-1 text-[9px] uppercase font-black tracking-widest rounded-bl-lg",
                  p.role === 'admin' ? "bg-red-600 text-white" : "bg-white/10 text-gray-500"
                )}>
                  {p.role}
                </div>
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-red-600/10 border border-red-600/20 flex items-center justify-center text-red-600 font-black text-xl">
                      {p.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-gray-200">{p.display_name || 'Anonymous User'}</h3>
                      <p className="text-xs text-gray-500 font-mono truncate max-w-[150px]">{p.email}</p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-white/5">
                    <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-tighter">
                      <span className="text-gray-600">Joined</span>
                      <span className="text-gray-400">{new Date(p.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-tighter">
                      <span className="text-gray-600">User ID</span>
                      <span className="text-gray-400 truncate max-w-[120px]">{p.user_id}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <Button variant="outline" className="flex-1 border-white/10 text-[10px] h-8 uppercase font-black tracking-widest text-gray-400 hover:text-white">
                      View Activity
                    </Button>
                    {p.role !== 'admin' && (
                      <Button 
                        onClick={() => promoteToAdmin(p.user_id)}
                        className="bg-red-600 text-white h-8 px-3 text-[10px] font-black uppercase tracking-widest"
                      >
                        Promote
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            filteredLeads.map((l) => (
              <Card key={l.id} className="bg-black border-white/10 hover:border-red-600/30 transition-all group">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Zap size={12} className="text-red-600" />
                        <span className="text-[10px] uppercase font-bold tracking-widest text-red-600">Inbound Lead</span>
                      </div>
                      <h3 className="text-base font-bold text-gray-200">{l.name}</h3>
                      <p className="text-xs text-gray-500 flex items-center"><Building2 size={12} className="mr-1" /> {l.company}</p>
                    </div>
                    <button className="text-gray-600 hover:text-white"><MoreVertical size={16} /></button>
                  </div>

                  <div className="p-3 bg-red-600/5 rounded-lg border border-red-600/10">
                    <p className="text-[9px] uppercase tracking-widest text-red-600 font-bold mb-1">Main Bottleneck</p>
                    <p className="text-xs text-gray-400 line-clamp-2 italic">"{l.bottleneck || 'No bottleneck specified.'}"</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-2">
                    <div className="space-y-1">
                      <p className="text-[9px] uppercase tracking-widest text-gray-600 font-bold">Source</p>
                      <span className="text-[10px] font-mono text-gray-400">{l.source || 'Direct'}</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] uppercase tracking-widest text-gray-600 font-bold">Inbound</p>
                      <span className="text-[10px] font-mono text-gray-400">{new Date(l.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <Button 
                      onClick={() => window.open(`mailto:${l.email}`)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white h-9 text-[10px] uppercase font-black tracking-widest"
                    >
                      Contact Now
                    </Button>
                    <Button variant="outline" className="border-white/10 text-gray-400 h-9 px-3 text-[10px] font-black uppercase tracking-widest">
                      Qualify
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </PortalLayout>
  );
};

export default AdminClients;