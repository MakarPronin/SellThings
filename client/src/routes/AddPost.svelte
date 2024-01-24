<script>
    import Post from './Post.svelte';
    import { PostStore } from './store.js';

    let post = {views: 0, imgUrl: "", description: "", price: ""};

    async function addPost() {
        try {
            console.log(post);
            await fetch('http://localhost:4001/posts/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify( post )
            });
            const res = await fetch('http://localhost:4001/posts/get');
            const data = await res.json();
            PostStore.set(data);
            post = {views: 0, imgUrl: "", description: "", price: ""};
        }
        catch (err) {
            console.log(err);
        }
    }
</script>

<div class="add-post-container">
    <div class="add-post-input-conatiner">
        <div class="add-post-input">
            <label for="img-url">Image Link:</label>
            <input id="img-url" bind:value={post.imgUrl} on:change={() => post = post}/>
        </div>
        <div class="add-post-input">
            <label for="description">Description:</label>
            <input id="description" bind:value={post.price} on:change={() => post = post}/>
        </div>
        <div class="add-post-input">
            <label for="price">Price:</label>
            <input id="price" bind:value={post.description} on:change={() => post = post}/>
        </div>
    </div>
    <Post {post}></Post>
    <button on:click={addPost}>Add Post</button>
</div>
  
  
<style>
    .add-post-input-conatiner {
        margin: 2vh;
        width: 100%;
        display: inline-flex;
        align-content: space-evenly;
        padding: 0%;
    }

    .add-post-input {
        margin: auto;
        background-color: rgba(157, 0, 255, 0.146);
        border-radius: 10px;
        border-style: none;
    }

    input {
        background-color: rgba(157, 0, 255, 0);
        outline: none;
        border-radius: 10px;
        border-style: none;
        width: 22vw;
    }

    label {
        padding-left: 10px;
    }

    .add-post-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        border-radius: 25px;
        box-shadow: 0px 2px 5px 0px rgba(157, 0, 255, 0.396);
    }

    button {
        overflow: hidden;
        background-color: rgba(157, 0, 255, 0.396);
        border-radius: 25px;
        border-style: none;
        margin: 1vh;
        height: 3vmax;
        width: 7vmax;
    }
</style>