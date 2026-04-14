import { AttendanceStatus } from "@prisma/client";

import { requireCurrentUser } from "@/lib/auth/current-user";
import { apiError, apiOk, ApiError } from "@/lib/http";
import { updateMatchParticipantAttendance } from "@/features/matchmaking";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ matchId: string; participantId: string }> }
) {
  try {
    const currentUser = await requireCurrentUser();
    const body = (await request.json().catch(() => ({}))) as {
      attendance_status?: string;
    };
    const { matchId, participantId } = await params;
    const allowedStatuses = new Set<AttendanceStatus>([
      AttendanceStatus.confirmed,
      AttendanceStatus.declined,
      AttendanceStatus.checked_in,
      AttendanceStatus.absent
    ]);

    if (!body.attendance_status || !allowedStatuses.has(body.attendance_status as AttendanceStatus)) {
      throw new ApiError(
        400,
        "VALIDATION_ERROR",
        "attendance_status must be one of confirmed, declined, checked_in, or absent."
      );
    }

    const data = await updateMatchParticipantAttendance(
      matchId,
      participantId,
      body.attendance_status as "confirmed" | "declined" | "checked_in" | "absent",
      currentUser.id
    );

    return apiOk(data);
  } catch (error) {
    return apiError(error);
  }
}
