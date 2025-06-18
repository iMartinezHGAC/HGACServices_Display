export function truncateDate(input: string | Date) {
    if(input instanceof Date)
      return input.toISOString().split('T')[0]

    if(input.includes('Z')) {
      return new Date(input).toISOString().split('T')[0]
    }
}

export function shrinkLongNames(input: string ): string {
    const nameComponents = input.split(" - ")
    if(nameComponents.length !== 2) return input
    const prefix = nameComponents[0] // This will contain the main jurisdiction name
    const postfix = nameComponents[1] // This will contain the long sub-jursidiction name
    const abbreviate = postfix
      .split(' ')
      .map(word => word[0].toUpperCase())
      .join('')
    return `${prefix} - ${abbreviate}`
}
