<script lang="ts">
	import { PUBLIC_TIMEZONE } from '$env/static/public'
	const yesterday = new Date(new Date().valueOf() - 1000 * 60 * 60 * 24)
	let day = yesterday.toLocaleDateString('th-TH', { day: 'numeric', timeZone: PUBLIC_TIMEZONE })
	let month = yesterday.toLocaleDateString('th-TH', { month: 'long', timeZone: PUBLIC_TIMEZONE })
	let year = yesterday.toLocaleDateString('th-TH', { year: 'numeric', timeZone: PUBLIC_TIMEZONE }).split(' ')[1]
	let start = 1, end = 99
</script>

<svelte:head>
	<title>PDF - OT Online</title>
	<meta name="description" content="PDF - OT Online" />
</svelte:head>

<h1 class="text-3xl font-bold my-10 text-center">
	กดเพื่อสร้าง PDF file
</h1>
<div class="flex flex-col">
	<div class="flex justify-center basis-full md:basis-auto items-center min-w-0 m-2">
		<label for="day" class="mr-4 text-gray-900">วันที่</label>
		<input type="text" bind:value={day} id="day" class="flex-grow-0 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"/>
	</div>
	<div class="flex justify-center basis-full md:basis-auto items-center min-w-0 m-2">
		<label for="month" class="mr-4 text-gray-900">เดือน</label>
		<input type="text" bind:value={month} id="month" class="flex-grow-0 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"/>
	</div>
	<div class="flex justify-center basis-full md:basis-auto items-center min-w-0 m-2">
		<label for="year" class="mr-4 text-gray-900">ปี</label>
		<input type="text" bind:value={year} id="year" class="flex-grow-0 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"/>
	</div>
	<div class="flex justify-center basis-full md:basis-auto items-center min-w-0 m-2">
		<label for="start" class="mr-4 text-gray-900">รายการแรก</label>
		<input type="text" bind:value={start} id="start" class="flex-grow-0 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"/>
	</div>
	<div class="flex justify-center basis-full md:basis-auto items-center min-w-0 m-2">
		<label for="end" class="mr-4 text-gray-900">รายการสุดท้าย</label>
		<input type="text" bind:value={end} id="end" class="flex-grow-0 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"/>
	</div>
	{#each [1, 2, 3, 6, 7, 8] as e}
		<div class="flex justify-center m-2">
			<a href={`/api/pdf?template=${e}&d=${day}&m=${month}&y=${year}&start=${start}&end=${end}`} target="_blank" class="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 transition text-white rounded-md text-lg">
				{e <= 3 ? `4/2563 (${e})` : `4/2566 (${e})`}
			</a>
		</div>
	{/each}
</div>