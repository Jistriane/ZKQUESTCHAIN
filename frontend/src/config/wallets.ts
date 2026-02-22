import {
  StellarWalletsKit,
  WalletNetwork,
  allowAllModules,
  FREIGHTER_ID,
  XBULL_ID
} from '@creit.tech/stellar-wallets-kit';
import { getCurrentNetwork, StellarNetwork } from './stellar';

const network = getCurrentNetwork() === StellarNetwork.TESTNET
  ? WalletNetwork.TESTNET
  : WalletNetwork.FUTURENET;

export const walletKit = new StellarWalletsKit({
  network,
  selectedWalletId: FREIGHTER_ID,
  modules: allowAllModules([FREIGHTER_ID])
});

export const connectWallet = async (preferredWalletId = FREIGHTER_ID): Promise<string> => {
  try {
    await walletKit.openModal({
      onWalletSelected: async (option: any) => {
        walletKit.setWallet(option.id);
      }
    });
    
    const { address } = await walletKit.getAddress();
    if (!address) throw new Error('Unable to get wallet address');
    return address;
  } catch (error: any) {
    if (error?.message?.includes('User rejected') || error?.message?.includes('User cancelled')) {
      throw new Error('Connection rejected by user');
    }
    throw error;
  }
};

export const disconnectWallet = async (): Promise<void> => {
  await walletKit.disconnect?.();
};

export const getWalletName = (): string | undefined => {
  return walletKit.getWalletId?.();
};

export const getWalletAddress = async (): Promise<string | null> => {
  const direct = await (walletKit as any).getPublicKey?.();
  if (direct) return direct;
  const addressResult = await (walletKit as any).getAddress?.();
  return addressResult?.address ?? null;
};

export { FREIGHTER_ID, XBULL_ID };
