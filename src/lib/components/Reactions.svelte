<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import { user } from '$lib/stores/auth';
  
  const dispatch = createEventDispatcher();
  
  // Props
  export let contentId; // Article ID or Comment ID
  export let contentType = 'article'; // 'article' or 'comment'
  export let compact = false; // Compact mode for smaller layouts
  export let disabled = false; // Disable interactions
  export let showCounts = true; // Show reaction counts
  
  // Reaction types
  const reactionTypes = [
  {
    id: 'like',
    label: 'Like',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="#000000" viewBox="0 0 256 256"><path d="M234,80.12A24,24,0,0,0,216,72H160V56a40,40,0,0,0-40-40,8,8,0,0,0-7.16,4.42L75.06,96H32a16,16,0,0,0-16,16v88a16,16,0,0,0,16,16H204a24,24,0,0,0,23.82-21l12-96A24,24,0,0,0,234,80.12ZM32,112H72v88H32ZM223.94,97l-12,96a8,8,0,0,1-7.94,7H88V105.89l36.71-73.43A24,24,0,0,1,144,56V80a8,8,0,0,0,8,8h64a8,8,0,0,1,7.94,9Z"></path></svg>`
  },
  {
    id: 'upvote',
    label: 'Upvote',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="#000000" viewBox="0 0 256 256"><path d="M240,56v64a8,8,0,0,1-16,0V75.31l-82.34,82.35a8,8,0,0,1-11.32,0L96,123.31,29.66,189.66a8,8,0,0,1-11.32-11.32l72-72a8,8,0,0,1,11.32,0L136,140.69,212.69,64H168a8,8,0,0,1,0-16h64A8,8,0,0,1,240,56Z"></path></svg>`
  },
  {
    id: 'downvote',
    label: 'Downvote',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="#000000" viewBox="0 0 256 256"><path d="M240,128v64a8,8,0,0,1-8,8H168a8,8,0,0,1,0-16h44.69L136,107.31l-34.34,34.35a8,8,0,0,1-11.32,0l-72-72A8,8,0,0,1,29.66,58.34L96,124.69l34.34-34.35a8,8,0,0,1,11.32,0L224,172.69V128a8,8,0,0,1,16,0Z"></path></svg>`
  }
];
  
  // State
  let reactions = [];
  let userReactions = {};
  let loading = true;
  let error = null;
  
  // Load reactions
  async function loadReactions() {
    if (!contentId) return;
    
    loading = true;
    error = null;
    
    try {
      // Get reaction counts
      const { data: reactionData, error: reactionsError } = await supabase
  .from('reactions')
  .select('reaction_type_id')
  .eq(contentType === 'article' ? 'article_id' : 'comment_id', contentId);

if (reactionsError) throw reactionsError;

const counts = reactionData?.reduce((acc, r) => {
  acc[r.reaction_type_id] = (acc[r.reaction_type_id] || 0) + 1;
  return acc;
}, {});
reactions = reactionTypes.map(type => ({
  ...type,
  count: counts?.[type.id] || 0
}));
        
      
      // Get user's reactions if logged in
      if ($user) {
        const { data: userReactionsData, error: userReactionsError } = await supabase
          .from('reactions')
          .select('reaction_type_id')
          .eq(contentType === 'article' ? 'article_id' : 'comment_id', contentId)
          .eq('user_id', $user.id);
          
        if (userReactionsError) throw userReactionsError;
        
        // Track user's reactions
        userReactions = {};
        userReactionsData?.forEach(r => {
          userReactions[r.reaction_type_id] = true;
        });
      }
    } catch (e) {
      console.error('Error loading reactions:', e);
      error = e.message;
    } finally {
      loading = false;
    }
  }
  
  // Toggle reaction
  async function toggleReaction(reactionTypeId) {
    if (disabled || loading || !$user) {
      if (!$user) {
        dispatch('auth-required');
      }
      return;
    }
    
    const hasReacted = userReactions[reactionTypeId];
    
    try {
      if (hasReacted) {
        // Remove reaction
        const { error: deleteError } = await supabase
          .from('reactions')
          .delete()
          .eq(contentType === 'article' ? 'article_id' : 'comment_id', contentId)
          .eq('user_id', $user.id)
          .eq('reaction_type_id', reactionTypeId);
          
        if (deleteError) throw deleteError;
        
        // Update local state
        userReactions[reactionTypeId] = false;
        reactions = reactions.map(r => {
          if (r.id === reactionTypeId) {
            return { ...r, count: Math.max(0, r.count - 1) };
          }
          return r;
        });
      } else {
        // Add reaction
        const { error: insertError } = await supabase
          .from('reactions')
          .insert({
            [contentType === 'article' ? 'article_id' : 'comment_id']: contentId,
            user_id: $user.id,
            reaction_type_id: reactionTypeId
          });
          
        if (insertError) throw insertError;
        
        // Update local state
        userReactions[reactionTypeId] = true;
        reactions = reactions.map(r => {
          if (r.id === reactionTypeId) {
            return { ...r, count: r.count + 1 };
          }
          return r;
        });
      }
      
      dispatch('reaction-change', { 
        contentId, 
        contentType, 
        reactionTypeId, 
        hasReacted: !hasReacted 
      });
    } catch (e) {
      console.error('Error toggling reaction:', e);
      error = e.message;
    }
  }
  
  // Watch for changes in props or auth state
  $: if (contentId || $user) {
    loadReactions();
  }
  
  onMount(() => {
    loadReactions();
  });
</script>

<div class="reactions {compact ? 'reactions-compact' : ''}" aria-label="Content reactions">
  {#if error}
    <div class="reactions-error" role="alert">{error}</div>
  {/if}
  
  <div class="reactions-list" class:reactions-loading={loading}>
    {#each reactions as reaction}
      <button 
        class="reaction-button" 
        class:reaction-active={userReactions[reaction.id]} 
        disabled={disabled || loading || !$user}
        on:click={() => toggleReaction(reaction.id)}
        aria-label="{reaction.label} ({reaction.count})"
        aria-pressed={userReactions[reaction.id] || false}
      >
        <span class="reaction-icon">{@html reaction.svg}</span>
        {#if showCounts}
          <span class="reaction-count">{reaction.count}</span>
        {/if}
      </button>
    {/each}
  </div>
</div>

<style>
  .reactions {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .reactions-list {
    display: flex;
    gap: 0.75rem;
    transition: opacity 0.2s;
  }
  
  .reactions-loading {
    opacity: 0.6;
  }
  
  .reactions-compact .reactions-list {
    gap: 0.25rem;
  }
  
  .reactions-error {
    color: var(--color-danger, #ff3e00);
    font-size: 0.75rem;
    margin-bottom: 0.25rem;
  }
  
  .reaction-button {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    background: transparent;
    border: none;
    border-radius: 4px;
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  
  .reaction-button:hover {
    background: rgba(0, 0, 0, 0.05);
  }
  
  .reaction-button:focus {
    outline: 2px solid rgba(0, 0, 0, 0.1);
  }
  
  .reaction-active {
    background: rgba(0, 0, 0, 0.02);
    font-weight: 500;
  }
  
  .reaction-icon {
    font-size: 1rem;
    line-height: 1;
  }
  
  .reactions-compact .reaction-icon {
    font-size: 0.875rem;
  }
  
  .reaction-count {
    font-size: 0.65rem;
    min-width: 1rem;
    text-align: center;
  }
  
  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    .reaction-button:hover {
      background: rgba(255, 255, 255, 0.1);
    }
    
    .reaction-button:focus {
      outline-color: rgba(255, 255, 255, 0.2);
    }
    
    .reaction-active {
      background: rgba(255, 255, 255, 0.1);
    }
  }
</style>
