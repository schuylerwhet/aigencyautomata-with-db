import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText, tool as createTool } from 'ai';
import { z } from 'zod';
import { createMCPClient } from '@ai-sdk/mcp';

// Use the environment variable for the Google API key
const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY,
});

export const runtime = 'nodejs'; // Required for MCP client fetch/headers usually

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Initialize MCP Tools if PICA_SECRET is present
  let mcpTools: any = {};
  if (process.env.PICA_SECRET) {
      try {
          const client = await createMCPClient({
            transport: {
              type: 'http',
              url: 'https://mcp.picahq.com',
              headers: {
                'Authorization': `Bearer ${process.env.PICA_SECRET}`,
              },
            },
          });
          mcpTools = await client.tools();
      } catch (err) {
          console.warn('PICA MCP setup failed:', err);
      }
  }

  const result = streamText({
    model: google('gemini-2.0-flash-exp'),
    messages,
    system: `You are the advanced AI assistant for "AigencyAutomata". 
        
        Capabilities:
        1. Explain services and ROI (Swiss-minimalist design, Agentic Automation, AI CRM).
        2. CAPTURE LEADS (Name, Email, Service context). Use the 'captureLead' tool when a user is interested.
        3. EXTERNAL ACTIONS: Use your Pica MCP tools for Gmail and Google Calendar:
           - GMAIL: Use 'gmail_send_message' for outreach and confirmations.
           - GCAL: Use 'google_calendar_create_event' to schedule audits or meetings.
        
        Tone: Swiss-minimalist, professional, authoritative, direct.
        Avoid salesy language. Speak with the precision of a high-end Swiss engineer.
        
        Lead Capture Protocol:
        1. Identify service interest.
        2. Ask a pointed question about their specific operational bottleneck.
        3. Capture Name, Email, and Company.
        4. Call 'captureLead' immediately once criteria are met.
        5. Once captured, PROACTIVELY ask if they would like to schedule an audit on their calendar using your tools.`,
    tools: {
      ...mcpTools,
      captureLead: createTool({
        description: 'Capture lead contact information and specific project requirements when a user expresses interest in services.',
        parameters: z.object({
          name: z.string().describe('User name'),
          email: z.string().email().describe('User email'),
          company: z.string().optional().describe('User company'),
          service_of_interest: z.string().describe('The specific agency service they are interested in'),
          bottleneck: z.string().optional().describe('The biggest bottleneck or time-consuming process the user mentioned'),
        }),
        execute: async (args) => {
          // This allows the frontend to trigger UI updates (success message, confetti, etc.)
          return { success: true, message: 'LEAD_CAPTURED_AND_SYNCED', data: args };
        },
      }),
    },
    maxSteps: 5,
  });

  return result.toDataStreamResponse();
}
