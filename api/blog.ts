const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DATABASE_ID = process.env.NOTION_DATABASE_ID || '8166afbb701e82f28b94811615cd4ce3';
const NOTION_VERSION = '2022-06-28';

export default async function handler(req: Request): Promise<Response> {
  if (!NOTION_TOKEN) {
    return Response.json({ error: 'NOTION_TOKEN not configured' }, { status: 503 });
  }

  const headers = {
    Authorization: `Bearer ${NOTION_TOKEN}`,
    'Notion-Version': NOTION_VERSION,
    'Content-Type': 'application/json',
  };

  const { searchParams } = new URL(req.url);
  const pageId = searchParams.get('pageId');

  if (pageId) {
    const res = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children`, { headers });
    const data = await res.json();
    return Response.json(data, { status: res.status });
  }

  const limit = parseInt(searchParams.get('limit') || '10');
  const res = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      page_size: limit,
      filter: { property: 'Published', checkbox: { equals: true } },
      sorts: [{ timestamp: 'created_time', direction: 'descending' }],
    }),
  });
  const data = await res.json();
  return Response.json(data, { status: res.status });
}
