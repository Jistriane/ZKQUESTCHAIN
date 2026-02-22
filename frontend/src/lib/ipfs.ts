import { create } from '@web3-storage/w3up-client';

let client: any;

export const initIPFS = async () => {
  if (!client) {
    client = await create();
  }
  return client;
};

export const uploadMetadata = async (data: Record<string, unknown>): Promise<string> => {
  const ipfs = await initIPFS();
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  const file = new File([blob], 'metadata.json');
  const cid = await ipfs.uploadFile(file);
  return `ipfs://${cid}`;
};

export const uploadImage = async (imageBlob: Blob): Promise<string> => {
  const ipfs = await initIPFS();
  const cid = await ipfs.uploadFile(imageBlob);
  return `ipfs://${cid}`;
};

export const fetchFromIPFS = async (cid: string): Promise<any> => {
  const gateway = import.meta.env.VITE_IPFS_GATEWAY ?? 'https://w3s.link/ipfs/';
  const response = await fetch(`${gateway}${cid}`);
  return response.json();
};
