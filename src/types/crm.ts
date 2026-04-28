
export type ContactStatus = 'Lead' | 'Active' | 'Churned' | 'Archived' | 'New';

export interface AuditData {
    score: number; // 0-100 Opportunity Score
    heatMapRank: string; // e.g., "#12 (Cold Zone)"
    aeoReadiness: boolean; // True = Needs improvement (+20)
    automationVoid: boolean; // True = Needs improvement (+20)
    digitalGaps: boolean; // True = Needs improvement (+10)
    adSpendLeakage: boolean; // True = High Priority (+30)
    killShot: string; // The "Primary Deficit" one-liner
    lastAudited: string; // ISO Date
}

export interface Contact {
    id: string;
    name: string;
    email: string;
    phone?: string;
    company: string;
    role: string;
    status: ContactStatus;
    lastContacted: string; // ISO Date
    notes?: string;
    tags: string[];
    website?: string;
    audit?: AuditData;
}

export type ActivityType = 'Email' | 'Call' | 'Meeting' | 'Note';

export interface Activity {
    id: string;
    contactId: string;
    type: ActivityType;
    title: string;
    content: string;
    timestamp: string; // ISO Date
    sentiment?: 'Positive' | 'Neutral' | 'Negative';
}
