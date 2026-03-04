import type {
  GetPrimaryExtensions,
  GetInstalledExtensions,
  GetIgnoredExtensions,
  ToggleIgnoredExtension,
  ClearIgnoredExtensions
} from './extension'
import type {
  CreateExtensionPack,
  GetExtensionPacks,
  UpdateExtensionPack,
  AddExtensionToPack,
  RemoveExtensionFromPack,
  BuildExtensionPack,
  UploadPackIcon,
  RemovePackIcon,
  DeleteExtensionPack,
  InstallExtensionPack,
  UninstallExtensionPack
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
  uploadPackIcon: UploadPackIcon
  removePackIcon: RemovePackIcon
  deleteExtensionPack: DeleteExtensionPack
  installExtensionPack: InstallExtensionPack
  uninstallExtensionPack: UninstallExtensionPack
  getIgnoredExtensions: GetIgnoredExtensions
  toggleIgnoredExtension: ToggleIgnoredExtension
  clearIgnoredExtensions: ClearIgnoredExtensions
}
