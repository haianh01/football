const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  // Find all users who are captains
  const captains = await prisma.teamMember.findMany({
    where: { role: 'captain', status: 'active' },
    include: { team: true, user: true }
  });

  if (captains.length === 0) {
    console.log("No captains found to create a match post.");
    return;
  }

  // Use the first captain to create a match post
  const captain = captains[0];
  const user = captain.user;
  const hostTeam = captain.team;

  // Find another team to invite
  const otherTeams = await prisma.team.findMany({
    where: { id: { not: hostTeam.id } }
  });

  if (otherTeams.length === 0) {
    console.log("No other teams found to send invitation.");
    return;
  }

  const guestTeam = otherTeams[0];

  console.log(`Creating Match Post for host team: ${hostTeam.name}...`);
  
  const matchPost = await prisma.matchPost.create({
    data: {
      team_id: hostTeam.id,
      title: "Giao hữu Test Tính năng Vote",
      match_type: "friendly",
      date: new Date(new Date().setDate(new Date().getDate() + 3)), // 3 days from now
      start_time: new Date(new Date().setHours(18, 0, 0, 0)),
      timezone: "Asia/Ho_Chi_Minh",
      country_code: "VN",
      field_type: "seven",
      status: "open",
      created_by: user.id
    }
  });

  console.log("Match Post created:", matchPost.id);

  console.log(`Creating an incoming invitation from: ${guestTeam.name}...`);
  // Find the guest team's captain to set as created_by
  const guestCaptain = await prisma.teamMember.findFirst({
    where: { team_id: guestTeam.id, role: 'captain', status: 'active' }
  });

  const invitation = await prisma.matchInvitation.create({
    data: {
      match_post_id: matchPost.id,
      inviter_team_id: guestTeam.id,
      target_team_id: hostTeam.id,
      status: 'pending',
      note: 'Hello đội chủ nhà, đội mình muốn giao lưu vui vẻ!',
      created_by: guestCaptain ? guestCaptain.user_id : user.id
    }
  });

  console.log("Invitation created:", invitation.id);
  console.log(`\n\n✅ Đã tạo thành công!\nTeam của bạn: ${hostTeam.name} (Tài khoản: ${user.email})\nKèo đã được tạo và có lời mời từ ${guestTeam.name}.\nHãy mở trang chủ và click vào kèo mới để xem nút Vote nha!`);
}

run().catch(console.error).finally(() => prisma.$disconnect());
