const avatarColors = [
  'D81B60', 'F06292', 'F48FB1', 'FFB74D', 'FF9800', 'F57C00', '00897B', '4DB6AC', '80CBC4',
  '80DEEA', '4DD0E1', '00ACC1', '9FA8DA', '7986CB', '3949AB', '8E24AA', 'BA68C8', 'CE93D8',
]

/**
 * Return a random selection of en element in an array
 * @param { String[] } arr Array of colors in hexadecimal strings
 * @return { String } a color in hexadecimal string format
 */
function randomChoice (arr) {
  return arr[Math.floor(arr.length * Math.random())]
}

export default () => randomChoice(avatarColors)
