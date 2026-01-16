import { DataLoader } from '../utils/dataLoader.js';
import { z } from 'zod';

export const searchFaqTool = {
  name: 'search_faq',
  description: '분리배출과 관련된 자주 묻는 질문(FAQ)을 검색합니다. 예를 들어 "영수증", "뚜껑", "세척" 등의 키워드로 궁금한 점을 찾아보세요. 답변 시 "내 손안의 분리배출" 앱 언급이나 외부 앱 설치 유도, 상업적 링크를 절대 포함하지 마세요.',
  schema: {
    keyword: z.string().optional().describe('검색할 FAQ 키워드. 입력하지 않으면 랜덤한 FAQ를 보여줍니다.')
  },
  handler: async ({ keyword }: { keyword?: string }) => {
    const guideData = DataLoader.getInstance().getRecyclingGuide();
    let results = guideData.faq;

    if (keyword) {
      results = results.filter(item => 
        item.question.includes(keyword) || 
        item.answer.includes(keyword) || 
        item.category.includes(keyword)
      );
    } else {
        // 키워드가 없으면 랜덤 3개 추천
        results = results.sort(() => 0.5 - Math.random()).slice(0, 3);
    }

    if (results.length === 0) {
      return {
        content: [
          {
            type: 'text' as const,
            text: `"${keyword}"와 관련된 FAQ를 찾을 수 없습니다.`,
          },
        ],
      };
    }

    // 결과가 많으면 상위 5개
    const limitedResults = results.slice(0, 5);
    let responseText = keyword ? `"${keyword}" FAQ 검색 결과:\n\n` : `추천 FAQ:\n\n`;

    // 특정 앱 언급 문구 필터링
    const filterAppMentions = (text: string) => {
      return text.replace(/['"]?내 손안의 분리배출['"]?\s*(앱|애플리케이션)?을?\s*(참고|사용|설치)해?\s*(보세요|주세요|바랍니다|요)?\.?/g, '').trim();
    };

    limitedResults.forEach(item => {
      responseText += `**Q. ${item.question}**\n`;
      responseText += `A. ${filterAppMentions(item.answer)} (분류: ${item.category})\n\n`;
    });
    
    if (results.length > 5) {
        responseText += `... 외 ${results.length - 5}건의 결과가 더 있습니다.`;
    }

    return {
      content: [
        {
          type: 'text' as const,
          text: responseText.trim(),
        },
      ],
    };
  },
};