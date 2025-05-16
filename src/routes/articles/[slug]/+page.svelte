<script lang="ts">
  // List of static fallback images
  const fallbackImages = [
    '/abstract-bg/cyberwoman_03922_Gradient_background._--ar_169_--v_7_1d0f87e1-9b9f-4fd2-9db0-88d7c6d81e6d.png',
    '/abstract-bg/fabio.o0_A_minimal_and_simple_illustration_with_large_shapes_of_afbda908-4c1e-401f-bd5b-74124b13216a.png',
    '/abstract-bg/freakywang_A_minimal_and_simple_illustration_with_large_shapes__fe7ed846-ffe8-4b51-9942-669494fbc41d.png',
    '/abstract-bg/knot_vain_Scribble_art_abstract_pattern_with_pen_and_marker_lin_9c99ec8b-22e6-4707-ae64-fe8a2aa0cc29.png',
    '/abstract-bg/lupulone_green_blurred_background_gradient_--chaos_5_--ar_169_-_5ac511ec-dfcd-4cf1-8550-7f0932b219e3.png',
    '/abstract-bg/olha_yankina_comic_book_background_with_intense_vibrant_fuchsia_1155e7d0-8105-48ba-9688-23d5380812da.png',
    '/abstract-bg/riverblursneakerheads_pale_blue_and_purple_and_white_and_pink_g_33e29b88-3488-4e0f-8de8-8da56ff5bdc1.png',
    '/abstract-bg/u6185661394_slightly_translucent_3d_blob_floating_in_the_air_wi_6528d831-1821-4443-a9f3-6dff189e88e0.png',
    '/abstract-bg/u9387181179_glowing_abstract_shape_smooth_white_gradient_backgr_75628d92-b35f-48a7-a10e-e200118acad0.png',
    '/abstract-bg/vm3042_medical-themed_background_smooth_gradient_of_green_and_b_431fe0db-9841-434b-824e-8402bab5a746.png',
    '/abstract-bg/vucccc9_Minimalist_digital_art_gradient_soft_pastel_hues_blendi_b79d7701-bb84-4d47-af6d-77601b77da85.png',
    '/abstract-bg/xin202_Color_gradient_background_with_colors_of_Tiffany_blue_an_62ea5a69-efb1-4941-adb0-2d642c42fc40.png',
    '/abstract-bg/yangshengtang_Blurred_background_light_red_and_blue_gradient_co_85858326-1bcc-40a9-ad7f-6aa1f6365e12.png',
  ];

  // Pick a random fallback image
  function getRandomBg() {
    return fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
  }

  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { supabase } from '$lib/supabaseClient';
  import { Button } from '$lib/components/ui/button';
  import { goto } from '$app/navigation';
  import { writable } from 'svelte/store';
  import Comments from '$lib/components/Comments.svelte';
  
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

<div class="container mx-auto px-4 py-12 max-w-4xl pt-32">
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
          src={getRandomBg()} 
          alt="Abstract background" 
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
    <!-- Comments section with proper article ID -->  
    <div class="mt-12 pt-8 border-t border-gray-200">
      <Comments articleId={$articleData.id} />
    </div>
  {/if}
</div>
