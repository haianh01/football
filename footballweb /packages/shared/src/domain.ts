export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';
export type TeamRole = 'captain' | 'manager' | 'member';
export type MatchStatus = 'draft' | 'open' | 'full' | 'completed' | 'cancelled';
export type UrgentPostStatus = 'open' | 'closed' | 'expired';
export type PitchType = '5' | '7' | '11';

export interface FieldSummary {
  id: string;
  name: string;
  district: string;
  address: string;
  pitchType: PitchType;
  priceRange?: string | null;
  verified: boolean;
}

export interface UrgentPostSummary {
  id: string;
  title: string;
  district: string;
  startsAt: string;
  neededPlayers: number;
  skillLevel?: SkillLevel | null;
  feeShare?: string | null;
  status: UrgentPostStatus;
  teamName: string;
}

