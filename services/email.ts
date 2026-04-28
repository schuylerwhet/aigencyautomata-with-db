import { blink } from '../src/lib/blink';

export interface LeadData {
  name: string;
  email: string;
  company?: string;
  bottleneck?: string;
  source: 'contact_form' | 'chatbot';
  service_of_interest?: string;
}

/**
 * Sends a high-priority lead notification using Pica's Gmail bridge SECURELY via our API route
 */
export const sendLeadNotification = async (lead: LeadData) => {
  console.log('Dispatching secure PICA lead notification call...', lead);

  try {
    const response = await fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lead, action: 'notify' })
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(`Notification failed: ${err.error || response.statusText}`);
    }

    console.log('Secure lead notification sent successfully.');
  } catch (error) {
    console.error('Failed to send lead notification:', error);
  }
};

/**
 * Creates an audit calendar event via PICA GCal SECURELY via our API route
 */
export const scheduleAuditSession = async (lead: LeadData, date: string) => {
  try {
    const response = await fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lead, action: 'schedule', date })
    });

    if (!response.ok) throw new Error('Schedule failed');
    console.log('Audit scheduled securely via PICA GCal.');
  } catch (error) {
    console.error('GCal Schedule error:', error);
  }
};

export const syncLeadToCRM = async (lead: LeadData) => {
  try {
    const existing = await blink.db.table('crm_contacts').list({ where: { email: lead.email }, limit: 1 });
    if (existing.length === 0) {
      const id = `lead-${Date.now()}`;
      await blink.db.table('crm_contacts').create({
        id,
        name: lead.name,
        email: lead.email,
        company: lead.company || 'Unknown',
        role: 'Founder/Owner',
        status: 'Lead',
        lastContacted: new Date().toISOString(),
        tags: ['Website Lead', lead.source === 'chatbot' ? 'AI Chatbot' : 'Contact Form'],
        notes: `Initial Bottleneck: ${lead.bottleneck || 'none specified'}`
      });
      await blink.db.table('crm_activities').create({
        id: `act-${Date.now()}`,
        contactId: id,
        type: 'Call',
        title: 'New Lead Submission',
        content: `User submitted form via ${lead.source}. Bottleneck: ${lead.bottleneck}`,
        timestamp: new Date().toISOString(),
        sentiment: 'Positive'
      });
    }
  } catch (error) {
    console.error('CRM Sync Error:', error);
  }
};
