const weekNames = ["", "첫째", "둘째", "셋째", "넷째", "다섯째"]

export function getBulletinWeekTitle(weekDate: string) {
  const [year, month, day] = weekDate.split("-").map(Number)
  if (!year || !month || !day) {
    return `${weekDate} 주일 주보`
  }

  let sundayCount = 0
  for (let currentDay = 1; currentDay <= day; currentDay += 1) {
    if (new Date(year, month - 1, currentDay).getDay() === 0) {
      sundayCount += 1
    }
  }

  const weekName = weekNames[sundayCount] || `${sundayCount}번째`
  return `${month}월 ${weekName}주 주일 주보`
}
