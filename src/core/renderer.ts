/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/core/renderer.ts
import { Fragment, EchelonElement } from 'echelon/core/jsx'; // createElement는 디버깅이나 내부용으로 필요할 수 있음
import { COMPONENT_META_KEY, ComponentMeta, EchelonInternalComponentInstance, INTERNAL_INSTANCE_KEY } from 'echelon/core/types';
import { getStoreValue, setStoreValue, subscribeStore, hasStore } from 'echelon/core/store';
import { startTracking, endTracking, recordDependency, ComputedInfo } from 'echelon/core/computed';

function callWithErrorHandling(instance: EchelonInternalComponentInstance, methodName: string | symbol, args: any[] = []): any {
  const method = (instance.componentObject as any)[methodName];
  if (typeof method === 'function') {
    try {
      return method.apply(instance.componentObject, args);
    } catch (err) {
      const meta = instance.meta;
      if (meta.errorCapturedMethodName && typeof (instance.componentObject as any)[meta.errorCapturedMethodName] === 'function') {
        const res = (instance.componentObject as any)[meta.errorCapturedMethodName](err, { method: methodName });
        if (res === false) throw err;
      } else {
        console.error(err);
      }
    }
  }
}

/**
 * 컴포넌트 클래스 필드와 DOM 요소의 프로퍼티/메서드/스타일/이벤트 및
 * 반응형 상태(@State)를 초기화하고 바인딩합니다.
 */
