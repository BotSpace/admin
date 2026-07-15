import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/shared/auth/requireAdmin";
import { getUserAgentThread } from "@/shared/api/agent";

// GET /api/admin/users/{id}/agent-threads/{threadId} — full transcript of one
// of the user's AI-agent threads. Admin-only; scoped to the user server-side.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; threadId: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id, threadId } = await params;
  try {
    const data = await getUserAgentThread(id, threadId);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Suhbat tarixini yuklab bo'lmadi" },
      { status: 502 }
    );
  }
}
