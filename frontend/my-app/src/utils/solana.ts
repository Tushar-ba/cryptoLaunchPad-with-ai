import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';

// Replace with your program ID
const PROGRAM_ID = new PublicKey('DE2z65pCcNYqEqhKTV62pEu7Kp1qbV4znax2VrAL6Y5p');

// IDL type and actual IDL will be generated from your Rust program
interface ContractIDL {
  // Add your IDL type definition here
}

export const getProgram = async (wallet: anchor.Wallet) => {
  const connection = new Connection('https://api.devnet.solana.com');
  const provider = new anchor.AnchorProvider(
    connection,
    wallet,
    { commitment: 'processed' }
  );

  // You'll need to import your IDL JSON file
  const idl = await Program.fetchIdl(PROGRAM_ID, provider) as ContractIDL;
  
  return new Program(idl, PROGRAM_ID, provider);
};

export const contribute = async (
  wallet: anchor.Wallet,
  poolAddress: PublicKey,
  amount: number
) => {
  const program = await getProgram(wallet);
  const connection = new Connection('https://api.devnet.solana.com');

  try {
    const tx = await program.methods
      .contribute(new anchor.BN(amount))
      .accounts({
        pool: poolAddress,
        contributor: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    await connection.confirmTransaction(tx);
    return tx;
  } catch (error) {
    console.error('Error contributing:', error);
    throw error;
  }
};

export const claimTokens = async (
  wallet: anchor.Wallet,
  poolAddress: PublicKey,
  userTokenAccount: PublicKey
) => {
  const program = await getProgram(wallet);
  const connection = new Connection('https://api.devnet.solana.com');

  try {
    const tx = await program.methods
      .claimTokens()
      .accounts({
        pool: poolAddress,
        user: wallet.publicKey,
        userTokenAccount,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
      })
      .rpc();

    await connection.confirmTransaction(tx);
    return tx;
  } catch (error) {
    console.error('Error claiming tokens:', error);
    throw error;
  }
}; 