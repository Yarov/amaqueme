import { defineMiddleware } from 'astro:middleware';
import { trackPageView } from './lib/clickhouse';
import { randomBytes } from 'crypto';

function generateSessionId(request) {
  const cookies = request.headers.get('cookie') || '';
  const sessionMatch = cookies.match(/session_id=([^;]+)/);
  
  if (sessionMatch) {
    return sessionMatch[1];
  }
  
  return randomBytes(16).toString('hex');
}

function getClientIP(request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
         request.headers.get('x-real-ip') ||
         request.headers.get('cf-connecting-ip') ||
         'unknown';
}

function detectDeviceType(userAgent) {
  const ua = userAgent.toLowerCase();
  
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/mobile|iphone|ipod|android|blackberry|opera mini|opera mobi|skyfire|maemo|windows phone|palm|iemobile|symbian|symbianos|fennec/i.test(ua)) {
    return 'mobile';
  }
  if (ua) {
    return 'desktop';
  }
  return 'unknown';
}

function detectBrowser(userAgent) {
  const ua = userAgent.toLowerCase();
  
  if (ua.includes('firefox')) return 'Firefox';
  if (ua.includes('chrome') && !ua.includes('edge')) return 'Chrome';
  if (ua.includes('safari') && !ua.includes('chrome')) return 'Safari';
  if (ua.includes('edge')) return 'Edge';
  if (ua.includes('opera') || ua.includes('opr')) return 'Opera';
  
  return 'Other';
}

function detectOS(userAgent) {
  const ua = userAgent.toLowerCase();
  
  if (ua.includes('windows')) return 'Windows';
  if (ua.includes('mac')) return 'macOS';
  if (ua.includes('linux')) return 'Linux';
  if (ua.includes('android')) return 'Android';
  if (ua.includes('iphone') || ua.includes('ipad')) return 'iOS';
  
  return 'Other';
}

function isBot(userAgent) {
  const botPatterns = [
    'bot', 'crawler', 'spider', 'scraper', 'curl', 'wget',
    'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider',
    'yandexbot', 'facebookexternalhit', 'twitterbot', 'whatsapp'
  ];
  
  const ua = userAgent.toLowerCase();
  return botPatterns.some(pattern => ua.includes(pattern)) ? 1 : 0;
}

function detectContentType(pathname) {
  if (pathname === '/' || pathname === '') {
    return 'home';
  }
  
  const knownCategories = ['noticias', 'categorias', 'politica', 'economia', 'deportes', 'cultura'];
  const firstSegment = pathname.split('/')[1];
  
  if (knownCategories.includes(firstSegment)) {
    return 'category';
  }
  
  if (pathname.includes('/page/') || pathname.includes('?page=')) {
    return 'category';
  }
  
  return 'post';
}

function extractSlugFromPath(pathname) {
  const segments = pathname.split('/').filter(s => s);
  
  // Para rutas de categoría con paginación: /category/slug/page/N
  if (segments.includes('category') && segments.includes('page')) {
    const categoryIndex = segments.indexOf('category');
    return segments[categoryIndex + 1] || 'home';
  }
  
  // Para rutas de categoría sin paginación: /category/slug
  if (segments[0] === 'category' && segments.length >= 2) {
    return segments[1];
  }
  
  // Para otras rutas, tomar el último segmento (excepto si es 'page' o un número)
  const lastSegment = segments[segments.length - 1];
  if (lastSegment === 'page' || /^\d+$/.test(lastSegment)) {
    // Si el último segmento es 'page' o un número, tomar el anterior
    return segments[segments.length - 2] || 'home';
  }
  
  return lastSegment || 'home';
}

export const onRequest = defineMiddleware(async (context, next) => {
  const startTime = Date.now();
  const { request, url, locals } = context;
  
  const response = await next();
  
  // Always track in production/development (analytics enabled by default)
  const shouldTrack = response.status === 200 && 
                      !url.pathname.startsWith('/_') && 
                      !url.pathname.startsWith('/api/') &&
                      !url.pathname.match(/\.(ico|png|jpg|jpeg|gif|svg|css|js|woff|woff2|ttf|eot)$/);
  
  console.log('🔍 Middleware executing:', {
    status: response.status,
    path: url.pathname,
    shouldTrack
  });
  
  if (shouldTrack) {
    const userAgent = request.headers.get('user-agent') || '';
    const sessionId = generateSessionId(request);
    const pathname = url.pathname;
    const slug = extractSlugFromPath(pathname);
    const contentType = detectContentType(pathname);
    
    const trackingData = {
      timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
      session_id: sessionId,
      user_ip: getClientIP(request),
      user_agent: userAgent,
      path: pathname,
      slug: slug,
      content_type: contentType,
      post_id: locals?.post?.id || locals?.post?.databaseId || '',
      post_title: locals?.post?.title || '',
      category_slug: contentType === 'category' ? slug : (locals?.category?.slug || ''),
      category_name: locals?.category?.name || '',
      referrer: request.headers.get('referer') || '',
      device_type: detectDeviceType(userAgent),
      browser: detectBrowser(userAgent),
      os: detectOS(userAgent),
      page_load_time: Date.now() - startTime,
      is_bot: isBot(userAgent),
    };
    
    console.log('📊 Tracking page view:', trackingData);
    
    trackPageView(trackingData).then(success => {
      console.log('✅ Page view tracked successfully:', success);
    }).catch(error => {
      console.error('❌ Failed to track page view:', error);
    });
    
    response.headers.set('Set-Cookie', `session_id=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`);
  }
  
  return response;
});
