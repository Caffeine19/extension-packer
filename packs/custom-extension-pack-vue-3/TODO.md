# Extension Pack Management System

## 🎯 Project Goal
Consolidate all custom extension packs into a unified project structure with a management application.

## 📁 Project Structure

```
root/
├── packs/                              # Extension pack definitions
│   ├── custom-extension-pack-vue-3/
│   │   └── package.json
│   ├── custom-extension-pack-vue-2/
│   │   └── package.json
│   ├── custom-extension-pack-js/
│   │   └── package.json
│   ├── custom-extension-pack-java/
│   │   └── package.json
│   ├── custom-extension-pack-python/
│   │   └── package.json
│   └── custom-extension-pack-haskell/
│       └── package.json
└── app/                               # Management application
    └── (Electron app with SolidJS, Vite, TypeScript)
```

## 🔧 Management Application Features

### Technology Stack
- **Framework**: Electron
- **Frontend**: SolidJS
- **Build Tool**: Vite
- **Language**: TypeScript

### Core Functionality

#### 1. Extension Discovery
- Scan user's local VS Code extensions to generate `installExtensionList`
- Parse `package.json` files from `./packs/` to create `extensionPackList`
- **📝 Reference**: The [Raycast VS Code extension](https://github.com/raycast/extensions/tree/main/extensions/vscode) has an excellent implementation for getting VS Code extension lists - consider reviewing their approach

#### 2. Data Structure
```typescript
export interface ExtensionPack {
    type: "vue3" | "vue2" | "js" | "java" | "python" | "haskell";
    extensionIdList: string[];
    // Example:
    // [
    //     "prettier",
    //     "vue-official",
    // ]
}
```

#### 3. Pack Management
- **Extension Tracking**: Identify which extensions belong to which packs
- **Batch Operations**: Use checkboxes/select components to batch-add extensions to packs
- **Automatic Updates**: 
  - Update relevant `package.json` files
  - Execute build commands to generate updated extension packs

## ✅ Implementation Tasks

- [ ] Set up monorepo structure
- [ ] Create individual extension pack `package.json` files
- [ ] Build Electron app with SolidJS + Vite + TypeScript
- [ ] Implement extension discovery logic
- [ ] Create pack management UI
- [ ] Add batch extension assignment functionality
- [ ] Implement automatic build pipeline