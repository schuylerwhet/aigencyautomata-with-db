import { createMCPClient } from '@ai-sdk/mcp';

export const runtime = 'nodejs';

/**
 * Securely sends lead notifications and schedules events using Pica MCP tools.
 */
export async function POST(req: Request) {
  try {
    const { lead, action, date } = await req.json();
    const picaSecret = process.env.PICA_SECRET;

    if (!picaSecret) {
      return new Response(JSON.stringify({ error: 'PICA_SECRET missing' }), { status: 500 });
    }

    const client = await createMCPClient({
      transport: {
        type: 'http',
        url: 'https://mcp.picahq.com',
        headers: {
          'Authorization': `Bearer ${picaSecret}`,
        },
      },
    });

    const tools = await client.tools();

    if (action === 'notify') {
      const subject = `[NEW LEAD] ${lead.name} from ${lead.company || 'Unknown Co'}`;
      const recipients = ['schuylerwhet@me.com', 'schuyler@aigencyautomata.com'];
      
      const html = `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #000; color: #fff; padding: 40px; border-left: 8px solid #ff0000; max-width: 600px;">
          <h1 style="font-weight: 900; font-size: 24px; letter-spacing: -1px; margin-bottom: 30px; text-transform: uppercase;">NEW LEAD DETECTED</h1>
          <div style="background-color: #1a1a1a; padding: 20px; border: 1px solid #333;">
            <p style="margin: 0; font-size: 18px; font-weight: bold;">${lead.name}</p>
            <p style="margin: 5px 0 0 0; color: #999;">${lead.email}</p>
          </div>
          <div style="margin-top: 20px; background-color: #1a1a1a; padding: 20px; border: 1px solid #333;">
            <p style="margin: 0; font-size: 14px;"><strong style="color: #ff0000;">Company:</strong> ${lead.company || 'N/A'}</p>
            <p style="margin: 5px 0 0 0; font-size: 14px;"><strong style="color: #ff0000;">Source:</strong> ${lead.source.toUpperCase()}</p>
          </div>
          <div style="margin-top: 20px; background-color: #1a1a1a; padding: 20px; border: 1px solid #333;">
            <p style="margin: 0; font-size: 14px; line-height: 1.6; font-style: italic;">"${lead.bottleneck || 'No bottleneck specified.'}"</p>
          </div>
        </div>
      `;

      // Use the gmail tool if available
      if (tools.gmail_send_message) {
        await (tools.gmail_send_message as any).execute({
          to: recipients.join(', '),
          subject: subject,
          body: html,
        });
      } else {
          // Fallback if specific tool name is slightly different
          console.error("Gmail tool not found in MCP client tools list.");
          return new Response(JSON.stringify({ error: 'Gmail tool not found' }), { status: 404 });
      }
    }

    if (action === 'schedule' && date) {
      if (tools.google_calendar_create_event) {
          await (tools.google_calendar_create_event as any).execute({
            summary: `System Audit: ${lead.name} (${lead.company})`,
            description: `Lead: ${lead.name}\nBottleneck: ${lead.bottleneck}\nSource: ${lead.source}`,
            start: date,
            duration: 30,
            attendees: [lead.email, 'schuyler@aigencyautomata.com']
          });
      }
    }

    return new Response(JSON.stringify({ success: true }));
  } catch (error: any) {
    console.error('Automation Route Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
