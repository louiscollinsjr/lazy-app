<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { isSidebarOpen } from '$lib/stores/uiStore';
  import * as Command from "$lib/components/ui/command";
  import * as Popover from "$lib/components/ui/popover";
  import { cn } from "$lib/utils";
  import { tick } from "svelte";
  import { Separator } from "$lib/components/ui/separator";

  let open = false;
  let value = "";

  $: selectedCategory =
    categories.find((c) => c.value === value)?.label ??
    "Select a category...";

  // Refocus the trigger button when the user selects an item
  function closeAndFocusTrigger(triggerId: string) {
    open = false;
    tick().then(() => {
      document.getElementById(triggerId)?.focus();
    });
  }
</script>

<script context="module">
  export const categories = [
    {
      value: "ai-hustles",
      label: "AI Hustles",
    },
    {
      value: "passive-income",
      label: "Passive Income",
    },
    {
      value: "savings",
      label: "Savings",
    },
    {
      value: "side-gigs",
      label: "Side Gigs",
    },
    {
      value: "entrepreneurship",
      label: "Entrepreneurship",
    },
    {
      value: "advice",
      label: "Advice",
    }
  ];
</script>

<div class="space-y-4 mt-12">
  <!-- Category Selector -->
  <div class="px-4">
    <h3 class="mb-2 font-semibold text-gray-700 pl-1  text-[12px]">Browse Categories</h3>
    <Popover.Root bind:open let:ids>
      <Popover.Trigger asChild let:builder>
        <Button
          builders={[builder]}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          class="w-full justify-between text-[12px]"
        >
          {selectedCategory}
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256" class="ml-2 opacity-50">
            <path d="M181.66,170.34a8,8,0,0,1,0,11.32l-48,48a8,8,0,0,1-11.32,0l-48-48a8,8,0,0,1,11.32-11.32L128,212.69l42.34-42.35A8,8,0,0,1,181.66,170.34Zm-96-84.68L128,43.31l42.34,42.35a8,8,0,0,0,11.32-11.32l-48-48a8,8,0,0,0-11.32,0l-48,48A8,8,0,0,0,85.66,85.66Z"></path>
          </svg>
        </Button>
      </Popover.Trigger>
        <Popover.Content class="max-w-xs p-0 text-[12px]">
          <Command.Root>
          <Command.Input placeholder="Search categories..." />
          <Command.Empty>No category found.</Command.Empty>
          <Command.Group>
            {#each categories as category}
              <Command.Item
                value={category.value}
                onSelect={(currentValue) => {
                  value = currentValue;
                  closeAndFocusTrigger(ids.trigger);
                }}
              >
                <span class={cn(
                  "mr-2 text-[12px]",
                  value === category.value ? "opacity-100" : "opacity-0"
                )}>✓</span>
                {category.label}
              </Command.Item>
            {/each}
          </Command.Group>
        </Command.Root>
      </Popover.Content>
    </Popover.Root>
  </div>

  <Separator class="my-2 w-[50%] ml-4"/>

  <!-- Main Navigation Items -->
  <div class="space-y-px pl-1">
    <Button variant="ghost" class="w-full justify-start text-gray-700 hover:bg-gray-100 hover:text-gray-900 font-medium text-[12px]">Articles & Shorts</Button>
    <Button variant="ghost" class="w-full justify-start text-gray-700 hover:bg-gray-100 hover:text-gray-900 font-medium text-[12px]">My Challenges</Button>
    <Button variant="ghost" class="w-full justify-start text-gray-700 hover:bg-gray-100 hover:text-gray-900 font-medium text-[12px]">My Bookmarks</Button>
    <Button variant="ghost" class="w-full justify-start text-gray-700 hover:bg-gray-100 hover:text-gray-900 font-medium text-[12px]">Submit an Idea</Button>
    <Button variant="ghost" class="w-full justify-start text-gray-700 hover:bg-gray-100 hover:text-gray-900 font-medium text-[12px]">Company</Button>
    <Button variant="ghost" class="w-full justify-start text-gray-700 hover:bg-gray-100 hover:text-gray-900 font-medium text-[12px]">News</Button>
  </div>
</div>
