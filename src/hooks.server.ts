import PocketBase from "pocketbase";
import {PB_URL} from "$env/static/private"
import type { Handle } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";

export const initPB: Handle = async({event, resolve}) => {
  event.locals.pb = new PocketBase(PB_URL)
  // load the store data from request cookie string
  event.locals.pb.authStore.loadFromCookie(event.request.headers.get('cookie') || '')

  // Attempt to verify authorization
  try {
    // check if the token is valid
    // await the latest user information
    event.locals.pb.authStore.isValid && await event.locals.pb.collection('users').authRefresh()
  } catch(__any) {
    // If anything is wrong with the token, destroy all client-side user information
    event.locals.pb.authStore.clear()
  }
  // ensure cookies don't exist forever
  const expires = new Date()
  const weeks_to_expiration = 26
  expires.setTime(expires.getTime() +(60*60*24*7) * weeks_to_expiration) // seconds minutes hours days = number of seconds in a week

  const response = await resolve(event)
  response.headers.append(
    'set-cookie',
    event.locals.pb.authStore.exportToCookie()
  )

  return new Response(response.body, response)
}

export const handle = sequence(initPB)
