export const config = {
  runtime: 'edge'
};

export default async function handler(req: Request) {
  const body = await req.json();
  return new Response(JSON.stringify({ pinned: true, body }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
