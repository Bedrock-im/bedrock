# Bedrock

> Your private workspace by design, not by promise.

A decentralized drive-like file manager built with **Next.js**, **React**, **Tailwind CSS**, and **Aleph.im**. This application lets users upload, organize, sort, and manage files in a cloud interface similar to Proton Drive.

Bedrock.im is a project built on top of [Aleph.im](https://aleph.im)'s decentralized cloud, supported by their [Acceleratooor](https://www.twentysix.cloud/acceleratooor/) program.

As the project is still in it's early stages, ways to contribute and understand the technical architecture aren't properly documented yet and will gradually appear in [our documentation](https://docs.bedrock.im).

If you're interested to learn more about this project, feel free to reach out by creating an issue, or contacting any of the team members.


## 🚀 Features

- 🔍 Search files and folders
- 🧩 Sort by name, size, or creation date
- 🗂️ Create folders
- 📤 Upload files (drag and drop supported)
- 🧭 Breadcrumb navigation
- ✅ Multi-file selection
- 🗑️ Soft/hard delete with restore option
- 📝 Rename and move files
- 🔐 End-to-end encryption with Aleph storage

## 🛠️ Stack

- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS
- **State management**: Zustand
- **UI library**: Radix UI + Lucide Icons
- **Drag and Drop**: `@dnd-kit/core`
- **Storage**: Aleph.im via `@aleph-sdk/*`
- **File Size Display**: `filesize`
- **Query Parameters**: `nuqs`

## 📁 Project Structure

```
.
├── components/drive/       # All drive-specific components (FileList, UploadButton, etc.)
├── components/ui/          # Design system (Table, Breadcrumbs, etc.)
├── stores/                 # Zustand stores (drive and account state)
├── hooks/                  # Custom hooks like use-bedrock-file-upload-dropzone
├── pages/                  # Next.js route files
├── public/                 # Static assets
└── ...
```

## 🧪 Available Scripts

```bash
yarn dev          # Start dev server on localhost:3000
yarn build        # Build the app for production
yarn start        # Run production build
yarn lint         # Run ESLint
yarn format       # Format code with Prettier
yarn test         # Run tests (Jest)
yarn storybook    # Launch Storybook
```

## ⚙️ Environment

Make sure to configure your `.env.local` if your Bedrock/Aleph services require secrets or specific URLs.

## 📦 Dependencies

This project uses:

- `@aleph-sdk`: To interact with Aleph's decentralized network
- `zustand`: Lightweight state management
- `react-dropzone`: File upload handling
- `radix-ui`: Unstyled component primitives
- `lucide-react`: Icon set
- `nuqs`: Query state for `search`, `cwd`, `sort`, etc.

## 🌍 Future Improvements

- 🧠 Smart search suggestions
- ⌚ Real time editor for files

## Team

| [<img src="https://github.com/chuipagro.png?size=85" width=85><br><sub>Pablo Levy</sub>](https://github.com/chuipagro) | [<img src="https://github.com/EdenComp.png?size=85" width=85><br><sub>Florian Lauch</sub>](https://github.com/EdenComp) | [<img src="https://github.com/Croos3r.png?size=85" width=85><br><sub>Dorian Moy</sub>](https://github.com/Croos3r) | [<img src="https://github.com/RezaRahemtola.png?size=85" width=85><br><sub>Reza Rahemtola</sub>](https://github.com/RezaRahemtola)
|:---:|:---:|:---:|:---:|
