'use client';

import { FormEvent, useState } from 'react';

type ApiResponse = {
  status: number;
  body: any;
};

type TeamRole = 'captain' | 'manager' | 'member';
type ApplicationAction = 'accept' | 'reject';
type ApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';
type UrgentPostStatus = 'open' | 'closed' | 'expired';
type MatchStatus = 'draft' | 'open' | 'full' | 'completed' | 'cancelled';

type UserRecord = {
  id: string;
  name: string;
  email: string;
};

type TeamMemberRecord = {
  id: string;
  role: TeamRole;
  joinedAt: string;
  user: UserRecord;
};

type TeamRecord = {
  id: string;
  name: string;
  slug: string;
  city: string;
  district: string;
  description?: string | null;
  creator?: UserRecord;
  members?: TeamMemberRecord[];
};

type MatchRecord = {
  id: string;
  teamId: string;
  title: string;
  startsAt: string;
  endsAt: string;
  district: string;
  status: MatchStatus;
  notes?: string | null;
  urgentPosts?: Array<{
    id: string;
    status: UrgentPostStatus;
  }>;
};

type UrgentPostApplicationRecord = {
  id: string;
  userId?: string;
  message?: string | null;
  status: ApplicationStatus;
  createdAt: string;
  user?: UserRecord;
};

type UrgentPostRecord = {
  id: string;
  teamId: string;
  matchId: string;
  neededPlayers: number;
  feeShare?: string | null;
  description?: string | null;
  expiresAt: string;
  status: UrgentPostStatus;
  team?: TeamRecord;
  match?: MatchRecord & {
    field?: {
      id: string;
      name: string;
    } | null;
  };
  applications?: UrgentPostApplicationRecord[];
};

type StepResult = {
  id: string;
  label: string;
  expected: string;
  actual: string;
  passed: boolean;
  detail: string;
};

type ActionLog = {
  id: string;
  label: string;
  status: number;
  detail: string;
  passed: boolean;
};

type ScenarioEntities = {
  captainId?: string;
  memberId?: string;
  applicantId?: string;
  teamId?: string;
  matchId?: string;
  urgentPostId?: string;
};

const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001').replace(/\/$/, '');

const roleLabels: Record<TeamRole, string> = {
  captain: 'Đội trưởng',
  manager: 'Quản lý',
  member: 'Thành viên',
};

const roleHints: Record<TeamRole, string> = {
  captain: 'Người này sẽ có toàn bộ quyền captain-only trong đội.',
  manager: 'Vai trò quản lý nội bộ, hiện chưa có quyền captain-only.',
  member: 'Thành viên thường, không có quyền sửa đội hay duyệt kèo.',
};

const memberInviteRoles: TeamRole[] = ['member', 'manager'];

const applicationStatusLabels: Record<ApplicationStatus, string> = {
  pending: 'Đang chờ',
  accepted: 'Đã nhận',
  rejected: 'Đã từ chối',
  cancelled: 'Đã hủy',
};

const urgentPostStatusLabels: Record<UrgentPostStatus, string> = {
  open: 'Đang mở',
  closed: 'Đã đủ người',
  expired: 'Hết hạn',
};

const matchStatusLabels: Record<MatchStatus, string> = {
  draft: 'Nháp',
  open: 'Đang mở',
  full: 'Đủ người',
  completed: 'Đã xong',
  cancelled: 'Đã hủy',
};

