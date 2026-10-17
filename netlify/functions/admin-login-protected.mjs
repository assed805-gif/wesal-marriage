export default async function handler(request) {
  if (request.method !== 'GET') {
    return Response.json(
      { error: 'method_not_allowed' },
      { status: 405 }
    );
  }

  return Response.json({
    ok: true,
    message: 'Wesal rate limit test'
  });
}

export const config = {
  path: '/api/wesal-rate-test',
  rateLimit: {
    windowLimit: 5,
    windowSize: 60,
    aggregateBy: ['ip', 'domain']
  }
};
