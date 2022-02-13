export const stringToCodePoints = (str: string) => {
  const points = []
  for (let i = 0; i < str.length; ++i) {
    points.push(str.codePointAt(i))
  }
  return points
}