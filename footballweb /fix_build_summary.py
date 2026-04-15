import re

with open("features/matchmaking/service.ts", "r") as f:
    content = f.read()

old_func = """function buildMatchInvitationSummary(invitation: MatchInvitationWithRelations) {
  return {
    id: invitation.id,
    status: invitation.status,
    note: invitation.note,
    created_at: invitation.created_at.toISOString(),
    responded_at: invitation.responded_at?.toISOString() ?? null,
    match_post: {
      id: invitation.match_post.id,
      title: invitation.match_post.title,
      status: invitation.match_post.status,
      date: invitation.match_post.date.toISOString().slice(0, 10),
      start_time: invitation.match_post.start_time.toISOString().slice(11, 16),
      venue_name: invitation.match_post.venue_name
    },
    inviter_team: {
      id: invitation.inviter_team.id,
      name: invitation.inviter_team.name,
      short_code: invitation.inviter_team.short_code,
      logo_url: invitation.inviter_team.logo_url
    },
    target_team: {
      id: invitation.target_team.id,
      name: invitation.target_team.name,
      short_code: invitation.target_team.short_code,
      logo_url: invitation.target_team.logo_url
    }
  };
}"""

new_func = """function buildMatchInvitationSummary(invitation: MatchInvitationWithRelations, currentUserId?: string) {
  return {
    id: invitation.id,
    status: invitation.status,
    note: invitation.note,
    created_at: invitation.created_at.toISOString(),
    responded_at: invitation.responded_at?.toISOString() ?? null,
    match_post: {
      id: invitation.match_post.id,
      title: invitation.match_post.title,
      status: invitation.match_post.status,
      date: invitation.match_post.date.toISOString().slice(0, 10),
      start_time: invitation.match_post.start_time.toISOString().slice(11, 16),
      venue_name: invitation.match_post.venue_name
    },
    inviter_team: {
      id: invitation.inviter_team.id,
      name: invitation.inviter_team.name,
      short_code: invitation.inviter_team.short_code,
      logo_url: invitation.inviter_team.logo_url
    },
    target_team: {
      id: invitation.target_team.id,
      name: invitation.target_team.name,
      short_code: invitation.target_team.short_code,
      logo_url: invitation.target_team.logo_url
    },
    vote_count: invitation._count?.votes ?? 0,
    has_voted_by_current_user: currentUserId ? (invitation.votes?.some((v) => v.user_id === currentUserId) ?? false) : false
  };
}"""

# 1. Update the function body
content = content.replace(old_func, new_func)

# 2. Update usages:
content = re.sub(r"buildMatchInvitationSummary\(invitation\)", r"buildMatchInvitationSummary(invitation, currentUserId)", content)
content = re.sub(r"buildMatchInvitationSummary\(result\)", r"buildMatchInvitationSummary(result, currentUserId)", content)

# 3. For createMatchInvitation, it's called 'createdByUserId' instead of 'currentUserId'
create_old = "export async function createMatchInvitation(\n  input: {\n    match_post_id: string;\n    inviter_team_id: string;\n    note?: string;\n  },\n  createdByUserId: string\n) {"
# Let's just fix the return specific inside createMatchInvitation
content = content.replace("buildMatchInvitationSummary(invitation, currentUserId);\n}\n\nasync function getInvitationForActor", "buildMatchInvitationSummary(invitation, createdByUserId);\n}\n\nasync function getInvitationForActor")

with open("features/matchmaking/service.ts", "w") as f:
    f.write(content)
