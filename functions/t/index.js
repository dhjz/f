export const onRequest = async ({ request, env }) => {
  const params = Object.fromEntries(new URL(request.url).searchParams) || {};
  const { type, key, val } = params
  let jsonStr = '666'
  let jsonStr1 = '777'
  // if (request.method.toLowerCase() === 'post') {
  //   try {
  //     jsonStr = await readStreamAsJson(request.body)
  //   } catch (e) {}
  // }
  // try {
  //   jsonStr1 = await parseReqData(request)
  // } catch (e) { }
  // jsonStr1 = await parseReqData(request)
  if ((request.method !== "GET")) {
    jsonStr1 = await request.json()
  }

  response.headers.set('Content-Type', 'application/json')
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
  
  return new Response(`请传入正确的参数type, key, val` + jsonStr + '|||' + jsonStr1);
};

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