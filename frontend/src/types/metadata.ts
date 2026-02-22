export interface AchievementMetadata {
  name: string;
  description: string;
  image: string;
  external_url?: string;
  attributes: AchievementAttribute[];
  proof_metadata: ProofMetadata;
  quest_data: QuestData;
  soulbound: boolean;
  minted_at: number;
  expires_at?: number | null;
}

export interface AchievementAttribute {
  trait_type: string;
  value: string | number;
  display_type?: 'string' | 'number' | 'boost_percentage' | 'boost_number' | 'date';
}

export interface ProofMetadata {
  proof_hash: string;
  verification_key_hash: string;
  circuit_name: string;
  public_inputs?: string[];
  verified_onchain: boolean;
  verification_tx?: string;
}

export interface QuestData {
  quest_id: number;
  quest_title: string;
  category: QuestCategory;
  difficulty: QuestDifficulty;
  xp_rewarded: number;
  completion_count?: number;
  success_rate?: number;
}

export enum QuestCategory {
  MATH = 'Math',
  LOGIC = 'Logic',
  PROGRAMMING = 'Programming',
  CHESS = 'Chess',
  CRYPTOGRAPHY = 'Cryptography'
}

export enum QuestDifficulty {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced',
  EXPERT = 'Expert',
  LEGENDARY = 'Legendary'
}
