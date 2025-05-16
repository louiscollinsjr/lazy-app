<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { page } from '$app/stores';
  import { supabase } from '$lib/supabaseClient';
  import { session, user as userStore } from '$lib/stores/auth';
  import CommentItem from './Comment.svelte';
  
  const { articleId } = $props<{ articleId: string }>();
  
  let comments = $state<any[]>([]);
  let newComment = $state('');
  let loading = $state(false);
  
  // Get user from either page data or auth store
  const user = $derived($page.data.user || $userStore);
  
  // Debug logs
  $effect(() => {
    console.log('Page data:', $page.data);
    console.log('User from store:', $userStore);
    console.log('User from combined sources:', user);
    console.log('Session exists:', !!$session);
  });

  async function fetchComments() {
    console.log('Fetching comments for article:', articleId);
    if (!articleId) {
      console.error('No articleId provided');
      return;
    }

    try {
      // First fetch top-level comments (where parent_id is null)
      const { data: topLevelComments, error: topLevelError } = await supabase
        .from('comments')
        .select('*')
        .eq('article_id', articleId)
        .is('parent_id', null)
        .order('created_at', { ascending: false });

      if (topLevelError) {
        console.error('Error fetching top level comments:', topLevelError);
        return;
      }

      // If no comments, set empty array and return
      if (!topLevelComments || topLevelComments.length === 0) {
        comments = [];
        return;
      }

      // Fetch all replies for these comments
      const commentIds = topLevelComments.map(c => c.id);
      const { data: replies, error: repliesError } = await supabase
        .from('comments')
        .select('*')
        .in('parent_id', commentIds)
        .order('created_at', { ascending: true });

      if (repliesError) {
        console.error('Error fetching replies:', repliesError);
        // Still continue with just top-level comments
      }

      // Attach replies to their parent comments
      const commentsWithReplies = topLevelComments.map(comment => ({
        ...comment,
        replies: replies?.filter(reply => reply.parent_id === comment.id) || []
      }));

      console.log('Fetched comments with replies:', commentsWithReplies);
      comments = commentsWithReplies;
    } catch (e) {
      console.error('Exception in fetchComments:', e);
    }
  }

  async function postComment() {
    if (!user) {
      console.error('User not authenticated');
      return;
    }
    
    if (!newComment.trim()) {
      console.error('Comment is empty');
      return;
    }
    
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
      
      // Now post the comment
      const { data, error } = await supabase
        .from('comments')
        .insert({
          article_id: articleId,
          user_id: user.id,
          body: newComment.trim(),
          parent_id: null
        })
        .select()
        .single();
      
      if (error) throw error;
      
      console.log('Comment posted successfully:', data);
      newComment = '';
      
      // Add the new comment to the UI immediately
      comments = [data, ...comments];
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      loading = false;
    }
  }

  $effect(() => {
    if (articleId) {
      console.log('articleId changed:', articleId);
      fetchComments();
    }
  });
  
  // Handle reply events from the Comment component
  function handleReply(event) {
    const { reply, commentId } = event.detail;
    
    // Find the comment and add the reply
    comments = comments.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), reply]
        };
      }
      return comment;
    });
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
</script>

<div class="space-y-6">
  <h3 class="text-2xl font-semibold text-gray-900">Comments</h3>
  
  {#if !user}
    <div class="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
      <p class="flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <a href="/login" class="font-medium hover:underline">Sign in</a> to leave a comment
      </p>
    </div>
  {:else}
    <div class="bg-white border rounded-lg p-5 shadow-sm">
      <label for="comment" class="block text-sm font-medium text-gray-700 mb-2">Your comment</label>
      <textarea
        id="comment"
        bind:value={newComment}
        class="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3 text-gray-700"
        placeholder="What are your thoughts?"
        rows="3"
      />
      <div class="flex justify-end">
        <Button 
          on:click={postComment} 
          disabled={loading || !newComment.trim()}
          class="relative"
        >  
          {#if loading}
            <span class="flex items-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Posting...
            </span>
          {:else}
            Post Comment
          {/if}
        </Button>
      </div>
    </div>
  {/if}

  <div class="space-y-6 mt-8">
    {#if comments.length === 0}
      <div class="text-center py-10 text-gray-500 bg-gray-50 rounded-lg border border-gray-100">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        <p class="text-lg">No comments yet</p>
        <p class="text-sm mt-1">Be the first to share your thoughts!</p>
      </div>
    {:else}
      <div class="space-y-6">
        {#each comments as comment (comment.id)}
          <CommentItem
            comment={comment}
            articleId={articleId}
            replies={comment.replies || []}
            on:reply={handleReply}
          />
        {/each}
      </div>
    {/if}
  </div>
</div>
