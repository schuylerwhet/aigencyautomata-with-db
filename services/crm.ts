
import { Contact, Activity } from '../src/types/crm';
import { blink } from '../src/lib/blink';

const MOCK_CONTACTS: Contact[] = [
    {
        id: 'c1',
        name: 'Sarah Connor',
        email: 'sarah.connor@sky.net',
        phone: '+1-555-0100',
        company: 'Tech Solutions Inc.',
        role: 'CTO',
        status: 'Active',
        lastContacted: '2025-10-25T10:00:00Z',
        tags: ['AI Interested', 'Enterprise'],
        notes: 'Very interested in our AI workflow automation. Wants a pilot project next month.'
    },
    {
        id: 'c2',
        name: 'John Doe',
        email: 'john.doe@acmecorp.com',
        phone: '+1-555-0101',
        company: 'Acme Corp',
        role: 'VP Marketing',
        status: 'Lead',
        lastContacted: '2025-10-20T14:30:00Z',
        tags: ['Content Engine', 'SMB'],
        notes: 'Looking to scale content production. Budget approved for Q4.'
    },
    {
        id: 'c3',
        name: 'Jane Smith',
        email: 'jane.smith@globex.com',
        phone: '+1-555-0102',
        company: 'Globex Corporation',
        role: 'CEO',
        status: 'Lead',
        lastContacted: '2025-09-15T09:00:00Z',
        tags: ['Consulting', 'Enterprise'],
        notes: 'Moved to a competitor due to pricing. Check in Q1 2026.',
        audit: {
            score: 75,
            heatMapRank: '#8 (Invisible)',
            aeoReadiness: false,
            automationVoid: true,
            digitalGaps: true,
            adSpendLeakage: true,
            killShot: "Spending $2k/mo on ads to a 404 landing page.",
            lastAudited: '2025-10-26T12:00:00Z'
        }
    }
];

const MOCK_ACTIVITIES: Activity[] = [
    {
        id: 'a1',
        contactId: 'c1',
        type: 'Email',
        title: 'Follow-up on proposal',
        content: 'Sent detailed proposal regarding the AI workflow automation implementation. Waiting for approval.',
        timestamp: '2025-10-25T10:00:00Z',
        sentiment: 'Positive'
    },
    {
        id: 'a2',
        contactId: 'c1',
        type: 'Meeting',
        title: 'Initial Discovery Call',
        content: 'Discussed pain points in current workflow. Identified manual data entry as biggest bottleneck.',
        timestamp: '2025-10-20T11:00:00Z',
        sentiment: 'Neutral'
    },
    {
        id: 'a3',
        contactId: 'c2',
        type: 'Call',
        title: 'Intro Call',
        content: 'Brief intro call. Interested in content generation. scheduled demo.',
        timestamp: '2025-10-20T14:30:00Z',
        sentiment: 'Positive'
    }
];

// Helper to seed data if empty
const seedData = async () => {
    try {
        const contacts = await blink.db.table<Contact>('crm_contacts').list({ limit: 1 });
        if (contacts.length === 0) {
            console.log("Seeding mock contacts...");
            for (const contact of MOCK_CONTACTS) {
                await blink.db.table('crm_contacts').create(contact);
            }
        }

        const activities = await blink.db.table<Activity>('crm_activities').list({ limit: 1 });
        if (activities.length === 0) {
            console.log("Seeding mock activities...");
            for (const activity of MOCK_ACTIVITIES) {
                await blink.db.table('crm_activities').create(activity);
            }
        }
    } catch (e) {
        console.warn("Failed to seed CRM data", e);
    }
};

export const getContacts = async (): Promise<Contact[]> => {
    try {
        await seedData();
        const contacts = await blink.db.table<Contact>('crm_contacts').list({ limit: 1000 });
        return (contacts || []).sort((a, b) => new Date(b.lastContacted).getTime() - new Date(a.lastContacted).getTime());
    } catch (e) {
        console.error("Error fetching contacts:", e);
        return MOCK_CONTACTS;
    }
};

export const saveContact = async (contact: Contact): Promise<Contact> => {
    try {
        // Ensure ID
        const contactWithId = { ...contact, id: contact.id || `c-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` };
        const saved = await blink.db.table<Contact>('crm_contacts').create(contactWithId);
        return saved as Contact;
    } catch (e) {
        console.error("Error saving contact:", e);
        throw e;
    }
};

export const updateContact = async (id: string, updates: Partial<Contact>): Promise<Contact> => {
    try {
        // Blink SDK .update returns void in some versions, or the object in others.
        // We'll assume list re-fetch is needed or return void.
        // But for this function signature, we'll try to return the updated object if possible, or just the input.
        await blink.db.table<Contact>('crm_contacts').update(id, updates);
        return { ...updates, id } as Contact; // Approximate return
    } catch (e) {
        console.error("Error updating contact:", e);
        throw e;
    }
};

export const getActivities = async (contactId: string): Promise<Activity[]> => {
    try {
        const allActivities = await blink.db.table<Activity>('crm_activities').list({ limit: 1000 });
        // Client-side filter if filter API not supported fully, but .list({ filters }) is standard in Blink
        return (allActivities || []).filter(a => a.contactId === contactId)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (e) {
        console.error("Error fetching activities:", e);
        return MOCK_ACTIVITIES.filter(a => a.contactId === contactId);
    }
};

export const saveActivity = async (activity: Omit<Activity, 'id'>): Promise<Activity> => {
    try {
        const newActivity = { ...activity, id: `a-${Date.now()}` } as Activity;
        const saved = await blink.db.table<Activity>('crm_activities').create(newActivity);
        return saved as Activity;
    } catch (e) {
        console.error("Error saving activity:", e);
        throw e;
    }
};
