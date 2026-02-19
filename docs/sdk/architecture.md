# Architecture

## Encryption

Bedrock uses a dual encryption approach:

1. **File content**: Encrypted with AES-256-CBC using random key/IV
2. **File paths**: Encrypted with ECIES using user's public key
3. **Metadata**: Encrypted with AES-256-CBC using signature-derived key
4. **Shared keys**: Encrypted with ECIES using recipient's public key

## Sub-accounts

- Main account signs a message to generate a signature
- Signature is used to derive encryption key and sub-account
- Sub-account is authorized via Aleph security aggregate
- All operations use the sub-account for better security

## Aleph Storage

- **STORE**: Binary file content (encrypted)
- **POST**: File metadata (encrypted)
- **AGGREGATE**: File index, contacts, knowledge bases
- **FORGET**: Delete messages from network
