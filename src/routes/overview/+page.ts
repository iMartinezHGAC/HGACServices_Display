import type { PageLoad } from "./$types";
import fakedata from "$lib/data/fakedata.json"

export const load: PageLoad = async () => {
  return {
    json: fakedata
  }
}
