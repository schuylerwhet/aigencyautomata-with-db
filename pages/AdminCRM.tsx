
import React, { useState, useEffect } from 'react';
import PortalLayout from '../components/PortalLayout';
import {
    Users, Search, UserPlus, Mail, Phone, Building, Calendar,
    MessageSquare, MoreVertical, Star, History, BrainCircuit,
    Send, FileText, CheckCircle2, Radar, Briefcase
} from 'lucide-react';
import { Badge } from '../src/components/ui/badge';
import { Button } from '../src/components/ui/button';
import { Contact, Activity } from '../src/types/crm';
import { getContacts, getActivities, saveContact } from '../services/crm';
import { analyzeCRMContact } from '../services/gemini';
import { cn } from '../src/lib/utils';
import { findProspects } from '../services/gemini';

const AdminCRM: React.FC = () => {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [geminiAnalysis, setGeminiAnalysis] = useState<string>('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [loading, setLoading] = useState(true);

    // Prospecting State
    const [showProspecting, setShowProspecting] = useState(false);
    const [isProspecting, setIsProspecting] = useState(false);
    const [prospectIndustry, setProspectIndustry] = useState('');
    const [prospectLocation, setProspectLocation] = useState('');

    useEffect(() => {
        loadContacts();
    }, []);

    useEffect(() => {
        if (selectedContact) {
            loadActivities(selectedContact.id);
            setGeminiAnalysis(''); // Reset analysis
        }
    }, [selectedContact]);

    const loadContacts = async () => {
        setLoading(true);
        const data = await getContacts();
        setContacts(data);
        setLoading(false);
    };

    const loadActivities = async (contactId: string) => {
        const data = await getActivities(contactId);
        setActivities(data);
    };

    const handleAnalyze = async () => {
        if (!selectedContact) return;
        setIsAnalyzing(true);
        try {
            const analysis = await analyzeCRMContact(selectedContact, activities);
            setGeminiAnalysis(analysis);
        } catch (error) {
            console.error("Analysis failed", error);
            setGeminiAnalysis("Failed to generate analysis.");
        }
        setIsAnalyzing(false);
    };

    const handleProspecting = async () => {
        if (!prospectIndustry || !prospectLocation) return;
        setIsProspecting(true);
        try {
            const newLeads = await findProspects(prospectIndustry, prospectLocation, 3);

            // Save leads to DB
            for (const lead of newLeads) {
                await saveContact(lead);
            }

            // Refresh list
            await loadContacts();

            setShowProspecting(false);
            if (newLeads.length > 0) {
                // Find the newly added leads in the updated list would require re-fetching/logic, 
                // but we can just set the first one as selected for immediate feedback
                // Note: The ID might have been generated on save if not present, but findProspects generates IDs.
                setSelectedContact(newLeads[0]);
            }
        } catch (error) {
            console.error("Prospecting failed", error);
        }
        setIsProspecting(false);
    };

    const filteredContacts = contacts.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.company.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <PortalLayout type="admin">
            <div className="flex h-[calc(100vh-10rem)] gap-6">
                {/* Left Panel: Contact List */}
                <div className="w-1/3 bg-black/40 border border-white/10 rounded-lg flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-white/10 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold flex items-center">
                                <Users className="mr-2 text-red-600" size={20} />
                                Contacts
                            </h2>
                            <Button
                                size="sm"
                                variant="outline"
                                className={cn("border-white/20 hover:bg-white/5", showProspecting && "bg-white/10 text-red-500")}
                                onClick={() => setShowProspecting(!showProspecting)}
                            >
                                <UserPlus size={16} className="mr-2" /> Prospect
                            </Button>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={14} />
                            <input
                                placeholder="Search contacts..."
                                className="w-full bg-black/20 border border-white/10 rounded-md pl-9 pr-3 py-2 text-sm focus:border-red-500/50 transition-colors"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {showProspecting && (
                            <div className="bg-white/5 p-3 rounded-lg border border-white/10 space-y-2 animate-in slide-in-from-top-2">
                                <h3 className="text-xs font-bold uppercase text-red-500">New Prospecting Run</h3>
                                <input
                                    placeholder="Industry (e.g. Dentists)"
                                    className="w-full bg-black border border-white/20 rounded px-2 py-1 text-xs"
                                    value={prospectIndustry}
                                    onChange={(e) => setProspectIndustry(e.target.value)}
                                />
                                <input
                                    placeholder="Location (e.g. Miami, FL)"
                                    className="w-full bg-black border border-white/20 rounded px-2 py-1 text-xs"
                                    value={prospectLocation}
                                    onChange={(e) => setProspectLocation(e.target.value)}
                                />
                                <div className="flex justify-end space-x-2">
                                    <Button size="sm" variant="ghost" onClick={() => setShowProspecting(false)} className="h-7 text-xs">Cancel</Button>
                                    <Button
                                        size="sm"
                                        onClick={handleProspecting}
                                        disabled={isProspecting}
                                        className="h-7 text-xs bg-red-600 hover:bg-red-700 text-white"
                                    >
                                        {isProspecting ? 'Scanning...' : 'Run Audit'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="p-8 text-center text-gray-500 animate-pulse">Loading contacts...</div>
                        ) : (
                            filteredContacts.map(contact => (
                                <div
                                    key={contact.id}
                                    onClick={() => setSelectedContact(contact)}
                                    className={cn(
                                        "p-4 border-b border-white/5 cursor-pointer transition-colors hover:bg-white/5",
                                        selectedContact?.id === contact.id ? "bg-white/10 border-l-4 border-l-red-600" : "border-l-4 border-l-transparent"
                                    )}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-bold text-sm text-gray-200">{contact.name}</h3>
                                        <span className={cn(
                                            "text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold",
                                            contact.status === 'Active' ? "bg-green-500/20 text-green-400" :
                                                contact.status === 'Lead' ? "bg-blue-500/20 text-blue-400" :
                                                    "bg-gray-500/20 text-gray-400"
                                        )}>
                                            {contact.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center text-xs text-gray-500 space-x-3">
                                        <span className="flex items-center"><Building size={12} className="mr-1" /> {contact.company}</span>
                                        <span className="flex items-center"><Briefcase size={12} className="mr-1" /> {contact.role}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {selectedContact ? (
                    <div className="flex-1 flex gap-6">
                        {/* Middle: Info & Activity */}
                        <div className="flex-1 bg-black/40 border border-white/10 rounded-lg flex flex-col overflow-hidden">
                            {/* Header */}
                            <div className="p-6 border-b border-white/10 bg-gradient-to-r from-black via-black to-red-900/10">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-16 h-16 rounded-full bg-red-600/20 border border-red-600/50 flex items-center justify-center text-2xl font-bold text-red-500">
                                            {selectedContact.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h1 className="text-2xl font-bold text-white">{selectedContact.name}</h1>
                                            <div className="flex items-center text-sm text-gray-400 space-x-4 mt-1">
                                                <span className="flex items-center"><Building size={14} className="mr-1" /> {selectedContact.company}</span>
                                                <span className="flex items-center"><Briefcase size={14} className="mr-1" /> {selectedContact.role}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="outline" className="text-gray-400 border-white/10 hover:text-white">Edit Profile</Button>
                                </div>

                                <div className="mt-6 flex space-x-6 text-sm">
                                    <a href={`mailto:${selectedContact.email}`} className="flex items-center text-gray-400 hover:text-red-500 transition-colors">
                                        <Mail size={16} className="mr-2" /> {selectedContact.email}
                                    </a>
                                    {selectedContact.phone && (
                                        <a href={`tel:${selectedContact.phone}`} className="flex items-center text-gray-400 hover:text-red-500 transition-colors">
                                            <Phone size={16} className="mr-2" /> {selectedContact.phone}
                                        </a>
                                    )}
                                    <span className="flex items-center text-gray-400">
                                        <Calendar size={16} className="mr-2" /> Last Contact: {new Date(selectedContact.lastContacted).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            {/* Audit Score Section (If available) */}
                            {selectedContact.audit && (
                                <div className="p-6 border-b border-white/10 bg-red-950/10">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-red-500 flex items-center">
                                            <Radar size={14} className="mr-2" /> Opportunity Audit
                                        </h3>
                                        <span className="text-2xl font-bold text-white">{selectedContact.audit.score}/100</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                                        <div className="bg-black/40 p-3 rounded border border-white/5">
                                            <p className="text-gray-500 text-[10px] uppercase">Heat Map Rank</p>
                                            <p className="text-white font-mono">{selectedContact.audit.heatMapRank}</p>
                                        </div>
                                        <div className="bg-black/40 p-3 rounded border border-red-500/20 border-l-2 border-l-red-600">
                                            <p className="text-red-400 text-[10px] uppercase">Kill Shot (Primary Deficit)</p>
                                            <p className="text-white text-xs leading-snug">{selectedContact.audit.killShot}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedContact.audit.adSpendLeakage && <Badge variant="destructive">Ad Spend Leakage (+30)</Badge>}
                                        {selectedContact.audit.aeoReadiness && <Badge variant="secondary">AEO Invisible (+20)</Badge>}
                                        {selectedContact.audit.automationVoid && <Badge variant="secondary">Automation Void (+20)</Badge>}
                                        {selectedContact.audit.digitalGaps && <Badge variant="secondary">Digital Gap (+10)</Badge>}
                                    </div>
                                </div>
                            )}

                            {/* Activity History */}
                            <div className="flex-1 overflow-y-auto p-6">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4 flex items-center justify-between">
                                    <span>Activity Timeline</span>
                                    <Button size="sm" variant="ghost" className="h-6 text-[10px] text-red-500 hover:text-red-400 hover:bg-red-500/10">
                                        + Log Activity
                                    </Button>
                                </h3>

                                <div className="space-y-6 relative border-l border-white/10 ml-3 pl-6">
                                    {activities.length === 0 ? (
                                        <p className="text-sm text-gray-600 italic">No activity history.</p>
                                    ) : (
                                        activities.map(activity => (
                                            <div key={activity.id} className="relative">
                                                <div className={cn(
                                                    "absolute -left-[31px] top-0 w-3 h-3 rounded-full border-2 border-black",
                                                    activity.type === 'Email' ? "bg-blue-500" :
                                                        activity.type === 'Meeting' ? "bg-purple-500" :
                                                            activity.type === 'Call' ? "bg-green-500" : "bg-gray-500"
                                                )} />
                                                <div className="flex items-baseline justify-between mb-1">
                                                    <span className={cn(
                                                        "text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded text-black",
                                                        activity.type === 'Email' ? "bg-blue-500" :
                                                            activity.type === 'Meeting' ? "bg-purple-500" :
                                                                activity.type === 'Call' ? "bg-green-500" : "bg-gray-500"
                                                    )}>{activity.type}</span>
                                                    <span className="text-[10px] text-gray-500">{new Date(activity.timestamp).toLocaleString()}</span>
                                                </div>
                                                <h4 className="text-sm font-bold text-gray-200 mb-1">{activity.title}</h4>
                                                <p className="text-sm text-gray-400 leading-snug">{activity.content}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right: Gemini Intelligence */}
                        <div className="w-1/3 min-w-[300px] bg-black/40 border border-white/10 rounded-lg flex flex-col overflow-hidden bg-gradient-to-b from-black via-black to-red-950/10">
                            <div className="p-4 border-b border-white/10 flex items-center justify-between">
                                <h2 className="text-sm font-bold flex items-center text-purple-400">
                                    <BrainCircuit className="mr-2" size={18} />
                                    GEMINI INTEL
                                </h2>
                                {geminiAnalysis && (
                                    <span className="text-[10px] text-green-500 flex items-center">
                                        <CheckCircle2 size={12} className="mr-1" /> Ready
                                    </span>
                                )}
                            </div>

                            <div className="flex-1 p-6 overflow-y-auto">
                                {!geminiAnalysis ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                                            <Radar className="text-gray-600" size={32} />
                                        </div>
                                        <p className="text-sm text-gray-400 max-w-[200px]">
                                            Let Gemini analyze this relationship and suggest next steps.
                                        </p>
                                        <Button
                                            onClick={handleAnalyze}
                                            disabled={isAnalyzing}
                                            className="bg-purple-600 hover:bg-purple-700 text-white w-full border-0"
                                        >
                                            {isAnalyzing ? (
                                                <span className="flex items-center"><span className="animate-spin mr-2">•</span> Analyzing...</span>
                                            ) : (
                                                <span className="flex items-center"><BrainCircuit className="mr-2" size={16} /> Run Analysis</span>
                                            )}
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                                        <div className="prose prose-invert prose-sm max-w-none">
                                            <p className="whitespace-pre-wrap text-gray-300 text-sm leading-relaxed">
                                                {geminiAnalysis}
                                            </p>
                                        </div>
                                        <Button variant="outline" size="sm" onClick={() => setGeminiAnalysis('')} className="w-full text-gray-500 border-white/10 hover:text-white">
                                            Clear Analysis
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 border-t border-white/10 bg-white/5">
                                <h4 className="text-[10px] uppercase tracking-widest text-gray-500 mb-3">Quick Actions</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button variant="outline" size="sm" className="bg-black border-white/10 hover:border-purple-500/50 hover:text-purple-400 text-gray-400 text-xs justify-start px-2">
                                        <FileText size={12} className="mr-2" /> Draft Email
                                    </Button>
                                    <Button variant="outline" size="sm" className="bg-black border-white/10 hover:border-green-500/50 hover:text-green-400 text-gray-400 text-xs justify-start px-2">
                                        <Calendar size={12} className="mr-2" /> Plan Meeting
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center bg-black/40 border border-white/10 rounded-lg text-gray-600">
                        <div className="text-center">
                            <Users size={48} className="mx-auto mb-4 opacity-50" />
                            <p className="text-lg">Select a contact to view details</p>
                        </div>
                    </div>
                )}
            </div>
        </PortalLayout>
    );
};

export default AdminCRM;
