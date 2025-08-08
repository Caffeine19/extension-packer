import type { GetPrimaryExtensions, GetInstalledExtensions } from './extension'
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
}
