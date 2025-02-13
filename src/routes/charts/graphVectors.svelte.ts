
let graphs: HTMLDivElement[] = $state([])

export function graphsState() {

  $inspect(graphs)
  function doesGraphExist(checkedGraph: HTMLDivElement) {
    if(graphs.find(graph => graph === checkedGraph) === undefined) return false 
    return true
  }

  function addGraph(newGraph: HTMLDivElement) {
    graphs.push(newGraph)
  }

  function useAddGraph(newGraph: HTMLDivElement) {
    if(doesGraphExist(newGraph))
      console.error("Graph already in state")
    else
      addGraph(newGraph)
  }

  function clearGraphs() {
    graphs = []
  }

  return {
    get graph() {return graphs},
    add: useAddGraph,
    clear: clearGraphs
  }
}
