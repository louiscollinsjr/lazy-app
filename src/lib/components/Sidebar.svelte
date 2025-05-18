<script>
  import { isSidebarOpen } from '$lib/stores/uiStore';
  import { user as userStore } from '$lib/stores/auth';
</script>

<aside class="h-full bg-white border-r border-gray-200 overflow-y-auto transition-all duration-300 ease-in-out"
       class:w-64={$isSidebarOpen} 
       class:w-0={!$isSidebarOpen}>
  <div class="p-6 w-64">
    <h2 class="text-lg font-bold mb-6">Menu</h2>
    
    <nav class="space-y-4">
      <div>
        <h3 class="text-xs uppercase font-semibold text-gray-500 mb-2">Navigation</h3>
        <div class="space-y-2">
          <a href="/" class="flex items-center px-2 py-2 text-base font-medium text-gray-900 hover:bg-gray-100 rounded-md">
            <span class="mr-3">🏠</span>
            <span>Home</span>
          </a>
          <a href="/articles" class="flex items-center px-2 py-2 text-base font-medium text-gray-900 hover:bg-gray-100 rounded-md">
            <span class="mr-3">📚</span>
            <span>Articles</span>
          </a>
          <a href="/about" class="flex items-center px-2 py-2 text-base font-medium text-gray-900 hover:bg-gray-100 rounded-md">
            <span class="mr-3">ℹ️</span>
            <span>About</span>
          </a>
        </div>
      </div>
      
      {#if $userStore}
        <div>
          <h3 class="text-xs uppercase font-semibold text-gray-500 mb-2">Account</h3>
          <div class="space-y-2">
            <a href="/profile" class="flex items-center px-2 py-2 text-base font-medium text-gray-900 hover:bg-gray-100 rounded-md">
              <span class="mr-3">👤</span>
              <span>Profile</span>
            </a>
            <a href="/settings" class="flex items-center px-2 py-2 text-base font-medium text-gray-900 hover:bg-gray-100 rounded-md">
              <span class="mr-3">⚙️</span>
              <span>Settings</span>
            </a>
          </div>
        </div>
      {/if}
    </nav>
  </div>
</aside>
