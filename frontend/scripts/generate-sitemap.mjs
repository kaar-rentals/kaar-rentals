/**
 * Generates public/sitemap.xml with static routes + live car listing URLs.
 * Run before build: npm run sitemap
 */
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE_URL = 'https://kaar.rentals';
const API_URL =
  process.env.VITE_API_URL?.replace(/\/+$/, '').replace(/\/api$/i, '') ||
  'https://kaar-rentals-backend.onrender.com';

const CITY_PATHS = [
  '/rent-car-lahore',
  '/rent-car-karachi',
  '/rent-car-islamabad',
  '/rent-car-rawalpindi',
  '/rent-car-faisalabad',
  '/rent-car-peshawar',
  '/rent-car-multan',
];

const STATIC_PATHS = [
  { loc: '/', priority: '1.0', changefreq: 'daily' },
  { loc: '/cars', priority: '0.9', changefreq: 'daily' },
  ...CITY_PATHS.map((loc) => ({
    loc,
    priority: '0.85',
    changefreq: 'daily',
  })),
  { loc: '/list-car', priority: '0.8', changefreq: 'weekly' },
  { loc: '/pricing', priority: '0.8', changefreq: 'weekly' },
  { loc: '/about', priority: '0.6', changefreq: 'monthly' },
  { loc: '/contact', priority: '0.6', changefreq: 'monthly' },
  { loc: '/privacy-policy', priority: '0.3', changefreq: 'yearly' },
  { loc: '/terms-of-service', priority: '0.3', changefreq: 'yearly' },
];

function toLastmod(value) {
  if (!value) return new Date().toISOString();
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? new Date().toISOString()
    : date.toISOString();
}

async function fetchCarListings() {
  try {
    const res = await fetch(`${API_URL}/api/cars?limit=500`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.cars || [])
      .map((car) => ({
        id: car._id,
        lastmod: toLastmod(car.updatedAt || car.createdAt),
      }))
      .filter((entry) => entry.id);
  } catch {
    console.warn('[sitemap] Could not fetch cars from API — static URLs only.');
    return [];
  }
}

function urlEntry(loc, priority, changefreq, lastmod) {
  return `  <url>
    <loc>${SITE_URL}${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

const buildLastmod = new Date().toISOString();
const carListings = await fetchCarListings();

const staticEntries = STATIC_PATHS.map((p) =>
  urlEntry(p.loc, p.priority, p.changefreq, buildLastmod)
);

const carEntries = carListings.map(({ id, lastmod }) =>
  urlEntry(`/car/${id}/details`, '0.7', 'daily', lastmod)
);

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticEntries, ...carEntries].join('\n')}
</urlset>
`;

const outPath = join(__dirname, '../public/sitemap.xml');
writeFileSync(outPath, xml, 'utf8');
console.log(`[sitemap] Wrote ${staticEntries.length + carEntries.length} URLs to public/sitemap.xml`);
