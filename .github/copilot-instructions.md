# Extension Packer - AI Coding Instructions

## Project Overview

This is a dual-purpose monorepo managing VSCode extension packs alongside an Electron-based management application built with SolidJS and TypeScript.

## Architecture

### Project Structure
- **`/packs/`** - VSCode extension pack definitions (each contains `package.json` with `extensionPack` array)
- **`/app/`** - Electron application for managing extension packs
  - **Main Process**: `src/main/index.ts` - Window management, IPC handlers
  - **Renderer**: `src/renderer/` - SolidJS frontend with Vite bundling
  - **Preload**: `src/preload/index.ts` - Secure context bridge between main/renderer

### Technology Stack
- **Frontend**: SolidJS + TypeScript + Vite
- **Desktop**: Electron with electron-vite for HMR
- **Bundling**: electron-builder for distribution
- **Linting**: ESLint with Solid-specific rules + Prettier

## Development Workflows

### Application Development
```bash
cd app/
pnpm dev          # Start with HMR (main + renderer)
pnpm build        # TypeScript compilation + Vite build
pnpm build:mac    # Create distributable .dmg
```

### Extension Pack Management
- Extension packs are defined in `packs/*/package.json` with `extensionPack` arrays
- Each pack contains 100+ extension IDs for specialized development environments
- Use `vsc-extension-quickstart.md` for VSCode extension pack workflows

### Key Commands
- **Development**: `pnpm dev` (uses electron-vite with HMR)
- **Type Checking**: Split between `typecheck:node` (main/preload) and `typecheck:web` (renderer)
- **Building**: Platform-specific builds via electron-builder with YAML config

## Project-Specific Patterns

### Electron Architecture
- **Triple TypeScript configs**: `tsconfig.node.json` (main/preload), `tsconfig.web.json` (renderer), `tsconfig.json` (root)
- **Path aliases**: `@renderer` points to `src/renderer/src` for clean imports
- **IPC Pattern**: Minimal usage - main process has `ping` handler, renderer sends via `window.electron.ipcRenderer`

### Build Configuration
- **electron-builder.yml**: Comprehensive cross-platform build settings with macOS entitlements, Windows NSIS, Linux AppImage/snap/deb
- **Exclusion patterns**: Excludes source files, configs, and dev dependencies from distribution
- **Asset handling**: `resources/` folder for runtime assets, `build/` for build-time resources

### Extension Pack Structure
```json
{
  "extensionPack": [
    "publisher.extension-id",
    "another.extension"
  ]
}
```

### Development Environment
- **VSCode settings**: Auto-format with Prettier for TS/JS/JSON
- **Debug config**: Separate debuggers for main process (Node) and renderer (Chrome DevTools)
- **Package manager**: pnpm with lockfile, `onlyBuiltDependencies` for electron/esbuild

## Critical Dependencies
- **@electron-toolkit/***: Provides preload APIs, utils, and ESLint configs
- **electron-vite**: Replaces standard Vite for Electron-specific bundling
- **vite-plugin-solid**: SolidJS integration with Vite
- **electron-builder**: Cross-platform distribution packaging

## Integration Points
- **Main ↔ Renderer**: Via contextBridge and electron-toolkit preload APIs
- **Extension Packs ↔ VSCode**: Standard VSCode extension pack format
- **Future App ↔ Packs**: Electron app will likely manage extension pack generation/editing

## Common Tasks
- **Adding extensions to pack**: Edit `extensionPack` array in relevant `packs/*/package.json`
- **Renderer changes**: Work in `app/src/renderer/src/` with auto-reload via HMR
- **Main process changes**: Modify `app/src/main/index.ts`, restart dev server
- **New extension pack**: Create new directory in `packs/` with `package.json` following existing pattern
