import { SorobanRpc } from '@stellar/stellar-sdk';
import { getCurrentNetwork, networkConfig } from '../config/stellar';

export const getRpcServer = () => {
  const network = getCurrentNetwork();
  const rpcUrl = networkConfig[network].rpcUrl;
  return new SorobanRpc.Server(rpcUrl, { allowHttp: false });
};
