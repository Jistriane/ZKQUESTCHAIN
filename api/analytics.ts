export const config = {
  runtime: 'edge'
};

export default async function handler(_req: Request) {
  return new Response('OK', { status: 200 });
}
