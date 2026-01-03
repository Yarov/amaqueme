import { getMostViewedPosts, getPostStats, getCategoryStats, getTopCategories, getDailyStats, getTrafficSources } from '../lib/clickhouse';

export async function getAnalyticsSummary(days = 30) {
  try {
    const [mostViewed, topCategories, dailyStats, trafficSources] = await Promise.all([
      getMostViewedPosts(10, days),
      getTopCategories(10, days),
      getDailyStats(days),
      getTrafficSources(days, 10)
    ]);

    const totalViews = dailyStats.reduce((sum, day) => sum + parseInt(day.total_views || 0), 0);
    const totalUniqueVisitors = dailyStats.reduce((sum, day) => sum + parseInt(day.unique_visitors || 0), 0);

    return {
      mostViewed,
      topCategories,
      dailyStats,
      trafficSources,
      summary: {
        totalViews,
        totalUniqueVisitors,
        avgViewsPerDay: dailyStats.length > 0 ? Math.round(totalViews / dailyStats.length) : 0,
        avgUniqueVisitorsPerDay: dailyStats.length > 0 ? Math.round(totalUniqueVisitors / dailyStats.length) : 0
      }
    };
  } catch (error) {
    console.error('Error getting analytics summary:', error);
    return {
      mostViewed: [],
      topCategories: [],
      dailyStats: [],
      trafficSources: [],
      summary: {
        totalViews: 0,
        totalUniqueVisitors: 0,
        avgViewsPerDay: 0,
        avgUniqueVisitorsPerDay: 0
      }
    };
  }
}

export async function getPostAnalytics(slug, days = 30) {
  try {
    const stats = await getPostStats(slug, days);
    
    const totalViews = stats.reduce((sum, day) => sum + parseInt(day.views || 0), 0);
    const totalUniqueVisitors = stats.reduce((sum, day) => sum + parseInt(day.unique_visitors || 0), 0);

    return {
      stats,
      summary: {
        totalViews,
        totalUniqueVisitors,
        avgViewsPerDay: stats.length > 0 ? Math.round(totalViews / stats.length) : 0
      }
    };
  } catch (error) {
    console.error('Error getting post analytics:', error);
    return {
      stats: [],
      summary: {
        totalViews: 0,
        totalUniqueVisitors: 0,
        avgViewsPerDay: 0
      }
    };
  }
}

export async function getCategoryAnalytics(categorySlug, days = 30) {
  try {
    const stats = await getCategoryStats(categorySlug, days);
    
    const totalViews = stats.reduce((sum, day) => sum + parseInt(day.views || 0), 0);
    const totalUniqueVisitors = stats.reduce((sum, day) => sum + parseInt(day.unique_visitors || 0), 0);

    return {
      stats,
      summary: {
        totalViews,
        totalUniqueVisitors,
        avgViewsPerDay: stats.length > 0 ? Math.round(totalViews / stats.length) : 0
      }
    };
  } catch (error) {
    console.error('Error getting category analytics:', error);
    return {
      stats: [],
      summary: {
        totalViews: 0,
        totalUniqueVisitors: 0,
        avgViewsPerDay: 0
      }
    };
  }
}

export function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function calculateGrowth(current, previous) {
  if (previous === 0) return 0;
  return Math.round(((current - previous) / previous) * 100);
}