function initializeComponentBindingsAndState(instance: EchelonInternalComponentInstance): void {
  const { componentObject, hostDomElement, meta } = instance;

  const isHostHtmlElement = hostDomElement instanceof HTMLElement;

  if (
    !isHostHtmlElement &&
    (meta.methodBindings.size > 0 ||
      meta.propertyBindings.size > 0 ||
      meta.styleBindings.size > 0 ||
      meta.styleLayoutFields.size > 0)
  ) {
    if (meta.tagName) {
      console.warn(
        `Component "${meta.componentName}" has tagName "${meta.tagName}" but its host DOM is not an HTMLElement. @Method, @Property, @Style and @StyleLayout bindings will not work.`
      );
    }
    // tagName 없는 Fragment 기반 컴포넌트는 이 경고를 발생시키지 않아야 함
  }

  // @Method 바인딩: 클래스 필드를 DOM 메서드 호출 함수로 설정
  meta.methodBindings.forEach((domMethodName, classFieldName) => {
    if (isHostHtmlElement && typeof (hostDomElement as any)[domMethodName] === 'function') {
      (componentObject as any)[classFieldName] = (...args: any[]) => {
        return (hostDomElement as any)[domMethodName](...args);
      };
    } else if (isHostHtmlElement) {
      console.warn(`@Method binding: DOM method "${domMethodName}" not found on host element of "${meta.componentName}" for field "${String(classFieldName)}". Field will be undefined.`);
       (componentObject as any)[classFieldName] = () => { console.error(`Called unbound @Method field ${String(classFieldName)}`)};
    }
  });

  // @Property, @Style, @State 필드에 대한 defineProperty 처리
  // 이 Set은 defineProperty가 이미 적용된 필드를 추적하여 중복 적용 방지
  const processedFields = new Set<string | symbol>();

  const setupFieldProperty = (
    classFieldName: string | symbol,
    type: 'property' | 'style' | 'style-layout' | 'state'
  ) => {
    if (processedFields.has(classFieldName)) return; // 이미 처리된 필드는 건너뜀

    // 스토어에 연결된 필드인지 확인
    const storeId = meta.storeFields?.get(classFieldName);
    if (storeId) {
      const existed = hasStore(storeId);
      const unsubscribe = subscribeStore(storeId, () => {
        if (instance.isMounted) instance.update();
      });
      if (!instance._storeListeners) instance._storeListeners = [];
      instance._storeListeners.push({ id: storeId, listener: unsubscribe });
      const initial = (componentObject as any)[classFieldName];
      if (initial !== undefined && !existed) setStoreValue(storeId, initial);
      Object.defineProperty(componentObject, classFieldName, {
        get() {
          return getStoreValue(storeId);
        },
        set(newValue) {
          setStoreValue(storeId, newValue);
        },
        configurable: true,
        enumerable: true,
      });
      processedFields.add(classFieldName);
      return;
    }

    let currentValue = (componentObject as any)[classFieldName];
    const domInteractionAllowed = isHostHtmlElement;
    let domName: string | undefined; // DOM 프로퍼티 또는 CSS 스타일 이름

    if (type === 'property' && meta.propertyBindings.has(classFieldName)) {
        domName = meta.propertyBindings.get(classFieldName)!;
        if (domInteractionAllowed && currentValue !== undefined) {
            (hostDomElement as any)[domName] = currentValue;
        }
    } else if (type === 'style' && meta.styleBindings.has(classFieldName)) {
        domName = meta.styleBindings.get(classFieldName)!;
        if (domInteractionAllowed && currentValue !== undefined) {
            (hostDomElement as HTMLElement).style[domName as any] = currentValue;
        }
    } else if (type === 'style-layout' && meta.styleLayoutFields.has(classFieldName)) {
        if (domInteractionAllowed && currentValue && typeof currentValue === 'object') {
            Object.entries(currentValue).forEach(([prop, val]) => {
                (hostDomElement as HTMLElement).style[prop as any] = val as any;
            });
        }
    }
    // 'state' 타입은 domName이 필요 없음

    Object.defineProperty(componentObject, classFieldName, {
      get() {
        // @Property의 경우, DOM에서 직접 읽어올 수도 있음 (옵션)
        // if (type === 'property' && domInteractionAllowed && domName) {
        //   return (hostDomElement as any)[domName];
        // }
        recordDependency(instance, classFieldName);
        return currentValue;
      },
      set(newValue) {
        if (currentValue !== newValue) {
          const oldValue = currentValue;
          currentValue = newValue;
          if (domInteractionAllowed) {
            if (type === 'property' && domName) {
              (hostDomElement as any)[domName] = newValue;
            } else if (type === 'style' && domName) {
              (hostDomElement as HTMLElement).style[domName as any] = newValue;
            } else if (type === 'style-layout' && newValue && typeof newValue === 'object') {
              Object.entries(newValue).forEach(([prop, val]) => {
                (hostDomElement as HTMLElement).style[prop as any] = val as any;
              });
            }
          }
          if (meta.watchHandlers && meta.watchHandlers.has(classFieldName)) {
            const handlers = meta.watchHandlers.get(classFieldName)!;
            handlers.forEach(handlerName => {
              const handler = (componentObject as any)[handlerName];
              if (typeof handler === 'function') {
                try {
                  handler.call(componentObject, newValue, oldValue);
                } catch (err) {
                  if (meta.errorCapturedMethodName && typeof (componentObject as any)[meta.errorCapturedMethodName] === 'function') {
                    const res = (componentObject as any)[meta.errorCapturedMethodName](err, { field: classFieldName });
                    if (res === false) throw err;
                  } else {
                    console.error(err);
                  }
                }
              }
            });
          }
          if (meta.computedDepsMap && meta.computedDepsMap.has(classFieldName) && instance._computedInfo) {
            const cFields = meta.computedDepsMap.get(classFieldName)!;
            cFields.forEach(cf => {
              const info = instance._computedInfo!.get(cf);
              if (!info) return;
              const prev = info.cached;
              const oldDeps = info.deps;
              info.dirty = true;
              startTracking(instance);
              try {
                info.cached = info.compute();
              } finally {
                info.deps = endTracking();
              }
              oldDeps.forEach(dep => {
                const set = meta.computedDepsMap?.get(dep);
                set?.delete(cf);
                if (set && set.size === 0) meta.computedDepsMap!.delete(dep);
              });
              info.deps.forEach(dep => {
                if (!meta.computedDepsMap) meta.computedDepsMap = new Map();
                let set = meta.computedDepsMap.get(dep);
                if (!set) { set = new Set(); meta.computedDepsMap.set(dep, set); }
                set.add(cf);
              });
              if (prev !== info.cached && meta.watchHandlers && meta.watchHandlers.has(cf)) {
                const handlers = meta.watchHandlers.get(cf)!;
                handlers.forEach(handlerName => {
                  const handler = (componentObject as any)[handlerName];
                  if (typeof handler === 'function') {
                    try { handler.call(componentObject, info.cached, prev); } catch (err) {
                      if (meta.errorCapturedMethodName && typeof (componentObject as any)[meta.errorCapturedMethodName] === 'function') {
                        const res = (componentObject as any)[meta.errorCapturedMethodName](err, { field: cf });
                        if (res === false) throw err;
                      } else {
                        console.error(err);
                      }
                    }
                  }
                });
              }
            });
          }
          // 이 필드가 @State 필드라면, 변경 시 리렌더링 요청
          if (meta.stateFields.has(classFieldName) && instance.isMounted) {
            instance.update();
          }
        }
      },
      configurable: true,
      enumerable: true,
    });
    processedFields.add(classFieldName);
  };

  // @Property 필드 우선 처리
  meta.propertyBindings.forEach((_domPropName, classFieldName) => setupFieldProperty(classFieldName, 'property'));
  // @Style 필드 처리
  meta.styleBindings.forEach((_cssStyleName, classFieldName) => setupFieldProperty(classFieldName, 'style'));
  // @StyleLayout 필드 처리
  meta.styleLayoutFields.forEach(classFieldName => setupFieldProperty(classFieldName, 'style-layout'));
  // @State 필드 처리 (이미 Property/Style로 처리되지 않은 경우)
  meta.stateFields.forEach(classFieldName => setupFieldProperty(classFieldName, 'state'));

  if (meta.computedFields && meta.computedFields.size > 0) {
    if (!instance._computedInfo) instance._computedInfo = new Map();
    meta.computedFields.forEach(field => {
      const desc = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(componentObject), field);
      if (!desc || typeof desc.get !== 'function') return;
      const computeFn = desc.get.bind(componentObject);
      const info: ComputedInfo = { deps: new Set(), compute: computeFn, cached: undefined, dirty: true };
      const deps = startTracking(instance);
      try {
        info.cached = computeFn();
      } finally {
        info.deps = endTracking();
      }
      info.deps.forEach(dep => {
        if (!meta.computedDepsMap) meta.computedDepsMap = new Map();
        let set = meta.computedDepsMap.get(dep);
        if (!set) { set = new Set(); meta.computedDepsMap.set(dep, set); }
        set.add(field);
      });
      info.dirty = false;
      instance._computedInfo!.set(field, info);
      Object.defineProperty(componentObject, field, {
        get() {
          if (info.dirty) {
            const prevDeps = info.deps;
            startTracking(instance);
            try {
              info.cached = computeFn();
            } finally {
              info.deps = endTracking();
            }
            prevDeps.forEach(d => {
              const s = meta.computedDepsMap?.get(d);
              s?.delete(field);
              if (s && s.size === 0) meta.computedDepsMap!.delete(d);
            });
            info.deps.forEach(dep => {
              if (!meta.computedDepsMap) meta.computedDepsMap = new Map();
              let set = meta.computedDepsMap.get(dep);
              if (!set) { set = new Set(); meta.computedDepsMap.set(dep, set); }
              set.add(field);
            });
            info.dirty = false;
          }
          recordDependency(instance, field);
          return info.cached;
        },
        enumerable: true,
        configurable: true,
      });
    });
  }


  // @Event 바인딩: 데코레이터로 지정된 클래스 메서드를 이벤트 핸들러로 등록
  meta.eventHandlers.forEach((domEventName, classMethodOrFieldName) => {
    const handlerCandidate = (componentObject as any)[classMethodOrFieldName];
    if (typeof handlerCandidate === 'function' && isHostHtmlElement) {
      const boundHandler = handlerCandidate.bind(componentObject); // this 컨텍스트 바인딩
      hostDomElement.addEventListener(domEventName, boundHandler);
      instance._eventListeners.push({ eventName: domEventName, handler: boundHandler, domElement: hostDomElement });
    } else if (isHostHtmlElement) {
      console.warn(`@Event binding: Handler method/field "${String(classMethodOrFieldName)}" not found or not a function in "${meta.componentName}" for event "${domEventName}".`);
    }
  });
}


