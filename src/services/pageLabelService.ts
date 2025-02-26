import { PageLabel, PageLabelsResponse } from '@/types/pageLabel';
import { api } from './api';
import { v4 as uuidv4 } from 'uuid';

class PageLabelService {
  private async getPageLabelsData(): Promise<PageLabelsResponse> {
    try {
      const data = await api.get<PageLabelsResponse>('pageLabels');
      return data || { pageLabels: [] };
    } catch (error) {
      return { pageLabels: [] };
    }
  }

  private async savePageLabelsData(data: PageLabelsResponse): Promise<void> {
    await api.update('pageLabels', data);
  }

  async getAllLabels(): Promise<PageLabel[]> {
    const data = await this.getPageLabelsData();
    return data.pageLabels;
  }

  async createLabel(data: { name: string }): Promise<PageLabel> {
    const newLabel: PageLabel = {
      id: `label_${uuidv4()}`,
      name: data.name,
    };

    const pageLabelsData = await this.getPageLabelsData();
    await this.savePageLabelsData({
      pageLabels: [...pageLabelsData.pageLabels, newLabel],
    });

    return newLabel;
  }

  async updateLabel(labelId: string, updates: { name: string }): Promise<void> {
    const pageLabelsData = await this.getPageLabelsData();
    const updatedLabels = pageLabelsData.pageLabels.map((label) =>
      label.id === labelId ? { ...label, ...updates } : label
    );

    await this.savePageLabelsData({ pageLabels: updatedLabels });
  }

  async deleteLabel(labelId: string): Promise<void> {
    const pageLabelsData = await this.getPageLabelsData();
    const filteredLabels = pageLabelsData.pageLabels.filter(
      (label) => label.id !== labelId
    );

    await this.savePageLabelsData({ pageLabels: filteredLabels });
  }
}

export const pageLabelService = new PageLabelService();
