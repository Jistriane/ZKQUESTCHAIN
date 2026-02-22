import { WalletButton } from './WalletButton';
import { NetworkSwitcher } from './NetworkSwitcher';

export const Header = () => {
  return (
    <header className="border-b border-slate-800">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="zkQuestChain" className="h-10 w-10" />
          <div className="text-xl font-semibold">zkQuestChain</div>
        </div>
        <div className="flex items-center gap-3">
          <NetworkSwitcher />
          <WalletButton />
        </div>
      </div>
    </header>
  );
};
