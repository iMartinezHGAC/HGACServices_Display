let juris_uuid: string = "a8se97t2"

export function jurisState() {
  $inspect(juris_uuid)
  // CRUD
  function setUUID(id: string) {
    juris_uuid = "/" + id.split("/")[1]
  }
  function clearUUID() {
    juris_uuid = ""
  }

  return {
    setUUID: setUUID,
    get uuid() { return juris_uuid },
  }
}
