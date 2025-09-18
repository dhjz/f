// /functions/upload-form.js

/**
 * 处理 POST 请求，接收 FormData，将文件 Gzip 压缩后存入 KV
 * @param {EventContext} context
 */
export async function onRequest(context) {
  try {
    const { request, env } = context;
    const { my_tmp: MY_KV } = env;
    const params = Object.fromEntries(new URL(request.url).searchParams) || {};
    let { type } = params

    const formData = await request.formData();
    const file = formData.get('file');
    // const description = formData.get('description');

    if (!file || typeof file === 'string') {
        return new Response('File not found in form data.', { status: 400 });
    }
    // 文件大小不能超过25M
    if (file.size > 25 * 1024 * 1024) {
        return new Response('File size exceeds 25MB limit.', { status: 400 });
    }

    const originalArrayBuffer = await file.arrayBuffer();
    const originalSize = originalArrayBuffer.byteLength;

    // --- GZIP COMPRESSION START ---
    // 1. 将 ArrayBuffer 转换成一个可读流 (ReadableStream)
    const readableStream = new Blob([originalArrayBuffer]).stream();
    
    // 2. 创建一个 Gzip 压缩流
    const compressionStream = new CompressionStream('gzip');

    // 3. 将原始数据流通过管道送入压缩流
    const compressedStream = readableStream.pipeThrough(compressionStream);

    // 4. 将压缩后的流转换回 ArrayBuffer 以便存储
    //    在 Workers 环境中，使用 Response 对象是最高效的方法
    const compressedArrayBuffer = await new Response(compressedStream).arrayBuffer();
    const compressedSize = compressedArrayBuffer.byteLength;
    // --- GZIP COMPRESSION END ---

    // const key = crypto.randomUUID();
    const key = Math.random().toString(32).slice(-4)

    const metadata = {
      name: file.name,
      type: file.type,
      size: originalSize, // 存储原始大小
      sizegz: compressedSize, // 存储压缩后的大小
    //   description: description || 'No description',
      flag: 'gzip', // **重要：添加一个标志，说明数据是压缩过的**
    };

    const options = {
      metadata: metadata,
    }
    if (!type || type != '1') {
      options.expiration = Math.floor(Date.now() / 1000) + 1 * 60 * 60 // 单位秒. 缓存1小时
    }

    // 存储压缩后的 ArrayBuffer 和元数据
    await MY_KV.put(key, compressedArrayBuffer, options);

    const responsePayload = {
      code: 200,
      msg: 'File compressed and uploaded successfully.',
      data: key,
      meta: metadata,
    };

    return new Response(JSON.stringify(responsePayload), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error uploading file:', error);
    return new Response('An error occurred while uploading the file.' + error.message, { status: 500 });
  }
}