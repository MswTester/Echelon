import { createElement, Fragment } from 'echelon/core/jsx';
import { Component, Render, Mounted, Destroyed, Event, Property, Children } from 'echelon/core/decorators';
import { setStoreValue, getStoreValue, subscribeStore } from 'echelon/core/store';
import type { RouteRecord } from './types';
import { resolveRoute } from './utils';

const ROUTER_STORE_ID = '__echelon_router__';

export function navigate(path: string): void {
  history.pushState(null, '', path);
  const info = getStoreValue(ROUTER_STORE_ID);
  setStoreValue(ROUTER_STORE_ID, { path, routes: info?.routes || [] });
}

@Component('a')
export class Link {
  @Property('href') to: string = '';

  @Event('click')
  handleClick(e: MouseEvent) {
    e.preventDefault();
    navigate(this.to);
  }

  @Render()
  render(@Children() children: any) {
    return createElement(Fragment, null, ...(Array.isArray(children) ? children : [children]));
  }
}

@Component()
export class Router {
  routes: RouteRecord[] = [];

  @Mounted()
  init() {
    window.addEventListener('popstate', this.updatePath);
    this.updatePath();
  }

  @Destroyed()
  cleanup() {
    window.removeEventListener('popstate', this.updatePath);
  }

  updatePath = () => {
    setStoreValue(ROUTER_STORE_ID, { path: location.pathname + location.search, routes: this.routes });
  };

  @Render()
  render(@Children() children: any) {
    return createElement(Fragment, null, ...(Array.isArray(children) ? children : [children]));
  }
}

@Component()
export class RouterOutlet {
  private unsubscribe?: () => void;
  private currentElement: any = null;

  private compute() {
    const info = getStoreValue(ROUTER_STORE_ID) as { path: string; routes: RouteRecord[] } | undefined;
    if (!info) {
      this.currentElement = null;
      return;
    }
    const match = resolveRoute(info.path, info.routes);
    if (match) {
      this.currentElement = createElement(match.component, {
        __routeParams: match.params,
        __queryParams: match.query,
      });
    } else {
      this.currentElement = null;
    }
  }

  @Mounted()
  mounted() {
    this.compute();
    this.unsubscribe = subscribeStore(ROUTER_STORE_ID, () => {
      this.compute();
    });
  }

  @Destroyed()
  destroyed() {
    this.unsubscribe?.();
  }

  @Render()
  render() {
    return this.currentElement;
  }
}
