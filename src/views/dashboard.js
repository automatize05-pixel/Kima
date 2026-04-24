import { supabase } from '../lib/supabase.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function render() {
  return `
    <div>
      <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
        <div>
          <h2 style="margin-bottom: 0;">Dashboard</h2>
          <p id="dashGreeting" style="color: var(--color-text-secondary); font-size: 0.9rem;">Pronto para iniciar sua jornada?</p>
        </div>
        <div style="width: 40px; height: 40px; background: var(--color-surface); border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; border: 2px solid var(--color-surface-light);" onclick="window.location.hash='#/profile'">
          👤
        </div>
      </header>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem;">
        <div class="card text-center" style="padding: 1.5rem 1rem;">
          <h3 id="dashStreak" style="color: var(--color-primary); font-size: 2.5rem; margin-bottom: 0.25rem;">0</h3>
          <p style="font-size: 0.75rem; color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 1px;">🔥 Dias Seguidos</p>
        </div>
        <div class="card text-center" style="padding: 1.5rem 1rem;">
          <h3 id="dashScore" style="color: var(--color-warning); font-size: 2.5rem; margin-bottom: 0.25rem;">0</h3>
          <p style="font-size: 0.75rem; color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 1px;">⚡ Score XP</p>
        </div>
      </div>

      <div class="card" style="margin-bottom: 2rem; background: linear-gradient(135deg, var(--color-surface), rgba(46, 125, 50, 0.15)); border-color: var(--color-primary-dark);">
        <h3 style="margin-bottom: 0.5rem;">⏱️ Foco Total</h3>
        <p style="color: var(--color-text-secondary); margin-bottom: 1.5rem; font-size: 0.9rem;" id="focusSubtext">Sua próxima sessão de 30 minutos aguarda.</p>
        <button class="btn btn-primary" style="width: 100%; padding: 0.9rem; font-size: 1rem;" onclick="window.location.hash='#/focus'">
          Entrar em Foco
        </button>
      </div>

      <div style="margin-bottom: 2rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <h3>📋 Tarefas de Hoje</h3>
          <a href="#/tasks" style="font-size: 0.85rem; color: var(--color-primary-light);">Ver todas →</a>
        </div>
        <div id="dashTasks" style="display: flex; flex-direction: column; gap: 0.5rem;">
          <div style="background: var(--color-surface); padding: 1rem; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center;">
            <span style="color: var(--color-text-secondary); font-size: 0.9rem;">A carregar tarefas...</span>
          </div>
        </div>
      </div>
      
      <div id="aiMessageContainer" class="card" style="border-left: 4px solid var(--color-primary); cursor: pointer; transition: all 0.2s;" onmouseenter="this.style.borderLeftColor='var(--color-primary-light)'" onmouseleave="this.style.borderLeftColor='var(--color-primary)'">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 0.5rem;">
          <span>🤖</span>
          <span style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; color: var(--color-primary-light);">Kima IA</span>
          <span id="aiLoading" style="display:none; font-size: 0.75rem; color: var(--color-text-secondary); margin-left: auto;">A gerar...</span>
        </div>
        <p id="aiMessageText" style="font-style: italic; color: var(--color-text-secondary); font-size: 0.9rem; line-height: 1.5;">
          Clique para receber um conselho personalizado.
        </p>
      </div>
    </div>
  `;
}

export async function afterRender() {
  const dashTasks = document.getElementById('dashTasks');
  const dashStreak = document.getElementById('dashStreak');
  const dashScore = document.getElementById('dashScore');
  const dashGreeting = document.getElementById('dashGreeting');

  const { data: { user } } = await supabase.auth.getUser();
  const isGuest = localStorage.getItem('kima_guest') === 'true';

  if (user) {
    dashGreeting.textContent = 'Bem-vindo de volta, guerreiro!';

    // Load profile
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (profile) {
      dashStreak.textContent = profile.streak || 0;
      dashScore.textContent = profile.score || 0;
    }

    // Load tasks
    const { data: tasks } = await supabase.from('tasks').select('*').eq('user_id', user.id).eq('done', false).limit(3);
    renderDashTasks(tasks || []);
  } else if (isGuest) {
    dashGreeting.textContent = 'Modo Convidado — crie uma conta para salvar progresso!';
    const tasks = JSON.parse(localStorage.getItem('kima_tasks_guest') || '[]').filter(t => !t.done).slice(0, 3);
    renderDashTasks(tasks);
  } else {
    renderDashTasks([]);
    dashGreeting.textContent = 'Faça login para salvar seu progresso.';
  }

  // AI connection
  const aiContainer = document.getElementById('aiMessageContainer');
  const aiText = document.getElementById('aiMessageText');
  const aiLoading = document.getElementById('aiLoading');

  aiContainer.addEventListener('click', async () => {
    if (aiLoading.style.display === 'block') return;
    aiLoading.style.display = 'block';
    aiText.style.opacity = '0.5';

    try {
      const aiStyle = localStorage.getItem('kima_ai_style') || 'mentor';
      const { data: profile } = user ? await supabase.from('profiles').select('*').eq('id', user.id).single() : { data: null };

      const res = await fetch(`${API_URL}/api/ai/motivate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'abriu o dashboard',
          streak: profile?.streak || 0,
          level: profile?.level || 1,
          aiStyle
        })
      });
      const data = await res.json();
      aiText.textContent = data.message || 'A IA está indisponível agora.';
      aiText.style.color = 'var(--color-text-primary)';
    } catch (e) {
      aiText.textContent = '"Sem internet? Sem problema — a disciplina começa na mente."';
    } finally {
      aiLoading.style.display = 'none';
      aiText.style.opacity = '1';
    }
  });
}

function renderDashTasks(tasks) {
  const dashTasks = document.getElementById('dashTasks');
  dashTasks.innerHTML = '';

  if (!tasks || tasks.length === 0) {
    dashTasks.innerHTML = `<div style="background: var(--color-surface); padding: 1rem; border-radius: var(--radius-md); text-align: center;">
      <p style="color: var(--color-text-secondary); font-size: 0.9rem;">Nenhuma tarefa pendente. <a href="#/tasks" style="color: var(--color-primary-light);">Criar agora →</a></p>
    </div>`;
    return;
  }

  tasks.forEach(t => {
    const div = document.createElement('div');
    div.style.cssText = 'background: var(--color-surface); padding: 1rem; border-radius: var(--radius-md); display: flex; align-items: center; gap: 12px;';
    div.innerHTML = `<div style="width: 18px; height: 18px; border: 2px solid var(--color-primary); border-radius: 4px; flex-shrink: 0;"></div><span>${t.title}</span>`;
    dashTasks.appendChild(div);
  });
}
