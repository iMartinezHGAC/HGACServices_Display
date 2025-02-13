import { REDIRECT_URL } from "$env/static/private"
import {error, redirect, type RequestHandler } from "@sveltejs/kit"

export const GET: RequestHandler = async({locals, url, cookies}) => {
  const provider = JSON.parse(cookies.get('parser')  || '{}')

  //check if provider state matches url state
  if(provider.state !== url.searchParams.get('state')) {
    throw new Error("Oauth provider state parameters don't match")
  }

  //attempt to log in
  try {
    const auth = await locals.pb
      .collection('users')
      .authWithOAuth2Code(
        provider.name,
        url.searchParams.get('code') || '',
        provider.codeVerifier,
        REDIRECT_URL + provider.name
      )
  } catch(error) {
    console.error(error)
    // return redirect(304, '/errors')
  }
  // after login, redirect to home page
  throw redirect(302, '/')
}

