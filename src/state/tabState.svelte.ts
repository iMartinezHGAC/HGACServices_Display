let chosenTab: string

export function tabState() {

  // CRUD
  function setTab(setter: string) {
    chosenTab = setter
  }
  function deleteTab() {
    chosenTab = ""
  }

  return {
    get tab() { return chosenTab },
    setTab: setTab,
  }
}
