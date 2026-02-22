import {
  Address,
  BASE_FEE,
  Contract,
  scValToNative,
  SorobanRpc,
  TransactionBuilder
} from '@stellar/stellar-sdk';
import { getCurrentNetwork, networkConfig } from '../config/stellar';
import { getRpcServer } from './stellar';

export type OnchainProfile = {
  xp: number;
  level: number;
  achievements: number;
};

export const fetchOnchainProfile = async (address: string): Promise<OnchainProfile | null> => {
  const network = getCurrentNetwork();
  const config = networkConfig[network];

  if (config.contractIds.playerRegistry.includes('...')) {
    return null;
  }

  const server = getRpcServer();
  let account;
  try {
    account = await server.getAccount(address);
  } catch {
    return null;
  }

  const contract = new Contract(config.contractIds.playerRegistry);
  const operation = contract.call('get_profile', Address.fromString(address).toScVal());
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: config.networkPassphrase
  })
    .addOperation(operation)
    .setTimeout(30)
    .build();

  let sim: SorobanRpc.Api.SimulateTransactionResponse;
  try {
    sim = await server.simulateTransaction(tx);
  } catch {
    return null;
  }

  const rawReturn = (sim as any).result?.retval ?? (sim as any).results?.[0]?.retval ?? (sim as any).results?.[0]?.xdr;
  if (!rawReturn) return null;

  let native: any;
  try {
    native = scValToNative(rawReturn);
  } catch {
    return null;
  }

  const xp = Number(native?.total_xp ?? native?.totalXp ?? 0);
  const level = Number(native?.level ?? 1);
  const achievementsList = native?.achievements ?? [];
  const achievements = Array.isArray(achievementsList) ? achievementsList.length : Number(native?.achievements_count ?? 0);

  return {
    xp,
    level,
    achievements
  };
};
