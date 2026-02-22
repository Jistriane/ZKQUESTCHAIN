import { useEffect, useMemo, useState } from 'react';
import { SudokuCard } from '../components/SudokuCard';
import { ProfileCard } from '../components/ProfileCard';
import { QuestProgress } from '../components/QuestProgress';
import { sudokuQuests } from '../lib/quests';
import { fetchOnchainProfile, OnchainProfile } from '../lib/profile';
import { getWalletAddress } from '../config/wallets';

export const HomePage = () => {
  const [questIndex, setQuestIndex] = useState(() => {
    if (typeof window === 'undefined') return 0;
    const saved = window.localStorage.getItem('zkquestchain_progress');
    if (!saved) return 0;
    try {
      const parsed = JSON.parse(saved) as { questIndex?: number };
      return parsed.questIndex ?? 0;
    } catch {
      return 0;
    }
  });
  const [completedQuestIds, setCompletedQuestIds] = useState<number[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = window.localStorage.getItem('zkquestchain_progress');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved) as { completedQuestIds?: number[] };
      return parsed.completedQuestIds ?? [];
    } catch {
      return [];
    }
  });

  const currentQuest = sudokuQuests[questIndex % sudokuQuests.length];
  const [onchainProfile, setOnchainProfile] = useState<OnchainProfile | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const localXp = useMemo(() => {
    return completedQuestIds.reduce((sum, questId) => {
      const quest = sudokuQuests.find((item) => item.id === questId);
      return sum + (quest?.rewardXp ?? 0);
    }, 0);
  }, [completedQuestIds]);
  const localAchievements = useMemo(() => completedQuestIds.length, [completedQuestIds]);
  const localLevel = useMemo(() => Math.max(1, Math.floor(Math.sqrt(localXp / 100))), [localXp]);

  const xp = onchainProfile?.xp ?? localXp;
  const achievements = onchainProfile?.achievements ?? localAchievements;
  const level = onchainProfile?.level ?? localLevel;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(
      'zkquestchain_progress',
      JSON.stringify({ questIndex, completedQuestIds })
    );
  }, [questIndex, completedQuestIds]);

  const handleQuestCompleted = () => {
    setCompletedQuestIds((prev) => {
      if (prev.includes(currentQuest.id)) return prev;
      return [...prev, currentQuest.id];
    });
    setQuestIndex((prev) => (prev + 1) % sudokuQuests.length);
  };

  const handleSyncProfile = async () => {
    setSyncing(true);
    setSyncError(null);
    try {
      const address = await getWalletAddress();
      if (!address) {
        setSyncError('Wallet not connected.');
        setOnchainProfile(null);
        return;
      }
      const profile = await fetchOnchainProfile(address);
      if (!profile) {
        setSyncError('Onchain profile not found yet.');
        setOnchainProfile(null);
        return;
      }
      setOnchainProfile(profile);
    } catch (error: any) {
      setSyncError(error?.message ?? 'Failed to sync onchain profile.');
      setOnchainProfile(null);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <SudokuCard quest={currentQuest} onCompleted={handleQuestCompleted} />
      </div>
      <div>
        <ProfileCard
          xp={xp}
          level={level}
          achievements={achievements}
          sourceLabel={onchainProfile ? 'Synced from blockchain' : 'Local progress'}
          onSync={handleSyncProfile}
          syncing={syncing}
          syncError={syncError}
        />
        <div className="mt-6">
          <QuestProgress
            quests={sudokuQuests}
            currentQuestId={currentQuest.id}
            completedQuestIds={completedQuestIds}
          />
        </div>
      </div>
    </div>
  );
};