/**
 * Echelon 컴포넌트 클래스로부터 내부 관리용 인스턴스를 생성합니다.
 */
function createComponentInstance(
  ComponentClass: new (...args: any[]) => object,
  propsFromJsx: Record<string, any>, // JSX에서 전달된 props (children 제외)
  jsxChildren: EchelonElement[] // JSX에서 전달된 children
): EchelonInternalComponentInstance | null {
  const meta: ComponentMeta | undefined = Reflect.getOwnMetadata(COMPONENT_META_KEY, ComponentClass);
  if (!meta) { // getOrCreateComponentMeta가 항상 메타를 만들지만, 만약을 위해
    console.error(`Component "${ComponentClass.name}" is missing @Component decorator or metadata structure is invalid.`);
    return null;
  }
  if(!meta.renderMethodName) {
      console.error(`Component "${ComponentClass.name}" is missing @Render() decorator for method name:`, meta.renderMethodName);
      return null;
  }


  const componentObject = new ComponentClass(); // 생성자 인자는 props에서 받거나 다른 방식으로 처리 가능

  if (meta.routeParamFields && propsFromJsx.__routeParams) {
    meta.routeParamFields.forEach((paramName, field) => {
      if (paramName in propsFromJsx.__routeParams) {
        (componentObject as any)[field] = propsFromJsx.__routeParams[paramName];
      }
    });
  }
  if (meta.queryParamFields && propsFromJsx.__queryParams) {
    meta.queryParamFields.forEach((queryName, field) => {
      if (queryName in propsFromJsx.__queryParams) {
        (componentObject as any)[field] = propsFromJsx.__queryParams[queryName];
      }
    });
  }
  delete (propsFromJsx as any).__routeParams;
  delete (propsFromJsx as any).__queryParams;

  let hostDomElement: HTMLElement | DocumentFragment;
  if (meta.tagName) {
    hostDomElement = document.createElement(meta.tagName);
  } else {
    hostDomElement = document.createDocumentFragment(); // 태그 없으면 Fragment 기반
  }
  
  const internalInstance: EchelonInternalComponentInstance = {
    componentObject,
    hostDomElement,
    currentRenderedDomNodes: [],
    meta,
    props: propsFromJsx, // children이 제외된 props
    jsxChildren,         // JSX children
    isMounted: false,
    _eventListeners: [],
    _computedInfo: new Map(),
    update: () => { /* 아래에서 실제 함수로 정의 */ },
    destroy: () => { /* 아래에서 실제 함수로 정의 */ },
  };
  
  Object.defineProperty(componentObject, INTERNAL_INSTANCE_KEY, {
    value: internalInstance,
    writable: false, // 읽기 전용
    enumerable: false, // 열거되지 않도록
    configurable: false, // 재설정 불가 (한번 설정되면)
  });
  // DOM 요소에 내부 인스턴스 참조 저장 (디버깅 또는 고급 사용 목적)
  (hostDomElement as any).__echelon_internal_instance__ = internalInstance;

  initializeComponentBindingsAndState(internalInstance);   // 필드 바인딩 및 상태 초기화

  if (meta.beforeMountMethodName) {
    callWithErrorHandling(internalInstance, meta.beforeMountMethodName);
  }

  // --- Update 함수 정의 ---
  internalInstance.update = () => {
    if (!internalInstance.isMounted) {
      // console.warn(`Skipping update for "${meta.componentName}" as it's not mounted yet.`);
      return;
    }
    if (!meta.renderMethodName || typeof (componentObject as any)[meta.renderMethodName] !== 'function') {
        console.error(`Render method "${String(meta.renderMethodName)}" not found or not a function on component "${meta.componentName}".`);
        return;
    }
    // console.log(`Updating component: ${meta.componentName}`);

    if (meta.beforeUpdateMethodName) {
      callWithErrorHandling(internalInstance, meta.beforeUpdateMethodName);
    }

    const renderArgs = prepareRenderArgs(internalInstance);
    const newRenderOutputJsx = callWithErrorHandling(internalInstance, meta.renderMethodName, renderArgs);

    // 단순화된 DOM 업데이트: 이전 노드 모두 제거 후 새로 추가 (Diffing 없음)
    internalInstance.currentRenderedDomNodes.forEach(node => node.parentNode?.removeChild(node));
    internalInstance.currentRenderedDomNodes = [];

    const newRenderedNodes = renderEchelonElementToNodes(newRenderOutputJsx, internalInstance);
    newRenderedNodes.forEach(node => {
      internalInstance.hostDomElement.appendChild(node); // 호스트(Fragment 또는 HTMLElement)에 추가
      internalInstance.currentRenderedDomNodes.push(node);
    });

    if (meta.updatedMethodName) {
      callWithErrorHandling(internalInstance, meta.updatedMethodName);
    }
  };

  // --- Destroy 함수 정의 ---
  internalInstance.destroy = () => {
    // console.log(`Destroying component: ${meta.componentName}`);
    if (meta.beforeUnmountMethodName) {
      callWithErrorHandling(internalInstance, meta.beforeUnmountMethodName);
    }
    // 1. 이벤트 리스너 해제
    internalInstance._eventListeners.forEach(({ eventName, handler, domElement }) => {
      domElement.removeEventListener(eventName, handler);
    });
    internalInstance._eventListeners = [];

    if (internalInstance._storeListeners) {
      internalInstance._storeListeners.forEach(({ listener }) => listener());
      internalInstance._storeListeners = [];
    }

    // 2. @Destroyed 생명주기 호출
    if (meta.destroyedMethodName) {
      callWithErrorHandling(internalInstance, meta.destroyedMethodName);
    }

    // 3. 자식 DOM 노드들 제거
    internalInstance.currentRenderedDomNodes.forEach(node => node.parentNode?.removeChild(node));
    internalInstance.currentRenderedDomNodes = [];

    // 4. 호스트 DOM 요소 제거 (만약 Fragment가 아니고, 부모가 있다면)
    if (hostDomElement.parentNode && !(hostDomElement instanceof DocumentFragment)) {
        hostDomElement.parentNode.removeChild(hostDomElement);
    }

    internalInstance.isMounted = false;
    // TODO: 자식 컴포넌트 인스턴스들도 재귀적으로 destroy 처리 (더 복잡한 관리 필요)
  };
  
  // --- 초기 렌더링 실행 ---
  if (typeof (componentObject as any)[meta.renderMethodName] !== 'function') {
      console.error(`Initial Render: Render method "${String(meta.renderMethodName)}" not found on component "${meta.componentName}".`);
      return null; // 또는 에러 DOM 반환
  }
  const initialRenderArgs = prepareRenderArgs(internalInstance);
  const initialRenderOutputJsx = callWithErrorHandling(internalInstance, meta.renderMethodName, initialRenderArgs);
  const initialRenderedNodes = renderEchelonElementToNodes(initialRenderOutputJsx, internalInstance);

  initialRenderedNodes.forEach(node => {
    internalInstance.hostDomElement.appendChild(node);
    internalInstance.currentRenderedDomNodes.push(node);
  });
  
  return internalInstance;
}

