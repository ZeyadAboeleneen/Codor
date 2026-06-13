import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';
 
export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['ar', 'en'],
 
  // Used when no locale matches
  defaultLocale: 'ar',

  // Disable locale prefix for default locale if we want Arabic on root without /ar prefix?
  // Wait, the user asked for "/ar" and "/en" and "Arabic route should be the default/main experience".
  // If we set `localePrefix: 'always'`, then root `/` redirects to `/ar`.
  localePrefix: 'always'
});
 
// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const {Link, redirect, usePathname, useRouter} =
  createNavigation(routing);
