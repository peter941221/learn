# Token Standards Cheat Sheet

Quick reference for the token standards developers meet most often across EVM
and Solana. Use this as a reminder for interfaces, events, and common edge
cases, not as a full implementation guide.

## ERC-20

ERC-20 is the common standard for fungible EVM tokens. Each unit is
interchangeable with any other unit of the same token, like USDC, DAI, or UNI.

```ts
type Address = `0x${string}`;

function totalSupply(): Promise<bigint>;
function balanceOf(account: Address): Promise<bigint>;
function transfer(to: Address, value: bigint): Promise<boolean>;
function allowance(owner: Address, spender: Address): Promise<bigint>;
function approve(spender: Address, value: bigint): Promise<boolean>;
function transferFrom(
  from: Address,
  to: Address,
  value: bigint,
): Promise<boolean>;
```

Events:

```ts
type Transfer = { from: Address; to: Address; value: bigint };
type Approval = { owner: Address; spender: Address; value: bigint };
```

Common patterns:

- `approve` plus `transferFrom` lets another account or contract spend tokens.
- Infinite approval uses `2n ** 256n - 1n` to avoid repeated approvals.
- Permit (EIP-2612) lets a user approve by signature instead of a transaction.

Gotchas:

- Some older tokens, especially USDT-style implementations, do not consistently
  return `bool` even when the ERC-20 interface says they should.
- Fee-on-transfer tokens may deliver less than `value`, so protocols should
  compare balances before and after the transfer when exact receipt matters.

## ERC-721

ERC-721 is the common EVM NFT standard. Every token ID is unique, and ownership
is tracked per `tokenId`.

```ts
type Address = `0x${string}`;

function balanceOf(owner: Address): Promise<bigint>;
function ownerOf(tokenId: bigint): Promise<Address>;
function safeTransferFrom(
  from: Address,
  to: Address,
  tokenId: bigint,
): Promise<void>;
function transferFrom(
  from: Address,
  to: Address,
  tokenId: bigint,
): Promise<void>;
function approve(to: Address, tokenId: bigint): Promise<void>;
function getApproved(tokenId: bigint): Promise<Address>;
function setApprovalForAll(operator: Address, approved: boolean): Promise<void>;
function isApprovedForAll(owner: Address, operator: Address): Promise<boolean>;
function tokenURI(tokenId: bigint): Promise<string>;
```

Events:

```ts
type Transfer = { from: Address; to: Address; tokenId: bigint };
type Approval = { owner: Address; approved: Address; tokenId: bigint };
type ApprovalForAll = {
  owner: Address;
  operator: Address;
  approved: boolean;
};
```

Common patterns:

- `tokenURI(tokenId)` points to metadata for images, traits, and descriptions.
- `setApprovalForAll` is the marketplace pattern for listing many NFTs.
- Enumeration (`totalSupply`, `tokenByIndex`, `tokenOfOwnerByIndex`) is an
  optional extension, not part of the core interface.

Gotchas:

- Prefer `safeTransferFrom` when sending to contracts, because receiver
  contracts must implement the ERC-721 receiver hook.
- Do not assume token IDs are sequential or enumerable unless the contract
  explicitly implements the enumeration extension.

## ERC-1155

ERC-1155 is a multi-token EVM standard. One contract can hold many token IDs,
and each ID can behave like a fungible token, an NFT, or a semi-fungible asset.

```ts
type Address = `0x${string}`;
type Hex = `0x${string}`;

function balanceOf(account: Address, id: bigint): Promise<bigint>;
function balanceOfBatch(accounts: Address[], ids: bigint[]): Promise<bigint[]>;
function setApprovalForAll(operator: Address, approved: boolean): Promise<void>;
function isApprovedForAll(
  account: Address,
  operator: Address,
): Promise<boolean>;
function safeTransferFrom(
  from: Address,
  to: Address,
  id: bigint,
  value: bigint,
  data: Hex,
): Promise<void>;
function safeBatchTransferFrom(
  from: Address,
  to: Address,
  ids: bigint[],
  values: bigint[],
  data: Hex,
): Promise<void>;
function uri(id: bigint): Promise<string>;
```

