# Stratégie d'Assurance Qualité — Bedrock

## 1. Vue d'Ensemble

La stratégie d'assurance qualité de Bedrock repose sur une approche multi-niveaux combinant tests automatisés, analyse statique de code et validation de l'accessibilité. Cette stratégie s'applique à l'ensemble de l'écosystème Bedrock : l'application frontend Next.js et le SDK TypeScript.

### Principes Directeurs

- **Shift-Left Testing** : détection des défauts dès la phase de développement
- **Test Pyramid** : forte proportion de tests unitaires, complétés par des tests d'intégration
- **Qualité du Code** : application stricte de standards de codage via linting et formatage automatisé
- **Accessibilité First** : conformité WCAG 2.1 AA intégrée au processus de développement
- **Sécurité par Design** : tests cryptographiques systématiques pour les fonctionnalités sensibles

---

## 2. Architecture Technique des Tests

### Framework Unifié — Jest

Les deux composants de l'écosystème Bedrock utilisent Jest comme framework de test unifié, garantissant une cohérence dans l'approche et les conventions de test.

### Frontend — Application Next.js

**Stack de test**

| Composant | Technologie | Version |
|-----------|-------------|---------|
| Framework de test | Jest | 30.x |
| Bibliothèque de test | React Testing Library | 16.x |
| Environnement | jsdom | Intégré |
| Coverage | V8 Provider | Intégré |
| Documentation visuelle | Storybook | 9.x |

**Organisation des fichiers**

```
front/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   └── __tests__/
│   │   │       └── button.test.tsx
│   │   └── __tests__/
│   │       ├── ThemeToggle.test.tsx
│   │       └── AuthWrapper.test.tsx
│   ├── lib/
│   │   └── __tests__/
│   │       └── utils.test.ts
│   └── app/
│       └── public/[id]/__tests__/
│           └── page.test.tsx
└── jest.config.ts
```

**Configuration Jest**

```typescript
const config: Config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};
```

### SDK TypeScript — bedrock-ts-sdk

**Stack de test**

| Composant | Technologie | Version |
|-----------|-------------|---------|
| Framework de test | Jest | 29.x |
| Preset | ts-jest | 29.x |
| Environnement | Node.js | ≥18.0.0 |
| Coverage | Intégré | Jest native |

**Organisation des fichiers**

```
bedrock-sdk/
├── src/
│   └── crypto/
│       └── encryption.ts
└── tests/
    ├── encryption.test.ts
    ├── bedrock-client.test.ts
    ├── bedrock-core.test.ts
    ├── contact-service.test.ts
    ├── credit-service.test.ts
    ├── errors.test.ts
    ├── file-service.test.ts
    ├── knowledge-base-service.test.ts
    └── schemas.test.ts
```

