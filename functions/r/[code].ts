export const onRequestGet: PagesFunction = async (context) => {
  const code = context.params.code;
  const url = new URL(context.request.url);
  const target = `${url.origin}/p/${encodeURIComponent(String(code))}`;

  return new Response(null, {
    status: 302,
    headers: {
      Location: target,
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      Pragma: 'no-cache',
    },
  });
};
