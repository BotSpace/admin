import { NextRequest, NextResponse } from "next/server";
import { api } from "@/shared/api/server";
import type { ModuleStatus } from "@/shared/api/services";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const data = await api<ModuleStatus>(`/api/modules/${slug}/status/`);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Holat ma'lumoti olinmadi" },
      { status: 502 }
    );
  }
}
