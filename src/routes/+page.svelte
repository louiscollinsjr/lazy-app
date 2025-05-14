<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { user } from "$lib/stores/auth";
</script>

<div class="container mx-auto px-4 py-12">
  <div class="max-w-4xl mx-auto">
    <h1 class="text-4xl font-bold font-geist mb-6">Welcome to LazyApp</h1>
    
    {#if $user}
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h2 class="text-xl font-medium font-inter mb-2">Welcome back, {$user.email}</h2>
        <p class="text-gray-600 mb-4">You're logged in with Supabase Magic Link authentication.</p>
        <Button variant="outline" class="text-sm">View Dashboard</Button>
      </div>
    {:else}
      <div class="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
        <h2 class="text-xl font-medium font-inter mb-2">Get Started</h2>
        <p class="text-gray-600 mb-4">Sign up or log in using our secure Magic Link authentication.</p>
        <div class="flex space-x-4">
          <a href="/login">
            <Button variant="default" class="text-sm">Sign Up</Button>
          </a>
          <a href="/login">
            <Button variant="outline" class="text-sm">Log In</Button>
          </a>
        </div>
      </div>
    {/if}
    
    <div class="grid md:grid-cols-2 gap-6 mt-8">
      <div class="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 class="text-lg font-medium font-montserrat mb-3">Magic Link Authentication</h3>
        <p class="text-gray-600 text-sm mb-4">Secure, passwordless authentication powered by Supabase.</p>
        <Button variant="ghost" size="sm" class="font-luckiest">Learn More</Button>
      </div>
      
      <div class="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 class="text-lg font-medium font-montserrat mb-3">Markdown Content</h3>
        <p class="text-gray-600 text-sm mb-4">Ready for articles, documentation, and more.</p>
        <Button variant="ghost" size="sm" class="font-luckiest">Coming Soon</Button>
      </div>
    </div>
  </div>
</div>