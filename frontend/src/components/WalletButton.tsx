import { useWallet } from '../hooks/useWallet';

export const WalletButton = () => {
  const { address, connect, disconnect, isConnecting, walletName, error } = useWallet();

  if (address) {
    return (
      <button
        onClick={disconnect}
        className="rounded-lg border border-slate-700 px-4 py-2 text-sm"
      >
        {walletName ?? 'Wallet'} • {address.slice(0, 6)}…{address.slice(-4)}
      </button>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={connect}
        disabled={isConnecting}
        className="rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 text-sm font-semibold"
      >
        {isConnecting ? 'Connecting…' : 'Connect Freighter'}
      </button>
      {error && (
        <p className="text-xs text-red-400 max-w-xs text-right">
          {error}
        </p>
      )}
    </div>
  );
};
