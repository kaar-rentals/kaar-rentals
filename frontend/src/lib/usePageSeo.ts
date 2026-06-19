import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  SITE_NAME,
  absoluteUrl,
  isPrivatePath,
} from '@/lib/seo';

export type PageSeoOptions = {
  title: string;
  description?: string;
  /** Path for canonical/OG, e.g. `/cars`. Defaults to current location. */
  path?: string;
  noIndex?: boolean;
  keywords?: string;
};

function upsertMeta(
  selector: string,
  attr: 'name' | 'property',
  key: string,
  content: string
) {
  let el = document.querySelector(`${selector}[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function setRobots(noIndex: boolean) {
  const content = noIndex ? 'noindex, nofollow' : 'index, follow';
  upsertMeta('meta', 'name', 'robots', content);
  upsertMeta('meta', 'name', 'googlebot', content);
}

export function usePageSeo({
  title,
  description = DEFAULT_DESCRIPTION,
  path,
  noIndex,
  keywords = DEFAULT_KEYWORDS,
}: PageSeoOptions) {
  const location = useLocation();
  const canonicalPath = path ?? location.pathname;
  const shouldNoIndex = noIndex ?? isPrivatePath(location.pathname);

  useEffect(() => {
    const url = absoluteUrl(canonicalPath);
    const ogImage = absoluteUrl('/og-image.png');

    document.title = title;

    upsertMeta('meta', 'name', 'description', description);
    upsertMeta('meta', 'name', 'keywords', keywords);
    upsertLink('canonical', url);
    setRobots(shouldNoIndex);

    upsertMeta('meta', 'property', 'og:title', title);
    upsertMeta('meta', 'property', 'og:description', description);
    upsertMeta('meta', 'property', 'og:url', url);
    upsertMeta('meta', 'property', 'og:type', 'website');
    upsertMeta('meta', 'property', 'og:site_name', SITE_NAME);
    upsertMeta('meta', 'property', 'og:locale', 'en_PK');
    upsertMeta('meta', 'property', 'og:image', ogImage);

    upsertMeta('meta', 'name', 'twitter:card', 'summary_large_image');
    upsertMeta('meta', 'name', 'twitter:site', '@kaarrentals');
    upsertMeta('meta', 'name', 'twitter:title', title);
    upsertMeta('meta', 'name', 'twitter:description', description);
    upsertMeta('meta', 'name', 'twitter:image', ogImage);
  }, [title, description, canonicalPath, shouldNoIndex, keywords]);
}
