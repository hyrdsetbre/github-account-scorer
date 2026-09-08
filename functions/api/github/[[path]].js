// Cloudflare Pages Functions: GitHub API 代理
export async function onRequest(context) {
  const { request, env, params } = context;
  const url = new URL(request.url);

  const path = Array.isArray(params.path) ? params.path.join('/') : params.path;
  const targetUrl = `https://api.github.com/${path}${url.search}`;

  const headers = new Headers(request.headers);
  headers.set('Accept', 'application/vnd.github.v3+json');
  headers.set('User-Agent', 'github-account-scorer');

  if (env.GITHUB_TOKEN) {
    headers.set('Authorization', `Bearer ${env.GITHUB_TOKEN}`);
  }

  headers.delete('host');
  headers.delete('origin');
  headers.delete('referer');

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
    });

    const responseHeaders = new Headers(response.headers);
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Proxy request failed', message: error.message }),
      {
        status: 502,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
