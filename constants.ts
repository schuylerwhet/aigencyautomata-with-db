
import { ServiceItem, ServiceCategory } from './types';

export const SERVICES: ServiceItem[] = [
  { 
    id: '01', 
    number: '01', 
    title: 'Workflow Automation', 
    category: ServiceCategory.WORKFLOW, 
    description: 'Custom-engineered AI agents that map and execute your most time-consuming operational workflows.',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
  },
  { 
    id: '02', 
    number: '02', 
    title: 'Lead Qualification', 
    category: ServiceCategory.LEAD, 
    description: 'High-speed AI screening that identifies and ranks high-intent prospects before they hit your CRM.',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
  },
  { 
    id: '03', 
    number: '03', 
    title: 'Revenue Operations', 
    category: ServiceCategory.REVENUE, 
    description: 'Unifying your tech stack with automated reporting pipelines and cross-platform data synchronization.',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
  },
  { 
    id: '04', 
    number: '04', 
    title: 'AI Content Engine', 
    category: ServiceCategory.CONTENT, 
    description: 'Scalable content production that preserves your unique brand voice across all digital channels.',
    icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
  },
  { 
    id: '05', 
    number: '05', 
    title: 'Paid Ads & AEO', 
    category: ServiceCategory.PAID_ADS, 
    description: 'Precision targeting and Answer Engine Optimization (AEO) to capture tomorrow’s search traffic.',
    icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
  },
  { 
    id: '06', 
    number: '06', 
    title: 'AI Voice Agents', 
    category: ServiceCategory.VOICE, 
    description: 'Natural language phone agents capable of handling complex inquiries and booking appointments 24/7.',
    icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z'
  },
  { 
    id: '07', 
    number: '07', 
    title: 'Chatbots & Booking', 
    category: ServiceCategory.CHATBOTS, 
    description: 'Intelligent conversational interfaces that turn website visitors into scheduled sales calls.',
    icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z'
  },
  { 
    id: '08', 
    number: '08', 
    title: 'Consulting & Audits', 
    category: ServiceCategory.CONSULTING, 
    description: 'Strategic deep-dives into your operational tech stack to find 30%+ efficiency gains.',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
  },
  { 
    id: '09', 
    number: '09', 
    title: 'Marketing & Design', 
    category: ServiceCategory.MARKETING_WEB, 
    description: 'Precision digital marketing and performance-optimized web design built for conversion density and speed.',
    icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9'
  },
];
