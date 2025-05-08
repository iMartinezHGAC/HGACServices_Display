let juris_uuid: string = "a8se97t2"

function isJurisdictionId(id: string) {
  const match = '[a-zA-Z0-9]{6}'
  return id.match(match)
}

export function jurisState() {
  $inspect('juris uuid from store', juris_uuid).with(console.trace)
  // CRUD
  function setUUID(id: string) {
    console.log('ID passed to setUUID: ', id)
    if(id !== undefined) {
      juris_uuid = '/' + id 
    }
  }
  function clearUUID() {
    juris_uuid = ""
  }

  return {
    setUUID: setUUID,
    get uuid() { return juris_uuid },
  }
}