/**
 * @Render 메서드에 전달할 인자 배열을 준비합니다. (@Prop, @Children 기반)
 */
function prepareRenderArgs(instance: EchelonInternalComponentInstance): any[] {
    const { meta, props, jsxChildren } = instance;
    
    // 렌더 메서드의 파라미터 개수를 알아내거나, 최대 인덱스를 기준으로 배열 생성
    const renderMethod = (instance.componentObject as any)[meta.renderMethodName!];
    const expectedArgCount = typeof renderMethod === 'function' ? renderMethod.length : 0;
    const renderArgs: any[] = new Array(expectedArgCount).fill(undefined);

    meta.propMappings.forEach((propKeyFromParent, parameterIndex) => {
        if (parameterIndex < expectedArgCount) {
            renderArgs[parameterIndex] = props[propKeyFromParent];
        }
    });

    if (meta.childrenParamIndex !== undefined && meta.childrenParamIndex < expectedArgCount) {
        // jsxChildren을 그대로 전달할지, 아니면 DOM 노드로 변환해서 전달할지 정책 필요
        // 현재는 JSX Element 배열 그대로 전달
        renderArgs[meta.childrenParamIndex] = jsxChildren;
    }
    
    return renderArgs;
}

/**
 * EchelonElement를 실제 DOM 노드(들)로 변환합니다. Fragment는 자식 노드 배열을 반환합니다.
 */
