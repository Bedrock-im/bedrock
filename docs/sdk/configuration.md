# Configuration

## Options

```typescript
const client = await BedrockClient.fromPrivateKey(privateKey, {
  channel: 'MY_CUSTOM_CHANNEL',
  apiServer: 'https://poc-aleph-ccn.reza.dev',
});
```

| Option | Default | Description |
|--------|---------|-------------|
| `channel` | `'bedrock'` | Aleph channel for data isolation |
| `apiServer` | `'https://poc-aleph-ccn.reza.dev'` | Aleph API server URL |

## Error Handling

The SDK provides typed errors:

```typescript
import {
  BedrockError,
  AuthenticationError,
  EncryptionError,
  FileError,
  FileNotFoundError,
  ContactError,
  KnowledgeBaseError,
  CreditError,
  NetworkError,
  ValidationError,
} from 'bedrock-ts-sdk';

try {
  await client.files.getFile('nonexistent.txt');
} catch (error) {
  if (error instanceof FileNotFoundError) {
    console.log('File not found:', error.message);
  } else if (error instanceof NetworkError) {
    console.log('Network error:', error.message);
  } else if (error instanceof CreditError) {
    console.log('Credit operation failed:', error.message);
  }
}
```

## Browser Compatibility

The SDK works in modern browsers with:

- WebCrypto API (for encryption)
- BigInt support
- ES2020+ features

Tested on: Chrome 90+, Firefox 90+, Safari 14+, Edge 90+

## Security Considerations

- Private keys are never sent over the network
- All file content is encrypted before upload
- File paths are encrypted to hide folder structure
- Metadata is encrypted with signature-derived key
- Use HTTPS/secure connections in production
- Keep private keys secure and never commit them
