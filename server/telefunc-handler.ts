import { enhance, type UniversalHandler } from "@universal-middleware/core";
import { telefunc } from "telefunc";
import { getCookieStoreForRequestAndCleanup } from "./cookies";

export const telefuncHandler: UniversalHandler = enhance(
  async (request, context, runtime) => {
    // Create a unique request ID for this request
    const requestId = `${Date.now()}-${Math.random()}`;
    const cookieStore = getCookieStoreForRequestAndCleanup(requestId);

    // Make cookieStore globally available for this request
    (globalThis as any).__telefuncCookieStore = cookieStore;

    const httpResponse = await telefunc({
      url: request.url.toString(),
      method: request.method,
      body: await request.text(),
      context: {
        ...context,
        ...runtime,
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
