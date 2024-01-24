<script>
    import { PostStore } from './store.js';
    let postCounter = 0;
    let newPostCounter = 0;

    PostStore.subscribe((newPosts) => {
        postCounter = 0;
        newPostCounter = 0;
        newPosts.forEach(post => {
            if (post.views < 3){
                newPostCounter++;
            }
            postCounter++;
        });
    });
</script>

<div class="counters-container">
    <span>Number of posts: {postCounter}</span>
    <span>Number of new posts: {newPostCounter}</span>
</div>
  
  
<style>
    .counters-container {
        display: flex;
        flex-direction: column;
        align-items: center;
    }
</style>