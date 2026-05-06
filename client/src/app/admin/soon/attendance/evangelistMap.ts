// 마을 → 전도사 그룹 매핑.
// 4단(담당→마을→다락방→순원) 평탄화 마이그레이션으로 담당(전도사) 노드는
// 데이터에서 사라졌지만, 시각적 그룹화를 위해 코드에 보존.
// dev DB에서 추출한 시점의 스냅샷.
type EvangelistName =
  | "김기쁨"
  | "오정민"
  | "송보석"
  | "원성인"
  | "새가족"

type EvangelistMeta = {
  label: EvangelistName
  color: string
}

const EVANGELIST_META: Record<EvangelistName, EvangelistMeta> = {
  김기쁨: { label: "김기쁨", color: "#ef5350" },
  오정민: { label: "오정민", color: "#42a5f5" },
  송보석: { label: "송보석", color: "#66bb6a" },
  원성인: { label: "원성인", color: "#ab47bc" },
  새가족: { label: "새가족", color: "#ff9800" },
}

const VILLAGE_TO_EVANGELIST: Record<string, EvangelistName> = {
  박세범: "김기쁨",
  이나경: "김기쁨",
  박승규: "김기쁨",
  신선혜: "김기쁨",
  김민지: "김기쁨",
  홍효정: "김기쁨",
  김연선: "오정민",
  서수아: "오정민",
  주효진: "오정민",
  홍민정: "오정민",
  조영욱: "오정민",
  윤미현: "오정민",
  박세헌: "송보석",
  신민석: "송보석",
  김민희: "송보석",
  김소진: "송보석",
  주효린: "송보석",
  정영화: "송보석",
  최우진: "원성인",
  박희영: "원성인",
  신하영: "원성인",
  박은수: "원성인",
  박지선: "원성인",
  엄은지: "원성인",
  김유진: "새가족",
  백은비: "새가족",
}

export function getEvangelistMeta(villageName: string): EvangelistMeta | null {
  const ev = VILLAGE_TO_EVANGELIST[villageName]
  return ev ? EVANGELIST_META[ev] : null
}
