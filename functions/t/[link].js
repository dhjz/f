export const onRequest = async (ctx) => {
  const { request, params = {} } = ctx
  if (params.link) {
    const link = await ctx.env.dhjz.get('link:' + params.link);
    if (link) {
      return Response.redirect(decodeURIComponent(link))
    }
  }
  return new Response(`该短链不存在或已失效`);
};