<script lang="ts">
  import type { PageData } from './$types.d.ts'
  import { onMount } from 'svelte'
  import Loading from '$lib/Loading.svelte'
  import QRCode from 'qrcode'
  export let data: PageData
  let qrUrl = ''
  let loading = true
  const today = new Date().toLocaleDateString('th-TH', { dateStyle: 'full' })

  onMount(async () => {
    const link = await (await fetch('/api/qr?id=' + data.id)).text()
    if (link) qrUrl = await QRCode.toDataURL(link, {
      margin: 0,
      scale: 16,
    })
    loading = false
    setInterval(() => {
      const now = new Date().toLocaleDateString('th-TH', { dateStyle: 'full' })
      if (now != today) window.location.reload()
    }, 60 * 1000)
  })
</script>

<svelte:head>
	<title>QR Code - OT Online</title>
	<meta name="description" content="QR Code - OT Online" />
</svelte:head>

<div class="container p-8 h-screen w-full flex flex-col">
  {#if loading}
    <Loading/>
  {:else if qrUrl}
    <h2 class="text-center m-4 text-2xl">
      QR Code ลิงค์ฟอร์ม OT ประจำ{today}
    </h2>
    <img class="object-contain flex-1 min-w-0 min-h-0 py-12" src={qrUrl} alt="qr" />
  {:else}
    <h2 class="text-center m-4 text-2xl">
      ไม่สามารถแสดง QR Code ในเครื่องนี้ได้
    </h2>
  {/if}
</div>
