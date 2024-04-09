<script lang="ts">
  import type { Data } from '../routes/api/job/+server.ts'
  import { roomList } from '$lib/roomList.ts'
  import { CalculateTimeDiff } from '$lib/CalculateTimeDiff.ts'

  const handleChangeRoom = () => {
    nameNum = ''
    const roomNum = roomList.map(e => e.name).indexOf(room)
    if (roomNum == -1) throw 'invalid room'
    workList = roomList[roomNum].work
    work = workList.length === 1 ? 0 : -1
  }

  const checkTime = (startTime: string, endTime: string, isWeekend: boolean) => {
    if (!startTime || !endTime) return false
    if (parseFloat(endTime) <= parseFloat(startTime)) return false
    const timeDiff = CalculateTimeDiff(startTime, endTime, isWeekend) as number[]
    if (isWeekend) return timeDiff[0] == 7 ? timeDiff[1] == 0 : timeDiff[0] < 7
    return timeDiff[0] == 4 ? timeDiff[1] == 0 : timeDiff[0] < 4
  }

  export let hmac: string, startTimeRange: string[], endTimeRange: string[]
  export let job: { [k: string]: [string, string][] }, jobData: Data
  let nameNum: string, room: string, work: number = -1
  let startTime: string, endTime: string
  let workList: [string, number][] = []
  let submitted = false
</script>

<svelte:head>
	<title>กรอกข้อมูล - OT Online</title>
	<meta name="description" content="กรอกข้อมูล - OT Online" />
</svelte:head>

<!-- <a href=".." class="underline text-gray-500 hover:text-gray-700">back</a> -->
<div class="mx-auto py-4 px-4">
  <form action="/submit" method="post">
    <input class="hidden" value={hmac} readonly name="hmac"/>
    <input class="hidden" value={jobData.isWeekend} readonly name="isWeekend"/>
    <div class="space-y-12">
      <div class="border-b border-gray-900/10 pb-12 space-y-4">
        <h2 class="text-xl font-bold text-center mb-8">แบบฟอร์มเบิกค่าตอบแทนนอกเวลา</h2>
        <div class="flex flex-wrap gap-4">
          <div class="flex basis-full md:basis-auto items-center min-w-0">
            <label for="date" class="mr-4 text-gray-900">วันที่</label>
            <input readonly value={jobData.today} type="date" id="date" class="flex-1 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"/>
          </div>
          <div class="flex-1 flex basis-full md:basis-0 items-center min-w-0">
            <label for="room" class="mr-4 text-gray-900">ห้อง</label>
            <select bind:value={room} on:change={handleChangeRoom} name="room" id="room" class="flex-1 min-w-0 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" required>
              <option disabled selected value="">เลือกห้อง</option>
              {#each jobData.list as e (e)}
                <option value={e}>{e}</option>
              {/each}
            </select>
          </div>
        </div>
        <div>
          {#each workList as e, i (e[0])}
            <div class="flex items-center">
              <input value={i} bind:group={work} type="radio" id="work[{i}]" name="work" class="duration-100 text-indigo-600 border-gray-300 w-4 h-4"/>
              <label for="work[{i}]" class="pl-4 py-1">{e[0]}</label>
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
          <input readonly class="hidden" value={nameNum ? job[room][+nameNum-1][0] : ''} name="fullname"/>
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
                {#if checkTime(startTime, e, jobData.isWeekend)}
                  <option value={e}>{e} น.</option>
                {/if}
              {/each}
            </select>
          </div>
          {#if startTime && endTime}
            <div class="basis-full md:basis-auto">
              <p>รวมเวลา {CalculateTimeDiff(startTime, endTime, jobData.isWeekend, { format: true })}</p>
            </div>
          {/if}
        </div>
        <div class="flex flex-wrap gap-4">
          <div class="flex basis-full items-center sm:flex-1 sm:basis-0">
            <label for="amount" class="mr-4 text-gray-900">ชิ้นงาน</label>
            <input type="text" name="amount" id="amount" class="transition flex-1 min-w-0 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"/>
          </div>
          <div class="flex basis-full items-center sm:basis-40 min-w-0">
            <label for="rate" class="mr-4 text-gray-900">อัตรา</label>
            <input readonly value={workList[work]?.at(1) ?? ''} name="rate" id="rate" class="flex-1 min-w-0 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" required>
          </div>
        </div>
      </div>
    </div>
    <div class="mt-6 flex items-center justify-end gap-x-6">
      <button type="submit" on:submit|once={() => submitted = true} disabled={submitted} class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">ส่งฟอร์ม</button>
    </div>
  </form>
</div>
