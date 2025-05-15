<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { supabase } from '$lib/supabaseClient';
  import { Button } from '$lib/components/ui/button';
  import { goto } from '$app/navigation';
  import { writable } from 'svelte/store';
  
  const articleData = writable(null);
  const articleContent = writable('');
  const isLoading = writable(true);
  const error = writable(null);
  
  onMount(async () => {
    try {
      isLoading.set(true);
      
      // Get the article data from Supabase
      const { data: article, error: articleError } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', $page.params.slug)
        .single();
      
      if (articleError) throw articleError;
      if (!article) throw new Error('Article not found');
      
      articleData.set(article);
      
      // Fetch the markdown content from the file
      try {
        const response = await fetch(`/api/articles/${article.slug}`);
        if (!response.ok) throw new Error('Failed to load article content');
        
        const content = await response.text();
        articleContent.set(content);
      } catch (contentError) {
        console.error('Error loading markdown content:', contentError);
        // Even if we can't load the content, still show article metadata
        articleContent.set('Content not available. Please try again later.');
      }
      
    } catch (err) {
      console.error('Error loading article:', err);
      error.set(err.message || 'Failed to load article');
    } finally {
      isLoading.set(false);
    }
  });
  
  function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }).format(date);
  }
  
  function goBack() {
    goto('/');
  }
</script>

<svelte:head>
  {#if $articleData}
    <title>{$articleData.title} | Lazy Money</title>
    <meta name="description" content={$articleData.description} />
  {:else}
    <title>Article | Lazy Money</title>
  {/if}
</svelte:head>

<div class="container mx-auto px-4 py-12 max-w-4xl">
  {#if $isLoading}
    <div class="animate-pulse space-y-4">
      <div class="h-8 bg-gray-200 rounded w-3/4"></div>
      <div class="h-4 bg-gray-200 rounded w-1/2"></div>
      <div class="h-4 bg-gray-200 rounded w-full"></div>
      <div class="h-4 bg-gray-200 rounded w-full"></div>
    </div>
  {:else if $error}
    <div class="bg-red-50 border border-red-200 text-red-700 rounded-lg p-6 mb-6">
      <h2 class="text-xl font-medium mb-2">Error</h2>
      <p>{$error}</p>
      <Button variant="outline" class="mt-4" on:click={goBack}>Back to Articles</Button>
    </div>
  {:else if $articleData}
    <Button variant="ghost" size="sm" class="mb-6" on:click={goBack}>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      Back to Articles
    </Button>
    
    <article class="prose prose-lg max-w-none">
      {#if $articleData.category}
        <div class="text-sm font-medium text-blue-600 uppercase tracking-wider mb-2">{$articleData.category}</div>
      {/if}
      
      <h1 class="text-4xl font-bold font-geist mb-4">{$articleData.title}</h1>
      
      <div class="flex items-center text-gray-500 mb-8">
        {#if $articleData.author}
          <span class="mr-4">By {$articleData.author}</span>
        {/if}
        {#if $articleData.published_date}
          <span>{formatDate($articleData.published_date)}</span>
        {/if}
      </div>
      
      {#if $articleData.featured_image}
        <img 
          src={$articleData.featured_image} 
          alt={$articleData.title} 
          class="w-full h-64 md:h-96 object-cover rounded-lg mb-8"
        />
      {/if}
      
      {#if $articleData.tags && $articleData.tags.length > 0}
        <div class="flex flex-wrap gap-2 mb-8">
          {#each $articleData.tags as tag}
            <span class="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">{tag}</span>
          {/each}
        </div>
      {/if}
      
      <!-- Article content rendered as markdown -->
      <div class="markdown-body whitespace-pre-line">
        {$articleContent}
      </div>
    </article>
  {/if}
</div>
