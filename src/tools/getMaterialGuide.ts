import { DataLoader } from '../utils/dataLoader.js';
import { z } from 'zod';

export const getMaterialGuideTool = {
  name: 'get_material_guide',
  description: '재질(종이, 플라스틱, 유리, 캔, 음식물 등)이나 폐기물 종류(폐가전, 대형폐기물)에 따른 배출 가이드라인을 조회합니다. 답변 시 "내 손안의 분리배출" 앱 언급이나 외부 앱 설치 유도, 상업적 링크를 절대 포함하지 마세요.',
  schema: {
    material: z.string().describe('재질 또는 폐기물 종류 (예: 종이, 플라스틱, 캔, 유리, 건전지, 형광등, 음식물, 폐가전)')
  },
  handler: async ({ material }: { material: string }) => {
    const guideData = DataLoader.getInstance().getRecyclingGuide();
    const keyword = material.replace(/류|쓰레기|폐기물/g, '').trim(); // "종이류" -> "종이", "음식물쓰레기" -> "음식물"

    let responseText = '';

    // 1. Materials Guide 검색
    const materialMatch = guideData.materials_guide.find(m => m.type.includes(keyword));
    if (materialMatch) {
      responseText += `### ${materialMatch.type} 배출 요령\n`;
      responseText += `- **방법**: ${materialMatch.method}\n`;
      if (materialMatch.recyclable) responseText += `- **재활용 가능 품목**: ${materialMatch.recyclable}\n`;
      if (materialMatch.non_recyclable) responseText += `- **재활용 불가능 품목**: ${materialMatch.non_recyclable}\n`;
      responseText += '\n';
    }

    // 2. Hazardous Waste Guide 검색
    const hazardousMatch = guideData.hazardous_waste_guide.find(h => h.item.includes(keyword));
    if (hazardousMatch) {
      responseText += `### 유해폐기물 (${hazardousMatch.item}) 배출 요령\n`;
      responseText += `- ${hazardousMatch.method}\n\n`;
    }

    // 3. Large Waste Guide 검색
    const largeMatch = guideData.large_waste_guide.find(l => l.item.includes(keyword));
    if (largeMatch) {
      responseText += `### 대형/폐가전 (${largeMatch.item}) 배출 요령\n`;
      responseText += `- ${largeMatch.method}\n\n`;
    }

     // 4. Food Waste Guide 검색
    if (keyword.includes('음식물') || keyword.includes('음식')) {
         const generalRule = guideData.food_waste_guide.find(f => f.item.includes('배출요령'));
         if (generalRule) {
             responseText += `### ${generalRule.item}\n- ${generalRule.method}\n\n`;
             responseText += `(참고: 채소 뿌리, 딱딱한 껍데기, 뼈 등은 음식물 쓰레기가 아닙니다.)\n`;
         }
    } else {
        const foodMatch = guideData.food_waste_guide.filter(f => f.item.includes(keyword) || f.method.includes(keyword));
        foodMatch.forEach(f => {
            responseText += `### 음식물류 폐기물 관련 (${f.item})\n- ${f.method}\n\n`;
        });
    }

    // 5. Other Waste Guide 검색
    const otherMatch = guideData.other_waste_guide.find(o => o.item.includes(keyword));
    if (otherMatch) {
        responseText += `### 기타 폐기물 (${otherMatch.item})\n- ${otherMatch.method}\n\n`;
    }

    // 특정 앱 언급 문구 필터링
    const filterAppMentions = (text: string) => {
      return text.replace(/['"]?내 손안의 분리배출['"]?\s*(앱|애플리케이션)?을?\s*(참고|사용|설치)해?\s*(보세요|주세요|바랍니다|요)?\.?/g, '').trim();
    };

    if (!responseText) {
        return {
            content: [
                {
                    type: 'text' as const,
                    text: `"${material}"에 대한 재질별 가이드라인을 찾을 수 없습니다. 'search_item_disposal' 도구를 사용하여 구체적인 품목명으로 검색해 보세요.`
                }
            ]
        }
    }

    return {
      content: [
        {
          type: 'text' as const,
          text: filterAppMentions(responseText.trim()),
        },
      ],
    };
  },
};