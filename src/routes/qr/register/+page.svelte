<script lang="ts">
  import type { PageServerData } from "./$types.js";
  export let data: PageServerData
</script>

<svelte:head>
	<title>ลงทะเบียนเครื่องรับ QR Code - OT Online</title>
	<meta name="description" content="ปิดแล้ว - OT Online" />
</svelte:head>

{#if !data.openQrRegister}
  <h2 class="text-center mt-12 text-xl">
    ฟอร์มปิดแล้ว
  </h2>
{:else}
  <div class="container px-6 sm:px-8 pt-6">
    <div class="mx-auto py-4 px-4">
      <form method="post">
        <div class="space-y-12">
          <div class="border-b border-gray-900/10 pb-12 space-y-4">
            <h2 class="text-xl font-bold text-center mb-8">ลงทะเบียนเครื่องรับ QR Code</h2>
            <div class="flex flex-wrap gap-4">
              <div class="flex basis-full items-center sm:flex-1 sm:basis-0">
                <label for="deviceName" class="mr-4 text-gray-900">ชื่อเครื่อง</label>
                <input type="text" name="deviceName" id="deviceName" class="transition flex-1 min-w-0 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" required/>
              </div>
            </div>
          </div>
        </div>
        <div class="mt-6 flex items-center justify-end gap-x-6">
          <button type="submit" class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Submit</button>
        </div>
      </form>
    </div>
  </div>
{/if}