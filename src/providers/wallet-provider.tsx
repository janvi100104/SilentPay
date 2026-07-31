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
const TARGET_NETWORK = 'preprod';

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
        const { address, networkId, timestamp } = JSON.parse(saved);
        const isValid = Date.now() - timestamp < 24 * 60 * 60 * 1000;
        if (isValid && address) {
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
      // The Lace wallet injects under window.midnight.mnLace
      const wallet = (window as any).midnight?.mnLace;
      if (!wallet) {
        throw new Error(
          'Lace Wallet not detected. Make sure the Lace extension is installed and enabled.\n\n' +
          'Extension: https://chromewebstore.google.com/detail/lace/gafhhkghbfjjkeiendhlofajokpaflmk\n\n' +
          'After installing, refresh this page.'
        );
      }

      // New DApp Connector API (CAIP-372): connect(networkId)
      // This MUST be called synchronously in the click handler — the browser
      // blocks popups if we await anything before calling it.
      let api: any;
      if (typeof wallet.connect === 'function') {
        api = await wallet.connect(TARGET_NETWORK);
      } else if (typeof wallet.enable === 'function') {
        // Fallback to old API for older wallet versions
        api = await wallet.enable();
      } else {
        throw new Error('Wallet does not support connect() or enable()');
      }

      // Get wallet state — try new API first, then old
      let address: string | null = null;
      let network: string | null = null;

      if (typeof api.getConnectionStatus === 'function') {
        // New API: use getConnectionStatus() and getUnshieldedAddress()
        const status = await api.getConnectionStatus();
        network = status.networkId;
        if (network) setNetworkId(network);

        if (typeof api.getUnshieldedAddress === 'function') {
          address = await api.getUnshieldedAddress();
        } else if (typeof api.state === 'function') {
          const s = await api.state();
          address = s.address;
        }
      } else if (typeof api.state === 'function') {
        // Old API: use state()
        const s = await api.state();
        address = s.address;
        network = TARGET_NETWORK;
      }

      if (!address) {
        throw new Error('No address found. Please unlock your wallet.');
      }

      // Save to localStorage
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
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect wallet';
      setState((prev) => ({
        ...prev,
        isConnecting: false,
        error: message,
      }));
    }
  }, []);

  const disconnect = useCallback(() => {
    // Try to call wallet's disconnect method
    try {
      const wallet = (window as any).midnight?.mnLace;
      if (typeof wallet?.disconnect === 'function') {
        wallet.disconnect();
      }
    } catch {
      // Ignore
    }

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
