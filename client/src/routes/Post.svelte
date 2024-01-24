<script>
    import { PostStore } from './store.js';
    export let post = {};

    async function willBuyClicked() {
        try {
            await fetch('http://localhost:4001/posts/remove', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: post.id })
            });
            const res = await fetch('http://localhost:4001/posts/get');
            const data = await res.json();
            PostStore.set(data);
        }
        catch (err) {
            console.log(err);
        }
    }
</script>

<div class="post-container">
    <img src={post.imgUrl} alt="">
    <span>{post.description}</span>
    <span>{post.price}</span>
    <div>
        <span>{post.views}👁</span>
        <button on:click={willBuyClicked} disabled={post.id == undefined}>Will buy!</button>
    </div>
</div>

  
<style>
    .post-container {
        margin-inline: auto;
        margin-top: 1vh;
        margin-bottom: 1vh;
        overflow: hidden;
        width: 22vw;
        height: 22vh;
        display: flex;
        flex-direction: column;
        border-radius: 25px;
        border-color: rgba(157, 0, 255, 0.396);
        border-style: solid;
        align-items: center;
    }

    button {
        margin: 0.2vmax;
        background-color: rgba(157, 0, 255, 0.396);
        border-radius: 10px;
        border-style: none;
    }
    span {
        margin-inline: 0.2vmax;
    }
    
    img {
        width: 22vw;
        height: 13vh
    }
</style>
  