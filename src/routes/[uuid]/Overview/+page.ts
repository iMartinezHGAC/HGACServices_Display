import type { PageLoad } from "./$types";
import fakedata from "$lib/data/fakedata2.json"


export const load: PageLoad = async () => {
  return {
    fakeData: fakedata
  }
}
