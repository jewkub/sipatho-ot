<script>
  import "../app.css";
</script>

<div class="flex flex-col min-h-lvh">
	<header/>
	<main class="flex-1 flex flex-col w-full my-0 mx-auto box-border">
		<slot/>
	</main>
</div>

<style lang="postcss">
  :global(html) {
    background-color: theme(colors.gray.100);
  }
</style>
