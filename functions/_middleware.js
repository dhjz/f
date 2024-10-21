// Set CORS to all /api responses
// 设置 - 构建与部署 - 构建配置 - 构建命令：npm install
// 设置 - 函数 - 兼容性标志 - nodejs_compat
export const onRequest = async (context) => {
  const response = await context.next();
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set('Access-Control-Max-Age', '86400');
  return response;
};