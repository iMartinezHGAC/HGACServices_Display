import type { PageServerLoad } from './$types';
import { PB_URL } from '$env/static/private';


export const load: PageServerLoad = async ({ locals, params }) => {
  let data
  const jurisId = params.uuid;

  try {
    const res = await fetch(`${PB_URL}/api/jurisdiction/${jurisId}/utilization`)
    data = await res.json()
  } catch(error) {
    console.error(error)
  }

  return {
    utilization: data,
  }
}
