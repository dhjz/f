export const onRequest = async ({ request, env }) => {
  const params = Object.fromEntries(new URL(request.url).searchParams) || {};
  let { type, key, val } = params
  let data = await parseReqData(request)

  if (!type && data && data.type) {
    type = data.type
    key = data.key
    val = data.val
  }

  if (type == 'list') {
    const list = await env.dhjz.list();
    return new Response(JSON.stringify(list));
  } else if (type == 'getlink' && key) {
    const val = await env.dhjz.get('link:' + key);
    return new Response(val);
  } else if (type == 'putlink' && key && val) {
    await env.dhjz.put('link:' + key, val);
    return new Response('添加成功, link:' + key + '|' + val);
  } else if (type == 'get' && key) {
    const val = await env.dhjz.get(key);
    return new Response(val);
  } else if (type == 'put' && key && val) {
    await env.dhjz.put(key, val);
    return new Response('添加成功, ' + key + '|' + val);
  }
  
  return new Response(`请传入正确的参数type, key, val, ${JSON.stringify(jsonStr1)}`);
};

// import { RequestData } from 'cloudflare-worker-request-data';  github.com/he-yang/cloudflare-worker-request-data
async function parseReqData(request) {
  const { headers } = request;
  if (request.method === "GET") {
      return Object.fromEntries(new URL(request.url).searchParams)
  } else {//request method = post
      const contentType = headers.get('content-type') || headers.get('Content-Type') || '';
      if (contentType.includes('application/json')) {
          return await request.json();
      } else if (contentType.includes('application/text')) {
        return await request.text();
      } else if (contentType.includes('text/html')) {
        return await request.text();
      } else if (contentType.includes('form')) {
          const formData = await request.formData();
          const body = {};
          for (const entry of formData.entries()) {
              body[entry[0]] = entry[1];
          }
          return body;
      } else {
          return '';
      }
  }
}