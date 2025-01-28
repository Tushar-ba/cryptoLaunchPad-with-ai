import { Inter } from 'next/font/google';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export default function Home() {
  return (
    <main className={`min-h-screen bg-gray-900 ${inter.className}`}>
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-white mb-8">
          Welcome to CryptoLaunchpad
        </h1>
        <div className="grid gap-6 md:grid-cols-2">
          <Link href="/solana-launchpad" 
                className="p-6 bg-gray-800 rounded-lg border border-gray-700 hover:border-purple-500">
            <h2 className="text-2xl font-bold text-white mb-2">
              Solana Launchpad →
            </h2>
            <p className="text-gray-400">
              Launch and invest in Solana token projects
            </p>
          </Link>
          <Link href="/ethereum-launchpad"
                className="p-6 bg-gray-800 rounded-lg border border-gray-700 hover:border-blue-500">
            <h2 className="text-2xl font-bold text-white mb-2">
              Ethereum Launchpad →
            </h2>
            <p className="text-gray-400">
              Launch and invest in Ethereum token projects
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}
