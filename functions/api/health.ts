export const onRequestGet: PagesFunction = async () => {
  return new Response(
    JSON.stringify({
      ok: true,
      time: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
};
