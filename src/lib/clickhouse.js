import { createClient } from '@clickhouse/client';

let client = null;

function getClickHouseConfig() {
  return {
    url: process.env.CLICKHOUSE_URL || process.env.CLICKHOUSE_HOST || 'http://localhost:8123',
    username: process.env.CLICKHOUSE_USER || 'default',
    password: process.env.CLICKHOUSE_PASSWORD || '',
    database: process.env.CLICKHOUSE_DATABASE || 'amaqueme_analytics',
  };
}

export function getClickHouseClient() {
  if (!client) {
    try {
      const config = getClickHouseConfig();
      console.log('Creating ClickHouse client with URL:', config.url);
      client = createClient(config);
    } catch (error) {
      console.error('Error creating ClickHouse client:', error);
      throw error;
    }
  }
  return client;
}

export async function initClickHouseSchema() {
  // Create a client without database specified for initial setup
  const config = getClickHouseConfig();
  const initClient = createClient({
    url: config.url,
    username: config.username,
    password: config.password,
  });

  try {
    // First, create the database
    await initClient.exec({
      query: `
        CREATE DATABASE IF NOT EXISTS ${config.database}
      `,
    });
    
    await initClient.close();
    
    // Now use the regular client with database specified
    const client = getClickHouseClient();

    await client.exec({
      query: `
        CREATE TABLE IF NOT EXISTS ${config.database}.page_views (
          timestamp DateTime DEFAULT now(),
          date Date DEFAULT toDate(timestamp),
          session_id String,
          user_ip String,
          user_agent String,
          path String,
          slug String,
          content_type Enum8('post' = 1, 'category' = 2, 'page' = 3, 'home' = 4, 'other' = 5),
          post_id String,
          post_title String,
          category_slug String,
          category_name String,
          referrer String,
          country String DEFAULT '',
          device_type Enum8('desktop' = 1, 'mobile' = 2, 'tablet' = 3, 'unknown' = 4),
          browser String,
          os String,
          page_load_time UInt32 DEFAULT 0,
          is_bot UInt8 DEFAULT 0
        ) ENGINE = MergeTree()
        PARTITION BY toYYYYMM(date)
        ORDER BY (date, timestamp, slug)
        TTL date + INTERVAL 365 DAY
      `,
    });

    // Drop old table if exists
    await client.exec({
      query: `DROP TABLE IF EXISTS ${config.database}.post_stats_mv`,
    });

    // Create target table for materialized view
    await client.exec({
      query: `
        CREATE TABLE IF NOT EXISTS ${config.database}.post_stats (
          date Date,
          slug String,
          post_id String,
          post_title String,
          views UInt64,
          unique_visitors UInt64,
          unique_ips UInt64
        ) ENGINE = SummingMergeTree()
        PARTITION BY toYYYYMM(date)
        ORDER BY (date, slug)
      `,
    });

    // Create materialized view that auto-populates the target table
    await client.exec({
      query: `
        CREATE MATERIALIZED VIEW IF NOT EXISTS ${config.database}.post_stats_mv
        TO ${config.database}.post_stats
        AS SELECT
          date,
          slug,
          post_id,
          post_title,
          count() as views,
          uniq(session_id) as unique_visitors,
          uniq(user_ip) as unique_ips
        FROM ${config.database}.page_views
        WHERE content_type = 'post'
        GROUP BY date, slug, post_id, post_title
      `,
    });

    console.log('✅ ClickHouse schema initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Error initializing ClickHouse schema:', error);
    return false;
  }
}

export async function trackPageView(data) {
  const client = getClickHouseClient();
  const config = getClickHouseConfig();

  try {
    await client.insert({
      table: `${config.database}.page_views`,
      values: [data],
      format: 'JSONEachRow',
    });
    return true;
  } catch (error) {
    console.error('Error tracking page view:', error);
    return false;
  }
}

export async function getMostViewedPosts(limit = 10, days = 30) {
  const client = getClickHouseClient();
  const config = getClickHouseConfig();

  try {
    const result = await client.query({
      query: `
        SELECT
          slug,
          post_id,
          post_title,
          sum(views) as total_views,
          sum(unique_visitors) as total_unique_visitors
        FROM ${config.database}.post_stats
        WHERE date >= today() - INTERVAL ${days} DAY
        GROUP BY slug, post_id, post_title
        ORDER BY total_views DESC
        LIMIT ${limit}
      `,
      format: 'JSONEachRow',
    });

    return await result.json();
  } catch (error) {
    console.error('Error getting most viewed posts:', error);
    return [];
  }
}

