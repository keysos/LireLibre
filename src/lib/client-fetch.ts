export async function clientFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  try {
    return await fetch(input, init);
  } catch {
    return Response.json(
      { error: "Connection failed. Please try again." },
      { status: 503 },
    );
  }
}
