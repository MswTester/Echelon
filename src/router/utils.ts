import type { RouteRecord, RouteMatch } from './types';

function compilePath(path: string): { regex: RegExp; keys: string[] } {
  const keys: string[] = [];
  const regexString = path
    .replace(/\//g, '\\/')
    .replace(/:([^/]+)/g, (_, key) => {
      keys.push(key);
      return '([^/]+)';
    });
  const regex = new RegExp(`^${regexString}$`);
  return { regex, keys };
}

function parseQuery(search: string): Record<string, string> {
  const params: Record<string, string> = {};
  if (!search) return params;
  const usp = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  usp.forEach((v, k) => {
    params[k] = v;
  });
  return params;
}

export function resolveRoute(path: string, routes: RouteRecord[]): RouteMatch | null {
  const [pathname, search = ''] = path.split('?');
  for (const r of routes) {
    if (!r._compiled) r._compiled = compilePath(r.path);
    const match = r._compiled.regex.exec(pathname);
    if (match) {
      if (r.guard && !r.guard()) continue;
      const params: Record<string, string> = {};
      r._compiled.keys.forEach((k, i) => (params[k] = match[i + 1]));
      return {
        component: r.component,
        params,
        query: parseQuery(search),
      };
    }
  }
  return null;
}
