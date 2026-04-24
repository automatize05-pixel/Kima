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
        
        <div class="input-group" style="margin-bottom: 0.5rem; position: relative;">
          <label>Senha</label>
          <div style="position: relative;">
            <input type="password" id="password" placeholder="••••••••" style="width: 100%; padding-right: 40px;" />
            <button id="btnViewPass" type="button" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--color-text-secondary); cursor: pointer; font-size: 1.1rem; padding: 5px;">👁️</button>
          </div>
        </div>

        <div id="forgotPassContainer" style="text-align: right; margin-bottom: 1rem;">
          <a href="#" id="btnForgotPass" style="font-size: 0.8rem; color: var(--color-text-secondary); text-decoration: none;">Esqueceu a senha?</a>
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
  const btnViewPass = document.getElementById('btnViewPass');
  const btnForgotPass = document.getElementById('btnForgotPass');
  const passwordInput = document.getElementById('password');
  const errorMsg = document.getElementById('errorMsg');
  const nameGroup = document.getElementById('nameGroup');
  const forgotPassContainer = document.getElementById('forgotPassContainer');
  let isRegister = false;

  function showError(msg, isSuccess = false) {
    errorMsg.textContent = msg;
    errorMsg.style.display = 'block';
    if (isSuccess) {
      errorMsg.style.color = 'var(--color-primary-light)';
      errorMsg.style.borderLeftColor = 'var(--color-primary)';
      errorMsg.style.background = 'rgba(46,125,50,0.1)';
    } else {
      errorMsg.style.color = 'var(--color-error)';
      errorMsg.style.borderLeftColor = 'var(--color-error)';
      errorMsg.style.background = 'rgba(239,83,80,0.1)';
    }
  }

  function hideError() {
    errorMsg.style.display = 'none';
  }

  // Toggle show/hide password
  btnViewPass.addEventListener('click', () => {
    const isPass = passwordInput.type === 'password';
    passwordInput.type = isPass ? 'text' : 'password';
    btnViewPass.textContent = isPass ? '🔒' : '👁️';
  });

  // Toggle Login/Register
  btnToggle.addEventListener('click', (e) => {
    e.preventDefault();
    isRegister = !isRegister;
    btnSubmit.textContent = isRegister ? 'Criar Conta' : 'Entrar';
    btnToggle.textContent = isRegister ? 'Já tem conta? Fazer login' : 'Não tem conta? Criar agora';
    nameGroup.style.display = isRegister ? 'block' : 'none';
    forgotPassContainer.style.display = isRegister ? 'none' : 'block';
    hideError();
  });

  // Forgot Password
  btnForgotPass.addEventListener('click', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    if (!email) {
      showError('Insira o seu email primeiro para recuperar a senha.');
      return;
    }
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/#/profile',
      });
      if (error) throw error;
      showError('✅ Link de recuperação enviado para o seu email!', true);
    } catch (err) {
      showError(err.message);
    }
  });

  // Submit
  btnSubmit.addEventListener('click', async () => {
    hideError();
    const email = document.getElementById('email').value.trim();
    const password = passwordInput.value;
    const name = document.getElementById('nameInput')?.value.trim() || email.split('@')[0];

    if (!email || !password) { showError('Preencha email e senha.'); return; }

    btnSubmit.disabled = true;
    btnSubmit.textContent = isRegister ? 'A criar conta...' : 'A entrar...';

    try {
      if (isRegister) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.user) {
          await supabase.from('profiles').insert([{ id: data.user.id, name }]);
        }
        showError('✅ Conta criada! Verifique o seu email ou faça login.', true);
        isRegister = false;
        btnSubmit.textContent = 'Entrar';
        btnToggle.textContent = 'Não tem conta? Criar agora';
        nameGroup.style.display = 'none';
        forgotPassContainer.style.display = 'block';
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
