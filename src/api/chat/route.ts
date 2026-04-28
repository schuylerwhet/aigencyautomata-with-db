import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText, tool as createTool } from 'ai';
import { z } from 'zod';
import { createMCPClient } from '@ai-sdk/mcp';

// Use the environment variable for the Google API key
const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY,
});

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const { messages } = await req.json();

  let mcpTools: any = {};
  if (process.env.PICA_SECRET) {
      try {
          const client = await createMCPClient({
            transport: {
              type: 'http',
              url: 'https://mcp.picaos.com/mcp',
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
        2. CAPTURE LEADS (Name, Email, Service context). Use 'captureLead' when a user is interested.
        3. BOOKING: If a user wants to book a 30-min audit, provide this direct link: https://calendar.app.google/xUxvNAFCRzkpmkfX6
        4. EXTERNAL ACTIONS (via Pica MCP Tools):
           - Use 'list_pica_integrations' to see what services (Gmail, GCal, LinkedIn) are linked.
           - Use 'search_pica_platform_actions' to find specific Gmail/GCal tasks.
           - Use 'execute_pica_action' to send emails or schedule events.
        
        Follow-up Protocol:
        1. Capture lead info first.
        2. Once captured, offer the direct booking link: https://calendar.app.google/xUxvNAFCRzkpmkfX6 or offer to schedule an audit via Gmail/GCal tools if preferred.
        3. Use your Pica tools to fulfill the request.
        
        Tone: Swiss-minimalist, professional, authoritative, direct.`,
    tools: {
      ...mcpTools,
      captureLead: createTool({
        description: 'Capture lead contact information.',
        parameters: z.object({
          name: z.string(),
          email: z.string().email(),
          company: z.string().optional(),
          service_of_interest: z.string(),
          bottleneck: z.string().optional(),
        }),
        execute: async (args) => {
          return { success: true, message: 'LEAD_CAPTURED', data: args };
        },
      }),
    },
    maxSteps: 5,
  });

  return result.toDataStreamResponse();
}
