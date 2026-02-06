import { enhance, type UniversalHandler } from "@universal-middleware/core";
import { telefunc } from "telefunc";
import { getCookieStoreForRequestAndCleanup } from "./cookies";
import { getCurrentUser } from "./auth";

export const telefuncHandler: UniversalHandler = enhance(
  async (request, context, runtime) => {
    // Create a unique request ID for this request
    const requestId = `${Date.now()}-${Math.random()}`;
    const cookieStore = getCookieStoreForRequestAndCleanup(requestId);

    // Make cookieStore globally available for this request
    (globalThis as any).__telefuncCookieStore = cookieStore;

    // Build a Request-like object for getCurrentUser (cookie header)
    const raw = request as { headers?: Headers | { get?: (n: string) => string | null; cookie?: string } };
    let cookie = "";
    if (raw.headers) {
      if (typeof raw.headers.get === "function") {
        cookie = raw.headers.get("cookie") ?? "";
      } else if (typeof (raw.headers as { cookie?: string }).cookie === "string") {
        cookie = (raw.headers as { cookie: string }).cookie;
      }
    }
    const req = new Request("http://localhost", { headers: { cookie } });
    const user = await getCurrentUser(req);

    const httpResponse = await telefunc({
      url: request.url.toString(),
      method: request.method,
      body: await request.text(),
      context: {
        ...context,
        ...runtime,
        user,
      },
    });

    // Clean up global reference
    delete (globalThis as any).__telefuncCookieStore;

    const { body, statusCode, contentType } = httpResponse;
    const headers = new Headers();
    headers.set("content-type", contentType);

    // Add cookies to response headers (each cookie needs its own Set-Cookie header)
    const cookies = cookieStore.getCookies();
    for (const cookie of cookies) {
      headers.append('Set-Cookie', cookie);
    }

    return new Response(body, {
      status: statusCode,
      headers,
    });
  },
  {
    name: "my-app:telefunc-handler",
    path: `/_telefunc`,
    method: ["GET", "POST"],
    immutable: false,
  },
);
