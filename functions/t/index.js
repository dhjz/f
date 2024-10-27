export const onRequest = async ({ request, env, next }) => {
  const params = Object.fromEntries(new URL(request.url).searchParams) || {};
  let { type, key, val, prefix, expiration, metadata } = params
  // post请求好像设置了跨域也无法跨域的
  let data = await parseReqData(request)

  if (typeof data === 'string') {
    try {
      data = JSON.parse(data)
    } catch (e) {}
  }

  if (!type && data && data.type) {
    type = data.type
    key = data.key
    val = data.val
    prefix = data.prefix
    expiration = data.expiration
    metadata = data.metadata
  }

  let options = {}
  let currSec = new Date().getTime() / 1000
  if (expiration) options.expiration = expiration < currSec ? (currSec + expiration) : expiration
  if (metadata) options.metadata = JSON.parse(metadata)
  if (!Object.keys(options).length) options = null

  if (type == 'list') {
    const list = await env.dhjz.list(prefix ? { prefix } : null);
    return new Response(JSON.stringify(list));
  } else if (type == 'getlink' && key) {
    const val = await env.dhjz.get('link:' + key);
    return new Response(val);
  } else if (type == 'putlink' && key && val) {
    await env.dhjz.put('link:' + key, val, options);
    return new Response('添加成功, link:' + key + '|' + (val.length > 1000 ? '' : val));
  } else if (type == 'get' && key) {
    const val = await env.dhjz.get(key);
    return new Response(val);
  } else if (type == 'put' && key && val) {
    await env.dhjz.put(key, val, options);
    return new Response('添加成功, ' + key + '|' + (val.length > 1000 ? '' : val));
  }
  
  return new Response(`请传入正确的参数type, key, val, ${JSON.stringify(jsonStr1)}`);
};

// import { RequestData } from 'cloudflare-worker-request-data';  github.com/he-yang/cloudflare-worker-request-data
async function parseReqData(request) {
  const { headers } = request;
  if (request.method === "GET") {
      return Object.fromEntries(new URL(request.url).searchParams) || {}
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