import Ably from 'ably';

export const revalidate = 0;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get('clientId') || `user-${Math.random().toString(36).slice(2, 7)}`;
  const client = new Ably.Rest(process.env.ABLY_API_KEY);
  const tokenRequestData = await client.auth.createTokenRequest({ clientId });
  return Response.json(tokenRequestData);
}
