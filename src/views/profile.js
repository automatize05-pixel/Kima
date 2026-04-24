import { supabase } from '../lib/supabase.js';

export async function render() {
  return `
    <div style="height: 100%; display: flex; flex-direction: column;">
      <header style="display: flex; align-items: center; margin-bottom: 2rem;">
        <button class="btn" style="padding: 0; background: none; color: var(--color-primary-light); font-size: 1.5rem;" onclick="window.location.hash='#/dashboard'">←</button>
        <h2 style="flex: 1; text-align: center; margin-right: 1.5rem;">Perfil</h2>
      </header>

      <div class="text-center" style="margin-bottom: 2rem;">
        <div style="width: 80px; height: 80px; background: linear-gradient(135deg, var(--color-primary-dark), var(--color-primary)); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; font-size: 2rem;">
          👤
        </div>
        <h3 id="profileName">Guerreiro</h3>
        <p style="color: var(--color-primary-light);">Nível <span id="profLevel">1</span></p>
        <div id="xpBar" style="background: var(--color-surface); border-radius: 999px; height: 8px; margin-top: 0.75rem; overflow: hidden;">
          <div id="xpFill" style="background: linear-gradient(90deg, var(--color-primary), var(--color-primary-light)); height: 100%; width: 0%; transition: width 0.8s ease; border-radius: 999px;"></div>
        </div>
        <p style="font-size: 0.8rem; color: var(--color-text-secondary); margin-top: 0.25rem;"><span id="profScore">0</span> XP</p>
      </div>

      <div class="card" style="margin-bottom: 1.5rem;">
        <h3 style="margin-bottom: 1rem; font-size: 1rem;">📊 Estatísticas</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div style="text-align: center; background: var(--color-bg); padding: 1rem; border-radius: var(--radius-md);">
            <p id="profPomos" style="font-size: 1.75rem; color: var(--color-primary);">0</p>
            <p style="font-size: 0.75rem; color: var(--color-text-secondary);">Pomodoros</p>
          </div>
          <div style="text-align: center; background: var(--color-bg); padding: 1rem; border-radius: var(--radius-md);">
            <p id="profStreak" style="font-size: 1.75rem; color: var(--color-warning);">0</p>
            <p style="font-size: 0.75rem; color: var(--color-text-secondary);">Streak 🔥</p>
          </div>
        </div>
      </div>

      <div class="card" style="margin-bottom: 1.5rem;">
        <h3 style="margin-bottom: 1rem; font-size: 1rem;">⚙️ Configurações</h3>
        <div style="margin-bottom: 1rem;">
          <label style="font-size: 0.85rem; color: var(--color-text-secondary); display: block; margin-bottom: 6px;">Personalidade da IA Kima</label>
          <select id="profileAiStyle" style="width: 100%; padding: var(--space-sm) var(--space-md); border-radius: var(--radius-md); background: var(--color-bg); color: white; border: 1px solid var(--color-surface-light);">
            <option value="mentor">🤝 Mentor Acolhedor</option>
            <option value="firme">💪 Firme e Direto</option>
            <option value="pressao">🔥 Pressão Extrema</option>
          </select>
        </div>
      </div>
      
      <div id="loginPrompt" style="display: none; text-align: center; margin-bottom: 1.5rem;">
        <p style="color: var(--color-text-secondary); font-size: 0.9rem;">Faça login para guardar o seu progresso na nuvem!</p>
        <button class="btn btn-primary" style="margin-top: 0.75rem;" onclick="window.location.hash='#/auth'">Fazer Login / Registar</button>
      </div>

      <div style="margin-top: auto; padding-top: 1rem;">
        <button id="btnLogout" class="btn btn-secondary" style="width: 100%; border-color: var(--color-error); color: var(--color-error);">Sair da Conta</button>
      </div>
    </div>
  `;
}

export async function afterRender() {
  const profileAiStyle = document.getElementById('profileAiStyle');
  const saved = localStorage.getItem('kima_ai_style') || 'mentor';
  profileAiStyle.value = saved;
  profileAiStyle.addEventListener('change', (e) => localStorage.setItem('kima_ai_style', e.target.value));

  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (profile) {
      document.getElementById('profileName').textContent = profile.name || user.email.split('@')[0];
      document.getElementById('profLevel').textContent = profile.level || 1;
      document.getElementById('profScore').textContent = profile.score || 0;
      document.getElementById('profStreak').textContent = profile.streak || 0;

      // XP bar: 500 XP per level
      const xpInLevel = (profile.score || 0) % 500;
      document.getElementById('xpFill').style.width = `${(xpInLevel / 500) * 100}%`;

      // Count pomodoros
      const { count } = await supabase.from('focus_sessions').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
      document.getElementById('profPomos').textContent = count || 0;
    }
  } else {
    document.getElementById('loginPrompt').style.display = 'block';
    document.getElementById('btnLogout').style.display = 'none';
  }

  document.getElementById('btnLogout').addEventListener('click', async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('kima_guest');
    window.location.hash = '#/auth';
  });
}
