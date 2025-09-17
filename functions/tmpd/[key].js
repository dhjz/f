// /functions/file/[key].js

export async function onRequest(context) {
  try {
    const { my_tmp: MY_KV } = context.env;
    const { key } = context.params;

    if (!key) {
      return new Response('Key is missing', { status: 400 });
    }

    // 1. 使用 getWithMetadata 获取值和元数据
    const { value, metadata } = await MY_KV.getWithMetadata(key, { type: 'arrayBuffer' });

    if (value === null) {
      return new Response('File not found', { status: 404 });
    }

    // 2. 检查元数据中是否有压缩标志
    if (metadata && metadata.flag === 'gzip') {
      // --- GZIP DECOMPRESSION START ---
      const compressedStream = new Blob([value]).stream();
      const decompressionStream = new DecompressionStream('gzip');
      const decompressedStream = compressedStream.pipeThrough(decompressionStream);
      // --- GZIP DECOMPRESSION END ---

      // 3. 直接将解压后的流作为响应体返回，这是最高效的方式
      //    不需要再把它转回 ArrayBuffer
      return new Response(decompressedStream, {
        headers: {
          // 从元数据中读取并设置正确的文件类型
          'Content-Type': metadata.type || 'application/octet-stream',
          'Content-Disposition': `attachment;filename="${encodeURIComponent(metadata.name)}"`,
        //   'Content-Length': metadata.size, // 设置原始文件大小
        },
      });
    } else {
      // 如果没有压缩标志，则按原样返回数据
      return new Response(value, {
        headers: {
          'Content-Type': metadata.type || 'application/octet-stream',
          'Content-Disposition': `attachment;filename="${encodeURIComponent(metadata.name)}"`,
        },
      });
    }

  } catch (error) {
    console.error('Error retrieving file:', error);
    return new Response('Error retrieving file', { status: 500 });
  }
}