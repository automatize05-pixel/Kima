import './style.css';
import { supabase } from './src/lib/supabase.js';

// Simple Router
const routes = {
  '/': () => import('./src/views/splash.js'),
  '/onboarding': () => import('./src/views/onboarding.js'),
  '/auth': () => import('./src/views/auth.js'),
  '/dashboard': () => import('./src/views/dashboard.js'),
  '/focus': () => import('./src/views/focus.js'),
  '/tasks': () => import('./src/views/tasks.js'),
  '/mindmaps': () => import('./src/views/mindmaps.js'),
  '/profile': () => import('./src/views/profile.js'),
};

const appContainer = document.getElementById('app');

const NAV_HIDDEN_ROUTES = ['/', '/auth', '/onboarding'];

const navItems = [
  { path: '/dashboard', icon: '🏠', label: 'Início' },
  { path: '/tasks', icon: '📋', label: 'Tarefas' },
  { path: '/focus', icon: '⏱️', label: 'Foco' },
  { path: '/mindmaps', icon: '🗺️', label: 'Mapas' },
  { path: '/profile', icon: '👤', label: 'Perfil' },
];

function renderNav(activePath) {
  let nav = document.getElementById('kima-nav');
  if (!nav) {
    nav = document.createElement('nav');
    nav.id = 'kima-nav';
    nav.style.cssText = `
      position: fixed; bottom: 0; left: 0; right: 0;
      background: var(--color-surface);
      border-top: 1px solid var(--color-surface-light);
      display: flex; justify-content: space-around; align-items: center;
      padding: 0.5rem 0 calc(0.5rem + env(safe-area-inset-bottom));
      z-index: 1000;
      max-width: 480px; margin: 0 auto;
    `;
    document.body.appendChild(nav);
  }

  if (NAV_HIDDEN_ROUTES.includes(activePath)) {
    nav.style.display = 'none';
    appContainer.style.paddingBottom = '0';
    return;
  }

  nav.style.display = 'flex';
  appContainer.style.paddingBottom = '70px';

  nav.innerHTML = navItems.map(item => {
    const isActive = activePath === item.path;
    return `
      <a href="#${item.path}" style="
        display: flex; flex-direction: column; align-items: center; gap: 2px;
        text-decoration: none; padding: 0.4rem 0.75rem; border-radius: var(--radius-md);
        color: ${isActive ? 'var(--color-primary-light)' : 'var(--color-text-secondary)'};
        background: ${isActive ? 'rgba(46,125,50,0.1)' : 'transparent'};
        transition: all 0.2s; min-width: 56px;
      ">
        <span style="font-size: 1.3rem;">${item.icon}</span>
        <span style="font-size: 0.65rem; font-weight: ${isActive ? '600' : '400'};">${item.label}</span>
      </a>
    `;
  }).join('');
}

async function router() {
  const hash = window.location.hash.slice(1) || '/';
  const path = hash.startsWith('/') ? hash : '/' + hash;
  const route = routes[path] || routes['/'];
  
  renderNav(path);
  appContainer.innerHTML = '<div class="text-center mt-4">A carregar...</div>';
  
  try {
    const viewModule = await route();
    appContainer.innerHTML = await viewModule.render();
    if (viewModule.afterRender) {
      await viewModule.afterRender();
    }
  } catch (err) {
    console.error('Error loading view', err);
    appContainer.innerHTML = '<div class="text-center mt-4" style="color:var(--color-error)">Erro ao carregar a página.<br><small>' + err.message + '</small></div>';
  }
}

window.addEventListener('hashchange', router);
window.addEventListener('load', router);

// Setup service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((registration) => {
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, (err) => {
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}
