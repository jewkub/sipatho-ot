<script lang="ts">
</script>

<svelte:head>
	<title>PDF - OT Online</title>
	<meta name="description" content="PDF - OT Online" />
</svelte:head>

<h1 class="text-3xl font-bold my-10 text-center">
	กดเพื่อสร้าง PDF file
</h1>
<div class="flex flex-col">
	{#each [1, 2, 3, 6, 7, 8] as e}
		<div class="flex justify-center m-2">
			<a href={`/api/pdf?template=${e}`} target="_blank" class="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 transition text-white rounded-md text-lg">
				{e <= 3 ? `4/2563 (${e})` : `4/2566 (${e})`}
			</a>
		</div>
	{/each}
</div>