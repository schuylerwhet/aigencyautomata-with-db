import { createMCPClient } from '@ai-sdk/mcp';

async function testPica() {
  const secret = process.env.PICA_SECRET || '';
  
  // Try several variants
  const urls = [
    'https://mcp.picaos.com/v1/mcp',
    'https://mcp.picahq.com/v1/mcp',
    'https://mcp.picaos.com/mcp'
  ];

  for (const url of urls) {
    console.log(`\n--- TESTING PICA MCP: ${url} ---`);
    try {
      const client = await createMCPClient({
        transport: {
          type: 'http',
          url: url,
          headers: {
            'Authorization': `Bearer ${secret}`,
          },
        },
      });

      console.log('Client created. Fetching tools...');
      const tools = await client.tools();
      const names = Object.keys(tools);
      console.log(`SUCCESS! Found ${names.length} tools: ${names.join(', ')}`);
      await client.close();
      return; // Stop if success
    } catch (err) {
      console.warn(`FAILED for ${url}:`, err.message || err);
    }
  }
}

testPica();
