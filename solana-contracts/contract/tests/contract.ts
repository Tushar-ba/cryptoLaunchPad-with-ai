import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Contract } from "../target/types/contract";
import { Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, createMint, getAssociatedTokenAddress, createAssociatedTokenAccount, mintTo, ASSOCIATED_TOKEN_PROGRAM_ID, transfer } from "@solana/spl-token";
import { expect } from "chai";

describe("Launchpad", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Contract as Program<Contract>;
  
  // Test accounts
  const tokenMint = Keypair.generate();
  let poolPda: PublicKey;
  let poolBump: number;
  let tokenVault: PublicKey;
  let userTokenAccount: PublicKey;
  let authorityTokenAccount: PublicKey;

  // Pool parameters
  const tokenPrice = new anchor.BN(0.5 * LAMPORTS_PER_SOL); // 0.5 SOL per token
  const tokenRatio = new anchor.BN(1000); // 1000 tokens per 1 SOL
  const poolSize = new anchor.BN(10 * LAMPORTS_PER_SOL); // 10 SOL max
  const startTime = new anchor.BN(Math.floor(Date.now() / 1000)); // Now
  const endTime = new anchor.BN(Math.floor(Date.now() / 1000) + 2); // 2 seconds from now

  before(async () => {
    try {
      // Create token mint
      await createMint(
        provider.connection,
        provider.wallet.payer,
        provider.wallet.publicKey,
        null,
        9,
        tokenMint
      );

      // Find PDA for pool
      [poolPda, poolBump] = PublicKey.findProgramAddressSync(
        [Buffer.from("pool")],
        program.programId
      );

      // Find PDA for token vault
      [tokenVault] = PublicKey.findProgramAddressSync(
        [Buffer.from("token_vault"), poolPda.toBuffer()],
        program.programId
      );

      // Get authority token account address
      authorityTokenAccount = await getAssociatedTokenAddress(
        tokenMint.publicKey,
        provider.wallet.publicKey
      );

      // Create authority's token account
      await createAssociatedTokenAccount(
        provider.connection,
        provider.wallet.payer,
        tokenMint.publicKey,
        provider.wallet.publicKey
      );

      // Get user token account address (same as authority in this case)
      userTokenAccount = authorityTokenAccount;

      // Mint tokens to authority
      await mintTo(
        provider.connection,
        provider.wallet.payer,
        tokenMint.publicKey,
        authorityTokenAccount,
        provider.wallet.publicKey,
        1_000_000 * LAMPORTS_PER_SOL // 1M tokens
      );

    } catch (error) {
      console.error("Setup error:", error);
      throw error;
    }
  });

  it("Initializes the pool", async () => {
    try {
      const tx = await program.methods
        .initializePool(
          tokenPrice,
          tokenRatio,
          poolSize,
          startTime,
          endTime
        )
        .accounts({
          pool: poolPda,
          tokenMint: tokenMint.publicKey,
          tokenVault: tokenVault,
          authority: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .signers([provider.wallet.payer])
        .rpc();

      await provider.connection.confirmTransaction(tx);

      // Transfer tokens to the vault
      const transferTx = await transfer(
        provider.connection,
        provider.wallet.payer,
        authorityTokenAccount,
        tokenVault,
        provider.wallet.publicKey,
        100_000 * LAMPORTS_PER_SOL // Transfer 100K tokens to vault
      );
      await provider.connection.confirmTransaction(transferTx);

      const pool = await program.account.pool.fetch(poolPda);
      expect(pool.tokenPrice.toString()).to.equal(tokenPrice.toString());
      expect(pool.tokenRatio.toString()).to.equal(tokenRatio.toString());
      expect(pool.poolSize.toString()).to.equal(poolSize.toString());
    } catch (error) {
      console.error("Initialize error:", error);
      throw error;
    }
  });

  it("Allows contribution", async () => {
    try {
      const contribution = new anchor.BN(1 * LAMPORTS_PER_SOL); // 1 SOL
      
      const [userContributionPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("contribution"),
          poolPda.toBuffer(),
          provider.wallet.publicKey.toBuffer(),
        ],
        program.programId
      );

      const tx = await program.methods
        .contribute(contribution)
        .accounts({
          pool: poolPda,
          userContribution: userContributionPda,
          contributor: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .rpc();

      await provider.connection.confirmTransaction(tx);

      const userContribution = await program.account.userContribution.fetch(
        userContributionPda
      );
      expect(userContribution.amount.toString()).to.equal(contribution.toString());
    } catch (error) {
      console.error("Contribute error:", error);
      throw error;
    }
  });

  it("Finalizes the pool", async () => {
    try {
      // Wait for the pool to end (3 seconds to be safe)
      console.log("Waiting for pool to end...");
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const tx = await program.methods
        .finalizePool()
        .accounts({
          pool: poolPda,
          authority: provider.wallet.publicKey,
        })
        .rpc();

      await provider.connection.confirmTransaction(tx);

      const pool = await program.account.pool.fetch(poolPda);
      expect(pool.finalized).to.be.true;
    } catch (error) {
      console.error("Finalize error:", error);
      throw error;
    }
  });

  it("Allows token claim", async () => {
    try {
      const [userContributionPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("contribution"),
          poolPda.toBuffer(),
          provider.wallet.publicKey.toBuffer(),
        ],
        program.programId
      );

      const tx = await program.methods
        .claimTokens()
        .accounts({
          pool: poolPda,
          userContribution: userContributionPda,
          tokenVault: tokenVault,
          userTokenAccount: userTokenAccount,
          user: provider.wallet.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      await provider.connection.confirmTransaction(tx);

      const userContribution = await program.account.userContribution.fetch(
        userContributionPda
      );
      expect(userContribution.tokensDue.toString()).to.equal("0");
      expect(userContribution.tokensClaimed.toString()).not.to.equal("0");
    } catch (error) {
      console.error("Claim error:", error);
      throw error;
    }
  });
});