async function request(path: string, options?: RequestInit): Promise<ApiResponse> {
  const response = await fetch(`${apiBaseUrl}/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
  });

  const raw = await response.text();
  let body: any = raw;

  try {
    body = raw ? JSON.parse(raw) : null;
  } catch {
    body = raw;
  }

  return {
    status: response.status,
    body,
  };
}

function summarizeBody(body: any): string {
  if (!body) return 'Không có nội dung phản hồi.';
  if (typeof body === 'string') return body;
  if (body.message) return Array.isArray(body.message) ? body.message.join(', ') : body.message;
  if (body.name && body.id) return `${body.name} (${body.id})`;
  if (body.title && body.id) return `${body.title} (${body.id})`;
  if (body.id) return `Tạo thành công với id: ${body.id}`;
  if (body.status) return `Trạng thái: ${body.status}`;
  return JSON.stringify(body);
}

function toSlug(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function toIso(value: string) {
  return new Date(value).toISOString();
}

function toDateTimeInput(value?: string | null) {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

function formatDateTime(value?: string | null) {
  if (!value) return 'Chưa có';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('vi-VN');
}

export default function CaptainTestPage() {
  const [results, setResults] = useState<StepResult[]>([]);
  const [entities, setEntities] = useState<ScenarioEntities>({});
  const [scenarioTag, setScenarioTag] = useState<string>('');
  const [isRunningScenario, setIsRunningScenario] = useState(false);
  const [fatalError, setFatalError] = useState<string | null>(null);

  const [users, setUsers] = useState<UserRecord[]>([]);
  const [teams, setTeams] = useState<TeamRecord[]>([]);
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [urgentPosts, setUrgentPosts] = useState<UrgentPostRecord[]>([]);
  const [manualLogs, setManualLogs] = useState<ActionLog[]>([]);
  const [manualError, setManualError] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
  });
  const [teamForm, setTeamForm] = useState({
    name: '',
    slug: '',
    city: 'Hà Nội',
    district: 'Cầu Giấy',
    description: '',
    creatorId: '',
    confirmCaptain: false,
  });
  const [memberForm, setMemberForm] = useState({
    teamId: '',
    actorUserId: '',
    userId: '',
    role: 'member' as TeamRole,
  });
  const [captainAssignmentForm, setCaptainAssignmentForm] = useState({
    teamId: '',
    actorUserId: '',
    memberId: '',
  });
  const [matchForm, setMatchForm] = useState({
    teamId: '',
    createdBy: '',
    title: '',
    district: 'Cầu Giấy',
    startsAt: '',
    endsAt: '',
    notes: '',
  });
  const [urgentPostForm, setUrgentPostForm] = useState({
    matchId: '',
    actorUserId: '',
    neededPlayers: '1',
    expiresAt: '',
    description: '',
    feeShare: '',
  });
  const [applicationForm, setApplicationForm] = useState({
    postId: '',
    userId: '',
    message: '',
  });
  const [reviewForm, setReviewForm] = useState({
    postId: '',
    applicationId: '',
    actorUserId: '',
    action: 'accept' as ApplicationAction,
  });
  const [editTeamForm, setEditTeamForm] = useState({
    teamId: '',
    actorUserId: '',
    name: '',
    city: '',
    district: '',
    description: '',
  });
  const [editMatchForm, setEditMatchForm] = useState({
    matchId: '',
    actorUserId: '',
    title: '',
    startsAt: '',
    endsAt: '',
    district: '',
    notes: '',
    status: 'draft' as MatchStatus,
  });
  const [editUrgentPostForm, setEditUrgentPostForm] = useState({
    postId: '',
    actorUserId: '',
    neededPlayers: '1',
    expiresAt: '',
    description: '',
    feeShare: '',
    status: 'open' as UrgentPostStatus,
  });
  const [teamLookupId, setTeamLookupId] = useState('');

  const selectedTeam = teams.find((team) => team.id === memberForm.teamId) ?? null;
  const selectedMatchTeam = teams.find((team) => team.id === matchForm.teamId) ?? null;
  const selectedMatch = matches.find((match) => match.id === urgentPostForm.matchId) ?? null;
  const selectedPost = urgentPosts.find((post) => post.id === applicationForm.postId) ?? null;
  const selectedReviewPost = urgentPosts.find((post) => post.id === reviewForm.postId) ?? null;
  const selectedUrgentPostTeam =
    (selectedMatch && teams.find((team) => team.id === selectedMatch.teamId)) ?? null;
  const selectedReviewTeam =
    (selectedReviewPost && teams.find((team) => team.id === selectedReviewPost.teamId)) ?? null;
  const selectedCaptainAssignmentTeam =
    teams.find((team) => team.id === captainAssignmentForm.teamId) ?? null;
  const selectedEditTeam = teams.find((team) => team.id === editTeamForm.teamId) ?? null;
  const selectedEditMatch = matches.find((match) => match.id === editMatchForm.matchId) ?? null;
  const selectedEditMatchTeam =
    (selectedEditMatch && teams.find((team) => team.id === selectedEditMatch.teamId)) ?? null;
  const selectedEditUrgentPost = urgentPosts.find((post) => post.id === editUrgentPostForm.postId) ?? null;
  const selectedEditUrgentPostTeam =
    (selectedEditUrgentPost && teams.find((team) => team.id === selectedEditUrgentPost.teamId)) ?? null;

  const captainChoices =
    selectedTeam?.members && selectedTeam.members.length > 0
      ? selectedTeam.members.filter((member) => member.role === 'captain').map((member) => member.user)
      : users;
  const captainSelectOptions = captainChoices.length > 0 ? captainChoices : users;

  const matchCaptainChoices =
    selectedMatchTeam?.members && selectedMatchTeam.members.length > 0
      ? selectedMatchTeam.members
          .filter((member) => member.role === 'captain')
          .map((member) => member.user)
      : users;
  const matchCaptainOptions = matchCaptainChoices.length > 0 ? matchCaptainChoices : users;

  const urgentPostCaptainChoices =
    selectedUrgentPostTeam?.members && selectedUrgentPostTeam.members.length > 0
      ? selectedUrgentPostTeam.members
          .filter((member) => member.role === 'captain')
          .map((member) => member.user)
      : users;
  const urgentPostCaptainOptions =
    urgentPostCaptainChoices.length > 0 ? urgentPostCaptainChoices : users;

  const reviewCaptainChoices =
    selectedReviewTeam?.members && selectedReviewTeam.members.length > 0
      ? selectedReviewTeam.members
          .filter((member) => member.role === 'captain')
          .map((member) => member.user)
      : users;
  const reviewCaptainOptions = reviewCaptainChoices.length > 0 ? reviewCaptainChoices : users;
  const captainAssignmentActorUsers =
    selectedCaptainAssignmentTeam?.members && selectedCaptainAssignmentTeam.members.length > 0
      ? selectedCaptainAssignmentTeam.members
          .filter((member) => member.role === 'captain')
          .map((member) => member.user)
      : users;
  const captainAssignmentActorOptions =
    captainAssignmentActorUsers.length > 0 ? captainAssignmentActorUsers : users;
  const captainAssignmentMemberOptions =
    selectedCaptainAssignmentTeam?.members?.filter((member) => member.role !== 'captain') ?? [];

  const reviewApplications = selectedReviewPost?.applications ?? [];
  const editTeamCaptainOptions =
    selectedEditTeam?.members && selectedEditTeam.members.length > 0
      ? selectedEditTeam.members
          .filter((member) => member.role === 'captain')
          .map((member) => member.user)
      : users;
  const editTeamCaptainChoices = editTeamCaptainOptions.length > 0 ? editTeamCaptainOptions : users;
  const editMatchCaptainOptions =
    selectedEditMatchTeam?.members && selectedEditMatchTeam.members.length > 0
      ? selectedEditMatchTeam.members
          .filter((member) => member.role === 'captain')
          .map((member) => member.user)
      : users;
  const editMatchCaptainChoices =
    editMatchCaptainOptions.length > 0 ? editMatchCaptainOptions : users;
  const editUrgentPostCaptainOptions =
    selectedEditUrgentPostTeam?.members && selectedEditUrgentPostTeam.members.length > 0
      ? selectedEditUrgentPostTeam.members
          .filter((member) => member.role === 'captain')
          .map((member) => member.user)
      : users;
  const editUrgentPostCaptainChoices =
    editUrgentPostCaptainOptions.length > 0 ? editUrgentPostCaptainOptions : users;

  function appendManualLog(
    label: string,
    response: ApiResponse,
    passed = response.status >= 200 && response.status < 300,
  ) {
    setManualLogs((current) => [
      {
        id: `${Date.now()}-${current.length + 1}`,
        label,
        status: response.status,
        detail: summarizeBody(response.body),
        passed,
      },
      ...current,
    ]);
  }

  function upsertUser(nextUser: UserRecord) {
    setUsers((current) => {
      const withoutExisting = current.filter((user) => user.id !== nextUser.id);
      return [nextUser, ...withoutExisting];
    });
  }

  function upsertTeam(nextTeam: TeamRecord) {
    setTeams((current) => {
      const withoutExisting = current.filter((team) => team.id !== nextTeam.id);
      return [nextTeam, ...withoutExisting];
    });
  }

  function upsertMatch(nextMatch: MatchRecord) {
    setMatches((current) => {
      const withoutExisting = current.filter((match) => match.id !== nextMatch.id);
      return [nextMatch, ...withoutExisting];
    });
  }

  function replaceTeamMatches(teamId: string, nextMatches: MatchRecord[]) {
    setMatches((current) => {
      const withoutTeam = current.filter((match) => match.teamId !== teamId);
      return [...nextMatches, ...withoutTeam];
    });
  }

  function upsertUrgentPost(nextPost: UrgentPostRecord) {
    setUrgentPosts((current) => {
      const withoutExisting = current.filter((post) => post.id !== nextPost.id);
      return [nextPost, ...withoutExisting];
    });
  }

  function loadTeamIntoEditForm(team: TeamRecord) {
    setEditTeamForm({
      teamId: team.id,
      actorUserId: team.creator?.id ?? '',
      name: team.name,
      city: team.city,
      district: team.district,
      description: team.description ?? '',
    });
  }

  function loadMatchIntoEditForm(match: MatchRecord) {
    const team = teams.find((item) => item.id === match.teamId);
    const captainId =
      team?.members?.find((member) => member.role === 'captain')?.user.id ?? team?.creator?.id ?? '';

    setEditMatchForm({
      matchId: match.id,
      actorUserId: captainId,
      title: match.title,
      startsAt: toDateTimeInput(match.startsAt),
      endsAt: toDateTimeInput(match.endsAt),
      district: match.district,
      notes: match.notes ?? '',
      status: match.status,
    });
  }

  function loadUrgentPostIntoEditForm(post: UrgentPostRecord) {
    const team = teams.find((item) => item.id === post.teamId);
    const captainId =
      team?.members?.find((member) => member.role === 'captain')?.user.id ?? team?.creator?.id ?? '';

    setEditUrgentPostForm({
      postId: post.id,
      actorUserId: captainId,
      neededPlayers: String(post.neededPlayers),
      expiresAt: toDateTimeInput(post.expiresAt),
      description: post.description ?? '',
      feeShare: post.feeShare ?? '',
      status: post.status,
    });
  }

  async function refreshTeam(teamId: string, silent = false) {
    const response = await request(`/teams/${teamId}`);

    if (!silent) {
      appendManualLog('Lấy lại chi tiết đội', response);
    }

    if (response.status === 200) {
      upsertTeam(response.body as TeamRecord);
    }

    return response;
  }

  async function refreshTeamMatches(teamId: string, silent = false) {
    const response = await request(`/teams/${teamId}/matches`);

    if (!silent) {
      appendManualLog('Lấy danh sách trận của đội', response);
    }

    if (response.status === 200) {
      const nextMatches = response.body as MatchRecord[];
      replaceTeamMatches(teamId, nextMatches);
    }

    return response;
  }

  async function refreshMatch(matchId: string, silent = false) {
    const response = await request(`/matches/${matchId}`);

    if (!silent) {
      appendManualLog('Lấy chi tiết trận', response);
    }

    if (response.status === 200) {
      upsertMatch(response.body as MatchRecord);
    }

    return response;
  }

  async function refreshUrgentPost(postId: string, silent = false) {
    const response = await request(`/urgent-posts/${postId}`);

    if (!silent) {
      appendManualLog('Lấy chi tiết kèo gấp', response);
    }

    if (response.status === 200) {
      upsertUrgentPost(response.body as UrgentPostRecord);
    }

    return response;
  }

  async function handleCreateUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActiveAction('create-user');
    setManualError(null);

    try {
      const response = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userForm),
      });

      appendManualLog('Tạo user', response);

      if (response.status === 201) {
        const nextUser = response.body as UserRecord;
        upsertUser(nextUser);

        setUserForm({
          name: '',
          email: '',
        });

        setTeamForm((current) => ({
          ...current,
          creatorId: current.creatorId || nextUser.id,
        }));

        setMemberForm((current) => ({
          ...current,
          userId: current.userId || nextUser.id,
        }));

        setApplicationForm((current) => ({
          ...current,
          userId: current.userId || nextUser.id,
        }));
      } else {
        setManualError(summarizeBody(response.body));
      }
    } catch (error) {
      setManualError(error instanceof Error ? error.message : 'Không thể tạo user.');
    } finally {
      setActiveAction(null);
    }
  }

  async function handleCreateTeam(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActiveAction('create-team');
    setManualError(null);

    try {
      if (!teamForm.confirmCaptain) {
        setManualError('Bạn cần xác nhận người tạo đội sẽ là đội trưởng của đội mới.');
        return;
      }

      const trimmedName = teamForm.name.trim();
      const generatedSlug =
        teamForm.slug.trim() || `${toSlug(trimmedName)}-${Date.now().toString().slice(-6)}`;

      const response = await request('/teams', {
        method: 'POST',
        body: JSON.stringify({
          name: trimmedName,
          slug: generatedSlug,
          city: teamForm.city.trim(),
          district: teamForm.district.trim(),
          description: teamForm.description.trim() || undefined,
          createdBy: teamForm.creatorId,
        }),
      });

      appendManualLog('Tạo đội', response);

      if (response.status === 201) {
        const teamId = response.body.id as string;
        setTeamLookupId(teamId);
        await refreshTeam(teamId, true);
        await refreshTeamMatches(teamId, true);

        setMemberForm((current) => ({
          ...current,
          teamId,
          actorUserId: teamForm.creatorId,
        }));

        setMatchForm((current) => ({
          ...current,
          teamId,
          createdBy: teamForm.creatorId,
          district: teamForm.district,
        }));

        setCaptainAssignmentForm((current) => ({
          ...current,
          teamId,
          actorUserId: teamForm.creatorId,
        }));

        setTeamForm((current) => ({
          ...current,
          name: '',
          slug: '',
          description: '',
          confirmCaptain: false,
        }));
      } else {
        setManualError(summarizeBody(response.body));
      }
    } catch (error) {
      setManualError(error instanceof Error ? error.message : 'Không thể tạo đội.');
    } finally {
      setActiveAction(null);
    }
  }

  async function handleAddMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActiveAction('add-member');
    setManualError(null);

    try {
      const response = await request(`/teams/${memberForm.teamId}/members`, {
        method: 'POST',
        body: JSON.stringify({
          actorUserId: memberForm.actorUserId,
          userId: memberForm.userId,
          role: memberForm.role,
        }),
      });

      appendManualLog('Thêm thành viên vào đội', response);

      if (response.status === 201) {
        await refreshTeam(memberForm.teamId, true);
      } else {
        setManualError(summarizeBody(response.body));
      }
    } catch (error) {
      setManualError(error instanceof Error ? error.message : 'Không thể thêm thành viên.');
    } finally {
      setActiveAction(null);
    }
  }

  async function handleAssignCaptain(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActiveAction('assign-captain');
    setManualError(null);

    try {
      const response = await request(
        `/teams/${captainAssignmentForm.teamId}/members/${captainAssignmentForm.memberId}`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            actorUserId: captainAssignmentForm.actorUserId,
            role: 'captain',
          }),
        },
      );

      appendManualLog('Bổ nhiệm đội trưởng', response);

      if (response.status === 200) {
        await refreshTeam(captainAssignmentForm.teamId, true);
      } else {
        setManualError(summarizeBody(response.body));
      }
    } catch (error) {
      setManualError(error instanceof Error ? error.message : 'Không thể bổ nhiệm đội trưởng.');
    } finally {
      setActiveAction(null);
    }
  }

  async function handleLoadTeamById(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActiveAction('load-team');
    setManualError(null);

    try {
      const teamResponse = await refreshTeam(teamLookupId);

      if (teamResponse.status !== 200) {
        setManualError(summarizeBody(teamResponse.body));
        return;
      }

      await refreshTeamMatches(teamLookupId, true);

      setMemberForm((current) => ({
        ...current,
        teamId: teamResponse.body.id,
        actorUserId: teamResponse.body.creator?.id ?? current.actorUserId,
      }));

      setMatchForm((current) => ({
        ...current,
        teamId: teamResponse.body.id,
        createdBy: teamResponse.body.creator?.id ?? current.createdBy,
        district: teamResponse.body.district ?? current.district,
      }));

      setCaptainAssignmentForm((current) => ({
        ...current,
        teamId: teamResponse.body.id,
        actorUserId: teamResponse.body.creator?.id ?? current.actorUserId,
      }));
    } catch (error) {
      setManualError(error instanceof Error ? error.message : 'Không thể tải đội theo ID.');
    } finally {
      setActiveAction(null);
    }
  }

  async function handleCreateMatch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActiveAction('create-match');
    setManualError(null);

    try {
      const response = await request('/matches', {
        method: 'POST',
        body: JSON.stringify({
          teamId: matchForm.teamId,
          title: matchForm.title.trim(),
          startsAt: toIso(matchForm.startsAt),
          endsAt: toIso(matchForm.endsAt),
          district: matchForm.district.trim(),
          notes: matchForm.notes.trim() || undefined,
          createdBy: matchForm.createdBy,
        }),
      });

      appendManualLog('Tạo trận', response);

      if (response.status === 201) {
        const nextMatch = response.body as MatchRecord;
        upsertMatch(nextMatch);
        await refreshTeamMatches(nextMatch.teamId, true);

        setUrgentPostForm((current) => ({
          ...current,
          matchId: nextMatch.id,
          actorUserId: matchForm.createdBy,
        }));

        setMatchForm((current) => ({
          ...current,
          title: '',
          startsAt: '',
          endsAt: '',
          notes: '',
        }));
      } else {
        setManualError(summarizeBody(response.body));
      }
    } catch (error) {
      setManualError(error instanceof Error ? error.message : 'Không thể tạo trận.');
    } finally {
      setActiveAction(null);
    }
  }

  async function handleUpdateTeam(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActiveAction('update-team');
    setManualError(null);

    try {
      const response = await request(`/teams/${editTeamForm.teamId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          actorUserId: editTeamForm.actorUserId,
          name: editTeamForm.name.trim(),
          city: editTeamForm.city.trim(),
          district: editTeamForm.district.trim(),
          description: editTeamForm.description.trim() || undefined,
        }),
      });

      appendManualLog('Sửa đội', response);

      if (response.status === 200) {
        await refreshTeam(editTeamForm.teamId, true);
      } else {
        setManualError(summarizeBody(response.body));
      }
    } catch (error) {
      setManualError(error instanceof Error ? error.message : 'Không thể sửa đội.');
    } finally {
      setActiveAction(null);
    }
  }

  async function handleUpdateMatch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActiveAction('update-match');
    setManualError(null);

    try {
      const response = await request(`/matches/${editMatchForm.matchId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          actorUserId: editMatchForm.actorUserId,
          title: editMatchForm.title.trim(),
          startsAt: toIso(editMatchForm.startsAt),
          endsAt: toIso(editMatchForm.endsAt),
          district: editMatchForm.district.trim(),
          notes: editMatchForm.notes.trim() || undefined,
          status: editMatchForm.status,
        }),
      });

      appendManualLog('Sửa trận', response);

      if (response.status === 200) {
        await refreshMatch(editMatchForm.matchId, true);

        if (response.body.teamId) {
          await refreshTeamMatches(response.body.teamId, true);
        }
      } else {
        setManualError(summarizeBody(response.body));
      }
    } catch (error) {
      setManualError(error instanceof Error ? error.message : 'Không thể sửa trận.');
    } finally {
      setActiveAction(null);
    }
  }

  async function handleUpdateUrgentPost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActiveAction('update-urgent-post');
    setManualError(null);

    try {
      const response = await request(`/urgent-posts/${editUrgentPostForm.postId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          actorUserId: editUrgentPostForm.actorUserId,
          neededPlayers: Number(editUrgentPostForm.neededPlayers),
          expiresAt: toIso(editUrgentPostForm.expiresAt),
          description: editUrgentPostForm.description.trim() || undefined,
          feeShare: editUrgentPostForm.feeShare.trim() || undefined,
          status: editUrgentPostForm.status,
        }),
      });

      appendManualLog('Sửa kèo gấp', response);

      if (response.status === 200) {
        await refreshUrgentPost(editUrgentPostForm.postId, true);
      } else {
        setManualError(summarizeBody(response.body));
      }
    } catch (error) {
      setManualError(error instanceof Error ? error.message : 'Không thể sửa kèo gấp.');
    } finally {
      setActiveAction(null);
    }
  }

  async function handleCreateUrgentPost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActiveAction('create-urgent-post');
    setManualError(null);

    try {
      const match = matches.find((item) => item.id === urgentPostForm.matchId);

      if (!match) {
        setManualError('Bạn cần chọn một trận hợp lệ trước khi đăng kèo gấp.');
        return;
      }

      const response = await request('/urgent-posts', {
        method: 'POST',
        body: JSON.stringify({
          actorUserId: urgentPostForm.actorUserId,
          matchId: urgentPostForm.matchId,
          teamId: match.teamId,
          neededPlayers: Number(urgentPostForm.neededPlayers),
          expiresAt: toIso(urgentPostForm.expiresAt),
          description: urgentPostForm.description.trim() || undefined,
          feeShare: urgentPostForm.feeShare.trim() || undefined,
        }),
      });

      appendManualLog('Đăng kèo gấp', response);

      if (response.status === 201) {
        const nextPost = response.body as UrgentPostRecord;
        await refreshUrgentPost(nextPost.id, true);
        await refreshMatch(nextPost.matchId, true);

        setApplicationForm((current) => ({
          ...current,
          postId: nextPost.id,
        }));

        setReviewForm((current) => ({
          ...current,
          postId: nextPost.id,
          actorUserId: urgentPostForm.actorUserId,
        }));

        setUrgentPostForm((current) => ({
          ...current,
          neededPlayers: '1',
          expiresAt: '',
          description: '',
          feeShare: '',
        }));
      } else {
        setManualError(summarizeBody(response.body));
      }
    } catch (error) {
      setManualError(error instanceof Error ? error.message : 'Không thể đăng kèo gấp.');
    } finally {
      setActiveAction(null);
    }
  }

  async function handleApplyToUrgentPost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActiveAction('apply-post');
    setManualError(null);

    try {
      const response = await request(`/urgent-posts/${applicationForm.postId}/apply`, {
        method: 'POST',
        body: JSON.stringify({
          userId: applicationForm.userId,
          message: applicationForm.message.trim() || undefined,
        }),
      });

      appendManualLog('Ứng tuyển vào kèo gấp', response);

      if (response.status === 201) {
        await refreshUrgentPost(applicationForm.postId, true);

        setReviewForm((current) => ({
          ...current,
          postId: applicationForm.postId,
          applicationId: response.body.id,
        }));

        setApplicationForm((current) => ({
          ...current,
          message: '',
        }));
      } else {
        setManualError(summarizeBody(response.body));
      }
    } catch (error) {
      setManualError(error instanceof Error ? error.message : 'Không thể ứng tuyển vào kèo.');
    } finally {
      setActiveAction(null);
    }
  }

  async function handleReviewApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActiveAction('review-application');
    setManualError(null);

    try {
      const response = await request(
        `/urgent-posts/${reviewForm.postId}/applications/${reviewForm.applicationId}/${reviewForm.action}`,
        {
          method: 'POST',
          body: JSON.stringify({
            actorUserId: reviewForm.actorUserId,
          }),
        },
      );

      appendManualLog(
        reviewForm.action === 'accept' ? 'Duyệt ứng viên vào kèo' : 'Từ chối ứng viên vào kèo',
        response,
      );

      if (response.status === 201 || response.status === 200) {
        await refreshUrgentPost(reviewForm.postId, true);
      } else {
        setManualError(summarizeBody(response.body));
      }
    } catch (error) {
      setManualError(error instanceof Error ? error.message : 'Không thể duyệt ứng viên.');
    } finally {
      setActiveAction(null);
    }
  }

  async function runScenario() {
    setIsRunningScenario(true);
    setResults([]);
    setEntities({});
    setFatalError(null);

    const tag = `${Date.now()}`;
    setScenarioTag(tag);

    const nextEntities: ScenarioEntities = {};

    const pushResult = (step: Omit<StepResult, 'id'>) => {
      setResults((current) => [
        ...current,
        {
          id: `${current.length + 1}-${Date.now()}`,
          ...step,
        },
      ]);
    };

    const runStep = async (
      label: string,
      expectedStatus: number,
      action: () => Promise<ApiResponse>,
      onSuccess?: (body: any) => void,
    ) => {
      const response = await action();
      const passed = response.status === expectedStatus;

      if (passed && onSuccess) {
        onSuccess(response.body);
        setEntities({ ...nextEntities });
      }

      pushResult({
        label,
        expected: `${expectedStatus}`,
        actual: `${response.status}`,
        passed,
        detail: summarizeBody(response.body),
      });

      if (!passed) {
        throw new Error(`${label} trả về ${response.status}, kỳ vọng ${expectedStatus}.`);
      }

      return response.body;
    };

    try {
      const captain = await runStep('Tạo tài khoản đội trưởng', 201, () =>
        request('/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            name: 'Đội trưởng test UI',
            email: `captain-${tag}@example.com`,
          }),
        }),
      );
      nextEntities.captainId = captain.id;
      upsertUser(captain);
      setEntities({ ...nextEntities });

      const member = await runStep('Tạo tài khoản thành viên thường', 201, () =>
        request('/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            name: 'Thành viên test UI',
            email: `member-${tag}@example.com`,
          }),
        }),
      );
      nextEntities.memberId = member.id;
      upsertUser(member);
      setEntities({ ...nextEntities });

      const applicant = await runStep('Tạo tài khoản ứng tuyển vào kèo', 201, () =>
        request('/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            name: 'Ứng viên test UI',
            email: `applicant-${tag}@example.com`,
          }),
        }),
      );
      nextEntities.applicantId = applicant.id;
      upsertUser(applicant);
      setEntities({ ...nextEntities });

      const team = await runStep('Đội trưởng tạo đội bóng', 201, () =>
        request('/teams', {
          method: 'POST',
          body: JSON.stringify({
            name: `Đội test quyền ${tag}`,
            slug: `doi-test-quyen-${tag}`,
            city: 'Hà Nội',
            district: 'Cầu Giấy',
            description: 'Đội được tạo để kiểm tra quyền captain trên giao diện.',
            createdBy: captain.id,
          }),
        }),
      );
      nextEntities.teamId = team.id;
      setEntities({ ...nextEntities });
      await refreshTeam(team.id, true);

      await runStep('Đội trưởng thêm thành viên vào đội', 201, () =>
        request(`/teams/${team.id}/members`, {
          method: 'POST',
          body: JSON.stringify({
            actorUserId: captain.id,
            userId: member.id,
            role: 'member',
          }),
        }),
      );

      await runStep('Thành viên thường thử sửa đội', 403, () =>
        request(`/teams/${team.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            actorUserId: member.id,
            name: 'Tên đội không được phép sửa',
          }),
        }),
      );

      await runStep('Đội trưởng sửa đội thành công', 200, () =>
        request(`/teams/${team.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            actorUserId: captain.id,
            name: `Đội test quyền ${tag} - đã sửa`,
          }),
        }),
      );

      await runStep('Thành viên thường thử tạo trận', 403, () =>
        request('/matches', {
          method: 'POST',
          body: JSON.stringify({
            teamId: team.id,
            title: 'Kèo test không được tạo',
            startsAt: '2026-03-21T20:00:00.000Z',
            endsAt: '2026-03-21T21:30:00.000Z',
            district: 'Cầu Giấy',
            createdBy: member.id,
          }),
        }),
      );

      const match = await runStep('Đội trưởng tạo trận thành công', 201, () =>
        request('/matches', {
          method: 'POST',
          body: JSON.stringify({
            teamId: team.id,
            title: 'Kèo test quyền đội trưởng',
            startsAt: '2026-03-21T20:00:00.000Z',
            endsAt: '2026-03-21T21:30:00.000Z',
            district: 'Cầu Giấy',
            createdBy: captain.id,
          }),
        }),
      );
      nextEntities.matchId = match.id;
      setEntities({ ...nextEntities });

      await runStep('Thành viên thường thử đăng kèo gấp', 403, () =>
        request('/urgent-posts', {
          method: 'POST',
          body: JSON.stringify({
            actorUserId: member.id,
            matchId: match.id,
            teamId: team.id,
            neededPlayers: 1,
            expiresAt: '2026-03-21T19:30:00.000Z',
            description: 'Thử đăng bài khi không phải đội trưởng',
          }),
        }),
      );

      const urgentPost = await runStep('Đội trưởng đăng kèo gấp thành công', 201, () =>
        request('/urgent-posts', {
          method: 'POST',
          body: JSON.stringify({
            actorUserId: captain.id,
            matchId: match.id,
            teamId: team.id,
            neededPlayers: 1,
            expiresAt: '2026-03-21T19:30:00.000Z',
            description: 'Bài test để kiểm tra quyền duyệt ứng viên.',
          }),
        }),
      );
      nextEntities.urgentPostId = urgentPost.id;
      setEntities({ ...nextEntities });

      const application = await runStep('Ứng viên gửi request vào kèo', 201, () =>
        request(`/urgent-posts/${urgentPost.id}/apply`, {
          method: 'POST',
          body: JSON.stringify({
            userId: applicant.id,
            message: 'Cho mình vào đá nhé',
          }),
        }),
      );

      await runStep('Thành viên thường thử duyệt ứng viên', 403, () =>
        request(`/urgent-posts/${urgentPost.id}/applications/${application.id}/accept`, {
          method: 'POST',
          body: JSON.stringify({
            actorUserId: member.id,
          }),
        }),
      );

      await runStep('Đội trưởng duyệt ứng viên thành công', 201, () =>
        request(`/urgent-posts/${urgentPost.id}/applications/${application.id}/accept`, {
          method: 'POST',
          body: JSON.stringify({
            actorUserId: captain.id,
          }),
        }),
      );
    } catch (error) {
      setFatalError(error instanceof Error ? error.message : 'Đã có lỗi không xác định.');
    } finally {
      setIsRunningScenario(false);
    }
  }

  return (
    <section className="section">
      <div className="page-head">
        <div>
          <span className="kicker">Playground kiểm thử</span>
          <h1 className="page-title">Tạo đội, tạo thành viên và test quyền đội trưởng</h1>
          <p className="muted">
            Trang này đã có đủ form để đi hết flow chính bằng giao diện: tạo user, tạo đội, thêm
            thành viên, tạo trận, đăng kèo gấp, ứng tuyển và duyệt ứng viên.
          </p>
        </div>
      </div>

	      <div className="callout">
	        User được chọn ở bước <strong>Tạo đội</strong> sẽ tự thành đội trưởng đầu tiên. Nếu muốn
	        có thêm đội trưởng, hãy thêm thành viên vào đội trước rồi dùng form
	        <strong> Bổ nhiệm đội trưởng</strong>.
	      </div>

      <section className="section">
        <div className="section-header">
          <div>
            <h2>Thao tác tay trên giao diện</h2>
            <p className="muted">Không cần Postman hay console nữa, mọi flow chính đều ở đây.</p>
          </div>
        </div>

        <div className="manual-grid">
          <article className="panel">
            <h2>Tạo user</h2>
            <form className="form-stack" onSubmit={handleCreateUser}>
              <label className="field-group">
                <span className="field-label">Tên hiển thị</span>
                <input
                  className="input-control"
                  value={userForm.name}
                  onChange={(event) =>
                    setUserForm((current) => ({ ...current, name: event.target.value }))
                  }
                  placeholder="Ví dụ: Nguyễn Văn A"
                  required
                />
              </label>
              <label className="field-group">
                <span className="field-label">Email</span>
                <input
                  className="input-control"
                  type="email"
                  value={userForm.email}
                  onChange={(event) =>
                    setUserForm((current) => ({ ...current, email: event.target.value }))
                  }
                  placeholder="captain@example.com"
                  required
                />
              </label>
              <div className="form-actions">
                <button className="button" type="submit" disabled={activeAction === 'create-user'}>
                  {activeAction === 'create-user' ? 'Đang tạo...' : 'Tạo user'}
                </button>
              </div>
            </form>
          </article>

          <article className="panel">
            <h2>Tạo đội</h2>
            <form className="form-stack" onSubmit={handleCreateTeam}>
              <label className="field-group">
                <span className="field-label">Tên đội</span>
                <input
                  className="input-control"
                  value={teamForm.name}
                  onChange={(event) =>
                    setTeamForm((current) => ({ ...current, name: event.target.value }))
                  }
                  placeholder="Ví dụ: FC Cầu Giấy"
                  required
                />
              </label>
              <div className="form-grid">
                <label className="field-group">
                  <span className="field-label">Slug</span>
                  <input
                    className="input-control"
                    value={teamForm.slug}
                    onChange={(event) =>
                      setTeamForm((current) => ({ ...current, slug: event.target.value }))
                    }
                    placeholder="Để trống sẽ tự sinh"
                  />
                </label>
	                <label className="field-group">
	                  <span className="field-label">Người tạo đội</span>
	                  <select
	                    className="input-control"
	                    value={teamForm.creatorId}
	                    onChange={(event) =>
	                      setTeamForm((current) => ({ ...current, creatorId: event.target.value }))
	                    }
	                    required
	                  >
	                    <option value="">Chọn user sẽ tạo đội</option>
	                    {users.map((user) => (
	                      <option key={user.id} value={user.id}>
	                        {user.name} • {user.email}
	                      </option>
	                    ))}
	                  </select>
	                  <span className="helper-text">
	                    User tạo đội sẽ tự trở thành đội trưởng ngay sau khi tạo thành công.
	                  </span>
	                </label>
	              </div>
              <div className="form-grid">
                <label className="field-group">
                  <span className="field-label">Thành phố</span>
                  <input
                    className="input-control"
                    value={teamForm.city}
                    onChange={(event) =>
                      setTeamForm((current) => ({ ...current, city: event.target.value }))
                    }
                    required
                  />
                </label>
                <label className="field-group">
                  <span className="field-label">Quận</span>
                  <input
                    className="input-control"
                    value={teamForm.district}
                    onChange={(event) =>
                      setTeamForm((current) => ({ ...current, district: event.target.value }))
                    }
                    required
                  />
                </label>
              </div>
	              <label className="field-group">
	                <span className="field-label">Mô tả</span>
                <textarea
                  className="textarea-control"
                  rows={3}
                  value={teamForm.description}
                  onChange={(event) =>
                    setTeamForm((current) => ({ ...current, description: event.target.value }))
                  }
	                  placeholder="Ví dụ: đội văn phòng đá tối thứ 5"
	                />
	              </label>
	              <label className="checkbox-row">
	                <input
	                  type="checkbox"
	                  checked={teamForm.confirmCaptain}
	                  onChange={(event) =>
	                    setTeamForm((current) => ({
	                      ...current,
	                      confirmCaptain: event.target.checked,
	                    }))
	                  }
	                />
	                <span>
	                  Tôi xác nhận user này là người quản lý đội và sẽ trở thành đội trưởng sau khi tạo đội.
	                </span>
	              </label>
	              <div className="form-actions">
	                <button className="button" type="submit" disabled={activeAction === 'create-team'}>
	                  {activeAction === 'create-team' ? 'Đang tạo...' : 'Tạo đội và xác nhận đội trưởng'}
	                </button>
	              </div>
	            </form>
	          </article>
	        </div>

	        <div className="manual-grid" style={{ marginTop: 16 }}>
	          <article className="panel">
	            <h2>Thêm thành viên mới vào đội</h2>
	            <form className="form-stack" onSubmit={handleAddMember}>
              <label className="field-group">
                <span className="field-label">Đội</span>
                <select
                  className="input-control"
                  value={memberForm.teamId}
                  onChange={(event) =>
                    setMemberForm((current) => ({ ...current, teamId: event.target.value }))
                  }
                  required
                >
                  <option value="">Chọn đội</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name} • {team.district}
                    </option>
                  ))}
                </select>
              </label>
              <div className="form-grid">
                <label className="field-group">
                  <span className="field-label">Ai đang thực hiện thao tác</span>
                  <select
                    className="input-control"
                    value={memberForm.actorUserId}
                    onChange={(event) =>
                      setMemberForm((current) => ({ ...current, actorUserId: event.target.value }))
                    }
                    required
                  >
                    <option value="">Chọn actorUserId</option>
                    {captainSelectOptions.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} • {user.email}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field-group">
                  <span className="field-label">User được thêm</span>
                  <select
                    className="input-control"
                    value={memberForm.userId}
                    onChange={(event) =>
                      setMemberForm((current) => ({ ...current, userId: event.target.value }))
                    }
                    required
                  >
                    <option value="">Chọn user</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} • {user.email}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
	              <label className="field-group">
	                <span className="field-label">Role trong đội</span>
	                <select
	                  className="input-control"
	                  value={memberForm.role}
                  onChange={(event) =>
                    setMemberForm((current) => ({
                      ...current,
                      role: event.target.value as TeamRole,
                    }))
                  }
                >
	                  {memberInviteRoles.map((role) => (
	                    <option key={role} value={role}>
	                      {roleLabels[role]}
	                    </option>
	                  ))}
	                </select>
	                <span className="helper-text">{roleHints[memberForm.role]}</span>
	                <span className="helper-text">
	                  Nếu muốn giao quyền đội trưởng, hãy thêm user vào đội trước rồi dùng form bổ nhiệm bên cạnh.
	                </span>
	              </label>
	              <div className="form-actions">
	                <button className="button" type="submit" disabled={activeAction === 'add-member'}>
	                  {activeAction === 'add-member' ? 'Đang thêm...' : 'Thêm vào đội'}
	                </button>
	              </div>
	            </form>
	          </article>

	          <article className="panel">
	            <h2>Bổ nhiệm đội trưởng</h2>
	            <form className="form-stack" onSubmit={handleAssignCaptain}>
	              <label className="field-group">
	                <span className="field-label">Đội</span>
	                <select
	                  className="input-control"
	                  value={captainAssignmentForm.teamId}
	                  onChange={(event) =>
	                    setCaptainAssignmentForm((current) => ({
	                      ...current,
	                      teamId: event.target.value,
	                      memberId: '',
	                    }))
	                  }
	                  required
	                >
	                  <option value="">Chọn đội</option>
	                  {teams.map((team) => (
	                    <option key={team.id} value={team.id}>
	                      {team.name} • {team.district}
	                    </option>
	                  ))}
	                </select>
	              </label>
	              <div className="form-grid">
	                <label className="field-group">
	                  <span className="field-label">Đội trưởng đang thực hiện</span>
	                  <select
	                    className="input-control"
	                    value={captainAssignmentForm.actorUserId}
	                    onChange={(event) =>
	                      setCaptainAssignmentForm((current) => ({
	                        ...current,
	                        actorUserId: event.target.value,
	                      }))
	                    }
	                    required
	                  >
	                    <option value="">Chọn captain hiện tại</option>
	                    {captainAssignmentActorOptions.map((user) => (
	                      <option key={user.id} value={user.id}>
	                        {user.name} • {user.email}
	                      </option>
	                    ))}
	                  </select>
	                </label>
	                <label className="field-group">
	                  <span className="field-label">Thành viên được bổ nhiệm</span>
	                  <select
	                    className="input-control"
	                    value={captainAssignmentForm.memberId}
	                    onChange={(event) =>
	                      setCaptainAssignmentForm((current) => ({
	                        ...current,
	                        memberId: event.target.value,
	                      }))
	                    }
	                    required
	                  >
	                    <option value="">Chọn thành viên</option>
	                    {captainAssignmentMemberOptions.map((member) => (
	                      <option key={member.id} value={member.id}>
	                        {member.user.name} • {roleLabels[member.role]}
	                      </option>
	                    ))}
	                  </select>
	                </label>
	              </div>
	              <p className="helper-text">
	                Flow chuẩn hơn là: tạo đội {'->'} thêm thành viên {'->'} bổ nhiệm đội trưởng nếu cần.
	              </p>
	              {captainAssignmentForm.teamId && captainAssignmentMemberOptions.length === 0 ? (
	                <p className="helper-text">Đội này hiện chưa có thành viên nào để bổ nhiệm thêm làm đội trưởng.</p>
	              ) : null}
	              <div className="form-actions">
	                <button
	                  className="button-secondary"
	                  type="submit"
	                  disabled={activeAction === 'assign-captain'}
	                >
	                  {activeAction === 'assign-captain' ? 'Đang cập nhật...' : 'Bổ nhiệm làm đội trưởng'}
	                </button>
	              </div>
	            </form>
	          </article>

	          <article className="panel">
	            <h2>Tải lại chi tiết đội theo ID</h2>
            <form className="form-stack" onSubmit={handleLoadTeamById}>
              <label className="field-group">
                <span className="field-label">Team ID</span>
                <input
                  className="input-control mono"
                  value={teamLookupId}
                  onChange={(event) => setTeamLookupId(event.target.value)}
                  placeholder="Dán team id vào đây"
                  required
                />
              </label>
              <div className="form-actions">
                <button
                  className="button-secondary"
                  type="submit"
                  disabled={activeAction === 'load-team'}
                >
                  {activeAction === 'load-team' ? 'Đang tải...' : 'Lấy dữ liệu đội'}
                </button>
              </div>
            </form>
            {manualError ? (
              <div className="callout" style={{ marginTop: 16 }}>
                <strong>Lỗi thao tác tay:</strong> {manualError}
              </div>
            ) : null}
          </article>
        </div>

        <div className="manual-grid" style={{ marginTop: 16 }}>
          <article className="panel">
            <h2>Sửa đội</h2>
            <form className="form-stack" onSubmit={handleUpdateTeam}>
              <label className="field-group">
                <span className="field-label">Đội cần sửa</span>
                <select
                  className="input-control"
                  value={editTeamForm.teamId}
                  onChange={(event) => {
                    const team = teams.find((item) => item.id === event.target.value);
                    if (team) {
                      loadTeamIntoEditForm(team);
                    } else {
                      setEditTeamForm((current) => ({ ...current, teamId: event.target.value }));
                    }
                  }}
                  required
                >
                  <option value="">Chọn đội</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name} • {team.district}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field-group">
                <span className="field-label">Ai đang sửa đội</span>
                <select
                  className="input-control"
                  value={editTeamForm.actorUserId}
                  onChange={(event) =>
                    setEditTeamForm((current) => ({ ...current, actorUserId: event.target.value }))
                  }
                  required
                >
                  <option value="">Chọn đội trưởng</option>
                  {editTeamCaptainChoices.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} • {user.email}
                    </option>
                  ))}
                </select>
              </label>
              <div className="form-grid">
                <label className="field-group">
                  <span className="field-label">Tên đội</span>
                  <input
                    className="input-control"
                    value={editTeamForm.name}
                    onChange={(event) =>
                      setEditTeamForm((current) => ({ ...current, name: event.target.value }))
                    }
                    required
                  />
                </label>
                <label className="field-group">
                  <span className="field-label">Thành phố</span>
                  <input
                    className="input-control"
                    value={editTeamForm.city}
                    onChange={(event) =>
                      setEditTeamForm((current) => ({ ...current, city: event.target.value }))
                    }
                    required
                  />
                </label>
              </div>
              <label className="field-group">
                <span className="field-label">Quận</span>
                <input
                  className="input-control"
                  value={editTeamForm.district}
                  onChange={(event) =>
                    setEditTeamForm((current) => ({ ...current, district: event.target.value }))
                  }
                  required
                />
              </label>
              <label className="field-group">
                <span className="field-label">Mô tả</span>
                <textarea
                  className="textarea-control"
                  rows={3}
                  value={editTeamForm.description}
                  onChange={(event) =>
                    setEditTeamForm((current) => ({ ...current, description: event.target.value }))
                  }
                />
              </label>
              <div className="form-actions">
                <button className="button" type="submit" disabled={activeAction === 'update-team'}>
                  {activeAction === 'update-team' ? 'Đang lưu...' : 'Lưu thay đổi đội'}
                </button>
              </div>
            </form>
          </article>

          <article className="panel">
            <h2>Mẹo dùng nhanh</h2>
            <div className="meta-grid">
              <div className="meta-row">
                <span className="meta-label">Nạp dữ liệu nhanh</span>
                <span>
                  Từ danh sách đội, bấm <strong>Nạp vào form sửa</strong> để đỡ phải chọn lại bằng tay.
                </span>
              </div>
              <div className="meta-row">
                <span className="meta-label">Nếu bị 403</span>
                <span>
                  Kiểm tra lại `Ai đang sửa đội` có đúng là user mang role `Đội trưởng` của đội đó không.
                </span>
              </div>
              <div className="meta-row">
                <span className="meta-label">Giữ context</span>
                <span>
                  Sau khi tạo đội mới, form sửa đội sẽ chưa tự nạp. Hãy bấm nút từ card đội để load vào.
                </span>
              </div>
            </div>
          </article>
        </div>

        <div className="manual-grid" style={{ marginTop: 16 }}>
          <article className="panel">
            <h2>Tạo trận cho đội</h2>
            <form className="form-stack" onSubmit={handleCreateMatch}>
              <label className="field-group">
                <span className="field-label">Đội</span>
                <select
                  className="input-control"
                  value={matchForm.teamId}
                  onChange={(event) =>
                    setMatchForm((current) => ({ ...current, teamId: event.target.value }))
                  }
                  required
                >
                  <option value="">Chọn đội</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name} • {team.district}
                    </option>
                  ))}
                </select>
              </label>
              <div className="form-grid">
                <label className="field-group">
                  <span className="field-label">Người tạo trận</span>
                  <select
                    className="input-control"
                    value={matchForm.createdBy}
                    onChange={(event) =>
                      setMatchForm((current) => ({ ...current, createdBy: event.target.value }))
                    }
                    required
                  >
                    <option value="">Chọn đội trưởng</option>
                    {matchCaptainOptions.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} • {user.email}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field-group">
                  <span className="field-label">Quận</span>
                  <input
                    className="input-control"
                    value={matchForm.district}
                    onChange={(event) =>
                      setMatchForm((current) => ({ ...current, district: event.target.value }))
                    }
                    required
                  />
                </label>
              </div>
              <label className="field-group">
                <span className="field-label">Tên trận</span>
                <input
                  className="input-control"
                  value={matchForm.title}
                  onChange={(event) =>
                    setMatchForm((current) => ({ ...current, title: event.target.value }))
                  }
                  placeholder="Ví dụ: Kèo tối thứ 5 sân 7"
                  required
                />
              </label>
              <div className="form-grid">
                <label className="field-group">
                  <span className="field-label">Bắt đầu</span>
                  <input
                    className="input-control"
                    type="datetime-local"
                    value={matchForm.startsAt}
                    onChange={(event) =>
                      setMatchForm((current) => ({ ...current, startsAt: event.target.value }))
                    }
                    required
                  />
                </label>
                <label className="field-group">
                  <span className="field-label">Kết thúc</span>
                  <input
                    className="input-control"
                    type="datetime-local"
                    value={matchForm.endsAt}
                    onChange={(event) =>
                      setMatchForm((current) => ({ ...current, endsAt: event.target.value }))
                    }
                    required
                  />
                </label>
              </div>
              <label className="field-group">
                <span className="field-label">Ghi chú</span>
                <textarea
                  className="textarea-control"
                  rows={3}
                  value={matchForm.notes}
                  onChange={(event) =>
                    setMatchForm((current) => ({ ...current, notes: event.target.value }))
                  }
                  placeholder="Ví dụ: đội cần đá sớm đúng giờ"
                />
              </label>
              <div className="form-actions">
                <button className="button" type="submit" disabled={activeAction === 'create-match'}>
                  {activeAction === 'create-match' ? 'Đang tạo...' : 'Tạo trận'}
                </button>
              </div>
            </form>
          </article>

          <article className="panel">
            <h2>Đăng kèo gấp cần người</h2>
            <form className="form-stack" onSubmit={handleCreateUrgentPost}>
              <label className="field-group">
                <span className="field-label">Trận đấu</span>
                <select
                  className="input-control"
                  value={urgentPostForm.matchId}
                  onChange={(event) =>
                    setUrgentPostForm((current) => ({ ...current, matchId: event.target.value }))
                  }
                  required
                >
                  <option value="">Chọn trận</option>
                  {matches.map((match) => (
                    <option key={match.id} value={match.id}>
                      {match.title} • {formatDateTime(match.startsAt)}
                    </option>
                  ))}
                </select>
              </label>
              <div className="form-grid">
                <label className="field-group">
                  <span className="field-label">Đội trưởng đăng bài</span>
                  <select
                    className="input-control"
                    value={urgentPostForm.actorUserId}
                    onChange={(event) =>
                      setUrgentPostForm((current) => ({
                        ...current,
                        actorUserId: event.target.value,
                      }))
                    }
                    required
                  >
                    <option value="">Chọn đội trưởng</option>
                    {urgentPostCaptainOptions.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} • {user.email}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field-group">
                  <span className="field-label">Số người cần</span>
                  <input
                    className="input-control"
                    type="number"
                    min={1}
                    max={5}
                    value={urgentPostForm.neededPlayers}
                    onChange={(event) =>
                      setUrgentPostForm((current) => ({
                        ...current,
                        neededPlayers: event.target.value,
                      }))
                    }
                    required
                  />
                </label>
              </div>
              <div className="form-grid">
                <label className="field-group">
                  <span className="field-label">Hạn nhận người</span>
                  <input
                    className="input-control"
                    type="datetime-local"
                    value={urgentPostForm.expiresAt}
                    onChange={(event) =>
                      setUrgentPostForm((current) => ({ ...current, expiresAt: event.target.value }))
                    }
                    required
                  />
                </label>
                <label className="field-group">
                  <span className="field-label">Phí chia sân</span>
                  <input
                    className="input-control"
                    value={urgentPostForm.feeShare}
                    onChange={(event) =>
                      setUrgentPostForm((current) => ({ ...current, feeShare: event.target.value }))
                    }
                    placeholder="Ví dụ: 80.000 VND"
                  />
                </label>
              </div>
              <label className="field-group">
                <span className="field-label">Mô tả</span>
                <textarea
                  className="textarea-control"
                  rows={3}
                  value={urgentPostForm.description}
                  onChange={(event) =>
                    setUrgentPostForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Ví dụ: cần 1 hậu vệ, đá chắc, đúng giờ"
                />
              </label>
              <div className="form-actions">
                <button
                  className="button"
                  type="submit"
                  disabled={activeAction === 'create-urgent-post'}
                >
                  {activeAction === 'create-urgent-post' ? 'Đang đăng...' : 'Đăng kèo gấp'}
                </button>
              </div>
            </form>
          </article>
        </div>

        <div className="manual-grid" style={{ marginTop: 16 }}>
          <article className="panel">
            <h2>Sửa trận</h2>
            <form className="form-stack" onSubmit={handleUpdateMatch}>
              <label className="field-group">
                <span className="field-label">Trận cần sửa</span>
                <select
                  className="input-control"
                  value={editMatchForm.matchId}
                  onChange={(event) => {
                    const match = matches.find((item) => item.id === event.target.value);
                    if (match) {
                      loadMatchIntoEditForm(match);
                    } else {
                      setEditMatchForm((current) => ({ ...current, matchId: event.target.value }));
                    }
                  }}
                  required
                >
                  <option value="">Chọn trận</option>
                  {matches.map((match) => (
                    <option key={match.id} value={match.id}>
                      {match.title} • {formatDateTime(match.startsAt)}
                    </option>
                  ))}
                </select>
              </label>
              <div className="form-grid">
                <label className="field-group">
                  <span className="field-label">Ai đang sửa trận</span>
                  <select
                    className="input-control"
                    value={editMatchForm.actorUserId}
                    onChange={(event) =>
                      setEditMatchForm((current) => ({
                        ...current,
                        actorUserId: event.target.value,
                      }))
                    }
                    required
                  >
                    <option value="">Chọn đội trưởng</option>
                    {editMatchCaptainChoices.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} • {user.email}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field-group">
                  <span className="field-label">Trạng thái</span>
                  <select
                    className="input-control"
                    value={editMatchForm.status}
                    onChange={(event) =>
                      setEditMatchForm((current) => ({
                        ...current,
                        status: event.target.value as MatchStatus,
                      }))
                    }
                  >
                    {Object.entries(matchStatusLabels).map(([status, label]) => (
                      <option key={status} value={status}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="field-group">
                <span className="field-label">Tên trận</span>
                <input
                  className="input-control"
                  value={editMatchForm.title}
                  onChange={(event) =>
                    setEditMatchForm((current) => ({ ...current, title: event.target.value }))
                  }
                  required
                />
              </label>
              <div className="form-grid">
                <label className="field-group">
                  <span className="field-label">Bắt đầu</span>
                  <input
                    className="input-control"
                    type="datetime-local"
                    value={editMatchForm.startsAt}
                    onChange={(event) =>
                      setEditMatchForm((current) => ({ ...current, startsAt: event.target.value }))
                    }
                    required
                  />
                </label>
                <label className="field-group">
                  <span className="field-label">Kết thúc</span>
                  <input
                    className="input-control"
                    type="datetime-local"
                    value={editMatchForm.endsAt}
                    onChange={(event) =>
                      setEditMatchForm((current) => ({ ...current, endsAt: event.target.value }))
                    }
                    required
                  />
                </label>
              </div>
              <label className="field-group">
                <span className="field-label">Quận</span>
                <input
                  className="input-control"
                  value={editMatchForm.district}
                  onChange={(event) =>
                    setEditMatchForm((current) => ({ ...current, district: event.target.value }))
                  }
                  required
                />
              </label>
              <label className="field-group">
                <span className="field-label">Ghi chú</span>
                <textarea
                  className="textarea-control"
                  rows={3}
                  value={editMatchForm.notes}
                  onChange={(event) =>
                    setEditMatchForm((current) => ({ ...current, notes: event.target.value }))
                  }
                />
              </label>
              <div className="form-actions">
                <button className="button" type="submit" disabled={activeAction === 'update-match'}>
                  {activeAction === 'update-match' ? 'Đang lưu...' : 'Lưu thay đổi trận'}
                </button>
              </div>
            </form>
          </article>

          <article className="panel">
            <h2>Sửa kèo gấp</h2>
            <form className="form-stack" onSubmit={handleUpdateUrgentPost}>
              <label className="field-group">
                <span className="field-label">Bài kèo cần sửa</span>
                <select
                  className="input-control"
                  value={editUrgentPostForm.postId}
                  onChange={(event) => {
                    const post = urgentPosts.find((item) => item.id === event.target.value);
                    if (post) {
                      loadUrgentPostIntoEditForm(post);
                    } else {
                      setEditUrgentPostForm((current) => ({
                        ...current,
                        postId: event.target.value,
                      }));
                    }
                  }}
                  required
                >
                  <option value="">Chọn bài kèo</option>
                  {urgentPosts.map((post) => (
                    <option key={post.id} value={post.id}>
                      {post.match?.title ?? `Kèo ${post.id}`} • {urgentPostStatusLabels[post.status]}
                    </option>
                  ))}
                </select>
              </label>
              <div className="form-grid">
                <label className="field-group">
                  <span className="field-label">Ai đang sửa kèo</span>
                  <select
                    className="input-control"
                    value={editUrgentPostForm.actorUserId}
                    onChange={(event) =>
                      setEditUrgentPostForm((current) => ({
                        ...current,
                        actorUserId: event.target.value,
                      }))
                    }
                    required
                  >
                    <option value="">Chọn đội trưởng</option>
                    {editUrgentPostCaptainChoices.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} • {user.email}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field-group">
                  <span className="field-label">Trạng thái</span>
                  <select
                    className="input-control"
                    value={editUrgentPostForm.status}
                    onChange={(event) =>
                      setEditUrgentPostForm((current) => ({
                        ...current,
                        status: event.target.value as UrgentPostStatus,
                      }))
                    }
                  >
                    {Object.entries(urgentPostStatusLabels).map(([status, label]) => (
                      <option key={status} value={status}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="form-grid">
                <label className="field-group">
                  <span className="field-label">Số người cần</span>
                  <input
                    className="input-control"
                    type="number"
                    min={1}
                    max={5}
                    value={editUrgentPostForm.neededPlayers}
                    onChange={(event) =>
                      setEditUrgentPostForm((current) => ({
                        ...current,
                        neededPlayers: event.target.value,
                      }))
                    }
                    required
                  />
                </label>
                <label className="field-group">
                  <span className="field-label">Hạn nhận người</span>
                  <input
                    className="input-control"
                    type="datetime-local"
                    value={editUrgentPostForm.expiresAt}
                    onChange={(event) =>
                      setEditUrgentPostForm((current) => ({
                        ...current,
                        expiresAt: event.target.value,
                      }))
                    }
                    required
                  />
                </label>
              </div>
              <label className="field-group">
                <span className="field-label">Phí chia sân</span>
                <input
                  className="input-control"
                  value={editUrgentPostForm.feeShare}
                  onChange={(event) =>
                    setEditUrgentPostForm((current) => ({
                      ...current,
                      feeShare: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="field-group">
                <span className="field-label">Mô tả</span>
                <textarea
                  className="textarea-control"
                  rows={3}
                  value={editUrgentPostForm.description}
                  onChange={(event) =>
                    setEditUrgentPostForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                />
              </label>
              <div className="form-actions">
                <button
                  className="button"
                  type="submit"
                  disabled={activeAction === 'update-urgent-post'}
                >
                  {activeAction === 'update-urgent-post' ? 'Đang lưu...' : 'Lưu thay đổi kèo'}
                </button>
              </div>
            </form>
          </article>
        </div>

        <div className="manual-grid" style={{ marginTop: 16 }}>
          <article className="panel">
            <h2>Ứng tuyển vào kèo gấp</h2>
            <form className="form-stack" onSubmit={handleApplyToUrgentPost}>
              <label className="field-group">
                <span className="field-label">Bài kèo gấp</span>
                <select
                  className="input-control"
                  value={applicationForm.postId}
                  onChange={(event) =>
                    setApplicationForm((current) => ({ ...current, postId: event.target.value }))
                  }
                  required
                >
                  <option value="">Chọn bài kèo</option>
                  {urgentPosts.map((post) => (
                    <option key={post.id} value={post.id}>
                      {post.match?.title ?? `Kèo ${post.id}`} • {urgentPostStatusLabels[post.status]}
                    </option>
                  ))}
                </select>
              </label>
              <div className="form-grid">
                <label className="field-group">
                  <span className="field-label">User ứng tuyển</span>
                  <select
                    className="input-control"
                    value={applicationForm.userId}
                    onChange={(event) =>
                      setApplicationForm((current) => ({ ...current, userId: event.target.value }))
                    }
                    required
                  >
                    <option value="">Chọn user</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} • {user.email}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field-group">
                  <span className="field-label">Ghi chú</span>
                  <input
                    className="input-control"
                    value={applicationForm.message}
                    onChange={(event) =>
                      setApplicationForm((current) => ({ ...current, message: event.target.value }))
                    }
                    placeholder="Ví dụ: mình đá được hậu vệ"
                  />
                </label>
              </div>
              <div className="form-actions">
                <button className="button" type="submit" disabled={activeAction === 'apply-post'}>
                  {activeAction === 'apply-post' ? 'Đang gửi...' : 'Gửi ứng tuyển'}
                </button>
              </div>
            </form>
          </article>

          <article className="panel">
            <h2>Duyệt hoặc từ chối ứng viên</h2>
            <form className="form-stack" onSubmit={handleReviewApplication}>
              <label className="field-group">
                <span className="field-label">Bài kèo gấp</span>
                <select
                  className="input-control"
                  value={reviewForm.postId}
                  onChange={(event) =>
                    setReviewForm((current) => ({
                      ...current,
                      postId: event.target.value,
                      applicationId: '',
                    }))
                  }
                  required
                >
                  <option value="">Chọn bài kèo</option>
                  {urgentPosts.map((post) => (
                    <option key={post.id} value={post.id}>
                      {post.match?.title ?? `Kèo ${post.id}`} • {urgentPostStatusLabels[post.status]}
                    </option>
                  ))}
                </select>
              </label>
              <div className="form-grid">
                <label className="field-group">
                  <span className="field-label">Ai đang duyệt</span>
                  <select
                    className="input-control"
                    value={reviewForm.actorUserId}
                    onChange={(event) =>
                      setReviewForm((current) => ({ ...current, actorUserId: event.target.value }))
                    }
                    required
                  >
                    <option value="">Chọn đội trưởng</option>
                    {reviewCaptainOptions.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} • {user.email}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field-group">
                  <span className="field-label">Hành động</span>
                  <select
                    className="input-control"
                    value={reviewForm.action}
                    onChange={(event) =>
                      setReviewForm((current) => ({
                        ...current,
                        action: event.target.value as ApplicationAction,
                      }))
                    }
                  >
                    <option value="accept">Duyệt</option>
                    <option value="reject">Từ chối</option>
                  </select>
                </label>
              </div>
              <label className="field-group">
                <span className="field-label">Ứng viên</span>
                <select
                  className="input-control"
                  value={reviewForm.applicationId}
                  onChange={(event) =>
                    setReviewForm((current) => ({
                      ...current,
                      applicationId: event.target.value,
                    }))
                  }
                  required
                >
                  <option value="">Chọn application</option>
                  {reviewApplications.map((application) => (
                    <option key={application.id} value={application.id}>
                      {(application.user?.name ?? application.userId ?? 'Không rõ user')} •{' '}
                      {applicationStatusLabels[application.status]}
                    </option>
                  ))}
                </select>
              </label>
              <div className="form-actions">
                <button
                  className="button"
                  type="submit"
                  disabled={activeAction === 'review-application'}
                >
                  {activeAction === 'review-application'
                    ? 'Đang xử lý...'
                    : reviewForm.action === 'accept'
                      ? 'Duyệt ứng viên'
                      : 'Từ chối ứng viên'}
                </button>
              </div>
            </form>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div>
            <h2>User đã tạo trong phiên</h2>
            <p className="muted">Bạn có thể dùng các user này để chọn làm đội trưởng hoặc đi apply.</p>
          </div>
        </div>
        <div className="entity-grid">
          {users.length === 0 ? (
            <article className="result-item">
              <div className="result-body">
                <strong>Chưa có user nào.</strong>
                <span>Hãy tạo user ở form phía trên.</span>
              </div>
            </article>
          ) : (
            users.map((user) => (
              <article key={user.id} className="entity-card">
                <span className="eyebrow">{user.name}</span>
                <strong>{user.email}</strong>
                <span className="mono">{user.id}</span>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div>
            <h2>Đội bóng đang theo dõi</h2>
            <p className="muted">Mỗi đội hiển thị creator, danh sách thành viên và role hiện tại.</p>
          </div>
        </div>
        <div className="entity-list">
          {teams.length === 0 ? (
            <article className="result-item">
              <div className="result-body">
                <strong>Chưa có đội nào trong phiên này.</strong>
                <span>Tạo đội mới hoặc dán team ID để tải lại dữ liệu cũ.</span>
              </div>
            </article>
          ) : (
            teams.map((team) => (
              <article key={team.id} className="panel">
                <div className="result-top">
                  <div className="stack">
                    <span className="eyebrow">
                      {team.city} • {team.district}
                    </span>
                    <strong>{team.name}</strong>
                    <span className="mono">{team.id}</span>
                  </div>
                  <div className="stack" style={{ justifyItems: 'end' }}>
                    <button
                      className="button-secondary"
                      type="button"
                      onClick={() => {
                        loadTeamIntoEditForm(team);
                      }}
                    >
                      Nạp vào form sửa
                    </button>
                    <button
                      className="button-secondary"
                      type="button"
                      onClick={() => {
                        setTeamLookupId(team.id);
                        setMemberForm((current) => ({
                          ...current,
                          teamId: team.id,
                          actorUserId: team.creator?.id ?? current.actorUserId,
                        }));
                        setMatchForm((current) => ({
                          ...current,
                          teamId: team.id,
                          createdBy: team.creator?.id ?? current.createdBy,
                          district: team.district,
                        }));
                        void refreshTeam(team.id);
                        void refreshTeamMatches(team.id, true);
                      }}
                    >
                      Làm mới đội này
                    </button>
                  </div>
                </div>
                <div className="meta-grid">
                  <div className="meta-row">
                    <span className="meta-label">Người tạo đội</span>
                    <span>
                      {team.creator ? `${team.creator.name} • ${team.creator.email}` : 'Chưa có dữ liệu'}
                    </span>
                  </div>
                  <div className="meta-row">
                    <span className="meta-label">Slug</span>
                    <span className="mono">{team.slug}</span>
                  </div>
                  <div className="meta-row">
                    <span className="meta-label">Mô tả</span>
                    <span>{team.description || 'Chưa có mô tả'}</span>
                  </div>
                </div>
                <div className="section" style={{ marginTop: 18 }}>
                  <h2>Thành viên trong đội</h2>
                  <div className="member-list">
                    {team.members && team.members.length > 0 ? (
                      team.members.map((member) => (
	                        <article key={member.id} className="member-row">
	                          <div className="stack">
	                            <strong>{member.user.name}</strong>
	                            <span className="muted">{member.user.email}</span>
	                            <span className="mono">{member.user.id}</span>
	                          </div>
	                          <div className="stack" style={{ justifyItems: 'end' }}>
	                            <span className="role-pill">{roleLabels[member.role]}</span>
	                            <span className="muted">
	                              Tham gia: {formatDateTime(member.joinedAt)}
	                            </span>
	                            {member.role !== 'captain' ? (
	                              <button
	                                className="button-secondary"
	                                type="button"
	                                onClick={() => {
	                                  const captainUser =
	                                    team.members?.find((item) => item.role === 'captain')?.user ?? null;
	
	                                  setCaptainAssignmentForm({
	                                    teamId: team.id,
	                                    actorUserId: captainUser?.id ?? '',
	                                    memberId: member.id,
	                                  });
	                                }}
	                              >
	                                Nạp vào form bổ nhiệm
	                              </button>
	                            ) : null}
	                          </div>
	                        </article>
                      ))
                    ) : (
                      <article className="result-item">
                        <div className="result-body">
                          <strong>Đội chưa có thành viên nào ngoài creator.</strong>
                        </div>
                      </article>
                    )}
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div>
            <h2>Danh sách trận đã tạo</h2>
            <p className="muted">Bạn có thể chọn các trận này để đăng kèo gấp phía trên.</p>
          </div>
        </div>
        <div className="entity-list">
          {matches.length === 0 ? (
            <article className="result-item">
              <div className="result-body">
                <strong>Chưa có trận nào.</strong>
                <span>Hãy tạo trận ở form phía trên.</span>
              </div>
            </article>
          ) : (
            matches.map((match) => {
              const team = teams.find((item) => item.id === match.teamId);

              return (
                <article key={match.id} className="panel">
                  <div className="result-top">
                    <div className="stack">
                      <span className="eyebrow">{team?.name ?? 'Không rõ đội'}</span>
                      <strong>{match.title}</strong>
                      <span className="mono">{match.id}</span>
                    </div>
                    <div className="stack" style={{ justifyItems: 'end' }}>
                      <button
                        className="button-secondary"
                        type="button"
                        onClick={() => {
                          loadMatchIntoEditForm(match);
                        }}
                      >
                        Nạp vào form sửa
                      </button>
                      <button
                        className="button-secondary"
                        type="button"
                        onClick={() => {
                          void refreshMatch(match.id);
                          setUrgentPostForm((current) => ({
                            ...current,
                            matchId: match.id,
                          }));
                        }}
                      >
                        Làm mới trận
                      </button>
                    </div>
                  </div>
                  <div className="meta-grid">
                    <div className="meta-row">
                      <span className="meta-label">Giờ đá</span>
                      <span>
                        {formatDateTime(match.startsAt)} đến {formatDateTime(match.endsAt)}
                      </span>
                    </div>
                    <div className="meta-row">
                      <span className="meta-label">Quận</span>
                      <span>{match.district}</span>
                    </div>
                    <div className="meta-row">
                      <span className="meta-label">Trạng thái</span>
                      <span>{matchStatusLabels[match.status]}</span>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div>
            <h2>Kèo gấp và ứng viên</h2>
            <p className="muted">Các bài kèo ở đây sẽ hiển thị luôn người apply và trạng thái duyệt.</p>
          </div>
        </div>
        <div className="entity-list">
          {urgentPosts.length === 0 ? (
            <article className="result-item">
              <div className="result-body">
                <strong>Chưa có bài kèo gấp nào.</strong>
                <span>Hãy tạo trận trước, rồi đăng kèo gấp.</span>
              </div>
            </article>
          ) : (
            urgentPosts.map((post) => (
              <article key={post.id} className="panel">
                <div className="result-top">
                  <div className="stack">
                    <span className="eyebrow">
                      {post.team?.name ?? post.match?.title ?? 'Kèo gấp'}
                    </span>
                    <strong>{post.match?.title ?? `Bài kèo ${post.id}`}</strong>
                    <span className="mono">{post.id}</span>
                  </div>
                  <div className="stack" style={{ justifyItems: 'end' }}>
                    <span className="role-pill">{urgentPostStatusLabels[post.status]}</span>
                    <button
                      className="button-secondary"
                      type="button"
                      onClick={() => {
                        loadUrgentPostIntoEditForm(post);
                      }}
                    >
                      Nạp vào form sửa
                    </button>
                    <button
                      className="button-secondary"
                      type="button"
                      onClick={() => {
                        void refreshUrgentPost(post.id);
                        setApplicationForm((current) => ({ ...current, postId: post.id }));
                        setReviewForm((current) => ({ ...current, postId: post.id }));
                      }}
                    >
                      Làm mới bài kèo
                    </button>
                  </div>
                </div>
                <div className="meta-grid">
                  <div className="meta-row">
                    <span className="meta-label">Số người cần</span>
                    <span>{post.neededPlayers}</span>
                  </div>
                  <div className="meta-row">
                    <span className="meta-label">Hạn nhận người</span>
                    <span>{formatDateTime(post.expiresAt)}</span>
                  </div>
                  <div className="meta-row">
                    <span className="meta-label">Phí chia sân</span>
                    <span>{post.feeShare || 'Chưa khai báo'}</span>
                  </div>
                  <div className="meta-row">
                    <span className="meta-label">Mô tả</span>
                    <span>{post.description || 'Không có mô tả'}</span>
                  </div>
                </div>
                <div className="section" style={{ marginTop: 18 }}>
                  <h2>Ứng viên đã apply</h2>
                  <div className="member-list">
                    {post.applications && post.applications.length > 0 ? (
                      post.applications.map((application) => (
                        <article key={application.id} className="member-row">
                          <div className="stack">
                            <strong>
                              {application.user?.name ?? application.userId ?? 'Không rõ user'}
                            </strong>
                            <span className="muted">
                              {application.user?.email ?? 'Không có email'}
                            </span>
                            <span className="mono">{application.id}</span>
                            <span className="muted">
                              Gửi lúc: {formatDateTime(application.createdAt)}
                            </span>
                            <span className="muted">
                              Lời nhắn: {application.message || 'Không có'}
                            </span>
                          </div>
                          <div className="stack" style={{ justifyItems: 'end' }}>
                            <span className="role-pill">
                              {applicationStatusLabels[application.status]}
                            </span>
                          </div>
                        </article>
                      ))
                    ) : (
                      <article className="result-item">
                        <div className="result-body">
                          <strong>Chưa có ai apply vào bài này.</strong>
                        </div>
                      </article>
                    )}
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div>
            <h2>Nhật ký thao tác tay</h2>
            <p className="muted">Mỗi action đều log lại HTTP status để bạn xem nhanh có đúng hay không.</p>
          </div>
        </div>
        <div className="result-list">
          {manualLogs.length === 0 ? (
            <article className="result-item">
              <div className="result-body">
                <strong>Chưa có thao tác nào được ghi lại.</strong>
                <span>
                  Hãy dùng các form phía trên để tạo user, tạo đội, thêm thành viên, tạo trận hoặc
                  đăng kèo gấp.
                </span>
              </div>
            </article>
          ) : (
            manualLogs.map((log) => (
              <article key={log.id} className="result-item">
                <div className="result-top">
                  <strong>{log.label}</strong>
                  <span className={`status-badge ${log.passed ? 'status-ok' : 'status-fail'}`}>
                    HTTP {log.status}
                  </span>
                </div>
                <div className="result-body">
                  <span>{log.detail}</span>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div>
            <h2>Kịch bản auto test quyền đội trưởng</h2>
            <p className="muted">
              Nếu muốn test end-to-end nhanh, dùng nút bên dưới để API tự chạy kịch bản mẫu.
            </p>
          </div>
        </div>

        <div className="test-grid">
          <article className="panel">
            <h2>Kịch bản sẽ chạy</h2>
            <p>
              Hệ thống sẽ tự tạo tài khoản mẫu, tạo đội, thêm thành viên, tạo trận, đăng kèo gấp và
              thử cả hai trường hợp: người thường thao tác sai quyền và đội trưởng thao tác đúng quyền.
            </p>
            <div className="meta-grid">
              <div className="meta-row">
                <span className="meta-label">API đang gọi tới</span>
                <span className="mono">{apiBaseUrl}/api</span>
              </div>
              <div className="meta-row">
                <span className="meta-label">Mã lần chạy gần nhất</span>
                <span className="mono">{scenarioTag || 'Chưa chạy lần nào'}</span>
              </div>
              <div className="meta-row">
                <span className="meta-label">Lưu ý</span>
                <span>Mỗi lần bấm sẽ tạo dữ liệu test mới trong database local của bạn.</span>
              </div>
            </div>
            <div className="test-actions">
              <button className="button" type="button" onClick={runScenario} disabled={isRunningScenario}>
                {isRunningScenario ? 'Đang chạy kịch bản...' : 'Chạy test quyền đội trưởng'}
              </button>
              <button
                className="button-secondary"
                type="button"
                onClick={() => {
                  setResults([]);
                  setEntities({});
                  setScenarioTag('');
                  setFatalError(null);
                }}
                disabled={isRunningScenario}
              >
                Xóa kết quả auto test
              </button>
            </div>
            {fatalError ? (
              <div className="callout" style={{ marginTop: 18 }}>
                <strong>Dừng kịch bản:</strong> {fatalError}
              </div>
            ) : null}
          </article>

          <article className="panel">
            <h2>Entity do auto test tạo ra</h2>
            <div className="meta-grid">
              <div className="meta-row">
                <span className="meta-label">Captain ID</span>
                <span className="mono">{entities.captainId ?? 'Chưa có'}</span>
              </div>
              <div className="meta-row">
                <span className="meta-label">Member ID</span>
                <span className="mono">{entities.memberId ?? 'Chưa có'}</span>
              </div>
              <div className="meta-row">
                <span className="meta-label">Applicant ID</span>
                <span className="mono">{entities.applicantId ?? 'Chưa có'}</span>
              </div>
              <div className="meta-row">
                <span className="meta-label">Team ID</span>
                <span className="mono">{entities.teamId ?? 'Chưa có'}</span>
              </div>
              <div className="meta-row">
                <span className="meta-label">Match ID</span>
                <span className="mono">{entities.matchId ?? 'Chưa có'}</span>
              </div>
              <div className="meta-row">
                <span className="meta-label">Urgent Post ID</span>
                <span className="mono">{entities.urgentPostId ?? 'Chưa có'}</span>
              </div>
            </div>
          </article>
        </div>

        <div className="section">
          <div className="section-header">
            <div>
              <h2>Kết quả từng bước</h2>
              <p className="muted">
                Bước hợp lệ của đội trưởng phải thành công, còn bước do thành viên thường thực hiện
                phải trả về `403`.
              </p>
            </div>
          </div>
          <div className="result-list">
            {results.length === 0 ? (
              <article className="result-item">
                <div className="result-body">
                  <strong>Chưa có dữ liệu auto test.</strong>
                  <span>Bấm nút `Chạy test quyền đội trưởng` để bắt đầu.</span>
                </div>
              </article>
            ) : (
              results.map((result) => (
                <article key={result.id} className="result-item">
                  <div className="result-top">
                    <strong>{result.label}</strong>
                    <span className={`status-badge ${result.passed ? 'status-ok' : 'status-fail'}`}>
                      {result.passed ? 'Đúng kỳ vọng' : 'Sai kỳ vọng'}
                    </span>
                  </div>
                  <div className="result-body">
                    <span>
                      <strong>Kỳ vọng:</strong> HTTP {result.expected}
                    </span>
                    <span>
                      <strong>Thực tế:</strong> HTTP {result.actual}
                    </span>
                    <span>
                      <strong>Chi tiết:</strong> {result.detail}
                    </span>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </section>
  );
}
