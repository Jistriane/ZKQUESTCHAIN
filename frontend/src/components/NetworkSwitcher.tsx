import { useState } from 'react';
import { StellarNetwork, getCurrentNetwork } from '../config/stellar';

export const NetworkSwitcher = () => {
  const [network, setNetwork] = useState(getCurrentNetwork());

  const handleSwitch = (value: StellarNetwork) => {
    localStorage.setItem('STELLAR_NETWORK_OVERRIDE', value);
    setNetwork(value);
    window.location.reload();
  };

  return (
    <select
      aria-label="Select Stellar network"
      value={network}
      onChange={(e) => handleSwitch(e.target.value as StellarNetwork)}
      className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs"
    >
      <option value={StellarNetwork.FUTURENET}>Futurenet</option>
      <option value={StellarNetwork.TESTNET}>Testnet</option>
    </select>
  );
};
