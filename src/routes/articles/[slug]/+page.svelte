<script lang="ts">
	import '$lib/styles/article.css';
	import { Badge } from '$lib/components/ui/badge';

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
		'/abstract-bg/yangshengtang_Blurred_background_light_red_and_blue_gradient_co_85858326-1bcc-40a9-ad7f-6aa1f6365e12.png'
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
	import ArticleList from '$lib/components/ArticleList.svelte';
	import Reactions from '$lib/components/Reactions.svelte';
	import { marked } from 'marked';
	
	// Configure marked options
	marked.setOptions({
		gfm: true, // GitHub Flavored Markdown
		breaks: true, // Convert \n to <br>
		pedantic: false,
		sanitize: false, // Output raw HTML
		smartLists: true, // Use smarter list behavior
		smartypants: true // Use smart punctuation
	})

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
				// Parse markdown to HTML
				const htmlContent = marked.parse(content);
				articleContent.set(htmlContent);
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

<div class="container mx-auto max-w-4xl px-4 py-12 pt-32">
	{#if $isLoading}
		<div class="animate-pulse space-y-4">
			<div class="h-8 w-3/4 rounded bg-gray-200"></div>
			<div class="h-4 w-1/2 rounded bg-gray-200"></div>
			<div class="h-4 w-full rounded bg-gray-200"></div>
			<div class="h-4 w-full rounded bg-gray-200"></div>
		</div>
	{:else if $error}
		<div class="mb-6 rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
			<h2 class="mb-2 text-xl font-medium">Error</h2>
			<p>{$error}</p>
			<Button variant="outline" class="mt-4" on:click={goBack}>Back to Articles</Button>
		</div>
	{:else if $articleData}
		<Button variant="ghost" size="sm" class="mb-6" on:click={goBack}>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="mr-2 h-4 w-4"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M10 19l-7-7m0 0l7-7m-7 7h18"
				/>
			</svg>
			Back to Articles
		</Button>

		<article class="prose prose-lg max-w-none">
			{#if $articleData.category}
				<Badge
					variant="secondary"
					class="mb-4 bg-gray-100 px-2 py-0.5 text-[10px] uppercase tracking-wider text-gray-600"
					>{$articleData.category}</Badge
				>
			{/if}

			<h1 class="mb-2 font-geist text-4xl font-bold">{$articleData.title}</h1>

			<div class="article-metadata" style="display: flex; gap: 1rem; font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1rem;">
				{#if $articleData.author}
					<span class="article-author">By {$articleData.author}</span>
				{/if}
				{#if $articleData.published_date}
					<span class="article-date">{formatDate($articleData.published_date)}</span>
				{/if}
			</div>

			<div class="article-reactions pb-8">
				<Reactions 
					contentId={$articleData.id} 
					contentType="article" 
					on:auth-required={() => {
						// Handle auth required (e.g., show login modal)
						console.log('Authentication required for reactions');
					}} 
				/>
			</div>

			{#if $articleData.featured_image}
				<img
					src={getRandomBg()}
					alt="Abstract background"
					class="mb-8 h-64 w-full rounded-lg object-cover md:h-96"
				/>
			{/if}

			{#if $articleData.tags && $articleData.tags.length > 0}
				<div class="mb-8 flex flex-wrap gap-2">
					{#each $articleData.tags as tag}
						<!-- <span class="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">{tag}</span> -->
            <Badge
					variant="secondary"
					class="mb-4 bg-gray-100 px-2 py-0.5 text-[10px] uppercase tracking-wider text-gray-600"
					>{tag}</Badge>
					{/each}
				</div>
			{/if}

			<!-- Article content rendered as markdown -->
			<div class="markdown-body prose prose-lg max-w-none">
				{@html $articleContent}
			</div>
		</article>

		<!-- Related Articles section -->
		<div class="mt-16 pt-8">
			<ArticleList
				title="Related Articles"
				titleClass="text-2xl font-medium font-geist mb-6"
				category={$articleData.category}
				excludeId={$articleData.id}
				maxArticles={3}
				relatedMode={true}
			/>
		</div>

		<!-- Comments section with proper article ID -->
		<div class="mt-12 border-t border-gray-200 pt-8">
			<Comments articleId={$articleData.id} />
		</div>
	{/if}
</div>