export async function getPostStats(slug, days = 30) {
  const client = getClickHouseClient();
  const config = getClickHouseConfig();

  try {
    const result = await client.query({
      query: `
        SELECT
          date,
          sum(views) as views,
          sum(unique_visitors) as unique_visitors
        FROM ${config.database}.post_stats
        WHERE slug = {slug: String}
          AND date >= today() - INTERVAL {days: UInt32} DAY
        GROUP BY date
        ORDER BY date DESC
      `,
      query_params: {
        slug: slug,
        days: days
      },
      format: 'JSONEachRow',
    });

    return await result.json();
  } catch (error) {
    console.error('Error getting post stats:', error);
    return [];
  }
}

export async function getCategoryStats(categorySlug, days = 30) {
  const client = getClickHouseClient();
  const config = getClickHouseConfig();

  try {
    const result = await client.query({
      query: `
        SELECT
          date,
          count() as views,
          uniq(session_id) as unique_visitors
        FROM ${config.database}.page_views
        WHERE category_slug = {categorySlug: String}
          AND date >= today() - INTERVAL {days: UInt32} DAY
          AND path NOT LIKE '/api/%'
          AND path NOT LIKE '/__%'
        GROUP BY date
        ORDER BY date DESC
      `,
      query_params: {
        categorySlug: categorySlug,
        days: days
      },
      format: 'JSONEachRow',
    });

    return await result.json();
  } catch (error) {
    console.error('Error getting category stats:', error);
    return [];
  }
}

export async function getTopCategories(limit = 10, days = 30) {
  const client = getClickHouseClient();
  const config = getClickHouseConfig();

  try {
    const result = await client.query({
      query: `
        SELECT
          category_slug,
          any(category_name) as category_name,
          count() as views,
          uniq(session_id) as unique_visitors
        FROM ${config.database}.page_views
        WHERE date >= today() - INTERVAL {days: UInt32} DAY
          AND category_slug != ''
          AND path NOT LIKE '/api/%'
          AND path NOT LIKE '/__%'
        GROUP BY category_slug
        ORDER BY views DESC
        LIMIT {limit: UInt32}
      `,
      query_params: {
        days: days,
        limit: limit
      },
      format: 'JSONEachRow',
    });

    return await result.json();
  } catch (error) {
    console.error('Error getting top categories:', error);
    return [];
  }
}

export async function getDailyStats(days = 30) {
  const client = getClickHouseClient();
  const config = getClickHouseConfig();

  try {
    const result = await client.query({
      query: `
        SELECT
          date,
          count() as total_views,
          uniq(session_id) as unique_visitors,
          countIf(content_type = 'post') as post_views,
          countIf(content_type = 'category') as category_views,
          countIf(device_type = 'mobile') as mobile_views,
          countIf(device_type = 'desktop') as desktop_views
        FROM ${config.database}.page_views
        WHERE date >= today() - INTERVAL ${days} DAY
          AND path NOT LIKE '/api/%'
          AND path NOT LIKE '/__%'
        GROUP BY date
        ORDER BY date DESC
      `,
      format: 'JSONEachRow',
    });

    return await result.json();
  } catch (error) {
    console.error('Error getting daily stats:', error);
    return [];
  }
}

export async function getTrafficSources(days = 30, limit = 10) {
  const client = getClickHouseClient();
  const config = getClickHouseConfig();

  try {
    const result = await client.query({
      query: `
        SELECT
          referrer,
          count() as views,
          uniq(session_id) as unique_visitors
        FROM ${config.database}.page_views
        WHERE date >= today() - INTERVAL {days: UInt32} DAY
          AND referrer != ''
          AND path NOT LIKE '/api/%'
          AND path NOT LIKE '/__%'
        GROUP BY referrer
        ORDER BY views DESC
        LIMIT {limit: UInt32}
      `,
      query_params: {
        days: days,
        limit: limit
      },
      format: 'JSONEachRow',
    });

    return await result.json();
  } catch (error) {
    console.error('Error getting traffic sources:', error);
    return [];
  }
}

export async function closeClickHouseClient() {
  if (client) {
    await client.close();
    client = null;
  }
}
