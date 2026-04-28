export const config = { runtime: "edge" };

export const config = { runtime: "edge" };

export const config = { runtime: "edge" };

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DATABASE_ID = process.env.NOTION_DATABASE_ID || '8166afbb701e82f28b94811615cd4ce3';
const NOTION_VERSION = '2022-06-28';

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export default async function handler(req: Request): Promise<Response> {
  if (!NOTION_TOKEN) {
    return json({ error: 'NOTION_TOKEN not configured' }, 503);
  }

  const notionHeaders = {
    Authorization: `Bearer ${NOTION_TOKEN}`,
    'Notion-Version': NOTION_VERSION,
    'Content-Type': 'application/json',
  };

  const { searchParams } = new URL(req.url, 'http://localhost');
  const pageId = searchParams.get('pageId');

  if (pageId) {
    const res = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children`, { headers: notionHeaders });
    const data = await res.json();
    return json(data, res.status);
  }

  const limit = parseInt(searchParams.get('limit') || '10');
  const res = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
    method: 'POST',
    headers: notionHeaders,
    body: JSON.stringify({
      page_size: limit,
      filter: { property: 'Published', checkbox: { equals: true } },
      sorts: [{ timestamp: 'created_time', direction: 'descending' }],
    }),
  });
  const data = await res.json();
  return json(data, res.status);
}
