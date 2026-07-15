import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/shared/auth/requireAdmin";
import { listUserAgentThreads } from "@/shared/api/agent";

// GET /api/admin/users/{id}/agent-threads — a user's AI-agent conversation
// threads across all their projects. Admin-only (middleware excludes /api).
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  try {
    const threads = await listUserAgentThreads(id);
    return NextResponse.json({ threads });
  } catch {
    return NextResponse.json(
      { error: "AI suhbatlarni yuklab bo'lmadi" },
      { status: 502 }
    );
  }
}
