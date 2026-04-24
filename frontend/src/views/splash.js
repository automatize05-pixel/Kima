import { supabase } from '../lib/supabase.js';

export async function render() {
  return `
    <div style="height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background: var(--color-bg); overflow: hidden; position: relative;">
      
      <!-- Ambient glow -->
      <div style="position: absolute; width: 300px; height: 300px; background: radial-gradient(circle, rgba(46,125,50,0.2) 0%, transparent 70%); border-radius: 50%; top: 50%; left: 50%; transform: translate(-50%, -50%); animation: pulse 2s ease-in-out infinite;"></div>
      
      <div style="position: relative; text-align: center; z-index: 1;">
        <div style="font-size: 5rem; margin-bottom: 1rem; animation: fadeInDown 0.8s ease;">🧠</div>
        <h1 style="font-size: 3.5rem; font-weight: 700; letter-spacing: -1px; color: white; margin-bottom: 0.5rem; animation: fadeInUp 0.8s ease 0.2s both;">
          Kima
        </h1>
        <p style="color: var(--color-text-secondary); font-size: 1rem; letter-spacing: 2px; text-transform: uppercase; animation: fadeInUp 0.8s ease 0.4s both;">
          Academia Mental Portátil
        </p>
        
        <div style="margin-top: 3rem; animation: fadeIn 1s ease 0.8s both;">
          <div style="display: flex; gap: 8px; justify-content: center;">
            <div style="width: 8px; height: 8px; background: var(--color-primary); border-radius: 50%; animation: bounce 1.2s ease infinite 0s;"></div>
            <div style="width: 8px; height: 8px; background: var(--color-primary); border-radius: 50%; animation: bounce 1.2s ease infinite 0.2s;"></div>
            <div style="width: 8px; height: 8px; background: var(--color-primary); border-radius: 50%; animation: bounce 1.2s ease infinite 0.4s;"></div>
          </div>
        </div>
      </div>

      <style>
        @keyframes pulse { 0%,100% { transform: translate(-50%,-50%) scale(1); opacity:0.5; } 50% { transform: translate(-50%,-50%) scale(1.2); opacity:1; } }
        @keyframes fadeInDown { from { opacity:0; transform: translateY(-20px); } to { opacity:1; transform: translateY(0); } }
        @keyframes fadeInUp { from { opacity:0; transform: translateY(20px); } to { opacity:1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
      </style>
    </div>
  `;
}

export async function afterRender() {
  // Check if already logged in → skip onboarding
  const { data: { session } } = await supabase.auth.getSession();
  const seenOnboarding = localStorage.getItem('kima_onboarding_done');

  setTimeout(() => {
    if (session) {
      window.location.hash = '#/dashboard';
    } else if (seenOnboarding) {
      window.location.hash = '#/auth';
    } else {
      window.location.hash = '#/onboarding';
    }
  }, 2500);
}