function renderEchelonElementToNodes(
  element: EchelonElement | null | undefined,
  // 자식 컴포넌트 인스턴스 생성 시 부모 컨텍스트 전달용 (현재 미사용, 향후 DI 등에 활용 가능)
  _parentInternalInstanceContext: EchelonInternalComponentInstance | null 
): Node[] {
  if (element == null) return []; // null 또는 undefined는 빈 배열 반환

  // 1. 컴포넌트 타입 (클래스)
  if (typeof element.type === 'function') {
    const ComponentClass = element.type as new (...args: any[]) => object;
    const componentProps = { ...element.props }; // props 복사
    const childrenFromProps = componentProps.children || []; // children 추출
    delete componentProps.children; // props 객체에서 children 제거

    const instance = createComponentInstance(ComponentClass, componentProps, childrenFromProps as EchelonElement[]);
    if (instance) {
      // createComponentInstance에서 초기 렌더링까지 완료되므로, hostDomElement를 반환
      return [instance.hostDomElement]; 
    }
    // 컴포넌트 생성 실패 시 주석 노드 반환
    return [document.createComment(` Error: Failed to create component ${ComponentClass.name} `)];
  }
  // 2. Fragment 타입
  else if (element.type === Fragment) {
    let fragmentChildrenNodes: Node[] = [];
    (element.props.children || []).forEach((child: EchelonElement<any> | null | undefined) => {
      fragmentChildrenNodes = fragmentChildrenNodes.concat(renderEchelonElementToNodes(child, _parentInternalInstanceContext));
    });
    return fragmentChildrenNodes; // Fragment는 자식 노드들의 배열을 직접 반환
  }
  // 3. 텍스트 노드 타입 (내부 'TEXT_ELEMENT')
  else if (element.type === 'TEXT_ELEMENT') {
    return [document.createTextNode(element.props.textContent as string)];
  }
  // 4. 일반 HTML 태그 (문자열 타입)
  else if (typeof element.type === 'string') {
    const domNode = document.createElement(element.type);

    // 속성(props) 적용
    Object.keys(element.props).forEach(propName => {
      if (propName === 'children') return; // children은 아래에서 재귀 처리
      const propValue = (element.props as any)[propName];

      if (propName.startsWith('on') && typeof propValue === 'function') {
        // 이벤트 핸들러: onEventName -> eventname
        const eventType = propName.substring(2).toLowerCase();
        domNode.addEventListener(eventType, propValue);
        // TODO: 이렇게 직접 등록된 이벤트 리스너는 컴포넌트 destroy 시 해제 로직 필요 (더 복잡해짐)
        // 현재는 컴포넌트 내부 @Event 데코레이터로 처리된 것만 해제됨.
      } else if (propName === 'style' && typeof propValue === 'object') {
        Object.assign(domNode.style, propValue); // style 객체 직접 할당
      } else if (propName === 'className') {
        domNode.setAttribute('class', propValue); // 'class' 속성으로 설정
      } else if (propValue === true) {
        domNode.setAttribute(propName, ''); // boolean true 속성 (e.g., disabled)
      } else if (propValue === false || propValue == null) {
        domNode.removeAttribute(propName); // false, null, undefined 속성은 제거
      } else {
        domNode.setAttribute(propName, String(propValue)); // 나머지 문자열/숫자 속성
      }
    });

    // 자식 요소들 재귀적으로 렌더링 및 추가
    let childDomNodes: Node[] = [];
    (element.props.children || []).forEach((childElement: EchelonElement<any> | null | undefined) => {
      childDomNodes = childDomNodes.concat(renderEchelonElementToNodes(childElement, _parentInternalInstanceContext));
    });
    childDomNodes.forEach(childNode => domNode.appendChild(childNode));
    return [domNode];
  }
  // 알 수 없는 타입
  console.warn('Encountered unknown EchelonElement type:', element.type);
  return [document.createComment(` Unknown EchelonElement type: ${String(element.type)} `)];
}

