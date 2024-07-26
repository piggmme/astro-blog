export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// from: hello world
// to: helloWorld
export const camelize = (str: string) => {
  return str
    .split(' ')
    .map(word => capitalize(word))
    .join('')
}
