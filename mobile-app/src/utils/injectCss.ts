/**
 * Lightweight mobile-app CSS — hides duplicate chrome, ads, and heavy animations.
 * Kept minimal so injection runs fast and doesn't block the main thread.
 */
export const MOBILE_APP_CSS = [
  'header.fixed,footer{display:none!important}',
  'body{padding-top:0!important;padding-bottom:88px!important}',
  '.adsbygoogle,ins.adsbygoogle{display:none!important}',
  '.car-card-hover,.fade-in,.slide-up{animation:none!important;transition:none!important}',
  '*,::before,::after{animation-duration:.01ms!important;transition-duration:.01ms!important}',
  'html{scroll-behavior:auto!important}',
].join('');

/** Runs once per page — id guard prevents re-injection on SPA navigations. */
export const INJECT_MOBILE_CSS =
  `(function(){var i='kaar-app-css';if(document.getElementById(i))return true;var s=document.createElement('style');s.id=i;s.textContent=${JSON.stringify(MOBILE_APP_CSS)};(document.head||document.documentElement).appendChild(s);return true;})();true;`;
