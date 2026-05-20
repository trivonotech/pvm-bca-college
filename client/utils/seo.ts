export interface SEOMetaOptions {
  title?: string;
  description?: string;
  keywords?: string;
  url?: string;
  image?: string;
  type?: string;
  canonical?: string;
}

export function updateSEOMeta(options: SEOMetaOptions) {
  const {
    title,
    description,
    keywords,
    url,
    image,
    type = 'website',
    canonical
  } = options;

  const origin = window.location.origin;
  const currentUrl = url || window.location.href;
  const canonicalUrl = canonical || currentUrl;

  // 1. Update Title
  if (title) {
    document.title = title;
    
    // OG Title
    updateOrCreateMeta('property', 'og:title', title);
    // Twitter Title
    updateOrCreateMeta('name', 'twitter:title', title);
  }

  // 2. Update Description
  if (description) {
    updateOrCreateMeta('name', 'description', description);
    updateOrCreateMeta('property', 'og:description', description);
    updateOrCreateMeta('name', 'twitter:description', description);
  }

  // 3. Update Keywords
  if (keywords) {
    updateOrCreateMeta('name', 'keywords', keywords);
  }

  // 4. Update URLs (Canonical and OG URL)
  updateOrCreateMeta('property', 'og:url', currentUrl);
  updateOrCreateCanonical(canonicalUrl);

  // 5. Update Images
  if (image) {
    const fullImageUrl = image.startsWith('http') ? image : `${origin}${image}`;
    updateOrCreateMeta('property', 'og:image', fullImageUrl);
    updateOrCreateMeta('name', 'twitter:image', fullImageUrl);
  }

  // 6. Update OG Type
  if (type) {
    updateOrCreateMeta('property', 'og:type', type);
  }
}

function updateOrCreateMeta(attributeName: 'name' | 'property', attributeValue: string, content: string) {
  let element = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attributeName, attributeValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function updateOrCreateCanonical(href: string) {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
}
