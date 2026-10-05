import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export class ApiError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
}

export function endpoint<P = Record<string, string>>(
  fn: (req: Request, params: P) => Promise<NextResponse>,
) {
  return async (req: Request, context?: { params: Promise<P> }) => {
    try {
      if (!["GET", "HEAD"].includes(req.method)) {
        const origin = req.headers.get("origin");
        const expectedOrigin = new URL(process.env.APP_URL!).origin;

        if (origin && origin !== expectedOrigin) {
          console.error("Origin check", {
            receivedOrigin: origin,
            expectedOrigin,
          });

          throw new ApiError("Invalid request origin", 403);
        }
      }

      return await fn(req, context ? await context.params : ({} as P));
    } catch (error) {
      if (error instanceof ApiError) {
        return json({ error: error.message }, error.status);
      }

      const dbError = error as {
        code?: string;
        message?: string;
      };

      console.error("API request failed", {
        code: dbError.code,
        message: dbError.message,
      });

      return json(
        { error: "Unable to complete this request. Please try again." },
        500,
      );
    }
  };
}

export async function body(req: Request): Promise<Record<string, unknown>> {
  let value: unknown;

  try {
    value = await req.json();
  } catch {
    throw new ApiError("Invalid JSON");
  }

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ApiError("Invalid JSON object");
  }

  return value as Record<string, unknown>;
}

export function integer(
  value: unknown,
  label = "ID",
  min = 1,
  max = 2147483647,
): number {
  const n =
    typeof value === "string" && /^\d+$/.test(value) ? Number(value) : value;

  if (typeof n !== "number" || !Number.isSafeInteger(n) || n < min || n > max) {
    throw new ApiError(`Invalid ${label}`);
  }

  return n;
}

export function uuid(value: string): string {
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      value,
    )
  ) {
    throw new ApiError("Invalid user ID");
  }

  return value;
}

export function text(
  value: unknown,
  label: string,
  max: number,
  required: true,
): string;

export function text(
  value: unknown,
  label: string,
  max: number,
  required?: false,
): string | null;

export function text(
  value: unknown,
  label: string,
  max: number,
  required = false,
): string | null {
  if (value === null || value === undefined) {
    if (required) {
      throw new ApiError(`${label} is required`);
    }

    return null;
  }

  if (typeof value !== "string") {
    throw new ApiError(`Invalid ${label}`);
  }

  const s = value.trim();

  if (s.length > max || (required && !s)) {
    throw new ApiError(
      `${label} must be ${required ? "1–" : "at most "}${max} characters`,
    );
  }

  return s || null;
}

export function boolean(value: unknown): boolean {
  if (typeof value !== "boolean") {
    throw new ApiError("Expected a boolean");
  }

  return value;
}

export function checked<T>(result: {
  data: T;
  error: { code?: string; message: string } | null;
}): T {
  if (result.error) {
    const { code } = result.error;

    if (code === "23505") {
      throw new ApiError("This item already exists", 409);
    }

    if (code === "23503" || code === "PGRST116") {
      throw new ApiError("Not found", 404);
    }

    if (["23514", "22001", "22P02"].includes(code ?? "")) {
      throw new ApiError("Invalid input");
    }

    if (code === "42501") {
      throw new ApiError("Not allowed", 403);
    }

    throw result.error;
  }

  return result.data;
}

export async function authenticated() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    throw new ApiError("Not authenticated", 401);
  }

  return { supabase, user: data.user };
}

// Read beyond the Data API's default row cap without silently truncating data.
export async function allRows<T>(
  read: (
    from: number,
    to: number,
  ) => PromiseLike<{
    data: T[] | null;
    error: { code?: string; message: string } | null;
  }>,
): Promise<T[]> {
  const rows: T[] = [];

  for (let offset = 0; ; offset += 500) {
    const batch = checked(await read(offset, offset + 499)) ?? [];

    rows.push(...batch);

    if (batch.length < 500) {
      return rows;
    }
  }
}
