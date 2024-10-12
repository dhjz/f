export const onRequest = async ({ request, env }) => {
  const params = Object.fromEntries(new URL(request.url).searchParams) || {};
  const { type, key, val } = params
  // response.headers.set('Content-Type', 'application/json')
  if (type == 'list') {
    const list = await env.dhjz.list();
    return new Response(JSON.stringify(list));
  } else if (type == 'get' && key) {
    const val = await env.dhjz.get('link:' + key);
    return new Response(val);
  } else if (type == 'put' && key && val) {
    await env.dhjz.put('link:' + key, val);
    return new Response('添加成功:' + key + '|' + val);
  }
  
  return new Response(`请传入正确的参数type, key, val`);
};