Events:

```ts
type TransferSingle = {
  operator: Address;
  from: Address;
  to: Address;
  id: bigint;
  value: bigint;
};
type TransferBatch = {
  operator: Address;
  from: Address;
  to: Address;
  ids: bigint[];
  values: bigint[];
};
type ApprovalForAll = {
  account: Address;
  operator: Address;
  approved: boolean;
};
type URI = { value: string; id: bigint };
```

Common patterns:

- Choose ERC-1155 over ERC-721 when one contract needs many asset types.
- Use batch transfers for game items, editions, and multi-asset inventory moves.
- Metadata URIs often use `{id}` substitution instead of one URI per token.

Gotchas:

- `ids` and `values` arrays must align by index in batch calls.
- Receiver contracts need ERC-1155 receiver hooks, or safe transfers to them
  should revert.

## SPL Token (Solana)

SPL Token is Solana's standard token program. A mint defines the asset, and token
accounts hold balances for owners. Associated token accounts (ATAs) are the
usual wallet-owned token account addresses.

```rust
use solana_program::{
    instruction::Instruction,
    program_error::ProgramError,
    pubkey::Pubkey,
};

fn initialize_mint(
    token_program_id: &Pubkey,
    mint: &Pubkey,
    mint_authority: &Pubkey,
    freeze_authority: Option<&Pubkey>,
    decimals: u8,
) -> Result<Instruction, ProgramError>;

fn transfer_checked(
    token_program_id: &Pubkey,
    source: &Pubkey,
    mint: &Pubkey,
    destination: &Pubkey,
    authority: &Pubkey,
    signer_pubkeys: &[&Pubkey],
    amount: u64,
    decimals: u8,
) -> Result<Instruction, ProgramError>;

fn approve_checked(
    token_program_id: &Pubkey,
    source: &Pubkey,
    mint: &Pubkey,
    delegate: &Pubkey,
    owner: &Pubkey,
    signer_pubkeys: &[&Pubkey],
    amount: u64,
    decimals: u8,
) -> Result<Instruction, ProgramError>;

fn mint_to_checked(
    token_program_id: &Pubkey,
    mint: &Pubkey,
    account: &Pubkey,
    mint_authority: &Pubkey,
    signer_pubkeys: &[&Pubkey],
    amount: u64,
    decimals: u8,
) -> Result<Instruction, ProgramError>;
```

Common accounts and authorities:

- Mint account: stores decimals, supply, mint authority, and freeze authority.
- Token account: stores owner, mint, amount, delegate, and close authority.
- Associated token account: deterministic token account for `(wallet, mint)`.
- Delegate: approved spender for part of a token account balance.

Common patterns:

- Create or fetch the recipient ATA before transferring SPL tokens.
- Use checked instructions when the client knows the mint decimals.
- Revoke mint authority when a fixed supply should become permanent.

Gotchas:

- `amount` is the raw base-unit integer. UI amounts must be scaled by
  `10 ** decimals`.
- A wallet does not hold SPL balances directly; balances live in token accounts,
  commonly ATAs.

## Resources

- [ERC-20 Standard](https://eips.ethereum.org/EIPS/eip-20)
- [ERC-721 Standard](https://eips.ethereum.org/EIPS/eip-721)
- [ERC-1155 Standard](https://eips.ethereum.org/EIPS/eip-1155)
- [OpenZeppelin IERC20](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/IERC20.sol)
- [OpenZeppelin IERC721](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/IERC721.sol)
- [OpenZeppelin IERC1155](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC1155/IERC1155.sol)
- [SPL Token Program](https://www.solana-program.com/docs/token)
