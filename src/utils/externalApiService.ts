import axios from 'axios';
import { RecyclingItem } from '../types/index.js';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE_URL = 'https://apis.data.go.kr/1482000/WasteRecyclingService';
const API_KEY = process.env.WASTE_RECYCLING_SERVICE_API_KEY;

interface ApiItem {
  dschgMthd: string;
  itemNm: string;
}

interface ApiResponse {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      items: {
        item: ApiItem[] | ApiItem;
      } | ApiItem[];
      numOfRows: number;
      pageNo: number;
      totalCount: number;
    };
  };
}

export class ExternalApiService {
  private static instance: ExternalApiService;

  private constructor() {}

  public static getInstance(): ExternalApiService {
    if (!ExternalApiService.instance) {
      ExternalApiService.instance = new ExternalApiService();
    }
    return ExternalApiService.instance;
  }

  public async searchRecyclingInfo(keyword: string): Promise<RecyclingItem[]> {
    if (!API_KEY) {
      console.warn('WASTE_RECYCLING_SERVICE_API_KEY is not set. Skipping external API search.');
      return [];
    }

    try {
      const response = await axios.get(API_BASE_URL + '/getItem', {
        params: {
          serviceKey: API_KEY, // Assume key is provided correctly in .env
          pageNo: 1,
          numOfRows: 10,
          _type: 'json',
          itemNm: keyword 
        },
        paramsSerializer: params => {
           let result = '';
           Object.keys(params).forEach(key => {
               if (key === 'serviceKey') {
                   result += `${key}=${API_KEY}&`;
               } else {
                   result += `${key}=${encodeURIComponent(params[key])}&`;
               }
           });
           return result.slice(0, -1);
        }
      });

      const data = response.data as ApiResponse;

      if (data.response?.header?.resultCode !== '00') {
        console.error('External API Error:', data.response?.header?.resultMsg);
        return [];
      }

      const bodyItems = data.response.body.items;
      
      if (!bodyItems) return [];
      
      let rawItems: ApiItem[] = [];

      // Handle potential variations in response structure
      if (Array.isArray(bodyItems)) {
         rawItems = bodyItems;
      } else if (typeof bodyItems === 'object' && bodyItems !== null && 'item' in bodyItems) {
         const innerItem = bodyItems.item;
         if (Array.isArray(innerItem)) {
             rawItems = innerItem;
         } else if (innerItem) {
             rawItems = [innerItem];
         }
      }

      return rawItems.map(item => ({
          dstrbt_name: item.itemNm || '',
          dstrbt_cn: item.dschgMthd || ''
      })).filter(item => item.dstrbt_name !== '');

    } catch (error) {
      console.error('Failed to fetch from external API:', error);
      return [];
    }
  }
}
