'use client';

import { useState, useEffect, useCallback } from 'react';

interface Web3Window extends Window {
  ethereum?: {
    isMetaMask?: boolean;
    request: (args: { method: string; params?: any[] }) => Promise<any>;
    on: (event: string, callback: (...args: any[]) => void) => void;
    removeListener: (event: string, callback: (...args: any[]) => void) => void;
  };
}

declare const window: Web3Window;

interface WalletState {
  address: string | null;
  chainId: string | null;
  connected: boolean;
  balance: string | null;
}

export function useWeb3() {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    chainId: null,
    connected: false,
    balance: null,
  });
  const [isInstalled, setIsInstalled] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum?.isMetaMask) {
      setIsInstalled(true);
      checkConnection();
    }
  }, []);

  const checkConnection = async () => {
    if (!window.ethereum) return;
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const balance = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [accounts[0], 'latest'],
        });
        const ethBalance = (parseInt(balance, 16) / 1e18).toFixed(4);
        setWallet({
          address: accounts[0],
          chainId,
          connected: true,
          balance: ethBalance,
        });
      }
    } catch {}
  };

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }
    setIsConnecting(true);
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [accounts[0], 'latest'],
      });
      const ethBalance = (parseInt(balance, 16) / 1e18).toFixed(4);
      setWallet({
        address: accounts[0],
        chainId,
        connected: true,
        balance: ethBalance,
      });
      return accounts[0];
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setWallet({ address: null, chainId: null, connected: false, balance: null });
  }, []);

  const getChainName = (chainId: string | null) => {
    const chains: Record<string, string> = {
      '0x1': 'Ethereum Mainnet',
      '0x89': 'Polygon',
      '0xa4b1': 'Arbitrum One',
      '0x38': 'BNB Chain',
      '0x13881': 'Polygon Mumbai',
      '0xaa36a7': 'Sepolia Testnet',
    };
    return chains[chainId || ''] || `Chain ${chainId}`;
  };

  return {
    wallet,
    isInstalled,
    isConnecting,
    connect,
    disconnect,
    getChainName,
  };
}
