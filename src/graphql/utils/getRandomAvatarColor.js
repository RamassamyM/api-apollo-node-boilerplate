/**
 * @module getRandomAvataColor
 */

/**
 * Enum for avatar colors
 * <strong style="color: white; background-color: #D81B60;">D81B60</strong>, <strong style="color: white; background-color: #F06292;">F06292</strong>,
 * <strong style="color: white; background-color: #F48FB1;">F48FB1</strong>, <strong style="color: white; background-color: #FFB74D;">FFB74D</strong>,
 * <strong style="color: white; background-color: #FF9800;">FF9800</strong>, <strong style="color: white; background-color: #F57C00;">F57C00</strong>,
 * <strong style="color: white; background-color: #00897B;">00897B</strong>, <strong style="color: white; background-color: #4DB6AC;">4DB6AC</strong>,
 * <strong style="color: white; background-color: #80CBC4;">80CBC4</strong>, <strong style="color: white; background-color: #80DEEA;">80DEEA</strong>,
 * <strong style="color: white; background-color: #4DD0E1;">4DD0E1</strong>, <strong style="color: white; background-color: #00ACC1;">00ACC1</strong>,
 * <strong style="color: white; background-color: #9FA8DA;">9FA8DA</strong>, <strong style="color: white; background-color: #7986CB;">7986CB</strong>,
 * <strong style="color: white; background-color: #3949AB;">3949AB</strong>, <strong style="color: white; background-color: #8E24AA;">8E24AA</strong>,
 * <strong style="color: white; background-color: #BA68C8;">BA68C8</strong>, <strong style="color: white; background-color: #CE93D8;">CE93D8</strong>,
 * @readonly
 * @enum { String[] } 
 */
export const avatarColors = [
  'D81B60', 'F06292', 'F48FB1', 'FFB74D', 'FF9800', 'F57C00', '00897B', '4DB6AC', '80CBC4',
  '80DEEA', '4DD0E1', '00ACC1', '9FA8DA', '7986CB', '3949AB', '8E24AA', 'BA68C8', 'CE93D8',
]

/**
 * Return a random selection of en element in an array
 * @param { String[] } arr Array of colors in hexadecimal strings
 * @return { String } a color in hexadecimal string format
 */
export function randomChoice (arr) {
  return arr[Math.floor(arr.length * Math.random())]
}

/**
 * Return a random hexadecimal string color for avatar color
 * @return { String } the hexadecimal string color
 */
export default () => randomChoice(avatarColors)
