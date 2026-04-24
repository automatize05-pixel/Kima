export async function render() {
  const steps = [
    {
      icon: '⏱️',
      title: 'Foco Profundo',
      desc: 'Sessões Pomodoro de 30 minutos com sons de concentração integrados para eliminar distrações.'
    },
    {
      icon: '📋',
      title: 'Tarefas com Propósito',
      desc: 'Organize o que precisa fazer hoje. Conclua e ganhe XP para subir de nível.'
    },
    {
      icon: '🤖',
      title: 'IA Comportamental',
      desc: 'Uma inteligência artificial analisa o seu progresso e te motiva com mensagens personalizadas.'
    },
    {
      icon: '🏆',
      title: 'Gamificação Real',
      desc: 'Streaks, XP, Níveis e Conquistas que tornam a disciplina viciante — da melhor forma.'
    }
  ];

  return `
    <div style="min-height: 100vh; display: flex; flex-direction: column; padding: 2rem 1.5rem;">
      
      <!-- Progress dots -->
      <div style="display: flex; justify-content: center; gap: 8px; margin-bottom: 2rem;">
        ${steps.map((_, i) => `<div id="dot-${i}" style="width: 8px; height: 8px; border-radius: 999px; background: var(--color-surface-light); transition: all 0.3s;"></div>`).join('')}
      </div>

      <!-- Step content -->
      <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; text-align: center; min-height: 320px;" id="stepContent">
        <!-- injected via JS -->
      </div>

      <!-- AI Style selector -->
      <div id="aiSection" style="display: none; margin-bottom: 2rem;">
        <p style="font-size: 0.9rem; color: var(--color-text-secondary); margin-bottom: 0.75rem; text-align: center;">Como prefere que a IA te fale?</p>
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
          <label id="opt-mentor" style="display:flex; align-items:center; gap: 12px; background: var(--color-surface); padding: 0.9rem 1rem; border-radius: var(--radius-md); cursor: pointer; border: 2px solid var(--color-primary);">
            <input type="radio" name="aiStyle" value="mentor" checked style="accent-color: var(--color-primary);"> 
            <div><p style="font-weight:600;">🤝 Mentor Acolhedor</p><p style="font-size: 0.8rem; color: var(--color-text-secondary);">Encorajador e positivo</p></div>
          </label>
          <label id="opt-firme" style="display:flex; align-items:center; gap: 12px; background: var(--color-surface); padding: 0.9rem 1rem; border-radius: var(--radius-md); cursor: pointer; border: 2px solid transparent;">
            <input type="radio" name="aiStyle" value="firme" style="accent-color: var(--color-primary);">
            <div><p style="font-weight:600;">💪 Firme e Direto</p><p style="font-size: 0.8rem; color: var(--color-text-secondary);">Sem rodeios, focado em resultados</p></div>
          </label>
          <label id="opt-pressao" style="display:flex; align-items:center; gap: 12px; background: var(--color-surface); padding: 0.9rem 1rem; border-radius: var(--radius-md); cursor: pointer; border: 2px solid transparent;">
            <input type="radio" name="aiStyle" value="pressao" style="accent-color: var(--color-primary);">
            <div><p style="font-weight:600;">🔥 Pressão Extrema</p><p style="font-size: 0.8rem; color: var(--color-text-secondary);">Modo sargento — sem desculpas</p></div>
          </label>
        </div>
      </div>

      <!-- Navigation buttons -->
      <div style="display: flex; gap: 1rem;">
        <button id="btnBack" class="btn btn-secondary" style="flex: 0; display: none;">← Voltar</button>
        <button id="btnNext" class="btn btn-primary" style="flex: 1; padding: 0.9rem; font-size: 1rem;">Próximo →</button>
      </div>
    </div>
  `;
}

export async function afterRender() {
  const steps = [
    { icon: '⏱️', title: 'Foco Profundo', desc: 'Sessões Pomodoro de 30 minutos com sons de concentração integrados para eliminar distrações.' },
    { icon: '📋', title: 'Tarefas com Propósito', desc: 'Organize o que precisa fazer hoje. Conclua e ganhe XP para subir de nível.' },
    { icon: '🤖', title: 'IA Comportamental', desc: 'Uma inteligência artificial analisa o seu progresso e te motiva com mensagens personalizadas.' },
    { icon: '🏆', title: 'Escolha sua IA', desc: 'Como prefere que a sua IA te fale? Escolha o estilo que mais combina com você.' },
  ];

  let current = 0;
  const stepContent = document.getElementById('stepContent');
  const btnNext = document.getElementById('btnNext');
  const btnBack = document.getElementById('btnBack');
  const aiSection = document.getElementById('aiSection');

  function renderStep() {
    const s = steps[current];
    // Update dots
    steps.forEach((_, i) => {
      const dot = document.getElementById(`dot-${i}`);
      dot.style.width = i === current ? '24px' : '8px';
      dot.style.background = i <= current ? 'var(--color-primary)' : 'var(--color-surface-light)';
    });

    stepContent.style.opacity = '0';
    stepContent.style.transform = 'translateY(20px)';
    setTimeout(() => {
      stepContent.innerHTML = `
        <div style="font-size: 5rem; margin-bottom: 1.5rem;">${s.icon}</div>
        <h2 style="font-size: 1.75rem; margin-bottom: 1rem; font-weight: 700;">${s.title}</h2>
        <p style="color: var(--color-text-secondary); font-size: 1rem; line-height: 1.6; max-width: 340px; margin: 0 auto;">${s.desc}</p>
      `;
      stepContent.style.transition = 'all 0.3s ease';
      stepContent.style.opacity = '1';
      stepContent.style.transform = 'translateY(0)';
    }, 150);

    // Show AI section only on last step
    aiSection.style.display = current === steps.length - 1 ? 'block' : 'none';
    btnBack.style.display = current > 0 ? 'block' : 'none';
    btnNext.textContent = current === steps.length - 1 ? '🚀 Começar Jornada' : 'Próximo →';
  }

  // Handle AI style selection visual
  document.querySelectorAll('input[name="aiStyle"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      document.querySelectorAll('label[id^="opt-"]').forEach(l => l.style.borderColor = 'transparent');
      document.getElementById(`opt-${e.target.value}`).style.borderColor = 'var(--color-primary)';
      localStorage.setItem('kima_ai_style', e.target.value);
    });
  });

  btnNext.addEventListener('click', () => {
    if (current < steps.length - 1) {
      current++;
      renderStep();
    } else {
      // Save preferences and go to auth
      const selected = document.querySelector('input[name="aiStyle"]:checked')?.value || 'mentor';
      localStorage.setItem('kima_ai_style', selected);
      localStorage.setItem('kima_onboarding_done', 'true');
      window.location.hash = '#/auth';
    }
  });

  btnBack.addEventListener('click', () => {
    if (current > 0) { current--; renderStep(); }
  });

  // Set default AI style
  if (!localStorage.getItem('kima_ai_style')) localStorage.setItem('kima_ai_style', 'mentor');
  renderStep();
}
