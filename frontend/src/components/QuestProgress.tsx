import { SudokuQuest } from '../lib/quests';

type QuestProgressProps = {
  quests: SudokuQuest[];
  currentQuestId: number;
  completedQuestIds: number[];
};

export const QuestProgress = ({ quests, currentQuestId, completedQuestIds }: QuestProgressProps) => {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <h3 className="text-lg font-semibold">Quest Progress</h3>
      <div className="mt-4 space-y-3 text-sm text-slate-300">
        {quests.map((quest) => {
          const isCompleted = completedQuestIds.includes(quest.id);
          const isCurrent = quest.id === currentQuestId;
          return (
            <div
              key={quest.id}
              className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/40 px-3 py-2"
            >
              <div>
                <div className="font-medium text-slate-100">{quest.title}</div>
                <div className="text-xs text-slate-500">+{quest.rewardXp} XP</div>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  isCompleted
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : isCurrent
                      ? 'bg-blue-500/20 text-blue-300'
                      : 'bg-slate-700/40 text-slate-400'
                }`}
              >
                {isCompleted ? 'Completed' : isCurrent ? 'Current' : 'Locked'}
              </span>
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-xs text-slate-500">Progress is saved locally in this browser.</p>
    </div>
  );
};
