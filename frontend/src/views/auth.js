import { supabase } from '../lib/supabase.js';

export async function render() {
  return `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 1rem;">
      <div class="card" style="width: 100%; max-width: 420px; padding: 2.5rem;">
        
        <div class="text-center" style="margin-bottom: 2.5rem;">
          <div style="font-size: 3rem; margin-bottom: 0.5rem;">🧠</div>
          <h1 style="font-size: 2rem; margin-bottom: 0.25rem;">Kima</h1>
          <p style="color: var(--color-text-secondary); font-size: 0.9rem;">Academia Mental Portátil</p>
        </div>
        
        <div id="errorMsg" style="display:none; background: rgba(239,83,80,0.1); border-left: 3px solid var(--color-error); padding: 0.75rem 1rem; border-radius: var(--radius-md); margin-bottom: 1rem; font-size: 0.9rem; color: var(--color-error);"></div>

        <div class="input-group" style="margin-bottom: 1rem;">
          <label>Email</label>
          <input type="email" id="email" placeholder="exemplo@kima.ao" />
        </div>
        <div class="input-group" style="margin-bottom: 0.5rem;">
          <label>Senha</label>
          <input type="password" id="password" placeholder="••••••••" />
        </div>
        <p id="nameGroup" style="display: none; margin-bottom: 1rem;">
          <label style="font-size: 0.85rem; color: var(--color-text-secondary); display: block; margin-bottom: 4px;">Nome (opcional)</label>
          <input type="text" id="nameInput" placeholder="Guerreiro" style="width: 100%; padding: var(--space-sm) var(--space-md); border-radius: var(--radius-md); border: 1px solid var(--color-surface-light); background: var(--color-surface); color: var(--color-text-primary);" />
        </p>

        <button id="btnSubmit" class="btn btn-primary" style="width: 100%; margin-top: 1rem; margin-bottom: 1rem; padding: 0.9rem;">
          Entrar
        </button>

        <div class="text-center" style="margin-bottom: 1rem;">
          <a href="#" id="btnToggle" style="font-size: 0.9rem; color: var(--color-primary-light);">Não tem conta? Criar agora</a>
        </div>
        
        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
          <div style="flex:1; height: 1px; background: var(--color-surface-light);"></div>
          <span style="font-size: 0.8rem; color: var(--color-text-secondary);">ou</span>
          <div style="flex:1; height: 1px; background: var(--color-surface-light);"></div>
        </div>

        <button class="btn btn-secondary" style="width: 100%;" id="btnGuest">
          Continuar como Convidado
        </button>
      </div>
    </div>
  `;
}

export async function afterRender() {
  const btnSubmit = document.getElementById('btnSubmit');
  const btnToggle = document.getElementById('btnToggle');
  const btnGuest = document.getElementById('btnGuest');
  const errorMsg = document.getElementById('errorMsg');
  const nameGroup = document.getElementById('nameGroup');
  let isRegister = false;

  function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.style.display = 'block';
  }
  function hideError() {
    errorMsg.style.display = 'none';
  }

  btnToggle.addEventListener('click', (e) => {
    e.preventDefault();
    isRegister = !isRegister;
    btnSubmit.textContent = isRegister ? 'Criar Conta' : 'Entrar';
    btnToggle.textContent = isRegister ? 'Já tem conta? Fazer login' : 'Não tem conta? Criar agora';
    nameGroup.style.display = isRegister ? 'block' : 'none';
    hideError();
  });

  btnSubmit.addEventListener('click', async () => {
    hideError();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const name = document.getElementById('nameInput')?.value.trim() || email.split('@')[0];

    if (!email || !password) { showError('Preencha email e senha.'); return; }

    btnSubmit.disabled = true;
    btnSubmit.textContent = isRegister ? 'A criar conta...' : 'A entrar...';

    try {
      if (isRegister) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        // Create profile
        if (data.user) {
          await supabase.from('profiles').insert([{ id: data.user.id, name }]);
        }
        showError('✅ Conta criada! Faça login agora.');
        isRegister = false;
        btnSubmit.textContent = 'Entrar';
        btnToggle.textContent = 'Não tem conta? Criar agora';
        nameGroup.style.display = 'none';
        errorMsg.style.color = 'var(--color-primary-light)';
        errorMsg.style.borderLeftColor = 'var(--color-primary)';
        errorMsg.style.background = 'rgba(46,125,50,0.1)';
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.location.hash = '#/dashboard';
      }
    } catch (e) {
      showError(e.message);
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.textContent = isRegister ? 'Criar Conta' : 'Entrar';
    }
  });

  btnGuest.addEventListener('click', () => {
    localStorage.setItem('kima_guest', 'true');
    window.location.hash = '#/dashboard';
  });
}
