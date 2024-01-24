<script>
    import { onMount } from 'svelte';
    import { PostStore } from './store.js';
    import Post from './Post.svelte';

    let posts = {};

    onMount(async () => {
        try {
            const res = await fetch('http://localhost:4001/posts/get');
            const data = await res.json();
            PostStore.set(data);
        }
        catch (err) {
            console.log(err);
        }
    });

    PostStore.subscribe((newPosts) => {
        console.log(`PostList: ${JSON.stringify(newPosts)}`);
        posts = newPosts;
    });
</script>

<div class="post-list-container">
    {#each posts as post (post.id)}
        <Post {post} />
    {/each}
</div>

  
<style>
    .post-list-container {
        margin-top: 1vh;
        margin-bottom: 1vh;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
    }
</style>