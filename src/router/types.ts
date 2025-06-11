export interface RouteRecord {
  path: string;
  component: new (...args: any[]) => any;
  guard?: () => boolean;
  _compiled?: { regex: RegExp; keys: string[] };
}

export interface RouteMatch {
  component: new (...args: any[]) => any;
  params: Record<string, string>;
  query: Record<string, string>;
}
