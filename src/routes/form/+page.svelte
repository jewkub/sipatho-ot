<script lang="ts">
  import Form from '$lib/Form.svelte';
  import type { PageData } from './$types.d.ts'
  export let data: PageData
</script>

{#if data.validHmac}
  <Form></Form>
{:else}
  <h2 class="text-center mt-12 text-xl">
    ลิงค์ไม่ถูกต้อง
  </h2>
{/if}
