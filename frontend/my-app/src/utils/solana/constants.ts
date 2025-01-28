import { PublicKey } from '@solana/web3.js';

export const PROGRAM_ID = new PublicKey('3gmjtd6RMMcpZQh5snACGLopxmDbkFNoEUXoHtUvWhjX');
export const NETWORK = 'https://api.devnet.solana.com'; 

// Add this function to calculate the expected account size
export const calculatePoolAccountSize = () => {
  // Add up all the fields in your Pool struct
  const discriminator = 8; // Anchor account discriminator
  const pubkey = 32;      // PublicKey size
  const tokenMint = 32;   // PublicKey size
  const tokenVault = 32;  // PublicKey size
  const numbers = 8 * 5;  // 5 number fields (u64/i64)
  const bool = 1;         // boolean size

  return discriminator + pubkey + tokenMint + tokenVault + numbers + bool;
};

// Use this size in your filters
const POOL_ACCOUNT_SIZE = calculatePoolAccountSize(); 