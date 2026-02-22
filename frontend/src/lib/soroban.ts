import {
  Address,
  BASE_FEE,
  Contract,
  SorobanRpc,
  TransactionBuilder
} from '@stellar/stellar-sdk';
import { getCurrentNetwork, networkConfig } from '../config/stellar';
import { getWalletAddress, walletKit } from '../config/wallets';
import { getRpcServer } from './stellar';

type SubmitProofArgs = {
  questId: number;
  proof: Uint8Array;
  publicInputs: Uint8Array;
};

export const submitQuestProof = async ({ questId, proof, publicInputs }: SubmitProofArgs): Promise<string> => {
  const address = await getWalletAddress();
  if (!address) throw new Error('Wallet not connected');

  const network = getCurrentNetwork();
  const config = networkConfig[network];
  const server = getRpcServer();

  if (config.contractIds.questManager.includes('...')) {
    throw new Error('Update QuestManager contractId in config/stellar.ts');
  }

  const account = await server.getAccount(address);
  const player = Address.fromString(address);
  const contractId = config.contractIds.questManager;

  const contract = new Contract(contractId);
  const operation = contract.call('submit_proof', player, questId, proof, publicInputs);

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: config.networkPassphrase
  })
    .addOperation(operation)
    .setTimeout(60)
    .build();

  const signedXdr = await (walletKit as any).signTransaction?.(tx.toXdr(), {
    networkPassphrase: config.networkPassphrase
  });
  if (!signedXdr) throw new Error('Transaction signing failed');

  const signedTx = TransactionBuilder.fromXdr(signedXdr, config.networkPassphrase);
  const sendResult = await server.sendTransaction(signedTx);
  if (sendResult.status !== 'PENDING') {
    throw new Error(`Failed to send transaction: ${sendResult.status}`);
  }

  await waitForTx(server, sendResult.hash);
  return sendResult.hash;
};

const waitForTx = async (server: SorobanRpc.Server, hash: string) => {
  for (let i = 0; i < 20; i += 1) {
    const result = await server.getTransaction(hash);
    if (result.status === SorobanRpc.Api.GetTransactionStatus.SUCCESS) return result;
    if (result.status === SorobanRpc.Api.GetTransactionStatus.FAILED) {
      throw new Error('Transaction failed');
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error('Timeout waiting for transaction confirmation');
};
