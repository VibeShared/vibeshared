import { NextResponse } from "next/server";

export function apiSuccess<T = any>(data: T, extra: Record<string, any> = {}) {
  return NextResponse.json({
    success: true,
    data,
    ...extra,
  });
}

export function apiError(message: string, status = 400) {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status }
  );
}
