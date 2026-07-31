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

  // Check known keys first
  if (midnight.mnLace) return { wallet: midnight.mnLace, key: 'mnLace' };
  if (midnight['1am']) return { wallet: midnight['1am'], key: '1am' };

  // Scan all keys for anything with connect/enable
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
      // Debug: log what the wallet extension provides
      const midnight = (window as any).midnight;
      console.log('[SilentPay] window.midnight:', midnight ? Object.keys(midnight) : 'undefined');

      // Try to find wallet immediately
      let found = findWallet();
      if (found) {
        console.log(`[SilentPay] Found wallet under window.midnight.${found.key}`);
      }

      // If not found, wait up to 5 seconds for async extension injection
      if (!found) {
        console.log('[SilentPay] Wallet not found yet, waiting for injection...');
        for (let i = 0; i < 50; i++) {
          await new Promise((r) => setTimeout(r, 100));
          found = findWallet();
          if (found) {
            console.log(`[SilentPay] Found wallet after ${i * 100}ms under: ${found.key}`);
            break;
          }
        }
      }

      if (!found) {
        const midnightKeys = midnight ? Object.keys(midnight) : [];
        throw new Error(
          `Lace Wallet not detected.\n\n` +
          `window.midnight keys: [${midnightKeys.join(', ')}] || empty\n\n` +
          `Checklist:\n` +
          `1. Is the Lace extension installed?\n` +
          `2. Is it enabled in chrome://extensions?\n` +
          `3. Have you created/unlocked a wallet in Lace?\n` +
          `4. Try refreshing this page\n\n` +
          `Extension: https://chromewebstore.google.com/detail/lace/gafhhkghbfjjkeiendhlofajokpaflmk`
        );
      }

      const { wallet } = found;

      // Comprehensive debug: dump everything about the wallet object
      const allOwnKeys = Object.getOwnPropertyNames(wallet);
      const proto = Object.getPrototypeOf(wallet);
      const protoKeys = proto ? Object.getOwnPropertyNames(proto) : [];
      const allMethods = [...new Set([...allOwnKeys, ...protoKeys])].filter(
        (k) => typeof (wallet as any)[k] === 'function'
      );
      const allGetters = allOwnKeys.filter((k) => {
        try {
          const desc = Object.getOwnPropertyDescriptor(wallet, k);
          return desc && typeof desc.get === 'function';
        } catch { return false; }
      });
      console.log('[SilentPay] Wallet methods:', allMethods);
      console.log('[SilentPay] Wallet getters:', allGetters);
      console.log('[SilentPay] Wallet own keys:', allOwnKeys);

      // Check for common wallet methods and their return values
      for (const fn of ['isEnabled', 'isEnabled', 'serviceUriConfig', 'apiVersion', 'name', 'rdns', 'icon']) {
        try {
          const val = (wallet as any)[fn];
          if (typeof val === 'function') {
            const result = await val.call(wallet);
            console.log(`[SilentPay] wallet.${fn}() =`, result);
          } else if (val !== undefined) {
            console.log(`[SilentPay] wallet.${fn} =`, val);
          }
        } catch (e: any) {
          console.log(`[SilentPay] wallet.${fn} error:`, e?.message);
        }
      }

      // Now try connect - but also check what happens with different error types
      let api: any = null;
      const errors: string[] = [];

      for (const netId of ['preprod', 'undeployed', 'preview', 'mainnet']) {
        try {
          api = await wallet.connect(netId);
          console.log(`[SilentPay] Connected via connect("${netId}")!`);
          break;
        } catch (e: any) {
          const msg = e?.message ?? String(e);
          const stack = e?.stack?.split('\n').slice(0, 3).join(' | ');
          console.log(`[SilentPay] connect("${netId}") error:`, msg, stack);
          errors.push(`connect("${netId}"): ${msg}`);
          api = null;
        }
      }

      if (!api) {
        throw new Error(`Wallet connect failed: ${errors.join(' | ')}`);
      }

      // Now align SDK to wallet's actual network (official pattern)
      try {
        const status = await api.getConnectionStatus();
        console.log(`[SilentPay] Wallet network: "${status.networkId}"`);
        setNetworkId(status.networkId);
      } catch (e: any) {
        console.warn('[SilentPay] getConnectionStatus failed:', e?.message);
        setNetworkId('preprod');
      }

      console.log('[SilentPay] Connected, API methods:', Object.keys(api).filter((k: string) => typeof api[k] === 'function'));

      // Get wallet state
      let address: string | null = null;
      let network: string | null = null;
      if (typeof api.getConnectionStatus === 'function') {
        const status = await api.getConnectionStatus();
        network = status?.networkId ?? null;
        console.log(`[SilentPay] Wallet status:`, status);
      }
      if (typeof api.getUnshieldedAddress === 'function') {
        const raw = await api.getUnshieldedAddress();
        address = typeof raw === 'string' ? raw : raw?.address ?? raw?.toString?.() ?? String(raw);
        console.log(`[SilentPay] Unshielded address:`, typeof raw, raw);
      }

      // Fallback to old API
      if (!address && typeof api.state === 'function') {
        const s = await api.state();
        address = typeof s?.address === 'string' ? s.address : String(s?.address ?? '');
        if (!network) network = s?.networkId || 'preprod';
      }

      if (!address) {
        throw new Error('No address found. Please unlock your wallet.');
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
