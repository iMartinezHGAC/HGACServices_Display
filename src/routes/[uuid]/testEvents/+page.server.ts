import type { PageServerLoad } from './$types';
import { PB_URL } from '$env/static/private';


export const load: PageServerLoad = async ({ locals, params }) => {
  let utilData
  const jurisId = params.uuid;

  try {
    const res = await fetch(`${PB_URL}/api/jurisdiction/${jurisId}/utilization`)
    utilData = await res.json()
  } catch(error) {
    console.error(error)
  }

  return {
    utilization: utilData,
  }
}
