<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import { goto } from '$app/navigation';
  import { Badge } from '$lib/components/ui/badge';
  import { Button } from '$lib/components/ui/button';
  import Reactions from './Reactions.svelte';
  import ArticleCard from './ArticleCard.svelte';
  import type { Article } from '$lib/types/article';
  
  export let articleId: string | null = null;
  export let fallbackBg = "bg-[url('/abstract-bg/freakywang_A_minimal_and_simple_illustration_with_large_shapes__fe7ed846-ffe8-4b51-9942-669494fbc41d.png')] bg-cover bg-center";
  export let showReactions = true;

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
  <ArticleCard 
    {article} 
    variant="default"
    showCategory={true}
    showMetadata={true}
  />
{/if}
