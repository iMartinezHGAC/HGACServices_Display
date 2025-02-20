export function sortAscendeing(a: number, b:number) {
    return a - b
}

export function sortDescending(a: number|undefined, b:number|undefined) {
  if(a && b)
    return b - a
  else if (!a) {
    console.error("a is undefined")
    return 0 
  }
  else if(!b) {
    console.error("b is undefined")
    return 0 
  }
  else {
    console.error("a and b are undefined")
    return 0 
  }
}
