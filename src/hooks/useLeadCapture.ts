import { useEffect } from 'react';
import { blink } from '../lib/blink';
import { useAuth } from './useAuth';
import { sendLeadNotification, syncLeadToCRM } from '../../services/email';

export const useLeadCapture = () => {
  const { user } = useAuth();

  useEffect(() => {
    const handleLeadCaptured = async (event: any) => {
      const { name, email, company, bottleneck, service_of_interest } = event.detail;
      
      try {
        const lead = {
          name: name || '',
          email: email || '',
          company: company || '',
          bottleneck: bottleneck || service_of_interest || '',
          source: 'chatbot' as const,
          service_of_interest: service_of_interest
        };

        console.log('Automating lead capture (Chatbot):', lead);
        
        // Save to leads table
        await blink.db.table('leads').create({
          userId: user?.id || null,
          ...lead
        });

        // Wire up CRM & Email
        await syncLeadToCRM(lead);
        await sendLeadNotification(lead);

      } catch (error) {
        console.error('Error automating lead from chatbot:', error);
      }
    };

    window.addEventListener('aigency:lead_captured', handleLeadCaptured);
    return () => window.removeEventListener('aigency:lead_captured', handleLeadCaptured);
  }, [user]);
};
