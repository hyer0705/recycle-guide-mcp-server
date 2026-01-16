import fs from 'fs';
import path from 'path';
import { RecyclingItem, RecyclingGuideData } from '../types/index.js';

const DATA_DIR = path.join(process.cwd(), 'data');

export class DataLoader {
  private static instance: DataLoader;
  private recyclingDb: RecyclingItem[] | null = null;
  private recyclingGuide: RecyclingGuideData | null = null;

  private constructor() {}

  public static getInstance(): DataLoader {
    if (!DataLoader.instance) {
      DataLoader.instance = new DataLoader();
    }
    return DataLoader.instance;
  }

  private loadJson<T>(filename: string): T {
    const filePath = path.join(DATA_DIR, filename);
    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(fileContent) as T;
    } catch (error) {
      console.error(`Error loading ${filename}:`, error);
      throw error;
    }
  }

  public getRecyclingDb(): RecyclingItem[] {
    if (!this.recyclingDb) {
      this.recyclingDb = this.loadJson<RecyclingItem[]>('recycling_db.json');
    }
    return this.recyclingDb;
  }

  public getRecyclingGuide(): RecyclingGuideData {
    if (!this.recyclingGuide) {
      this.recyclingGuide = this.loadJson<RecyclingGuideData>('recycling_guide.json');
    }
    return this.recyclingGuide;
  }
}
