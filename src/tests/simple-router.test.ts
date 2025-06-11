import 'reflect-metadata';
import { createElement, mount, Component, Render, State, Event, Prop } from '../index';

describe('Simple Router Tests', () => {
  test('basic route component switching', () => {
    @Component('div')
    class HomeComponent {
      @Render()
      render() {
        return createElement('div', { id: 'home' }, 'Home Page');
      }
    }

    @Component('div')
    class AboutComponent {
      @Render()
      render() {
        return createElement('div', { id: 'about' }, 'About Page');
      }
    }

    @Component('div')
    class RouterTestComponent {
      @State() currentRoute = 'home';

      @Event('click')
      handleNavigation(event: MouseEvent) {
        const target = event.target as HTMLElement;
        const route = target.dataset.route;
        if (route) {
          this.currentRoute = route;
        }
      }

      @Render()
      render() {
        return createElement('div', null,
          createElement('nav', null,
            createElement('button', { 'data-route': 'home' }, 'Home'),
            createElement('button', { 'data-route': 'about' }, 'About')
          ),
          createElement('div', { id: 'route-content' },
            this.currentRoute === 'home' 
              ? createElement(HomeComponent, null)
              : createElement(AboutComponent, null)
          )
        );
      }
    }

    const container = document.createElement('div');
    mount(createElement(RouterTestComponent, null), container);
    
    // Test initial route
    expect(container.querySelector('#home')).toBeTruthy();
    expect(container.querySelector('#about')).toBeFalsy();
    
    // Test navigation
    const aboutBtn = container.querySelector('[data-route="about"]') as HTMLElement;
    aboutBtn.click();
    
    expect(container.querySelector('#home')).toBeFalsy();
    expect(container.querySelector('#about')).toBeTruthy();
    
    // Test back to home
    const homeBtn = container.querySelector('[data-route="home"]') as HTMLElement;
    homeBtn.click();
    
    expect(container.querySelector('#home')).toBeTruthy();
    expect(container.querySelector('#about')).toBeFalsy();
  });

  test('route with parameters simulation', () => {
    @Component('div')
    class UserProfileComponent {
      @State() userId = '';
      @State() tab = 'profile';

      @Render()
      render(
        @Prop('userId') userId: string,
        @Prop('tab') tab: string
      ) {
        this.userId = userId;
        this.tab = tab;
        
        return createElement('div', { id: 'user-profile' },
          createElement('h2', { id: 'user-id' }, `User: ${this.userId}`),
          createElement('p', { id: 'active-tab' }, `Tab: ${this.tab}`)
        );
      }
    }

    @Component('div')
    class RouterWithParamsComponent {
      @State() currentUser = '123';
      @State() currentTab = 'profile';

      @Event('click')
      handleNavigation(event: MouseEvent) {
        const target = event.target as HTMLElement;
        const userId = target.dataset.userid;
        const tab = target.dataset.tab;
        
        if (userId) this.currentUser = userId;
        if (tab) this.currentTab = tab;
      }

      @Render()
      render() {
        return createElement('div', null,
          createElement('nav', null,
            createElement('button', { 
              'data-userid': '123', 
              'data-tab': 'profile' 
            }, 'User 123 Profile'),
            createElement('button', { 
              'data-userid': '456', 
              'data-tab': 'settings' 
            }, 'User 456 Settings'),
            createElement('button', { 
              'data-userid': '789', 
              'data-tab': 'dashboard' 
            }, 'User 789 Dashboard')
          ),
          createElement(UserProfileComponent, {
            userId: this.currentUser,
            tab: this.currentTab
          })
        );
      }
    }

    const container = document.createElement('div');
    mount(createElement(RouterWithParamsComponent, null), container);
    
    // Test initial state
    expect(container.querySelector('#user-id')?.textContent).toBe('User: 123');
    expect(container.querySelector('#active-tab')?.textContent).toBe('Tab: profile');
    
    // Test navigation to different user
    const user456Btn = container.querySelector('[data-userid="456"]') as HTMLElement;
    user456Btn.click();
    
    expect(container.querySelector('#user-id')?.textContent).toBe('User: 456');
    expect(container.querySelector('#active-tab')?.textContent).toBe('Tab: settings');
    
    // Test navigation to another user
    const user789Btn = container.querySelector('[data-userid="789"]') as HTMLElement;
    user789Btn.click();
    
    expect(container.querySelector('#user-id')?.textContent).toBe('User: 789');
    expect(container.querySelector('#active-tab')?.textContent).toBe('Tab: dashboard');
  });

  test('nested routing simulation', () => {
    @Component('div')
    class NestedRouteContent {
      @Render()
      render(
        @Prop('section') section: string,
        @Prop('subsection') subsection: string
      ) {
        return createElement('div', { id: 'nested-content' },
          createElement('h3', { id: 'section' }, `Section: ${section}`),
          createElement('p', { id: 'subsection' }, `Subsection: ${subsection}`)
        );
      }
    }

    @Component('div')
    class NestedRouterComponent {
      @State() activeSection = 'dashboard';
      @State() activeSubsection = 'overview';

      @Event('click')
      handleNavigation(event: MouseEvent) {
        const target = event.target as HTMLElement;
        const section = target.dataset.section;
        const subsection = target.dataset.subsection;
        
        if (section) this.activeSection = section;
        if (subsection) this.activeSubsection = subsection;
      }

      @Render()
      render() {
        return createElement('div', null,
          createElement('nav', { className: 'main-nav' },
            createElement('button', { 'data-section': 'dashboard' }, 'Dashboard'),
            createElement('button', { 'data-section': 'profile' }, 'Profile'),
            createElement('button', { 'data-section': 'settings' }, 'Settings')
          ),
          createElement('nav', { className: 'sub-nav' },
            createElement('button', { 'data-subsection': 'overview' }, 'Overview'),
            createElement('button', { 'data-subsection': 'details' }, 'Details'),
            createElement('button', { 'data-subsection': 'analytics' }, 'Analytics')
          ),
          createElement(NestedRouteContent, {
            section: this.activeSection,
            subsection: this.activeSubsection
          })
        );
      }
    }

    const container = document.createElement('div');
    mount(createElement(NestedRouterComponent, null), container);
    
    // Test initial state
    expect(container.querySelector('#section')?.textContent).toBe('Section: dashboard');
    expect(container.querySelector('#subsection')?.textContent).toBe('Subsection: overview');
    
    // Test section navigation
    const profileBtn = container.querySelector('[data-section="profile"]') as HTMLElement;
    profileBtn.click();
    
    expect(container.querySelector('#section')?.textContent).toBe('Section: profile');
    expect(container.querySelector('#subsection')?.textContent).toBe('Subsection: overview');
    
    // Test subsection navigation
    const detailsBtn = container.querySelector('[data-subsection="details"]') as HTMLElement;
    detailsBtn.click();
    
    expect(container.querySelector('#section')?.textContent).toBe('Section: profile');
    expect(container.querySelector('#subsection')?.textContent).toBe('Subsection: details');
    
    // Test combined navigation
    const settingsBtn = container.querySelector('[data-section="settings"]') as HTMLElement;
    settingsBtn.click();
    
    const analyticsBtn = container.querySelector('[data-subsection="analytics"]') as HTMLElement;
    analyticsBtn.click();
    
    expect(container.querySelector('#section')?.textContent).toBe('Section: settings');
    expect(container.querySelector('#subsection')?.textContent).toBe('Subsection: analytics');
  });

  test('route guards and conditional rendering', () => {
    let userPermissions: string[] = ['read'];

    const hasPermission = (permission: string): boolean => {
      return userPermissions.includes(permission);
    };

    @Component('div')
    class ProtectedComponent {
      @State() hasAccess = false;
      @State() requiredPermission = 'write';

      checkAccess() {
        this.hasAccess = hasPermission(this.requiredPermission);
      }

      @Event('click')
      handlePermissionChange(event: MouseEvent) {
        const target = event.target as HTMLElement;
        const action = target.dataset.action;
        
        if (action === 'grant-write') {
          userPermissions = ['read', 'write'];
          this.checkAccess();
        } else if (action === 'grant-admin') {
          userPermissions = ['read', 'write', 'admin'];
          this.checkAccess();
        } else if (action === 'revoke') {
          userPermissions = ['read'];
          this.checkAccess();
        } else if (action === 'change-requirement') {
          this.requiredPermission = this.requiredPermission === 'write' ? 'admin' : 'write';
          this.checkAccess();
        }
      }

      componentDidMount() {
        this.checkAccess();
      }

      @Render()
      render() {
        return createElement('div', null,
          createElement('div', { id: 'permission-status' }, 
            `Required: ${this.requiredPermission}, Has access: ${this.hasAccess}`
          ),
          createElement('div', { id: 'user-permissions' }, 
            `User permissions: ${userPermissions.join(', ')}`
          ),
          createElement('button', { 'data-action': 'grant-write' }, 'Grant Write'),
          createElement('button', { 'data-action': 'grant-admin' }, 'Grant Admin'),
          createElement('button', { 'data-action': 'revoke' }, 'Revoke All'),
          createElement('button', { 'data-action': 'change-requirement' }, 'Change Requirement'),
          this.hasAccess 
            ? createElement('div', { id: 'protected-content' }, 'Protected content is accessible')
            : createElement('div', { id: 'access-denied' }, 'Access denied')
        );
      }
    }

    const container = document.createElement('div');
    const instance = mount(createElement(ProtectedComponent, null), container) as any;
    
    // Manually trigger access check for testing
    instance.componentObject.checkAccess();
    
    // Test initial state (only read permission, requires write)
    expect(container.querySelector('#access-denied')).toBeTruthy();
    expect(container.querySelector('#protected-content')).toBeFalsy();
    expect(container.querySelector('#permission-status')?.textContent).toContain('Has access: false');
    
    // Test granting write permission
    const grantWriteBtn = container.querySelector('[data-action="grant-write"]') as HTMLElement;
    grantWriteBtn.click();
    
    expect(container.querySelector('#protected-content')).toBeTruthy();
    expect(container.querySelector('#access-denied')).toBeFalsy();
    expect(container.querySelector('#permission-status')?.textContent).toContain('Has access: true');
    
    // Test changing requirement to admin
    const changeReqBtn = container.querySelector('[data-action="change-requirement"]') as HTMLElement;
    changeReqBtn.click();
    
    expect(container.querySelector('#access-denied')).toBeTruthy();
    expect(container.querySelector('#protected-content')).toBeFalsy();
    expect(container.querySelector('#permission-status')?.textContent).toContain('Required: admin');
    
    // Test granting admin permission
    const grantAdminBtn = container.querySelector('[data-action="grant-admin"]') as HTMLElement;
    grantAdminBtn.click();
    
    expect(container.querySelector('#protected-content')).toBeTruthy();
    expect(container.querySelector('#access-denied')).toBeFalsy();
    
    // Test revoking permissions
    const revokeBtn = container.querySelector('[data-action="revoke"]') as HTMLElement;
    revokeBtn.click();
    
    expect(container.querySelector('#access-denied')).toBeTruthy();
    expect(container.querySelector('#protected-content')).toBeFalsy();
  });
});