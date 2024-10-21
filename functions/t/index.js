export const onRequest = async ({ request, env, data }) => {
  const params = Object.fromEntries(new URL(request.url).searchParams) || {};
  const { type, key, val } = params
  let jsonStr = '666'
  let jsonStr1 = '777'
  if (request.method.toLowerCase() === 'post') {
    try {
      jsonStr = await readStreamAsJson(request.body)
    } catch (e) {}
  }
  if (request.method.toLowerCase() === 'post') {
    try {
      jsonStr1 = await parseReqData(request)
    } catch (e) {}
  }
  // response.headers.set('Content-Type', 'application/json')
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
  
  return new Response(`请传入正确的参数type, key, val` + JSON.stringify(data) + '|||' + jsonStr + '|||' + jsonStr1);
};

async function readStreamAsJson(stream) {
  const chunks = [];

  return new Promise((resolve, reject) => {
      stream.on('data', chunk => {
          chunks.push(chunk);
      });

      stream.on('end', () => {
          // 将 Buffer 数组连接成一个完整的 Buffer
          const buffer = Buffer.concat(chunks);
          // 将 Buffer 转换为字符串
          const jsonString = buffer.toString();
          // 解析为 JSON 对象
          try {
              const jsonData = JSON.parse(jsonString);
              resolve(jsonData);
          } catch (error) {
              resolve(jsonString)
              // reject(error);
          }
      });

      stream.on('error', err => {
          reject(err);
      });
  });
}


async function parseReqData(request) {
  const { headers } = request;
  if (request.method === "GET") {
      return Object.fromEntries(new URL(request.url).searchParams)
  } else {//request method = post
      const contentType = headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
          return await request.json();
      } else if (contentType.includes('application/text')) {
        return request.text();
      } else if (contentType.includes('text/html')) {
        return request.text();
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