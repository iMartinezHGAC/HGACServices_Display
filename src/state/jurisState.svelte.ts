import type { JurisdictionType } from "../ambient"


function isJurisdictionId(id: string) {
  const match = '[a-zA-Z0-9]{6}'
  return id.match(match)
}

let chosenJurisdiction: JurisdictionType
let juris_uuid: string
let juris_logo: string

export function jurisState() {
  // CRUD
  function setJurisdiction(juris: JurisdictionType) {
    console.log('ID passed to setUUID: ', juris)
    if (juris !== undefined) {
      chosenJurisdiction = juris
      juris_uuid = '/' + juris.id
    }
  }
  function clearUUID() {
    juris_logo = ""
    juris_uuid = ""
  }

  function setJurisLogo(url: string) {
    juris_logo = url
    console.log("STATE: jurisdiction logo ", juris_logo)
  }

  return {
    setJurisdiction: setJurisdiction,
    setJurisLogo: setJurisLogo,
    clearUUID: clearUUID,
    get uuid() { return juris_uuid },
    get jurisdiction() { return chosenJurisdiction },
    get logo_url() { return juris_logo },
  }
}
