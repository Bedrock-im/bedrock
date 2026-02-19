# Getting Started

## Installation

```bash
npm install bedrock-ts-sdk
```

## Quick Start

### Node.js

```typescript
import { BedrockClient } from 'bedrock-ts-sdk';

// Initialize from private key
const client = await BedrockClient.fromPrivateKey('0x...');

// Upload a file
const files = await client.files.uploadFiles([{
  name: 'hello.txt',
  path: '/documents/hello.txt',
  content: Buffer.from('Hello, Bedrock!'),
}]);

// List all files
const allFiles = await client.files.listFiles();
console.log('Files:', allFiles);

// Download a file
const content = await client.files.downloadFile(allFiles[0]);
console.log('Content:', content.toString());
```

### Browser with MetaMask

```typescript
import { BedrockClient, BEDROCK_MESSAGE } from 'bedrock-ts-sdk';

// Request signature from MetaMask
const accounts = await window.ethereum.request({
  method: 'eth_requestAccounts'
});
const signature = await window.ethereum.request({
  method: 'personal_sign',
  params: [BEDROCK_MESSAGE, accounts[0]],
});

// Initialize client with signature
const client = await BedrockClient.fromSignature(
  signature,
  window.ethereum
);

// Upload a file from user input
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];
const buffer = Buffer.from(await file.arrayBuffer());

await client.files.uploadFiles([{
  name: file.name,
  path: `/uploads/${file.name}`,
  content: buffer,
}]);
```

## Initialization Methods

### `BedrockClient.fromPrivateKey(privateKey, config?)`

Create client from Ethereum private key.

```typescript
const client = await BedrockClient.fromPrivateKey('0xabc123...');
```

### `BedrockClient.fromProvider(provider, config?)`

Create client from wallet provider (MetaMask, WalletConnect, etc.).

```typescript
const client = await BedrockClient.fromProvider(window.ethereum);
```

### `BedrockClient.fromSignature(signatureHash, provider, config?)`

Create client from wallet signature (recommended for web apps).

```typescript
// User signs message with wallet
const signature = await wallet.signMessage({ message: 'Bedrock.im' });
const client = await BedrockClient.fromSignature(
  signature,
  window.ethereum,
  { apiServer: 'https://poc-aleph-ccn.reza.dev' }
);
```
