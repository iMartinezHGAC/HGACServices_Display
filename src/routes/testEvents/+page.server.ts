import type { Actions } from '@sveltejs/kit';
import type { EventType, JurisdictionType } from '../../../ambient';
import type { PageServerLoad } from './$types';
import PocketBase from 'pocketbase'

interface TableDataResult<T = any> {
  [tableName: string]: T | { error: string }
}

export const load: PageServerLoad = async ({ locals, request, params }) => {

  /*
  let eventsData: EventType[] = []
  // Build program OR conditions (unchanged from your original)
  try {
    eventsData = await locals.pb.collection('events_json').getFullList<EventType>()
    //console.log('Event Data if any', eventsData)
  } catch (err) {
    console.error('Error trying to get events data', err)
  }

  let jurisdictionData: JurisdictionType[] = []
  try {
    jurisdictionData = await locals.pb.collection('jurisdictions').getFullList<JurisdictionType>()
  } catch (err) {
    console.error('Error trying to get jurisdiction data', err)
  }
  */
  const pocketbase = new PocketBase('192.168.2.2')
  locals.pb.authStore.loadFromCookie(request.headers.get('cookie') || '')

  const jurisId = '9dek35nm3dm50xu'

  let res = await fetch(`http://127.0.0.1:8090/api/jurisdiction/${jurisId}/utilization`)
  let result = await res.json()
  console.log(result)
  return {
    /*
    eventsData: eventsData,
    jurisdictionData: jurisdictionData
    */
    dashboardData: result
  }
}

function formDataToObject(formData: FormData): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (obj[key] === undefined) {
      obj[key] = value;
    } else if (Array.isArray(obj[key])) {
      (obj[key] as unknown[]).push(value);
    } else {
      obj[key] = [obj[key], value];
    }
  }
  return obj;
}
export const actions = {
  update: async ({ locals, request }) => {
    const data = await request.formData()
    const formObj = formDataToObject(data); // Convert to plain object
    const { eventId, jurisId } = formObj

    console.log('event id', eventId)
    console.log('juris id', jurisId)
    //const record = await locals.pb.collection('events_json').update(eventId, { jurisdiction: jurisId });
  },
} satisfies Actions
