export const onRequest = async (ctx) => {
  const { request, params } = ctx
  const task = await ctx.env.dhjz.get("dhjz");
console.log(task, request.headers);
  return new Response((task + '暂未到获取ip' + JSON.stringify(request)));
};