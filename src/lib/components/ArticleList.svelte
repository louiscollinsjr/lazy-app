<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import { goto } from '$app/navigation';
  import { writable } from 'svelte/store';
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge'
  
  export let searchQuery = '';
  export let maxArticles: number | null = null;     // Limit number of articles to display
  export let excludeId: string | null = null;       // Exclude current article from list
  export let category: string | null = null;        // Filter by specific category
  export let relatedMode: boolean = false;          // Special styling for related articles
  export let title: string | null = null;           // Optional section title
  export let titleClass: string = "text-2xl font-normal font-geist mb-6";  // Custom title classes
  
  interface Article {
    id: string;
    title: string;
    slug: string;
    description: string;
    featured_image: string;
    category: string;
    tags: string[];
    published_date: string;
    author: string;
    draft: boolean;
  }
  
  const articles = writable<Article[]>([]);
  const filteredArticles = writable<Article[]>([]);
  const isLoading = writable(true);
  const error = writable<string | null>(null);
  
  // Filter articles based on search input
  $: {
    if ($articles) {
      let filtered = $articles.filter(article => {
        // Basic filters that always apply
        if (article.draft) return false; // Don't show draft articles
        if (excludeId && article.id === excludeId) return false; // Exclude current article
        
        // Category filter
        if (category && article.category !== category) return false;
        
        // Search query filter (only apply if not in related mode and query exists)
        if (!relatedMode && searchQuery) {
          const query = searchQuery.toLowerCase();
          return (
            article.title.toLowerCase().includes(query) ||
            (article.description && article.description.toLowerCase().includes(query)) ||
            (article.category && article.category.toLowerCase().includes(query)) ||
            (article.tags && article.tags.some(tag => tag.toLowerCase().includes(query)))
          );
        }
        
        return true;
      });
      
      // Apply maxArticles limit if set
      if (maxArticles) {
        filtered = filtered.slice(0, maxArticles);
      }
      
      $filteredArticles = filtered;
    }
  }
  
  onMount(async () => {
    try {
      isLoading.set(true);
      const { data, error: err } = await supabase
        .from('articles')
        .select('*')
        .order('published_date', { ascending: false });
      
      if (err) throw err;
      
      articles.set(data);
      filteredArticles.set(data.filter(article => !article.draft));
    } catch (err) {
      console.error('Error fetching articles:', err);
      error.set('Failed to load articles');
    } finally {
      isLoading.set(false);
    }
  });
  
  function formatDate(dateString: string) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }).format(date);
  }
  
  function navigateToArticle(slug: string) {
    goto(`/articles/${slug}`);
  }
</script>

<div class="mt-2">
  {#if $isLoading}
    <div class="flex justify-center py-12">
      <div class="animate-pulse flex flex-col space-y-4 w-full max-w-2xl">
        <div class="h-6 bg-gray-200 rounded w-3/4"></div>
        <div class="h-4 bg-gray-200 rounded w-full"></div>
        <div class="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
    </div>
  {:else if $error}
    <div class="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">
      <p>{$error}</p>
    </div>
  {:else if $filteredArticles.length === 0}
    <!-- Display nothing when no articles found in related mode -->
    {#if !relatedMode}
      <div class="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <h3 class="text-lg font-medium mb-2">No articles found</h3>
        <p class="text-gray-600">Try adjusting your search term</p>
      </div>
    {/if}
  {:else}
    {#if title}
      <h2 class={titleClass}>{title}</h2>
    {/if}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 gap-y-16 p-0 pb-8">
      {#each $filteredArticles as article (article.id)}
        <div class="relative h-full w-full bg-transparent transition-all duration-200 overflow-hidden bg-white">
          <a 
            href="/articles/{article.slug}" 
            class="absolute inset-0 w-full h-full p-0 m-0 z-10"
            aria-label="Read {article.title}"
          >
            <span class="sr-only">Read {article.title}</span>
          </a>
          <div class="flex flex-col h-full">
            <!-- {#if article.featured_image}
              <div class="md:w-1/3 h-48 md:h-auto overflow-hidden">
                <img 
                  src={article.featured_image} 
                  alt={article.title} 
                  class="w-full h-full object-cover"
                />
              </div>
            {/if} -->
            <div class="p-1 flex-1 flex flex-col gap-4 justify-between h-full">
              <div>
                {#if article.category}
                  <Badge variant="secondary" class="text-[8px] uppercase mb-4 tracking-wider px-2 py-0.5 bg-gray-100 text-gray-600">{article.category}</Badge>
                {/if}
                <h3 class="text-lg font-medium font-geist mb-1 text-gray-900 line-clamp-2">{article.title}</h3>
                {#if article.description}
                  <p class="text-sm text-gray-600 line-clamp-2 mb-0.5">{article.description}</p>
                {/if}
                <!-- {#if article.tags && article.tags.length > 0}
                  <div class="mt-3 flex items-center gap-1.5 mb-3">
                    {#each article.tags.slice(0, 3) as tag}
                    <Badge variant="secondary" class="text-[8px] uppercase mb-4 tracking-wider px-2 py-0.5 bg-gray-100 text-gray-600">{tag}</Badge>
                    {/each}
                  </div>
                {/if} -->
              </div>
              <div class="mt-2 text-[11px] text-gray-500 flex flex-col items-start space-y-1">
                {#if article.published_date}
                  <div>{formatDate(article.published_date)}</div>
                {/if}
                {#if article.author}
                  <span>Reviewed by {article.author}</span>
                {/if}
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
