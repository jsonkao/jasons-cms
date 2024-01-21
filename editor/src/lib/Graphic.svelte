<script>
	import { onMount } from "svelte";

  let count = 0;

  onMount(() => {
    const interval = setInterval(() => count += 1, 1000)
    return () => clearInterval(interval);
  })
</script>

<div>
  <p>Count: {count}</p>
</div>

<style>
  div {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 300px;
    background: rgba(255, 0, 0, 0.1);
    border: 1px solid red;
  }
</style>