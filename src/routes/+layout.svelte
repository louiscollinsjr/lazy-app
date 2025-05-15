<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import Navbar from '$lib/components/Navbar.svelte';
	import { supabase } from '$lib/supabaseClient';
	import { session, user } from '$lib/stores/auth';
	

	let { children } = $props();

	onMount(async () => {
		// Initialize auth state
		const { data } = await supabase.auth.getSession();
		if (data.session) {
			session.set(data.session);
			user.set(data.session.user);
		}

		// Listen for auth changes
		const { data: authListener } = supabase.auth.onAuthStateChange(
			(event, newSession) => {
				session.set(newSession);
				user.set(newSession?.user ?? null);
			}
		);

		return () => {
			authListener.subscription.unsubscribe();
		};
	});
</script>

<div class="min-h-screen flex flex-col bg-white">
	<Navbar />
	<main class="flex-grow">
		{@render children()}
	</main>
</div>
