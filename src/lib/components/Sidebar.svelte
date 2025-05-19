<script>
  import { isSidebarOpen } from '$lib/stores/uiStore';
  import SidebarMenu from './SidebarMenu.svelte';
</script>

<aside class="h-full bg-white border-none border-gray-100">
  <div class="pt-5 pb-4 px-4 h-full overflow-y-auto flex flex-col"
       class:opacity-100={$isSidebarOpen}
       class:opacity-0={!$isSidebarOpen}>
    <SidebarMenu />
  </div>
</aside>
