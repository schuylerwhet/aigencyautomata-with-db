import React, { useEffect, useState } from 'react';
import PortalLayout from '../components/PortalLayout';
import { blink } from '../src/lib/blink';
import { 
  FolderKanban, 
  Calendar,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  Search,
  Zap,
  LayoutDashboard
} from 'lucide-react';
import { Button } from '../src/components/ui/button';
import { Input } from '../src/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../src/components/ui/card';
import { toast } from 'sonner';
import { cn } from '../src/lib/utils';
import { useAuth } from '../src/hooks/useAuth';

interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'review' | 'completed';
  budget: number;
  deadline: string;
  created_at: string;
}

const ClientProjects: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchProjects = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      // Security policy handles user_id filtering for client tokens
      const data = await blink.db.table<Project>('projects').list({
        where: { user_id: user.id },
        orderBy: { created_at: 'desc' }
      });
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [user]);

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 size={16} className="text-green-500" />;
      case 'in_progress': return <Clock size={16} className="text-red-600" />;
      case 'review': return <AlertCircle size={16} className="text-yellow-500" />;
      default: return <Clock size={16} className="text-gray-500" />;
    }
  };

  return (
    <PortalLayout type="client">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tighter">My Projects</h2>
          <p className="text-xs text-gray-500 font-mono uppercase tracking-widest mt-1">Real-time status of your agency assets.</p>
        </div>
        
        <div className="relative w-full md:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <Input 
            placeholder="Search your projects..." 
            className="pl-10 bg-black border-white/10 text-sm h-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-10 h-10 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-[10px] font-mono uppercase text-gray-500 animate-pulse">Requesting Status Update...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <Card className="bg-black border-white/10 overflow-hidden">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center relative">
            <FolderKanban size={48} className="text-gray-800 mb-4" />
            <p className="text-sm font-bold text-gray-400">No active projects found.</p>
            <p className="text-xs text-gray-600 mt-2 uppercase tracking-widest leading-relaxed max-w-xs">
              Reach out to your account manager to initiate your first automation sequence.
            </p>
            <Button className="mt-8 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-widest text-[10px] h-10 px-6">
              Contact Agency
            </Button>
            <Zap size={120} className="absolute -right-8 -bottom-8 text-red-600/5" />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="bg-black border-white/10 hover:border-red-600/30 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="text-gray-600 hover:text-white"><ExternalLink size={18} /></button>
              </div>
              
              <CardHeader className="border-b border-white/5 pb-4 px-6">
                <div className="flex items-center space-x-3 mb-1">
                  {getStatusIcon(project.status)}
                  <span className="text-[10px] uppercase font-bold tracking-widest text-red-600">{project.status}</span>
                </div>
                <CardTitle className="text-lg font-bold tracking-tight text-gray-200">{project.name}</CardTitle>
              </CardHeader>
              
              <CardContent className="p-6 space-y-6">
                <p className="text-xs text-gray-500 leading-relaxed min-h-[40px]">
                  {project.description || 'System synchronization in progress...'}
                </p>

                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-mono uppercase text-gray-600 tracking-widest">Delivery Progress</span>
                    <span className="text-xs font-mono text-gray-400">
                      {project.status === 'completed' ? '100%' : project.status === 'review' ? '90%' : project.status === 'in_progress' ? '45%' : '0%'}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-600 transition-all duration-1000" 
                      style={{ width: project.status === 'completed' ? '100%' : project.status === 'review' ? '90%' : project.status === 'in_progress' ? '45%' : '0%' }} 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/5">
                  <div className="space-y-1">
                    <p className="text-[9px] uppercase tracking-widest text-gray-700 font-bold">Launch Date</p>
                    <div className="flex items-center text-[10px] font-mono text-gray-500">
                      <Calendar size={12} className="mr-1.5" /> {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'TBD'}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] uppercase tracking-widest text-gray-700 font-bold">Project ID</p>
                    <div className="flex items-center text-[10px] font-mono text-gray-500">
                      <LayoutDashboard size={12} className="mr-1.5" /> {project.id.slice(0, 8)}...
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Button className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold uppercase tracking-widest text-[9px] h-10">
                    View Deliverables
                  </Button>
                  <Button variant="ghost" className="text-[9px] uppercase tracking-widest font-black text-red-600 hover:text-red-500 hover:bg-red-600/5 px-4">
                    Messages
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PortalLayout>
  );
};

export default ClientProjects;