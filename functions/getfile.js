export const onRequest = async ({ request, env, next }) => {
  const params = Object.fromEntries(new URL(request.url).searchParams) || {};
  let { id } = params
  if (!id) {
    return new Response('id is required', { status: 403 });
  }
  const val = await env.dhjz.get('tempfile:' + id);
  let arr = val.split('||')
  let base64Data = ''
  let name = id
  let type = ''
  if (arr.length > 3) {
    base64Data = arr[3]
    type = arr[1]
    name = arr[2]
  } else {
    base64Data = arr[0]
  }
  // 解码 Base64 数据
  const binaryData = atob(base64Data);
  const uint8Array = new Uint8Array(binaryData.length);

  for (let i = 0; i < binaryData.length; i++) {
    uint8Array[i] = binaryData.charCodeAt(i);
  }

  // 创建响应
  return new Response(uint8Array, {
    headers: {
      'Content-Type': type || 'application/octet-stream', // 文件类型
      'Content-Disposition': `inline;filename="${name}"`, // 提示浏览器下载
      // 'Content-Disposition': `attachment; filename="${name}"`, // 提示浏览器下载
      // 'Content-Length': uint8Array.byteLength,
    },
  });
};