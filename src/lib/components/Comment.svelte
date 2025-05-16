<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { supabase } from '$lib/supabaseClient';
  import { page } from '$app/stores';
  import { user as userStore } from '$lib/stores/auth';
  import { createEventDispatcher } from 'svelte';

  type CommentType = {
    id: string;
    body: string;
    created_at: string;
    user_id: string;
  };

  const { comment, articleId, replies = [], level = 0 } = $props<{
    comment: CommentType;
    articleId: string;
    replies?: any[];
    level?: number;
  }>();

  // Get user from either page data or auth store
  const user = $derived($page.data.user || $userStore);
  let replyOpen = $state(false);
  let replyBody = $state('');
  let loading = $state(false);

  async function reply() {
    if (!user) return;
    if (!replyBody.trim()) return;
    
    loading = true;
    try {
      // First, ensure the user exists in the users table
      const { data: existingUser, error: userCheckError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();
      
      // If user doesn't exist, create a profile for them
      if (userCheckError) {
        console.log('User not found in users table, creating profile...');
        
        // Create a user entry with the correct fields based on the schema
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email,
            name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            avatar_url: user.user_metadata?.avatar_url || null,
            created_at: new Date().toISOString()
          });
        
        if (insertError) {
          console.error('Error creating user profile:', insertError);
          throw insertError;
        }
      }
      
      // Now post the reply
      const { data, error } = await supabase
        .from('comments')
        .insert({
          article_id: articleId,
          user_id: user.id,
          parent_id: comment.id,
          body: replyBody.trim()
        })
        .select()
        .single();
      
      if (error) throw error;
      
          // Dispatch an event to the parent component
      const dispatch = createEventDispatcher();
      dispatch('reply', { reply: data, commentId: comment.id });
      
      replyBody = '';
      replyOpen = false;
    } catch (error) {
      console.error('Error posting reply:', error);
    } finally {
      loading = false;
    }
  }

  function formatDate(date: string) {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
</script>

<div class="py-3 group hover:bg-gray-50 px-3 -mx-3 rounded transition-colors">
  <div class="flex items-start space-x-3">
    <div class="flex-shrink-0">
      <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-medium">
        {comment?.user_id?.slice(0, 2)?.toUpperCase() || '??'}
      </div>
    </div>
    <div class="flex-1 min-w-0">
      <div class="flex items-baseline justify-between mb-1">
        <div class="flex items-center space-x-2">
          <span class="text-sm font-medium text-gray-900">{comment.user_id.slice(0, 8)}</span>
          <span class="text-xs text-gray-400">•</span>
          <span class="text-xs text-gray-500">{formatDate(comment.created_at)}</span>
        </div>
      </div>
      <div class="text-gray-800 whitespace-pre-line">{comment.body}</div>
      
      {#if user}
        <div class="mt-2 flex items-center space-x-3 text-sm">
          <button 
            on:click={() => replyOpen = !replyOpen}
            class="text-gray-500 hover:text-blue-600 transition-colors flex items-center space-x-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            <span>Reply</span>
          </button>
        </div>
      {/if}
    </div>
  </div>

  {#if replyOpen}
    <div class="mt-3 pl-10">
      <textarea
        bind:value={replyBody}
        class="w-full p-3 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Write a reply..."
        rows="2"
      />
      <div class="flex justify-end space-x-2 mt-2">
        <Button 
          variant="outline" 
          size="sm" 
          on:click={() => {
            replyOpen = false;
            replyBody = '';
          }}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button 
          size="sm" 
          on:click={reply} 
          disabled={loading || !replyBody.trim()}
        >
          {loading ? 'Posting...' : 'Reply'}
        </Button>
      </div>
    </div>
  {/if}

  {#if replies.length > 0}
    <div class="mt-3 space-y-3 border-l-2 border-gray-100 pl-4">
      {#each replies as reply}
        <svelte:self
          comment={reply}
          articleId={articleId}
          level={level + 1}
          replies={reply.replies || []}
          on:reply
        />
      {/each}
    </div>
  {/if}
</div>
