use anchor_lang::prelude::*;
use anchor_lang::solana_program::clock::Clock;
use anchor_spl::token::{self, Token, TokenAccount, Mint, Transfer};
use anchor_spl::associated_token::AssociatedToken;

declare_id!("DE2z65pCcNYqEqhKTV62pEu7Kp1qbV4znax2VrAL6Y5p");

#[program]
pub mod contract {
    use super::*;

    pub fn initialize_pool(
        ctx: Context<InitializePool>,
        token_price: u64,      // Price in lamports per token
        token_ratio: u64,      // How many tokens per 1 SOL
        pool_size: u64,        // Max SOL to raise
        start_time: i64,
        end_time: i64,
    ) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        pool.authority = ctx.accounts.authority.key();
        pool.token_mint = ctx.accounts.token_mint.key();
        pool.token_vault = ctx.accounts.token_vault.key();
        pool.token_price = token_price;
        pool.token_ratio = token_ratio;
        pool.pool_size = pool_size;
        pool.total_raised = 0;
        pool.start_time = start_time;
        pool.end_time = end_time;
        pool.finalized = false;
        Ok(())
    }

    pub fn contribute(ctx: Context<Contribute>, amount: u64) -> Result<()> {
        let clock = Clock::get()?;
        let pool = &ctx.accounts.pool;

        // First do all the validation with immutable reference
        require!(clock.unix_timestamp >= pool.start_time, CustomError::PoolNotStarted);
        require!(clock.unix_timestamp <= pool.end_time, CustomError::PoolEnded);
        require!(!pool.finalized, CustomError::PoolFinalized);
        
        let contribution = amount;
        require!(
            pool.total_raised + contribution <= pool.pool_size,
            CustomError::PoolFull
        );

        // Calculate tokens before transfer
        let tokens_to_receive = (contribution as u128)
            .checked_mul(pool.token_ratio as u128)
            .unwrap()
            .checked_div(anchor_lang::solana_program::native_token::LAMPORTS_PER_SOL as u128)
            .unwrap() as u64;

        // Transfer SOL from contributor to pool
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: ctx.accounts.contributor.to_account_info(),
                to: ctx.accounts.pool.to_account_info(),
            },
        );
        anchor_lang::system_program::transfer(cpi_context, contribution)?;

        // Now update state with mutable references
        let pool = &mut ctx.accounts.pool;
        pool.total_raised += contribution;
        
        let user_contribution = &mut ctx.accounts.user_contribution;
        user_contribution.amount += contribution;
        user_contribution.tokens_due += tokens_to_receive;

        Ok(())
    }

    pub fn claim_tokens(ctx: Context<ClaimTokens>) -> Result<()> {
        let user_contribution = &mut ctx.accounts.user_contribution;
        
        require!(ctx.accounts.pool.finalized, CustomError::PoolNotFinalized);
        require!(user_contribution.tokens_due > 0, CustomError::NoTokensToClaim);

        let tokens_to_transfer = user_contribution.tokens_due;

        // Transfer tokens from vault to user
        let seeds = &[
            b"pool".as_ref(),
            &[ctx.bumps.pool],
        ];
        let signer = &[&seeds[..]];

        let cpi_accounts = Transfer {
            from: ctx.accounts.token_vault.to_account_info(),
            to: ctx.accounts.user_token_account.to_account_info(),
            authority: ctx.accounts.pool.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        
        token::transfer(cpi_ctx, tokens_to_transfer)?;

        // Update user contribution
        user_contribution.tokens_due = 0;
        user_contribution.tokens_claimed = tokens_to_transfer;

        Ok(())
    }

    pub fn finalize_pool(ctx: Context<FinalizePool>) -> Result<()> {
        require!(!ctx.accounts.pool.finalized, CustomError::PoolAlreadyFinalized);
        require!(
            Clock::get()?.unix_timestamp > ctx.accounts.pool.end_time,
            CustomError::PoolNotEnded
        );

        ctx.accounts.pool.finalized = true;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializePool<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Pool::LEN,
        seeds = [b"pool"],
        bump
    )]
    pub pool: Account<'info, Pool>,
    pub token_mint: Account<'info, Mint>,
    #[account(
        init,
        payer = authority,
        token::mint = token_mint,
        token::authority = pool,
        seeds = [b"token_vault", pool.key().as_ref()],
        bump
    )]
    pub token_vault: Account<'info, TokenAccount>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct Contribute<'info> {
    #[account(mut)]
    pub pool: Account<'info, Pool>,
    #[account(
        init_if_needed,
        payer = contributor,
        space = 8 + UserContribution::LEN,
        seeds = [b"contribution", pool.key().as_ref(), contributor.key().as_ref()],
        bump
    )]
    pub user_contribution: Account<'info, UserContribution>,
    #[account(mut)]
    pub contributor: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct ClaimTokens<'info> {
    #[account(
        seeds = [b"pool"],
        bump
    )]
    pub pool: Account<'info, Pool>,
    #[account(
        mut,
        seeds = [b"contribution", pool.key().as_ref(), user.key().as_ref()],
        bump
    )]
    pub user_contribution: Account<'info, UserContribution>,
    #[account(
        mut,
        seeds = [b"token_vault", pool.key().as_ref()],
        bump,
        token::mint = pool.token_mint,
        token::authority = pool
    )]
    pub token_vault: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = user_token_account.mint == pool.token_mint
    )]
    pub user_token_account: Account<'info, TokenAccount>,
    pub user: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct FinalizePool<'info> {
    #[account(
        mut,
        seeds = [b"pool"],
        bump,
        has_one = authority
    )]
    pub pool: Account<'info, Pool>,
    pub authority: Signer<'info>,
}

#[account]
pub struct Pool {
    pub authority: Pubkey,
    pub token_mint: Pubkey,
    pub token_vault: Pubkey,
    pub token_price: u64,
    pub token_ratio: u64,
    pub pool_size: u64,
    pub total_raised: u64,
    pub start_time: i64,
    pub end_time: i64,
    pub finalized: bool,
}

#[account]
pub struct UserContribution {
    pub amount: u64,
    pub tokens_due: u64,
    pub tokens_claimed: u64,
}

impl Pool {
    pub const LEN: usize = 32 + 32 + 32 + 8 + 8 + 8 + 8 + 8 + 8 + 1;
}

impl UserContribution {
    pub const LEN: usize = 8 + 8 + 8;
}

#[error_code]
pub enum CustomError {
    #[msg("Pool has not started yet")]
    PoolNotStarted,
    #[msg("Pool has ended")]
    PoolEnded,
    #[msg("Pool is already finalized")]
    PoolAlreadyFinalized,
    #[msg("Pool is finalized")]
    PoolFinalized,
    #[msg("Pool is full")]
    PoolFull,
    #[msg("Pool has not ended yet")]
    PoolNotEnded,
    #[msg("Pool is not finalized yet")]
    PoolNotFinalized,
    #[msg("No tokens to claim")]
    NoTokensToClaim,
    #[msg("Contribution too small")]
    ContributionTooSmall,
}
