# API Reference

## File Operations

### Upload Files

```typescript
const files = await client.files.uploadFiles([
  {
    name: 'document.pdf',
    path: '/documents/document.pdf',
    content: fileBuffer, // Buffer or File
  },
  {
    name: 'image.jpg',
    path: '/images/image.jpg',
    content: imageBuffer,
  },
]);
```

### Edit Files

```typescript
const [file] = await client.files.uploadFiles([
  {
    name: 'document.txt',
    path: '/documents/document.txt',
    content: fileBuffer, // Buffer or File
  },
]);

const editedFile = await client.files.editFileContent(file, editedFileBuffer);
```

### List Files

```typescript
// List all non-deleted files
const files = await client.files.listFiles();

// Include soft-deleted files
const allFiles = await client.files.listFiles(true);
```

### Get File by Path

```typescript
const file = await client.files.getFile('documents/document.pdf');
console.log(file.name, file.size, file.created_at);
```

### Download File

```typescript
const file = await client.files.getFile('documents/document.pdf');
const content = await client.files.downloadFile(file);

// Save to disk (Node.js)
fs.writeFileSync('downloaded.pdf', content);

// Create download link (Browser)
const blob = new Blob([content]);
const url = URL.createObjectURL(blob);
```

### Move/Rename Files

```typescript
await client.files.moveFiles([
  { oldPath: 'old/path.txt', newPath: 'new/path.txt' },
  { oldPath: 'doc.pdf', newPath: 'documents/doc.pdf' },
]);
```

### Duplicate Files

```typescript
await client.files.duplicateFiles([{ oldPath: 'original.txt', newPath: 'copy.txt' }]);
await client.files.duplicateFiles([
    { oldPath: 'original.txt', newPath: 'copy.txt' },
    { oldPath: 'dir/file1.pdf', newPath: 'dir2/file2.pdf' }
]);
```

### Soft Delete (Trash)

```typescript
// Move to trash
await client.files.softDeleteFiles(['path/to/file.txt']);

// Restore from trash
await client.files.restoreFiles(['path/to/file.txt']);
```

### Hard Delete (Permanent)

```typescript
// WARNING: This permanently removes files from Aleph network
await client.files.hardDeleteFiles(['path/to/file.txt']);
```

### Share Files

```typescript
// Share with a contact
await client.files.shareFile('document.pdf', contactPublicKey);

// Unshare
await client.files.unshareFile('document.pdf', contactPublicKey);
```

### Public File Sharing

```typescript
// Share file publicly (anyone can access without authentication)
const file = await client.files.getFile('document.pdf');
const publicHash = await client.files.shareFilePublicly(file, 'username');

console.log(`Share this link: https://app.bedrock.im/public/${publicHash}`);

// Fetch public file metadata (static method - no auth needed)
import { FileService } from 'bedrock-ts-sdk';
const metadata = await FileService.fetchPublicFileMeta(publicHash);
console.log(metadata.name, metadata.size, metadata.username);

// Download public file (static method - no auth needed)
const content = await FileService.downloadPublicFile(metadata.store_hash);
```

## Contact Operations

### Add Contact

```typescript
const contact = await client.contacts.addContact(
  'Alice',                                      // Name
  '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1', // Address
  'public_key_hex'                              // Public key
);
```

### List Contacts

```typescript
const contacts = await client.contacts.listContacts();
contacts.forEach(c => {
  console.log(c.name, c.address, c.public_key);
});
```

### Get Contact

```typescript
// By public key
const contact = await client.contacts.getContact(publicKey);
```

```typescript
// By address
const contactByAddress = await client.contacts.getContactByAddress('0x...');
```

### Update Contact

```typescript
await client.contacts.updateContactName(publicKey, 'Alice Smith');
```

### Remove Contact

```typescript
await client.contacts.removeContact(publicKey);
```

### Share Files with Contact

```typescript
// Share
await client.contacts.shareFileWithContact('file.pdf', publicKey);

// Get files you shared with a contact
const sharedFiles = await client.contacts.getSharedFiles(publicKey);

// Get files a contact shared with you
const receivedFiles = await client.contacts.fetchFilesSharedByContact(publicKey);

// Unshare
await client.contacts.unshareFileWithContact('file.pdf', publicKey);
```

## Knowledge Base Operations

### Create Knowledge Base

```typescript
const kb = await client.knowledgeBases.createKnowledgeBase('My Documents');
```

```typescript
// With initial files
const kbWithFiles = await client.knowledgeBases.createKnowledgeBase(
  'Research Papers',
  ['paper1.pdf', 'paper2.pdf']
);
```

### List Knowledge Bases

```typescript
const kbs = await client.knowledgeBases.listKnowledgeBases();
kbs.forEach(kb => {
  console.log(kb.name, kb.file_paths.length);
});
```

### Get Knowledge Base

```typescript
const kb = await client.knowledgeBases.getKnowledgeBase('My Documents');
```

### Rename Knowledge Base

```typescript
await client.knowledgeBases.renameKnowledgeBase('Old Name', 'New Name');
```

### Manage Files in Knowledge Base

```typescript
// Set files (replaces all)
await client.knowledgeBases.setFiles('My KB', ['file1.txt', 'file2.txt']);

// Add files
await client.knowledgeBases.addFiles('My KB', ['file3.txt']);

// Remove files
await client.knowledgeBases.removeFiles('My KB', ['file1.txt']);

// Clear all files
await client.knowledgeBases.clearFiles('My KB');
```

### Delete Knowledge Base

```typescript
await client.knowledgeBases.deleteKnowledgeBase('My Documents');
```

## Credit Operations

The credit system is backend-managed (read-only from SDK).

### Get Credit Balance

```typescript
const credits = await client.credits.getCreditBalance();

console.log('Balance:', credits.balance);
console.log('Transactions:', credits.transactions);

// Transaction history
credits.transactions.forEach(tx => {
  console.log(tx.type, tx.amount, tx.description, tx.timestamp);
});
```

> **Note:** Credits are managed by the backend. Users cannot modify their balance via the SDK.

## Utility Methods

### Get Account Info

```typescript
const mainAddress = client.getMainAddress();
const subAddress = client.getSubAddress();
const publicKey = client.getPublicKey();
const encryptionKey = client.getEncryptionKey();
```

### Reset Data

```typescript
// WARNING: These operations permanently delete data

// Reset all data
await client.resetAllData();

// Reset specific data types
await client.resetFiles();
await client.resetContacts();
await client.resetKnowledgeBases();
```
