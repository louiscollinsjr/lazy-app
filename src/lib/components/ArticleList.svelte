<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import { goto } from '$app/navigation';
  import { writable } from 'svelte/store';
  
  export let searchQuery = '';
  
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
      $filteredArticles = $articles.filter(article => {
        if (article.draft) return false; // Don't show draft articles
        
        const query = searchQuery.toLowerCase();
        if (!query) return true; // If no query, show all
        
        // Search in title, description, category, and tags
        return (
          article.title.toLowerCase().includes(query) ||
          (article.description && article.description.toLowerCase().includes(query)) ||
          (article.category && article.category.toLowerCase().includes(query)) ||
          (article.tags && article.tags.some(tag => tag.toLowerCase().includes(query)))
        );
      });
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

<div class="mt-8">
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
    <div class="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
      <h3 class="text-lg font-medium mb-2">No articles found</h3>
      <p class="text-gray-600">Try adjusting your search term</p>
    </div>
  {:else}
    <div class="grid gap-8">
      {#each $filteredArticles as article (article.id)}
        <div 
          class="bg-white border border-gray-200 hover:border-gray-300 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer" 
          on:click={() => navigateToArticle(article.slug)}
          on:keydown={(e) => e.key === 'Enter' && navigateToArticle(article.slug)}
          tabindex="0"
        >
          <div class="flex flex-col md:flex-row">
            {#if article.featured_image}
              <div class="md:w-1/3 h-48 md:h-auto overflow-hidden">
                <img 
                  src={article.featured_image} 
                  alt={article.title} 
                  class="w-full h-full object-cover"
                />
              </div>
            {/if}
            <div class="p-6 flex-1 flex flex-col justify-between">
              <div>
                {#if article.category}
                  <div class="text-xs font-medium text-blue-600 mb-2 uppercase tracking-wider">{article.category}</div>
                {/if}
                <h3 class="text-xl font-bold font-geist mb-2 text-gray-900">{article.title}</h3>
                {#if article.description}
                  <p class="text-gray-600 line-clamp-2 mb-4">{article.description}</p>
                {/if}
                {#if article.tags && article.tags.length > 0}
                  <div class="flex flex-wrap gap-2 mb-4">
                    {#each article.tags as tag}
                      <span class="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">{tag}</span>
                    {/each}
                  </div>
                {/if}
              </div>
              <div class="flex justify-between items-center mt-4 text-sm text-gray-500">
                <div>
                  {#if article.author}
                    <span>By {article.author}</span>
                  {/if}
                </div>
                {#if article.published_date}
                  <div>{formatDate(article.published_date)}</div>
                {/if}
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
