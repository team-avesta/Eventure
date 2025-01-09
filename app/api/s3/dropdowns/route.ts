import { NextRequest, NextResponse } from 'next/server';
import { S3DataService } from '@/lib/s3/data';

interface PageData {
  pages: Array<{
    id: string;
    title: string;
    url: string;
  }>;
}

interface DimensionsData {
  dimensions: Array<{
    id: string;
    name: string;
  }>;
}

interface EventCategoriesData {
  eventCategory: string[];
}

interface EventActionsData {
  eventAction: string[];
}

interface EventNamesData {
  eventNames: string[];
}

export async function GET(request: NextRequest) {
  try {
    const dataService = new S3DataService();

    // Fetch all required data in parallel
    const [pageData, dimensions, eventCategories, eventActions, eventNames] =
      await Promise.all([
        dataService.getData<PageData>('page-data'),
        dataService.getData<DimensionsData>('dimensions'),
        dataService.getData<EventCategoriesData>('event-categories'),
        dataService.getData<EventActionsData>('event-actions'),
        dataService.getData<EventNamesData>('event-names'),
      ]);

    return NextResponse.json({
      pageData: pageData?.pages || [],
      dimensions: dimensions?.dimensions || [],
      eventCategories: eventCategories?.eventCategory || [],
      eventActionNames: eventActions?.eventAction || [],
      eventNames: eventNames?.eventNames || [],
    });
  } catch (error) {
    console.error('Error fetching dropdown data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dropdown data' },
      { status: 500 }
    );
  }
}