/**
 * DOM 노드 트리를 순회하며 모든 컴포넌트 인스턴스의 mounted 콜백을 호출합니다.
 * 이 함수는 노드가 실제 DOM에 연결된 후 호출되어야 합니다.
 */
function callMountedRecursively(nodeOrFragment: Node | DocumentFragment): void {
  if ((nodeOrFragment as any).__echelon_internal_instance__) {
    const instance = (nodeOrFragment as any).__echelon_internal_instance__ as EchelonInternalComponentInstance;
    if (!instance.isMounted) { // 아직 마운트되지 않은 경우에만
      instance.isMounted = true; // 마운트 상태로 변경
      if (instance.meta.mountedMethodName) {
        callWithErrorHandling(instance, instance.meta.mountedMethodName);
      }
    }
  }
  // 자식 노드들에 대해 재귀 호출
  nodeOrFragment.childNodes.forEach(child => callMountedRecursively(child));
}

/**
 * 최상위 EchelonElement를 실제 DOM에 마운트합니다.
 */
export function mount(
  rootJsxElement: EchelonElement,
  containerDomElement: HTMLElement
): EchelonInternalComponentInstance | null { // 최상위 컴포넌트 인스턴스 반환 (있다면)
  if (!containerDomElement) {
    console.error('Mount container DOM element not found.');
    return null;
  }
  containerDomElement.innerHTML = ''; // 기존 내용 모두 제거 (단순화)
  
  const rootRenderedNodes = renderEchelonElementToNodes(rootJsxElement, null);
  let rootInstance: EchelonInternalComponentInstance | null = null;

  rootRenderedNodes.forEach(node => {
    containerDomElement.appendChild(node);
    // 최상위 노드 중 컴포넌트 인스턴스를 가진 첫 번째 것을 루트 인스턴스로 간주
    if (!rootInstance && (node as any).__echelon_internal_instance__) {
      rootInstance = (node as any).__echelon_internal_instance__;
    }
  });

  // DOM에 추가 후, mounted 콜백들 재귀적으로 호출
  // Fragment를 루트로 사용한 경우 rootRenderedNodes는 여러 개일 수 있음
  // 각 노드에 대해 callMountedRecursively 호출
  rootRenderedNodes.forEach(node => callMountedRecursively(node));
  
  return rootInstance;
}