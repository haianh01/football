import re

with open("features/matchmaking/service.ts", "r") as f:
    content = f.read()

match_invitation_type_pattern = re.compile(
    r"type MatchInvitationWithRelations = Prisma\.MatchInvitationGetPayload<\{\s*include: \{.*?target_team: true;\s*\};\s*\}>;",
    re.DOTALL
)

new_type_def = """const MATCH_INVITATION_INCLUDE = {
  match_post: {
    include: {
      team: {
        include: {
          _count: {
            select: {
              team_members: true
            }
          }
        }
      }
    }
  },
  inviter_team: true,
  target_team: true,
  _count: {
    select: {
      votes: true
    }
  },
  votes: {
    select: {
      user_id: true
    }
  }
} satisfies Prisma.MatchInvitationInclude;

type MatchInvitationWithRelations = Prisma.MatchInvitationGetPayload<{
  include: typeof MATCH_INVITATION_INCLUDE;
}>;"""

content = match_invitation_type_pattern.sub(new_type_def, content)

inline_include_pattern = re.compile(
    r"include:\s*\{\s*match_post:\s*\{\s*include:\s*\{\s*team:\s*\{\s*include:\s*\{\s*_count:\s*\{\s*select:\s*\{\s*team_members:\s*true\s*\}\s*\}\s*\}\s*\}\s*\}\s*\},\s*inviter_team:\s*true,\s*target_team:\s*true\s*\}",
    re.DOTALL
)

content = inline_include_pattern.sub("include: MATCH_INVITATION_INCLUDE", content)

with open("features/matchmaking/service.ts", "w") as f:
    f.write(content)
