<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import { goto } from '$app/navigation';
  import { Badge } from '$lib/components/ui/badge';
  import { Button } from '$lib/components/ui/button';
  import Reactions from './Reactions.svelte';
  //import { formatDate } from '$lib/utils';

  export let articleId: string | null = null;
  export let fallbackBg = "bg-[url('/abstract-bg/freakywang_A_minimal_and_simple_illustration_with_large_shapes__fe7ed846-ffe8-4b51-9942-669494fbc41d.png')] bg-cover bg-center";
  export let showReactions = true;

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

  let article: Article | null = null;
  let isLoading = true;
  let error: string | null = null;

  onMount(async () => {
    isLoading = true;
    let query = supabase.from('articles').select('*').eq('draft', false);
    if (articleId) {
      query = query.eq('id', articleId);
    } else {
      query = query.order('published_date', { ascending: false }).limit(1);
    }
    const { data, error: err } = await query;
    if (err) {
      error = 'Could not load article';
      article = null;
    } else {
      article = data && data.length > 0 ? data[0] : null;
    }
    isLoading = false;
  });

  function formatDate(dateString: string) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(date);
  }

  function openArticle(slug: string) {
    goto(`/articles/${slug}`);
  }
</script>

{#if isLoading}
  <div class="flex items-center justify-center h-96 rounded-3xl w-full bg-gray-100 animate-pulse">
    <span class="text-2xl text-gray-400 font-semibold">Loading...</span>
  </div>
{:else if error}
  <div class="flex items-center justify-center h-96 rounded-3xl w-full bg-red-100">
    <span class="text-lg text-red-500">{error}</span>
  </div>
{:else if article}
  <div class="relative w-full rounded-lg overflow-hidden mb-8 group bg-white shadow-none transition hover:shadow-none mb-32">
    <div class={`w-full h-[340px] md:h-[475px] flex items-center justify-center rounded-lg ${fallbackBg} relative`}>
      <!-- {#if article.featured_image}
        <img src={article.featured_image} alt={article.title} class="object-cover w-full h-full absolute inset-0 z-0" />
      {/if} -->
      <!-- <div class="relative z-10 flex items-center justify-center w-full h-full">
        <span class="bg-white/70 rounded-2xl px-8 py-6 text-3xl md:text-4xl font-bold text-gray-700 shadow-none backdrop-blur-sm group-hover:scale-105 transition-transform duration-200">{article.title}</span>
      </div> -->
    </div>
    <div class="pl-0 pr-4 py-4 md:pl-1 md:pr-8 md:py-6">
      <div class="flex flex-wrap gap-2 mb-6">
        {#if article.category}
          <Badge variant="secondary" class="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-gray-100 text-gray-600">{article.category}</Badge>
        {/if}
        <!-- {#each article.tags.slice(0, 3) as tag}
          <Badge variant="secondary" class="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-gray-100 text-gray-600">{tag}</Badge>
        {/each} -->
      </div>
      <h3 class="text-5xl font-medium font-geist mb-4 text-gray-900 line-clamp-2">{article.title}</h3>
      <div class="text-gray-700 text-base md:text-lg line-clamp-3 mb-2 max-w-[75%]">{article.description}</div>
      <!-- <div class="featured-meta text-sm">
        {#if article.author}<span class="featured-author">By {article.author}</span>{/if}
        {#if article.published_date}<span class="featured-date">{formatDate(article.published_date)}</span>{/if}
      </div> -->
      
      {#if showReactions}
      <div class="featured-reactions py-2">
        <Reactions 
          contentId={article.id} 
          contentType="article" 
          compact={true}
          showCounts={true}
        />
      </div>
      {/if}
      <div class="mt-2 text-[11px] text-gray-500 flex flex-col items-start space-y-1">
        {#if article.published_date}
          <div>{formatDate(article.published_date)}</div>
        {/if}
        {#if article.author}
          <span>By {article.author}</span>
        {/if}
      </div>
    </div>
    <Button
      class="absolute inset-0 w-full h-full p-0 m-0 opacity-0 cursor-pointer"
      aria-label={`Read article: ${article.title}`}
      on:click={() => openArticle(article.slug)}
      tabIndex="0"
      variant="ghost"
    >
      <span class="sr-only">Read {article.title}</span>
    </Button>
  </div>
{/if}
