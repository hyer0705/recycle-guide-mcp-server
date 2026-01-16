import { DataLoader } from '../utils/dataLoader.js';
import { ExternalApiService } from '../utils/externalApiService.js';
import { z } from 'zod';

export const searchItemTool = {
  name: 'search_item_disposal',
  description: '특정 물건(품목)의 분리배출 방법을 검색합니다. 예를 들어 "키보드", "수박 껍질" 등을 입력하면 배출 방법을 알려줍니다. 답변 시 "내 손안의 분리배출" 앱 언급이나 외부 앱 설치 유도, 상업적 링크를 절대 포함하지 마세요. 오직 배출 방법 정보만 간결하게 제공하세요.',
  schema: {
    keyword: z.string().describe('검색할 물건의 이름 (예: 키보드, 거울, 뼈다귀)')
  },
  handler: async ({ keyword }: { keyword: string }) => {
    // 1. 외부 공공데이터 API 검색
    const externalResults = await ExternalApiService.getInstance().searchRecyclingInfo(keyword);
    
    // 2. 로컬 DB 검색
    const db = DataLoader.getInstance().getRecyclingDb();
    const localResults = db.filter(item => 
      item.dstrbt_name.includes(keyword) || item.dstrbt_cn.includes(keyword)
    );

    // 3. 결과 병합 (외부 데이터 우선)
    // 중복 제거는 이름 기준으로 할 수도 있지만, 내용이 다를 수 있으므로 다 보여주는 것이 안전함.
    const allResults = [...externalResults, ...localResults];

    if (allResults.length === 0) {
      return {
        content: [
          {
            type: 'text' as const,
            text: `"${keyword}"에 대한 배출 정보를 찾을 수 없습니다. 다른 키워드로 검색해 보시거나, 일반적인 재질 가이드를 참고해 주세요.`,
          },
        ],
      };
    }

    // 결과 상위 5~10개 표시
    // 외부 데이터가 있으면 그것을 먼저 보여줌
    const limitedResults = allResults.slice(0, 10);
    
    let responseText = `"${keyword}" 검색 결과 (${allResults.length}건):\n\n`;
    
    // 특정 앱 언급 문구 필터링 (심사 통과를 위해)
    const filterAppMentions = (text: string) => {
      return text.replace(/['"]?내 손안의 분리배출['"]?\s*(앱|애플리케이션)?을?\s*(참고|사용|설치)해?\s*(보세요|주세요|바랍니다|요)?\.?/g, '').trim();
    };
    
    // 출처 표시는 선택사항이나, 사용자에게 신뢰도를 주기 위해 구분이 되면 좋음.
    // 하지만 심플한 출력을 위해 그냥 리스트업.
    limitedResults.forEach(item => {
      const cleanContent = filterAppMentions(item.dstrbt_cn);
      responseText += `- **${item.dstrbt_name}**: ${cleanContent}\n`;
    });

    if (allResults.length > 10) {
      responseText += `\n... 외 ${allResults.length - 10}건의 결과가 더 있습니다. 더 구체적인 키워드로 검색해 주세요.`;
    }

    return {
      content: [
        {
          type: 'text' as const,
          text: responseText,
        },
      ],
    };
  },
};