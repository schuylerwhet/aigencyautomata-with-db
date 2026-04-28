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
  FolderKanban
} from 'lucide-react';
import { Button } from '../src/components/ui/button';
import { Input } from '../src/components/ui/input';
import { Card, CardContent } from '../src/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '../src/components/ui/dialog';
import { toast } from 'sonner';
import { cn } from '../src/lib/utils';

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

const AdminProjects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    userId: '',
    budget: '',
    deadline: ''
  });

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const data = await blink.db.table<Project>('projects').list({
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
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name || !newProject.userId) {
      toast.error('Name and Client ID are required');
      return;
    }

    try {
      await blink.db.table<Project>('projects').create({
        name: newProject.name,
        description: newProject.description,
        user_id: newProject.userId,
        budget: parseFloat(newProject.budget) || 0,
        deadline: newProject.deadline,
        status: 'pending'
      });
      toast.success('Project created successfully');
      setIsCreateOpen(false);
      fetchProjects();
      setNewProject({ name: '', description: '', userId: '', budget: '', deadline: '' });
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
    }
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.user_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 size={14} className="text-green-500" />;
      case 'in_progress': return <Clock size={14} className="text-red-600" />;
      case 'review': return <AlertCircle size={14} className="text-yellow-500" />;
      default: return <Clock size={14} className="text-gray-500" />;
    }
  };

  return (
    <PortalLayout type="admin">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tighter">Projects</h2>
          <p className="text-xs text-gray-500 font-mono uppercase tracking-widest mt-1">Manage agency workflow and delivery.</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 text-white hover:bg-red-700 h-10 px-6 font-bold uppercase tracking-widest text-[10px]">
              <Plus size={16} className="mr-2" /> New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-black border-white/10 text-white">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold tracking-tighter uppercase">Initiate New Project</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateProject} className="space-y-4 py-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Project Name</label>
                <Input 
                  value={newProject.name}
                  onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                  className="bg-white/5 border-white/10 text-sm h-10"
                  placeholder="e.g. Q1 Marketing Automation"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Client ID (user_id)</label>
                <Input 
                  value={newProject.userId}
                  onChange={(e) => setNewProject({...newProject, userId: e.target.value})}
                  className="bg-white/5 border-white/10 text-sm h-10 font-mono"
                  placeholder="Paste client's user ID here"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Budget ($)</label>
                  <Input 
                    type="number"
                    value={newProject.budget}
                    onChange={(e) => setNewProject({...newProject, budget: e.target.value})}
                    className="bg-white/5 border-white/10 text-sm h-10"
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Deadline</label>
                  <Input 
                    type="date"
                    value={newProject.deadline}
                    onChange={(e) => setNewProject({...newProject, deadline: e.target.value})}
                    className="bg-white/5 border-white/10 text-sm h-10"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Scope Description</label>
                <textarea 
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-md p-3 text-sm min-h-[100px] focus:outline-none focus:border-red-600 transition-colors"
                  placeholder="Outline key deliverables..."
                />
              </div>
              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 font-bold uppercase tracking-widest text-xs h-12 mt-4">
                Deploy Project
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <Input 
            placeholder="Search projects or clients..." 
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
          <p className="text-[10px] font-mono uppercase text-gray-500 animate-pulse">Synchronizing Data...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <Card className="bg-black border-dashed border-white/10 border-2">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <FolderKanban size={48} className="text-gray-700 mb-4" />
            <p className="text-sm font-bold text-gray-300">No projects found.</p>
            <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">Awaiting system input.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="bg-black border-white/10 hover:border-red-600/30 transition-all group">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(project.status)}
                      <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500">{project.status}</span>
                    </div>
                    <h3 className="text-base font-bold text-gray-200 group-hover:text-red-600 transition-colors">{project.name}</h3>
                  </div>
                  <button className="text-gray-600 hover:text-white"><MoreVertical size={16} /></button>
                </div>

                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed h-10">
                  {project.description || 'No description provided.'}
                </p>

                <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5">
                  <div className="space-y-1">
                    <p className="text-[9px] uppercase tracking-widest text-gray-600 font-bold">Client</p>
                    <div className="flex items-center text-[10px] font-mono text-gray-400">
                      <User size={10} className="mr-1" /> {project.user_id.slice(0, 8)}...
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] uppercase tracking-widest text-gray-600 font-bold">Budget</p>
                    <div className="flex items-center text-[10px] font-mono text-green-500">
                      <DollarSign size={10} className="mr-1" /> ${project.budget.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-[10px] font-mono text-gray-500">
                    <Calendar size={12} className="mr-1" /> {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'N/A'}
                  </div>
                  <Button variant="ghost" className="h-8 text-[10px] uppercase tracking-widest font-bold text-red-600 hover:text-red-500 hover:bg-red-600/5">
                    Open Details
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

export default AdminProjects;