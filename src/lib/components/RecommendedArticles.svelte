<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import { goto } from '$app/navigation';
  import type { Article } from '$lib/types/article';
  import ArticleCard from './ArticleCard.svelte';

  let articles: Article[] = [];
  let isLoading = true;
  let error = '';

  onMount(async () => {
    try {
      const { data, error: err } = await supabase
        .from('articles')
        .select('*')
        .eq('is_recommended', true)
        .order('published_date', { ascending: false })
        .limit(8);

      if (err) {
        console.error('Supabase error:', err);
        error = 'Could not load recommended articles';
      } else {
        console.log('Fetched recommended articles:', data);
        articles = data || [];
      }
    } catch (e) {
      console.error('Unexpected error:', e);
      error = 'An unexpected error occurred';
    } finally {
      isLoading = false;
    }
  });

  function openArticle(slug: string) {
    goto(`/articles/${slug}`);
  }
</script>

{#if isLoading}
  <div class="flex items-center justify-center h-72 w-full bg-gray-100 animate-pulse rounded-xl">
    <span class="text-2xl text-gray-400 font-semibold">Loading...</span>
  </div>
{:else if error}
  <div class="flex items-center justify-center h-72 w-full bg-red-100 rounded-lg">
    <span class="text-lg text-red-500">{error}</span>
  </div>
{:else if articles.length > 0}
  <section class="px-0 sm:px-0 lg:px-0 pb-32">
    <h2 class="text-2xl font-bold mb-12">Recommended articles</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-24 w-full">
      {#each articles.slice(0, 2) as article (article.id)}
        <ArticleCard {article} variant="default" />
      {/each}
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full">
      {#each articles.slice(2, 8) as article (article.id)}
        <ArticleCard {article} variant="compact" />
      {/each}
    </div>
  </section>
{:else}
  <div class="text-center py-12 text-gray-400">No recommended articles found.</div>
{/if}
