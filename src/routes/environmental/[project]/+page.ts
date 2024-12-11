import { error } from '@sveltejs/kit'
import type { PageLoad } from './$types'

export const load: PageLoad = ({ params }) => {
  if(params.project) {
    console.log("called loader with slug: ", params.project)
    return {
      projectName: params.project
    }
  }

  error(404, 'Not Found')
}
