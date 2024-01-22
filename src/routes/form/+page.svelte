<script lang="ts">
  import { onMount } from 'svelte'
  import type { Data } from '../api/+server.ts'
  import { roomList } from '$lib/roomList.ts'
  import { CalculateTimeDiff } from '$lib/CalculateTimeDiff.ts'

  const handleChangeRoom = () => {
    nameNum = ''
    const roomNum = roomList.map(e => e.name).indexOf(room)
    if (roomNum == -1) throw 'invalid room'
    workList = roomList[roomNum].work
    rateList = roomList[roomNum].rate
  }

  let data: Data, nameNum: string, room: string, rate: string
  const job: { [k: string]: [string, string][] } = {}
  let startTime: string, endTime: string
  let workList: string[] = [], rateList: string[] | number[] = []
  const timeRange = {
    weekday: {
      start: ['6.30', '7.00', '7.30', '8.00', '15.00', '15.30', '16.00', '16.30', '17.00'],
      end: ['8.00', '8.30', '18.00', '18.30', '19.00', '19.30', '20.00', '20.30', '21.00'],
    },
    weekend: {
      start: [...Array(26)].map((_, i) => `${(i>>1)+6}.${(i&1)*30}`),
      end: [...Array(26)].map((_, i) => `${(i>>1)+6}.${(i&1)*30}`),
    },
  }
  let startTimeRange: string[], endTimeRange: string[]
  // https://stackoverflow.com/a/62118425/4468834
  onMount(async () => {
		const res = await fetch('/api')
    data = await res.json()

    if (data.isWeekend) ({start: startTimeRange, end: endTimeRange} = timeRange.weekend)
    else ({start: startTimeRange, end: endTimeRange} = timeRange.weekday)
    for (const room in data.job) {
      job[room] = [...new Map(data.job[room].filter((e): e is [string, string] => e != null))]
    }
	});
</script>

<svelte:head>
	<title>กรอกข้อมูล - OT Online</title>
	<meta name="description" content="กรอกข้อมูล - OT Online" />
</svelte:head>

<!-- <div>{JSON.stringify(data)}</div> -->
<div class="container px-6 sm:px-8 pt-6">
  <a href=".." class="underline text-gray-500 hover:text-gray-700">back</a>
  <div class="mx-auto py-4 px-4">
    {#if data}
      <form action="/submit" method="post">
        <div class="space-y-12">
          <div class="border-b border-gray-900/10 pb-12 space-y-4">
            <h2 class="text-xl font-bold text-center mb-8">แบบฟอร์มเบิกค่าตอบแทนนอกเวลา</h2>
            <div class="flex flex-wrap gap-4">
              <div class="flex basis-full md:basis-auto items-center min-w-0">
                <label for="date" class="mr-4 text-gray-900">วันที่</label>
                <input readonly value={data.today} type="date" id="date" class="flex-1 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"/>
              </div>
              <div class="flex-1 flex basis-full md:basis-0 items-center min-w-0">
                <label for="room" class="mr-4 text-gray-900">ห้อง</label>
                <select bind:value={room} on:change={handleChangeRoom} name="room" id="room" class="flex-1 min-w-0 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" required>
                  <option disabled selected value="">เลือกห้อง</option>
                  {#each data.list as e (e)}
                    <option value={e}>{e}</option>
                  {/each}
                </select>
              </div>
            </div>
            <div class="space-y-2">
              {#each workList as work, i (work)}
                <div class="flex items-center space-x-4">
                  <input checked={workList.length === 1} type="checkbox" id="work[{i}]" name="work[{i}]" class="duration-100 rounded text-indigo-600 border-gray-300 w-4 h-4"/>
                  <label for="work[{i}]">{work}</label>
                </div>
              {/each}
            </div>
            <div class="flex flex-wrap gap-4">
              <div class="flex-1 flex basis-full sm:basis-0 items-center min-w-0">
                <label for="name" class="mr-4 text-gray-900">ชื่อ</label>
                <select bind:value={nameNum} name="name" id="name" class="flex-1 min-w-0 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" required>
                  <option disabled selected value="">เลือกชื่อ</option>
                  {#each job[room] as e, i (e[0])}
                    <option value={i+1}>{e[0]}</option>
                  {/each}
                </select>
              </div>
              <input class="hidden" value={nameNum ? job[room][+nameNum-1][0] : ''} name="fullname"/>
              <div class="flex basis-full sm:basis-40 items-center min-w-0">
                <label for="sap" class="mr-4 text-gray-900">SAP</label>
                <input value={nameNum ? job[room]?.at(parseInt(nameNum)-1)?.at(1) : ''} readonly type="text" name="sap" id="sap" class="flex-1 min-w-0 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" required/>
              </div>
            </div>
            <div class="flex flex-wrap gap-4">
              <div class="flex-1 flex basis-full sm:basis-0 items-center min-w-0">
                <label for="startTime" class="mr-4 text-gray-900">เวลาเข้า</label>
                <select bind:value={startTime} on:change={() => endTime = ''} name="startTime" id="startTime" class="flex-1 min-w-0 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" required>
                  <option disabled selected value="">เลือกเวลาเข้า</option>
                  {#each startTimeRange as e (e)}
                    <option value={e}>{e} น.</option>
                  {/each}
                </select>
              </div>
              <div class="flex-1 flex basis-full sm:basis-0 items-center min-w-0">
                <label for="endTime" class="mr-4 text-gray-900">เวลาออก</label>
                <select bind:value={endTime} name="endTime" id="endTime" class="flex-1 min-w-0 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" required>
                  <option disabled selected value="">เลือกเวลาออก</option>
                  {#each endTimeRange as e (e)}
                    {#if parseFloat(e) > parseFloat(startTime)}
                      <option value={e}>{e} น.</option>
                    {/if}
                  {/each}
                </select>
              </div>
              {#if startTime && endTime}
                <div class="basis-full md:basis-auto">
                  <p>รวมเวลา {CalculateTimeDiff(startTime, endTime)}</p>
                </div>
              {/if}
            </div>
            <div class="flex flex-wrap gap-4">
              <div class="flex basis-full items-center sm:flex-1 sm:basis-0">
                <label for="amount" class="mr-4 text-gray-900">ชิ้นงาน</label>
                <input type="text" name="amount" id="amount" class="transition flex-1 min-w-0 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" required/>
              </div>
              <div class="flex basis-full items-center sm:flex-1 sm:basis-0">
                <label for="rate" class="mr-4 text-gray-900">อัตรา</label>
                <select disabled={rateList.length == 0} bind:value={rate} name="rate" id="rate" class="flex-1 min-w-0 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" required>
                  {#each rateList as e (e)}
                    <option value={e}>{e}</option>
                  {/each}
                </select>
              </div>
            </div>
          </div>
        </div>
        <div class="mt-6 flex items-center justify-end gap-x-6">
          <button type="submit" class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Save</button>
        </div>
      </form>
    {:else}
      <div role="status">
        <svg aria-hidden="true" class="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
          <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
        </svg>
      </div>
    {/if}
  </div>
</div>
