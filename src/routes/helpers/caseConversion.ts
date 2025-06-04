/**
 * It doesn't actually convert to camel case
 */
export function toCamelCase(input: string): string {
  // Split the string by space, then map over the words
  const words = input.split(' ');
  // Join all words together to form a single string
  return "#" +words.join('');
}

export function snakeToHuman(input: string): string {
  return input
    .split("_")
    .map(word=> word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() )
    .join(" ")
}
