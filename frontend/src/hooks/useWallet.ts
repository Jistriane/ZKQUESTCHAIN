import { useCallback, useState } from 'react';
import { connectWallet, disconnectWallet, getWalletName, FREIGHTER_ID, XBULL_ID } from '../config/wallets';

export const useWallet = () => {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const addr = await connectWallet(FREIGHTER_ID);
      setAddress(addr);
    } catch (err: any) {
      setError(err?.message || 'Failed to connect Freighter wallet');
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    await disconnectWallet();
    setAddress(null);
    setError(null);
  }, []);

  return {
    address,
    isConnecting,
    error,
    connect,
    disconnect,
    walletName: getWalletName()
  };
};
