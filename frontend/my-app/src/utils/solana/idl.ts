export type Contract = {
  "version": "0.1.0",
  "name": "contract",
  "instructions": [
    {
      "name": "claim_tokens",
      "accounts": [
        {
          "name": "pool",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "user_contribution",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "token_vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user_token_account",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "token_program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "contribute",
      "accounts": [
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user_contribution",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "contributor",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "system_program",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "finalize_pool",
      "accounts": [
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "initialize_pool",
      "accounts": [
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "token_mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "token_vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "system_program",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "token_program",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associated_token_program",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "token_price",
          "type": "u64"
        },
        {
          "name": "token_ratio",
          "type": "u64"
        },
        {
          "name": "pool_size",
          "type": "u64"
        },
        {
          "name": "start_time",
          "type": "i64"
        },
        {
          "name": "end_time",
          "type": "i64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "Pool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "token_mint",
            "type": "publicKey"
          },
          {
            "name": "token_vault",
            "type": "publicKey"
          },
          {
            "name": "token_price",
            "type": "u64"
          },
          {
            "name": "token_ratio",
            "type": "u64"
          },
          {
            "name": "pool_size",
            "type": "u64"
          },
          {
            "name": "total_raised",
            "type": "u64"
          },
          {
            "name": "start_time",
            "type": "i64"
          },
          {
            "name": "end_time",
            "type": "i64"
          },
          {
            "name": "finalized",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "UserContribution",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "tokens_due",
            "type": "u64"
          },
          {
            "name": "tokens_claimed",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "PoolNotStarted",
      "msg": "Pool has not started yet"
    },
    {
      "code": 6001,
      "name": "PoolEnded",
      "msg": "Pool has ended"
    },
    {
      "code": 6002,
      "name": "PoolAlreadyFinalized",
      "msg": "Pool is already finalized"
    },
    {
      "code": 6003,
      "name": "PoolFinalized",
      "msg": "Pool is finalized"
    },
    {
      "code": 6004,
      "name": "PoolFull",
      "msg": "Pool is full"
    },
    {
      "code": 6005,
      "name": "PoolNotEnded",
      "msg": "Pool has not ended yet"
    },
    {
      "code": 6006,
      "name": "PoolNotFinalized",
      "msg": "Pool is not finalized yet"
    },
    {
      "code": 6007,
      "name": "NoTokensToClaim",
      "msg": "No tokens to claim"
    },
    {
      "code": 6008,
      "name": "ContributionTooSmall",
      "msg": "Contribution too small"
    }
  ]
};

export const IDL: Contract = {
  "version": "0.1.0",
  "name": "contract",
  "instructions": [
    {
      "name": "claim_tokens",
      "accounts": [
        {
          "name": "pool",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "user_contribution",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "token_vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user_token_account",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "token_program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "contribute",
      "accounts": [
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user_contribution",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "contributor",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "system_program",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "finalize_pool",
      "accounts": [
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "initialize_pool",
      "accounts": [
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "token_mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "token_vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "system_program",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "token_program",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associated_token_program",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "token_price",
          "type": "u64"
        },
        {
          "name": "token_ratio",
          "type": "u64"
        },
        {
          "name": "pool_size",
          "type": "u64"
        },
        {
          "name": "start_time",
          "type": "i64"
        },
        {
          "name": "end_time",
          "type": "i64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "Pool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "token_mint",
            "type": "publicKey"
          },
          {
            "name": "token_vault",
            "type": "publicKey"
          },
          {
            "name": "token_price",
            "type": "u64"
          },
          {
            "name": "token_ratio",
            "type": "u64"
          },
          {
            "name": "pool_size",
            "type": "u64"
          },
          {
            "name": "total_raised",
            "type": "u64"
          },
          {
            "name": "start_time",
            "type": "i64"
          },
          {
            "name": "end_time",
            "type": "i64"
          },
          {
            "name": "finalized",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "UserContribution",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "tokens_due",
            "type": "u64"
          },
          {
            "name": "tokens_claimed",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "PoolNotStarted",
      "msg": "Pool has not started yet"
    },
    {
      "code": 6001,
      "name": "PoolEnded",
      "msg": "Pool has ended"
    },
    {
      "code": 6002,
      "name": "PoolAlreadyFinalized",
      "msg": "Pool is already finalized"
    },
    {
      "code": 6003,
      "name": "PoolFinalized",
      "msg": "Pool is finalized"
    },
    {
      "code": 6004,
      "name": "PoolFull",
      "msg": "Pool is full"
    },
    {
      "code": 6005,
      "name": "PoolNotEnded",
      "msg": "Pool has not ended yet"
    },
    {
      "code": 6006,
      "name": "PoolNotFinalized",
      "msg": "Pool is not finalized yet"
    },
    {
      "code": 6007,
      "name": "NoTokensToClaim",
      "msg": "No tokens to claim"
    },
    {
      "code": 6008,
      "name": "ContributionTooSmall",
      "msg": "Contribution too small"
    }
  ]
} as const;