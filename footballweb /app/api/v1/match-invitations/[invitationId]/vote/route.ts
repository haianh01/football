import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/auth/current-user";
import { voteForMatchInvitation, removeMatchInvitationVote } from "@/features/matchmaking";
import { ApiError } from "@/lib/http";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ invitationId: string }> }
) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return NextResponse.json(
                { error: { code: "UNAUTHORIZED", message: "Bạn cần đăng nhập." } },
                { status: 401 }
            );
        }

        const { invitationId } = await params;
        const data = await voteForMatchInvitation(invitationId, currentUser.id);

        return NextResponse.json({ data });
    } catch (error) {
        if (error instanceof ApiError) {
            return NextResponse.json(
                { error: { code: error.code, message: error.message } },
                { status: error.status }
            );
        }

        console.error("[MatchInvitationVote API POST Error]", error);
        return NextResponse.json(
            { error: { code: "INTERNAL_SERVER_ERROR", message: "Đã có lỗi xảy ra. Vui lòng thử lại sau." } },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ invitationId: string }> }
) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return NextResponse.json(
                { error: { code: "UNAUTHORIZED", message: "Bạn cần đăng nhập." } },
                { status: 401 }
            );
        }

        const { invitationId } = await params;
        const data = await removeMatchInvitationVote(invitationId, currentUser.id);

        return NextResponse.json({ data });
    } catch (error) {
        if (error instanceof ApiError) {
            return NextResponse.json(
                { error: { code: error.code, message: error.message } },
                { status: error.status }
            );
        }

        console.error("[MatchInvitationVote API DELETE Error]", error);
        return NextResponse.json(
            { error: { code: "INTERNAL_SERVER_ERROR", message: "Đã có lỗi xảy ra. Vui lòng thử lại sau." } },
            { status: 500 }
        );
    }
}
