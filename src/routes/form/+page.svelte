<script lang="ts">
  import { onMount } from 'svelte'
  import Form from '$lib/Form.svelte'
  import type { PageData } from './$types.d.ts'
  import type { Data } from '../api/job/+server.ts'
  import Loading from '$lib/Loading.svelte'
  export let data: PageData
  let jobData: Data
  let loaded = false
  const timeRange = {
    weekday: {
      start: ['4.30', '6.30', '7.00', '7.30', '8.00', '15.00', '15.30', '16.00', '16.30', '17.00'],
      end: ['8.00', '8.30', '16.00', '16.30', '17.00', '17.30', '18.00', '18.30', '19.00', '19.30', '20.00', '20.30', '21.00'],
    },
    weekend: {
      start: ['4.30', ...[...Array(26)].map((_, i) => `${(i>>1)+6}.${(i&1)*3}0`)],
      end: [...[...Array(26)].map((_, i) => `${(i>>1)+6}.${(i&1)*3}0`), '20.30'],
    },
  }
  timeRange.weekend.start.splice(12, 2)
  timeRange.weekend.end.splice(13, 1)
  let startTimeRange: string[], endTimeRange: string[]
  const job: { [k: string]: [string, string][] } = {}
  // https://stackoverflow.com/a/62118425/4468834
  onMount(async () => {
		const res = await fetch('/api/job')
    jobData = await res.json()
    ;({start: startTimeRange, end: endTimeRange} = timeRange[jobData.isWeekend ? 'weekend' : 'weekday'])
    for (const room in jobData.job) {
      job[room] = [...new Map(jobData.job[room].filter((e): e is [string, string] => e != null))]
    }
    loaded = true
	})
</script>
<div class="container px-6 sm:px-8 pt-6">
  {#if !loaded}
    <Loading/>
  {:else if data.validHmac}
    <Form hmac={data.hmac} {startTimeRange} {endTimeRange} {job} {jobData}></Form>
  {:else}
    <h2 class="text-center mt-12 text-xl">
      ลิงค์ไม่ถูกต้อง
    </h2>
  {/if}
</div>