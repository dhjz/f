export const onRequest = async (ctx) => {
  const { request, params = {} } = ctx
  const list = await ctx.env.dhjz.list();
  return new Response(`${task}::${request.url}, list: ${JSON.stringify(list)}, params: ${JSON.stringify(params)}`);
};