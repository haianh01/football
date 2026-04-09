import { NextResponse } from "next/server";

export class ApiError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function apiOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ data }, init);
}

export function apiCreated<T>(data: T) {
  return NextResponse.json(
    { data },
    {
      status: 201
    }
  );
}

export function apiError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          details: error.details ?? {}
        }
      },
      {
        status: error.status
      }
    );
  }

  console.error(error);

  return NextResponse.json(
    {
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred.",
        details: {}
      }
    },
    {
      status: 500
    }
  );
}

