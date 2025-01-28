import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Layout from '../components/Layout';
import { NetworkProvider } from '../contexts/NetworkContext';
import { SolanaWalletProvider } from '../contexts/SolanaWalletContext';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <NetworkProvider>
      <SolanaWalletProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </SolanaWalletProvider>
    </NetworkProvider>
  );
}
