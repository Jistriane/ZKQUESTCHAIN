type ProfileCardProps = {
  xp: number;
  level: number;
  achievements: number;
  sourceLabel?: string;
  onSync?: () => void;
  syncing?: boolean;
  syncError?: string | null;
};

export const ProfileCard = ({
  xp,
  level,
  achievements,
  sourceLabel,
  onSync,
  syncing,
  syncError
}: ProfileCardProps) => {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Your Profile</h3>
        {onSync && (
          <button
            onClick={onSync}
            disabled={syncing}
            className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-200 disabled:opacity-50"
          >
            {syncing ? 'Syncing…' : 'Sync onchain'}
          </button>
        )}
      </div>
      <div className="mt-4 grid gap-3 text-sm text-slate-300">
        <div className="flex items-center justify-between">
          <span>XP</span>
          <span>{xp}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Level</span>
          <span>{level}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Achievements</span>
          <span>{achievements}</span>
        </div>
      </div>
      {sourceLabel && <p className="mt-4 text-xs text-slate-500">{sourceLabel}</p>}
      {syncError && <p className="mt-2 text-xs text-red-400">{syncError}</p>}
    </div>
  );
};
