export async function callTelefunc<T>(telefuncName: string, telefuncArgs: any[] = []): Promise<T> {
  const res = await fetch("/_telefunc", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ telefuncName, telefuncArgs }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Telefunc error ${res.status}: ${text}`);
  }

  return (await res.json()) as T;
}
