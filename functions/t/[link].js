export const onRequest = async (ctx) => {
  const { request, params = {} } = ctx
  if (params.link) {
    const link = await ctx.env.dhjz.get('link:' + params.link);
    if (link) {
      if (params.link.startsWith('html')) {
        return new Response(link, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
      }
      return Response.redirect(decodeURIComponent(link))
    }
  }
  return new Response(`该短链不存在或已失效`);
};
