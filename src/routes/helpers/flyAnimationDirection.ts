const paths = ["overview", "community", "emergency", "economic_development", "environmental", "public_safety", "transportation", "aging", "buy"]

/**
  * checks if the tab routed from is to the left of the current tab or not
  *
  */
export function checkRouteDirection(fromRoute: string|undefined, currentRoute: string|undefined): boolean {
    if(fromRoute && currentRoute) {
      const isLeftOf: boolean = paths.indexOf(fromRoute) < paths.indexOf(currentRoute)
      return isLeftOf
    }
    return false
}
