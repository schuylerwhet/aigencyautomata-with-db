
export enum ServiceCategory {
  WORKFLOW = 'WORKFLOW_AUTOMATION',
  LEAD = 'LEAD_QUALIFICATION',
  REVENUE = 'REVENUE_OPERATIONS',
  CONTENT = 'AI_CONTENT_ENGINE',
  PAID_ADS = 'PAID_ADS_SEO_AEO',
  REPUTATION = 'REPUTATION_REVIEWS',
  CHATBOTS = 'AI_CHATBOTS_BOOKING',
  EMAIL = 'EMAIL_SMS_CAMPAIGNS',
  SOCIAL = 'SOCIAL_MEDIA_MGMT',
  VOICE = 'AI_VOICE_AGENTS',
  WEB = 'WEB_DEVELOPMENT',
  CONSULTING = 'CONSULTING_AUDITS',
  MARKETING_WEB = 'DIGITAL_MARKETING_WEB_DESIGN'
}

export interface ServiceItem {
  id: string;
  number: string;
  title: string;
  category: string;
  description: string;
  icon: string; // SVG path data
}

export interface BlogPost {
  id: string;
  title: string;
  category: string;
  date: string;
  excerpt: string;
  content?: string; // Markdown-style content
  tags: string[];
  link: string;
  image?: string;
  notionId: string;
  author?: string;
  status?: 'Published' | 'Draft' | 'Archived';
  readingTime?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
}
