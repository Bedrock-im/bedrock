# Architecture

This document explains the core architecture of Bedrock, focusing on account creation and file encryption/sharing
mechanisms.

## Account Creation Process

Bedrock implements a unique account creation system that provides enhanced security and user experience through the
use of sub wallets and message signing.

### 1. User Authentication Flow

1. **Message Signing**: When a user wants to create an account, they are prompted to sign a message with their primary
   wallet (e.g., MetaMask)
2. **Hash Generation**: The signature of the message produces a deterministic hash
3. **Sub wallet Creation**: This hash is used to generate a private key for a new wallet
4. **Aleph Permissions**: The user
   grants [permissions to this wallet on the Aleph network](https://docs.aleph.cloud/devhub/building-applications/messaging/permissions.html),
   allowing it to publish
   content on their behalf
5. **Account Publishing**: All subsequent operations (file uploads, metadata updates, etc.) are performed using this
   sub wallet for improved UX

![Account Creation Flow](/assets/wallet.png)

### Benefits of This Approach

- 🛡️ **Enhanced Security**: The user's primary wallet private key is never exposed to the application
- ✅ **Simplified UX**: Users don't need to sign transactions for every operation once the subwallet is set up
- ⚙️ **Deterministic**: The same wallet will always generate the same subwallet, without any concerns of data loss or
  hack
- 🗳️ **Aleph Integration**: Seamless integration
  with [Aleph's permission system](https://docs.aleph.cloud/devhub/building-applications/messaging/permissions.html)
  to keep a fully decentralized publishing
  without any control from Bedrock

## File Encryption and Sharing System

Bedrock implements a file encryption and sharing system that ensures privacy and secure collaboration.

### Core Encryption Principles

#### 1. One Key Per File

- 🛡️ Each uploaded file gets its own unique encryption key
- 🔑 Keys are generated using cryptographically secure random number generation
- 💻 Files are encrypted client-side before being uploaded to Aleph storage

#### 2. Key Storage and Management

- **Encrypted Key Storage**: File encryption keys are stored encrypted on Aleph using the user's subwallet
- **Elliptic Curve Encryption**: Keys are encrypted
  using [elliptic curve cryptography](https://blog.cloudflare.com/a-relatively-easy-to-understand-primer-on-elliptic-curve-cryptography/)
  with the user's subwallet as the
  encryption key
- **Decentralized Storage**: All encrypted keys are stored on the Aleph network nodes, ensuring no central point of
  failure

### File Sharing Mechanism

#### 1. Sharing Process

When a user shares a file with others:

1. **Key Duplication**: The file's encryption key is encrypted for each recipient's wallet (using elliptic curve
   encryption again)
2. **Multiple Encrypted Copies**: Each recipient gets their own encrypted copy of the file key
3. **Access Control**: Recipients can decrypt the file key using their own wallet and then decrypt the file

#### 2. Permission Management

- **Granular Access**: Each user has their own encrypted copy of the file key
- **Independent Access**: Users can access shared files without depending on the original owner being online
- **Revocation Support**: Access can be revoked by removing the user's encrypted key copy

### Security Features

#### 1. Access Revocation and Re-encryption

When a user is removed from a shared file:

1. **Key Rotation**: A new encryption key is generated for the file
2. **File Re-encryption**: The file is re-encrypted with the new key
3. **Key Redistribution**: The new key is encrypted and distributed to all remaining authorized users
4. **Old Key Invalidation**: The previous key becomes useless, ensuring the removed user loses access

#### 2. End-to-End Encryption

- **Client-Side Encryption**: All encryption/decryption happens in the user's browser when he removes or shares files
- **Zero-Knowledge**: Bedrock never has access to unencrypted files or encryption keys

This architecture ensures that Bedrock provides true privacy by design, where users maintain complete control over
their data while benefiting from the decentralized and resilient nature of the Aleph network.
