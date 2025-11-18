import type { JurisdictionType } from "../ambient"


function isJurisdictionId(id: string) {
  const match = '[a-zA-Z0-9]{6}'
  return id.match(match)
}

let chosenJurisdiction: JurisdictionType
let juris_uuid: string
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
    juris_uuid = ""
  }

  return {
    setJurisdiction: setJurisdiction,
    get uuid() { return juris_uuid },
    get jurisdiction() { return chosenJurisdiction },
  }
}
