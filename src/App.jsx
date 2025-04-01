import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { UnsafeBurnerWalletAdapter } from "@solana/wallet-adapter-wallets";
import {
  WalletModalProvider,
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";
import { TokenLaunchpad } from "./components/TokenLaunchpad";

import "./App.css";

function App() {
  const endpoint = import.meta.env.VITE_ENDPOINT;
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900">
        <ConnectionProvider endpoint={endpoint}>
          <WalletProvider wallets={[]}>
            <WalletModalProvider>
              <div className="absolute top-4 right-4 z-50">
                <WalletMultiButton className="!bg-gradient-to-r !from-purple-600 !to-blue-600 !text-white !rounded-xl !px-6 !py-3 !font-medium hover:!opacity-90 transition-opacity" />
              </div>
              <TokenLaunchpad />
            </WalletModalProvider>
          </WalletProvider>
        </ConnectionProvider>
      </div>
    </>
  );
}

export default App;
