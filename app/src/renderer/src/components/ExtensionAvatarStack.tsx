import type { Component } from 'solid-js'
import { For, Show } from 'solid-js'
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/Tooltip'
import type { ExtensionInfo } from './PackCard'

const MAX_AVATARS = 14

interface ExtensionAvatarStackProps {
  extensionIds: string[]
  extensionsMap?: Record<string, ExtensionInfo>
}

const ExtensionAvatarStack: Component<ExtensionAvatarStackProps> = (props) => {
  return (
    <div class="flex items-center gap-3">
      <div class="flex items-center -space-x-2.5">
        <For each={props.extensionIds.slice(0, MAX_AVATARS)}>
          {(extId) => {
            const info = () => props.extensionsMap?.[extId]
            return (
              <Tooltip>
                <TooltipTrigger
                  as="div"
                  class="border-card bg-muted relative h-10 w-10 flex-shrink-0 cursor-default overflow-hidden rounded-full border-2 p-1 ring-0 transition-transform hover:z-10 hover:scale-120"
                >
                  <Show
                    when={info()?.icon}
                    fallback={
                      <div class="text-muted-foreground flex h-full w-full items-center justify-center text-[10px] font-bold">
                        {(info()?.name || extId).charAt(0).toUpperCase()}
                      </div>
                    }
                  >
                    <img
                      src={info()!.icon}
                      alt=""
                      class="h-full w-full rounded-full object-cover"
                    />
                  </Show>
                </TooltipTrigger>
                <TooltipContent>{info()?.name || extId}</TooltipContent>
              </Tooltip>
            )
          }}
        </For>
        <Show when={props.extensionIds.length > MAX_AVATARS}>
          <div class="border-card bg-muted relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2">
            <span class="text-muted-foreground text-[11px] font-semibold">
              +{props.extensionIds.length - MAX_AVATARS}
            </span>
          </div>
        </Show>
      </div>
    </div>
  )
}

export default ExtensionAvatarStack
