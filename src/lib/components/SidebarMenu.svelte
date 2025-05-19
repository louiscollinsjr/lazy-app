<script>
  import { Button } from '$lib/components/ui/button';
  import { isSidebarOpen } from '$lib/stores/uiStore';
</script>

<div class="space-y-2 mt-12">
  <!-- Main Navigation Items -->
  <div class="space-y-px">
    <Button variant="ghost" class="w-full justify-start text-gray-700 hover:bg-gray-100 hover:text-gray-900 font-medium text-[12px]">Articles</Button>
    <Button variant="ghost" class="w-full justify-start text-gray-700 hover:bg-gray-100 hover:text-gray-900 font-medium text-[12px]">Investing</Button>
    <Button variant="ghost" class="w-full justify-start text-gray-700 hover:bg-gray-100 hover:text-gray-900 font-medium text-[12px]">Money Habits</Button>
    <Button variant="ghost" class="w-full justify-start text-gray-700 hover:bg-gray-100 hover:text-gray-900 font-medium text-[12px]">Online Business</Button>
    <Button variant="ghost" class="w-full justify-start text-gray-700 hover:bg-gray-100 hover:text-gray-900 font-medium text-[12px]">Lazy Money Shorts</Button>
    <Button variant="ghost" class="w-full justify-start text-gray-700 hover:bg-gray-100 hover:text-gray-900 font-medium text-[12px]">News</Button>
    <Button variant="ghost" class="w-full justify-start text-gray-700 hover:bg-gray-100 hover:text-gray-900 font-medium text-[12px]">Company</Button>
  </div>
</div>
