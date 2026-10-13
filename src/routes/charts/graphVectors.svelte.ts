let graphs: HTMLElement[] = []

/** Sort in document order; registration order depends on mount timing and isn't reliable. */
function byDocumentOrder(a: HTMLElement, b: HTMLElement) {
  if (a === b) return 0
  return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
}

export function graphsState() {

  function addGraph(newGraph: HTMLElement) {
    if (!graphs.includes(newGraph)) graphs.push(newGraph)
  }

  function removeGraph(oldGraph: HTMLElement) {
    graphs = graphs.filter(graph => graph !== oldGraph)
  }

  function clearGraphs() {
    graphs = []
  }

  return {
    get graph() {return graphs.filter(g => g.isConnected).sort(byDocumentOrder)},
    add: addGraph,
    remove: removeGraph,
    clear: clearGraphs
  }
}