**Configuration Jest**

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/*.test.ts',
    '!**/examples/**',
  ],
  coverageReporters: ['text', 'json', 'html'],
};
```

---

## 3. Standards de Qualité du Code

### Analyse Statique — ESLint

**Frontend**

La configuration ESLint du frontend intègre plusieurs plugins spécialisés :

- **eslint-config-next** : règles Next.js et React
- **@typescript-eslint** : règles TypeScript strictes
- **eslint-plugin-perfectionist** : tri automatique des imports
- **eslint-plugin-jsx-a11y** : règles d'accessibilité WCAG
- **eslint-plugin-storybook** : bonnes pratiques Storybook

**Règles d'accessibilité (niveau ERROR)**

```yaml
jsx-a11y/alt-text: error
jsx-a11y/aria-props: error
jsx-a11y/aria-proptypes: error
jsx-a11y/aria-unsupported-elements: error
jsx-a11y/role-has-required-aria-props: error
jsx-a11y/role-supports-aria-props: error
jsx-a11y/label-has-associated-control: error
```

**Règles TypeScript**

```yaml
"@typescript-eslint/no-unused-vars":
  - warn
  - argsIgnorePattern: "^_"
    varsIgnorePattern: "^_"
    caughtErrors: "all"
    caughtErrorsIgnorePattern: "^_"
```

**SDK**

Le SDK utilise également ESLint avec les plugins TypeScript :

- **@typescript-eslint/eslint-plugin** : règles TypeScript
- **@typescript-eslint/parser** : parser TypeScript pour ESLint

### Formatage du Code — Prettier

Le formatage automatique est appliqué uniformément sur les deux projets :

**Frontend**
```json
{
  "format": "prettier '**/**/*.{ts,tsx}' --write",
  "format:check": "prettier '**/**/*.{ts,tsx}' --check"
}
```

**SDK**
```json
{
  "format": "prettier --write \"src/**/*.{ts,tsx,js,jsx}\"",
  "format:check": "prettier --check \"src/**/*.{ts,tsx,js,jsx}\""
}
```

### TypeScript — Mode Strict

Les deux projets utilisent TypeScript en mode strict avec les options suivantes :

```json
{
  "compilerOptions": {
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true
  }
}
```

---

## 4. Conventions de Test

### Nommage et Structure

**Fichiers de test**

- Pattern : `*.test.{ts,tsx}` ou `*.spec.{ts,tsx}`
- Localisation :
  - **Frontend** : dossier `__tests__/` adjacent au code source
  - **SDK** : dossier `tests/` à la racine du projet
- Nommage : correspond au module testé (`button.tsx` → `button.test.tsx`)

**Structure des tests**

```typescript
describe('NomDuModule', () => {
  describe('fonctionnalité spécifique', () => {
    it('should comportement attendu', () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

### Pattern AAA (Arrange-Act-Assert)

L'ensemble des tests suit le pattern AAA pour garantir la lisibilité :

```typescript
it('should update user profile', async () => {
  // Arrange : préparation des données
  const user = { id: 1, name: 'Alice' };
  const newName = 'Alice Smith';

  // Act : exécution de l'action
  const result = await updateProfile(user.id, { name: newName });

  // Assert : vérification du résultat
  expect(result.name).toBe(newName);
  expect(result.id).toBe(user.id);
});
```

---

## 5. Types de Tests Implémentés

### Tests Unitaires de Composants (Frontend)

**Exemple : Composant Button**

```typescript
describe("Button Component", () => {
  it("renders correctly", () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  it("handles onClick events", () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    const button = screen.getByRole("button", { name: /click me/i });

    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("applies variant classes", () => {
    render(<Button variant="destructive">Delete</Button>);
    const button = screen.getByRole("button", { name: /delete/i });
    expect(button).toHaveClass("bg-destructive");
  });
});
```

**Caractéristiques**

- Utilisation de `getByRole` pour garantir l'accessibilité
- Tests d'événements utilisateur via `fireEvent`
- Assertions sur les attributs ARIA et l'état du DOM
- Validation des variants et des styles

### Tests SDK — Périmètre Complet

Le SDK dispose d'une suite complète de tests couvrant l'ensemble de ses modules :

| Module | Fichier de test | Domaine |
|--------|----------------|---------|
| Client principal | `bedrock-client.test.ts` | Initialisation, configuration |
| Core | `bedrock-core.test.ts` | Fonctionnalités centrales |
| Cryptographie | `encryption.test.ts` | AES, ECIES, hashing |
| Schémas | `schemas.test.ts` | Validation Zod |
| Gestion d'erreurs | `errors.test.ts` | Classes d'erreur custom |
| Service fichiers | `file-service.test.ts` | Upload, download, gestion fichiers |
| Service crédits | `credit-service.test.ts` | Gestion des crédits utilisateur |
| Base de connaissances | `knowledge-base-service.test.ts` | Stockage de données |
| Contacts | `contact-service.test.ts` | Gestion des contacts |

### Tests Cryptographiques (SDK)

**Exemple : Service de Chiffrement**

```typescript
describe('EncryptionService', () => {
  describe('AES encryption/decryption', () => {
    it('should encrypt and decrypt string data', async () => {
      const data = 'Hello, Bedrock!';
      const key = EncryptionService.generateKey();
      const iv = EncryptionService.generateIv();

      const encrypted = await EncryptionService.encrypt(data, key, iv);
      const decrypted = await EncryptionService.decrypt(encrypted, key, iv);

      expect(decrypted).toBe(data);
      expect(encrypted).not.toBe(data);
    });

    it('should fail with wrong key', async () => {
      const data = 'Secret data';
      const key1 = EncryptionService.generateKey();
      const key2 = EncryptionService.generateKey();
      const iv = EncryptionService.generateIv();

      const encrypted = await EncryptionService.encrypt(data, key1, iv);

      await expect(
        EncryptionService.decrypt(encrypted, key2, iv)
      ).rejects.toThrow();
    });
  });
});
```

**Domaines couverts**

- Génération de clés et vecteurs d'initialisation (32 bytes, 16 bytes)
- Chiffrement/déchiffrement AES-256
- Chiffrement/déchiffrement ECIES
- Hashing SHA-256
- Gestion des caractères Unicode
- Tests de sécurité (validation avec clés/IV incorrects)

---

## 6. Accessibilité — WCAG 2.1 AA

### Niveau de Conformité

L'application frontend respecte le niveau de conformité WCAG 2.1 AA via :

- Validation automatique des règles `jsx-a11y` dans ESLint
- Tests d'accessibilité dans la suite de tests unitaires
- Utilisation systématique de sélecteurs sémantiques (`getByRole`, `getByLabelText`)

### Tests d'Accessibilité

**Exemple : Validation des labels de formulaire**

```typescript
describe('Form Accessibility', () => {
  it('has proper label associations', () => {
    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    expect(emailInput).toHaveAttribute('type', 'email');

    const passwordInput = screen.getByLabelText(/password/i);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('provides error messages with role alert', async () => {
    render(<LoginForm />);
    const submitButton = screen.getByRole('button', { name: /submit/i });

    fireEvent.click(submitButton);

    const errorMessage = await screen.findByRole('alert');
    expect(errorMessage).toHaveTextContent(/email is required/i);
  });
});
```

### Bonnes Pratiques Appliquées

**Sélecteurs accessibles privilégiés**

```typescript
// ✅ Sélecteurs sémantiques
screen.getByRole("button", { name: /submit/i });
screen.getByLabelText(/email address/i);
screen.getByRole("alert");

// ❌ Évités
container.querySelector('.btn-primary');
container.querySelector('#email-input');
```

**Validation des attributs ARIA**

```typescript
it("provides accessible name", () => {
  render(<Button>Submit</Button>);
  const button = screen.getByRole("button", { name: "Submit" });
  expect(button).toHaveAccessibleName("Submit");
});
```

---

## 7. Couverture de Code

### Configuration de Coverage

**Frontend (Jest)**

```typescript
{
  coverageProvider: "v8",
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.stories.tsx",
    "!src/**/__tests__/**"
  ]
}
```

**SDK (Jest)**

```javascript
{
  collectCoverageFrom: [
    'src/**/*.ts',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/*.test.ts',
    '!**/examples/**',
  ],
  coverageReporters: ['text', 'json', 'html']
}
```

### Formats de Rapports

Les deux projets génèrent trois formats de rapports de couverture :

| Format | Usage |
|--------|-------|
| **text** | Affichage console pour feedback immédiat |
| **json** | Intégration dans les pipelines CI/CD |
| **html** | Navigation interactive des fichiers couverts |

---

## 8. Documentation Vivante — Storybook

### Configuration

**Version** : 9.0.1

**Addons installés**

- `@storybook/addon-docs` : génération automatique de documentation
- `@storybook/addon-links` : navigation entre stories
- `@chromatic-com/storybook` : tests visuels de régression
- `@storybook/addon-onboarding` : guide d'utilisation

### Scripts Disponibles

```json
{
  "storybook": "storybook dev -p 6006",
  "storybook:build": "storybook build"
}
```

### Usage

Storybook sert de catalogue interactif des composants du design system, permettant :

- Le développement isolé des composants UI
- La documentation automatique des props et variants
- La validation visuelle des composants
- La détection des régressions visuelles

---

## 9. Scripts de Test

### Frontend

```json
{
  "test": "jest",
  "test:watch": "jest --watch",
  "lint": "next lint",
  "lint:fix": "next lint --fix",
  "format": "prettier '**/**/*.{ts,tsx}' --write",
  "format:check": "prettier '**/**/*.{ts,tsx}' --check"
}
```

### SDK

```json
{
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage",
  "typecheck": "tsc --noEmit",
  "format": "prettier --write \"src/**/*.{ts,tsx,js,jsx}\"",
  "format:check": "prettier --check \"src/**/*.{ts,tsx,js,jsx}\""
}
```

---

## 10. Bonnes Pratiques de Test

### Tests de Composants

**Comportement privilégié sur implémentation**

```typescript
// ✅ Tester le comportement
expect(handleSubmit).toHaveBeenCalledWith({ username: "test" });

// ❌ Tester l'implémentation
expect(component.state.count).toBe(1);
```

**Tests asynchrones**

```typescript
// ✅ Utiliser async/await
const result = await EncryptionService.encrypt(data, key, iv);
expect(result).toBeDefined();

// ❌ Omettre await
const result = EncryptionService.encrypt(data, key, iv);
// Promesse non résolue
```

### Tests de Sécurité

**Validation des entrées**

```typescript
describe('Input Validation', () => {
  it('rejects invalid key length', () => {
    const shortKey = Buffer.alloc(16); // Attendu : 32 bytes
    expect(() => EncryptionService.encrypt(data, shortKey, iv))
      .toThrow('Invalid key length');
  });
});
```

**Tests de limites**

```typescript
it('handles unicode edge cases', async () => {
  const unicode = '🔐 Encrypted 世界';
  const encrypted = await EncryptionService.encrypt(unicode, key, iv);
  const decrypted = await EncryptionService.decrypt(encrypted, key, iv);
  expect(decrypted).toBe(unicode);
});
```

### Factorisation avec beforeEach

```typescript
describe('EncryptionService', () => {
  let key: Buffer;
  let iv: Buffer;

  beforeEach(() => {
    key = EncryptionService.generateKey();
    iv = EncryptionService.generateIv();
  });

  it('encrypts data', async () => {
    const encrypted = await EncryptionService.encrypt('data', key, iv);
    expect(encrypted).toBeDefined();
  });
});
```

---

## 11. Gouvernance Technique

### Standards de Code

- Tous les tests suivent les mêmes conventions de formatage que le code source
- Les tests sont isolés et reproductibles
- Chaque test vérifie un seul comportement
- Les assertions sont explicites et significatives

### Unification des Outils

- Les deux projets utilisent Jest comme framework de test unifié
- Configuration adaptée à chaque environnement (jsdom pour frontend, node pour SDK)
- Approche cohérente dans les conventions de nommage et structure des tests

### Accessibilité

- Les règles `jsx-a11y` sont configurées au niveau ERROR
- Les sélecteurs de test utilisent systématiquement les rôles ARIA
- Les composants UI respectent les standards WCAG 2.1 AA

### Sécurité

- Les fonctionnalités cryptographiques sont systématiquement testées
- Les tests de sécurité incluent la validation avec des données invalides
- Les cas limites (Unicode, grandes tailles, valeurs extrêmes) sont couverts

---

**Version** : 1.1
**Complément de** : [Politique de tests](./politique-de-tests.md)
