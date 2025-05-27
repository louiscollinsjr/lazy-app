<script lang="ts">
  import { onMount } from 'svelte';

  // List of available background images
  const backgroundImages = [
    '/fabio.o0_A_minimal_and_simple_illustration_with_large_shapes_of_afbda908-4c1e-401f-bd5b-74124b13216a.png',
    '/freakywang_A_minimal_and_simple_illustration_with_large_shapes__fe7ed846-ffe8-4b51-9942-669494fbc41d.png',
    '/knot_vain_Scribble_art_abstract_pattern_with_pen_and_marker_lin_9c99ec8b-22e6-4707-ae64-fe8a2aa0cc29.png',
    '/lupulone_green_blurred_background_gradient_--chaos_5_--ar_169_-_5ac511ec-dfcd-4cf1-8550-7f0932b219e3.png',
    '/riverblursneakerheads_pale_blue_and_purple_and_white_and_pink_g_33e29b88-3488-4e0f-8de8-8da56ff5bdc1.png',
    '/u9387181179_glowing_abstract_shape_smooth_white_gradient_backgr_75628d92-b35f-48a7-a10e-e200118acad0.png',
    '/vm3042_medical-themed_background_smooth_gradient_of_green_and_b_431fe0db-9841-434b-824e-8402bab5a746.png',
    '/vucccc9_Minimalist_digital_art_gradient_soft_pastel_hues_blendi_b79d7701-bb84-4d47-af6d-77601b77da85.png',
    '/yangshengtang_Blurred_background_light_red_and_blue_gradient_co_85858326-1bcc-40a9-ad7f-6aa1f6365e12.png'
  ];

  let randomBgImage = '';

  onMount(() => {
    randomBgImage = backgroundImages[Math.floor(Math.random() * backgroundImages.length)];
  });

  export let article: {
    id: string;
    slug: string;
    title: string;
    description: string;
    category?: string;
    published_date?: string;
    author?: string;
  };

  export let variant: 'default' | 'compact' = 'default';
  export let showCategory: boolean = true;
  export let showMetadata: boolean = true;

  function formatDate(dateString: string) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(date);
  }
</script>

<div class="relative w-full group bg-white rounded-lg overflow-hidden flex flex-col h-full">
  <div class="relative overflow-hidden rounded-t-lg flex-none">
    <div 
      class={`w-full ${variant === 'default' ? 'h-[340px] md:h-[475px]' : 'h-72 md:h-64'} rounded-lg`}
      style="background-image: url('{randomBgImage}'); background-size: cover; background-position: center"
    />
  </div>

  <div class="pt-0 md:p-0 mt-2 relative z-10 flex flex-col flex-grow">
    {#if showCategory && article.category}
      <div class="my-4 flex-none">
        <span class="text-xs uppercase tracking-wider px-0 py-0 bg-gray-100 text-gray-600 rounded">
          {article.category}
        </span>
      </div>
    {/if}

    <h3 class="font-bold text-gray-900 mb-3 line-clamp-2 flex-none
      {variant === 'default' ? 'text-2xl' : 'text-lg'}">
      {article.title}
    </h3>

    <div class="text-gray-700 mb-4 line-clamp-2 flex-grow
      {variant === 'default' ? 'text-base w-[80%]' : 'text-sm'}">
      {article.description}
    </div>

    {#if showMetadata && (article.published_date || article.author)}
      <div class="text-xs text-gray-500 space-y-1 flex-none">
        {#if article.published_date}
          <div>{formatDate(article.published_date)}</div>
        {/if}
        {#if article.author}
          <div>By {article.author}</div>
        {/if}
      </div>
    {/if}
  </div>

  <a
    href="/articles/{article.slug}"
    class="absolute inset-0 w-full h-full z-10"
    aria-label={`Read article: ${article.title}`}
    tabIndex="0"
  >
    <span class="sr-only">Read {article.title}</span>
  </a>
</div>
