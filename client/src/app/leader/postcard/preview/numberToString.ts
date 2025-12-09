const stringLessThanTen = [
  "첫",
  "두",
  "세",
  "네",
  "다섯",
  "여섯",
  "일곱",
  "여덟",
  "아홉",
]

const numberAtTheOne = [
  "한",
  "두",
  "세",
  "네",
  "다섯",
  "여섯",
  "일곱",
  "여덟",
  "아홉",
]

const numberAtTheTen = [
  "열",
  "스물",
  "서른",
  "마흔",
  "쉰",
  "예순",
  "일흔",
  "여든",
  "아흔",
]

const numberAtTheHundred = [
  "백",
  "이백",
  "삼백",
  "사백",
  "오백",
  "육백",
  "칠백",
  "팔백",
  "구백",
]

export default function numberToString(num: number | undefined): string {
  if (!num) {
    return ""
  }
  if (num < 10) {
    return "" + stringLessThanTen[num - 1]
  }
  let returnString = ""
  if (num >= 100) {
    returnString += numberAtTheHundred[Math.floor(num / 100) - 1]
    num = num % 100
  }
  if (num >= 10) {
    if (num === 20) {
      returnString += "스무"
    } else {
      returnString += numberAtTheTen[Math.floor(num / 10) - 1]
    }
    num = num % 10
  }
  if (num > 0) {
    returnString += numberAtTheOne[num - 1]
  }
  //20 예외처리
  return returnString
}
