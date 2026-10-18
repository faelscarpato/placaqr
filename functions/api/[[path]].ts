export const onRequest: PagesFunction = async (context) => {
  return new Response(
    JSON.stringify({
      error: 'Endpoint não encontrado',
      path: context.params.path || [],
    }),
    {
      status: 404,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
};
