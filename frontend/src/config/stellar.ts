export enum StellarNetwork {
  FUTURENET = 'FUTURENET',
  TESTNET = 'TESTNET'
}

const envNetwork = (import.meta.env.VITE_STELLAR_NETWORK as string | undefined) ?? 'FUTURENET';
const getEnv = (key: string, fallback: string) => (import.meta.env[key] as string | undefined) ?? fallback;

export const networkConfig = {
  [StellarNetwork.FUTURENET]: {
    networkPassphrase: 'Test SDF Future Network ; October 2022',
    horizonUrl: import.meta.env.VITE_HORIZON_URL ?? 'https://horizon-futurenet.stellar.org',
    rpcUrl: import.meta.env.VITE_RPC_URL ?? 'https://rpc-futurenet.stellar.org',
    friendbotUrl: 'https://friendbot-futurenet.stellar.org',
    contractIds: {
      questManager: getEnv('VITE_CONTRACT_QUEST_MANAGER', 'CA...'),
      playerRegistry: getEnv('VITE_CONTRACT_PLAYER_REGISTRY', 'CB...'),
      achievementNft: getEnv('VITE_CONTRACT_ACHIEVEMENT_NFT', 'CC...'),
      ultrahonkVerifier: getEnv('VITE_CONTRACT_ULTRAHONK', 'CD...')
    }
  },
  [StellarNetwork.TESTNET]: {
    networkPassphrase: 'Test SDF Network ; September 2015',
    horizonUrl: 'https://horizon-testnet.stellar.org',
    rpcUrl: 'https://soroban-testnet.stellar.org',
    friendbotUrl: 'https://friendbot.stellar.org',
    contractIds: {
      questManager: getEnv(
        'VITE_CONTRACT_QUEST_MANAGER_TESTNET',
        'CAYLKAVMTQPLJ3Q34YR4MSKOUXYFQMOGWQVPKFUKTWHGGHUQNQJIMBAK'
      ),
      playerRegistry: getEnv('VITE_CONTRACT_PLAYER_REGISTRY_TESTNET', 'CBK3I5AAAIJ6WT7YGEIKVQULY2TGKVL3UMXGC4KD5M4YQPA23RSEPV3O'),
      achievementNft: getEnv('VITE_CONTRACT_ACHIEVEMENT_NFT_TESTNET', 'CDQ3D4U64NZ7N4GNNLBSUQ55ZRSDNVK3ROJNPNJAZL4JLLC3DVKQTEKG'),
      ultrahonkVerifier: getEnv('VITE_CONTRACT_ULTRAHONK_TESTNET', 'CDMAU7PE5DFPORYS4OPCS34O4EVDJNO7X2WIXPNLNFVQYHE376FM76DB')
    }
  }
};

export const getCurrentNetwork = (): StellarNetwork => {
  const override = localStorage.getItem('STELLAR_NETWORK_OVERRIDE');
  if (override === StellarNetwork.TESTNET) return StellarNetwork.TESTNET;
  if (override === StellarNetwork.FUTURENET) return StellarNetwork.FUTURENET;
  return envNetwork === 'TESTNET' ? StellarNetwork.TESTNET : StellarNetwork.FUTURENET;
};
