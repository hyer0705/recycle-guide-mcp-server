export interface RecyclingItem {
  dstrbt_name: string; // 품목명 (예: 가격표)
  dstrbt_cn: string;   // 배출 내용 (예: 종이류로 배출)
}

export interface MaterialGuide {
  type: string;
  method: string;
  recyclable?: string;
  non_recyclable?: string;
}

export interface WasteGuideItem {
  item: string;
  method: string;
}

export interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

export interface RecyclingGuideData {
  basic_principles: string[];
  materials_guide: MaterialGuide[];
  hazardous_waste_guide: WasteGuideItem[];
  large_waste_guide: WasteGuideItem[];
  food_waste_guide: WasteGuideItem[];
  other_waste_guide: WasteGuideItem[];
  faq: FaqItem[];
}
