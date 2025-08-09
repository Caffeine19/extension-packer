import type { GetPrimaryExtensions, GetInstalledExtensions, GetIgnoredExtensions, ToggleIgnoredExtension, ClearIgnoredExtensions } from './extension'
import type {
  CreateExtensionPack,
  GetExtensionPacks,
  UpdateExtensionPack,
  AddExtensionToPack,
  RemoveExtensionFromPack,
  BuildExtensionPack
} from './pack'

export interface ExtensionAPI {
  getPrimaryExtensions: GetPrimaryExtensions
  getInstalledExtensions: GetInstalledExtensions
  getExtensionPacks: GetExtensionPacks
  createExtensionPack: CreateExtensionPack
  updateExtensionPack: UpdateExtensionPack
  addExtensionToPack: AddExtensionToPack
  removeExtensionFromPack: RemoveExtensionFromPack
  buildExtensionPack: BuildExtensionPack
  getIgnoredExtensions: GetIgnoredExtensions
  toggleIgnoredExtension: ToggleIgnoredExtension
  clearIgnoredExtensions: ClearIgnoredExtensions
}
