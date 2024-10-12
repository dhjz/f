export const onRequest = async ({ request, env }) => {
  const params = Object.fromEntries(new URL(request.url).searchParams);
  const list = await env.dhjz.list();
  return new Response(`${request.url}, list: ${JSON.stringify(list)}, params: ${JSON.stringify(params)}`);
};