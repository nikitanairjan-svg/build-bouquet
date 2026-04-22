import { NextRequest, NextResponse } from "next/server";

// GET  /api/bouquet  — fetch saved bouquets
export async function GET(_req: NextRequest) {
  return NextResponse.json({ bouquets: [] });
}

// POST /api/bouquet  — save a new bouquet
export async function POST(req: NextRequest) {
  const _body = await req.json();
  return NextResponse.json({ success: true }, { status: 201 });
}
