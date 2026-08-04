'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';

interface WalletState {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  networkId: string | null;
}

interface WalletContextType extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const WALLET_STORAGE_KEY = 'silentpay_wallet';

function findWallet(): { wallet: any; key: string } | null {
  const midnight = (window as any).midnight;
  if (!midnight) return null;
  if (midnight.mnLace) return { wallet: midnight.mnLace, key: 'mnLace' };
  if (midnight['1am']) return { wallet: midnight['1am'], key: '1am' };
  for (const key of Object.keys(midnight)) {
    const candidate = midnight[key];
    if (candidate && typeof candidate === 'object') {
      if (typeof candidate.connect === 'function' || typeof candidate.enable === 'function') {
        return { wallet: candidate, key };
      }
    }
  }
  return null;
}

function toAddressString(value: any): string | null {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    if (typeof value.unshieldedAddress === 'string') return value.unshieldedAddress;
    if (typeof value.address === 'string') return value.address;
    if (typeof value.addr === 'string') return value.addr;
  }
  return null;
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>({
    address: null,
    isConnected: false,
    isConnecting: false,
    error: null,
    networkId: null,
  });

  // Restore wallet session from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(WALLET_STORAGE_KEY);
    if (saved) {
      try {
        const { address: storedAddress, networkId, timestamp } = JSON.parse(saved);
        const isValid = Date.now() - timestamp < 24 * 60 * 60 * 1000;
        const address = toAddressString(storedAddress);
        if (isValid && address && !address.startsWith('[object')) {
          setState((prev) => ({
            ...prev,
            address,
            isConnected: true,
            networkId: networkId || null,
          }));
        } else {
          localStorage.removeItem(WALLET_STORAGE_KEY);
        }
      } catch {
        localStorage.removeItem(WALLET_STORAGE_KEY);
      }
    }
  }, []);

  const connect = useCallback(async () => {
    setState((prev) => ({ ...prev, isConnecting: true, error: null }));

    try {
      const midnight = (window as any).midnight;
      let found = findWallet();

      if (!found) {
        for (let i = 0; i < 50; i++) {
          await new Promise((r) => setTimeout(r, 100));
          found = findWallet();
          if (found) break;
        }
      }

      if (!found) {
        throw new Error('Lace Wallet not detected. Please install and unlock it.');
      }

      const { wallet } = found;

      let api: any = null;
      for (const netId of ['preview', 'preprod', 'undeployed', 'mainnet']) {
        try {
          api = await wallet.connect(netId);
          break;
        } catch {
          api = null;
        }
      }

      if (!api) {
        throw new Error('Wallet connect failed. Please unlock your wallet and try again.');
      }

      // Get network
      let network: string | null = null;
      try {
        const status = await api.getConnectionStatus();
        network = status?.networkId ?? null;
        setNetworkId(status.networkId);
      } catch {
        setNetworkId('preprod');
      }

      // Get address — try multiple methods, keep the first real string
      let address: string | null = null;

      // Method 1: getUnshieldedAddress
      try {
        const raw = await api.getUnshieldedAddress();
        address = toAddressString(raw);
      } catch {}

      // Method 2: state()
      if (!address && typeof api.state === 'function') {
        try {
          const s = await api.state();
          address = toAddressString(s?.address);
          if (!network) network = s?.networkId || 'preprod';
        } catch {}
      }

      // Method 3: scan all API properties for a bech32 address string
      if (!address) {
        const allKeys = [...Object.getOwnPropertyNames(api)];
        let proto = Object.getPrototypeOf(api);
        while (proto && proto !== Object.prototype) {
          allKeys.push(...Object.getOwnPropertyNames(proto));
          proto = Object.getPrototypeOf(proto);
        }
        for (const key of [...new Set(allKeys)]) {
          try {
            const val = api[key];
            if (typeof val === 'string' && val.length > 10 && !val.startsWith('[object')) {
              address = val;
              break;
            }
            if (val && typeof val === 'object') {
              const nested = toAddressString(val.address ?? val);
              if (nested && !nested.startsWith('[object')) {
                address = nested;
                break;
              }
            }
          } catch {}
        }
      }

      if (!address) {
        throw new Error('Could not retrieve wallet address.');
      }

      localStorage.setItem(
        WALLET_STORAGE_KEY,
        JSON.stringify({ address, networkId: network, timestamp: Date.now() })
      );

      setState({
        address,
        isConnected: true,
        isConnecting: false,
        error: null,
        networkId: network,
      });

      if (typeof window !== 'undefined') {
        window.location.href = '/dashboard';
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect wallet';
      console.error('[SilentPay] Connect error:', message);
      setState((prev) => ({
        ...prev,
        isConnecting: false,
        error: message,
      }));
    }
  }, []);

  const disconnect = useCallback(() => {
    try {
      const found = findWallet();
      if (found && typeof found.wallet.disconnect === 'function') {
        found.wallet.disconnect();
      }
    } catch {}
    localStorage.removeItem(WALLET_STORAGE_KEY);
    setState({
      address: null,
      isConnected: false,
      isConnecting: false,
      error: null,
      networkId: null,
    });
  }, []);

  return (
    <WalletContext.Provider
      value={{
        ...state,
        connect,
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
