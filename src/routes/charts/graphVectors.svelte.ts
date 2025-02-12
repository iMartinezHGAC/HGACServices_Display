
let graphs: HTMLDivElement[] = $state([])

export function graphsState() {

  function doesGraphExist(checkedGraph: HTMLDivElement) {
    if(graphs.find(graph => graph === checkedGraph)) return true
    return false
  }

  function addGraph(newGraph: HTMLDivElement) {
    graphs.push(newGraph)
  }

  function clearGraphs() {
    graphs = []
  }

  return {
    get graph() {return graphs},
    add: addGraph,
    clear: clearGraphs
  }
}
