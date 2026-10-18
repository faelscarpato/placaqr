export const onRequest: PagesFunction = async (context) => {
  return new Response(
    JSON.stringify({
      ok: true,
      service: 'placa-qr-api',
      path: context.params.path || [],
      phase: 1
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
