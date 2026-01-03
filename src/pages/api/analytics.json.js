import { getMostViewedPosts, getTopCategories, getDailyStats } from '../../lib/clickhouse';

export async function GET({ request }) {
  const url = new URL(request.url);
  const type = url.searchParams.get('type') || 'most-viewed';
  const days = parseInt(url.searchParams.get('days') || '30');
  const limit = parseInt(url.searchParams.get('limit') || '10');

  try {
    let data;

    switch (type) {
      case 'most-viewed':
        data = await getMostViewedPosts(limit, days);
        break;
      
      case 'top-categories':
        data = await getTopCategories(limit, days);
        break;
      
      case 'daily-stats':
        data = await getDailyStats(days);
        break;
      
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid type parameter' }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data,
        meta: {
          type,
          days,
          limit,
          timestamp: new Date().toISOString()
        }
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300' // Cache por 5 minutos
        }
      }
    );
  } catch (error) {
    console.error('Error in analytics API:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}
