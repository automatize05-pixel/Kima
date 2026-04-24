import { supabase } from '../lib/supabase.js';

export async function render() {
  return `
    <div style="height: 100%; display: flex; flex-direction: column;">
      <header style="display: flex; align-items: center; margin-bottom: 2rem;">
        <button class="btn" style="padding: 0; background: none; color: var(--color-primary-light); font-size: 1.5rem;" onclick="window.location.hash='#/dashboard'">←</button>
        <h2 style="flex: 1; text-align: center; margin-right: 1.5rem;">Tarefas</h2>
      </header>

      <div style="display: flex; gap: 10px; margin-bottom: 2rem;">
        <input type="text" id="newTaskInput" placeholder="Adicionar nova tarefa..." style="flex: 1; padding: var(--space-sm) var(--space-md); border-radius: var(--radius-md); border: 1px solid var(--color-surface-light); background: var(--color-surface); color: var(--color-text-primary);" />
        <button id="btnAddTask" class="btn btn-primary">+</button>
      </div>

      <div style="flex: 1; overflow-y: auto;">
        <ul id="taskList" style="list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.5rem;"></ul>
        <div id="emptyState" class="text-center" style="margin-top: 3rem; display: none;">
          <p style="font-size: 3rem; margin-bottom: 1rem;">🍃</p>
          <p style="color: var(--color-text-secondary);">Nenhuma tarefa ainda.<br>Crie a primeira acima!</p>
        </div>
        <div id="authPrompt" class="text-center" style="margin-top: 3rem; display: none;">
          <p style="font-size: 3rem; margin-bottom: 1rem;">🔒</p>
          <p style="color: var(--color-text-secondary);">Precisa estar logado para guardar tarefas.</p>
          <button class="btn btn-primary" style="margin-top: 1rem;" onclick="window.location.hash='#/auth'">Fazer Login</button>
        </div>
      </div>
    </div>
  `;
}

export async function afterRender() {
  const btnAddTask = document.getElementById('btnAddTask');
  const taskInput = document.getElementById('newTaskInput');
  const taskList = document.getElementById('taskList');
  const emptyState = document.getElementById('emptyState');
  const authPrompt = document.getElementById('authPrompt');

  // Get current logged in user
  const { data: { user } } = await supabase.auth.getUser();
  const isGuest = localStorage.getItem('kima_guest') === 'true';

  if (!user && !isGuest) {
    authPrompt.style.display = 'block';
    btnAddTask.disabled = true;
    return;
  }

  // Guest mode: use localStorage
  if (isGuest || !user) {
    let tasks = JSON.parse(localStorage.getItem('kima_tasks_guest') || '[]');

    function renderGuestTasks() {
      taskList.innerHTML = '';
      if (tasks.length === 0) { emptyState.style.display = 'block'; return; }
      emptyState.style.display = 'none';
      tasks.forEach((t, i) => {
        const li = createTaskElement(t.title, t.done, async (done) => {
          tasks[i].done = done;
          localStorage.setItem('kima_tasks_guest', JSON.stringify(tasks));
        });
        taskList.appendChild(li);
      });
    }

    btnAddTask.addEventListener('click', () => {
      const text = taskInput.value.trim();
      if (!text) return;
      tasks.push({ title: text, done: false });
      localStorage.setItem('kima_tasks_guest', JSON.stringify(tasks));
      taskInput.value = '';
      renderGuestTasks();
    });

    renderGuestTasks();
    return;
  }

  // Logged-in mode: use Supabase
  async function loadTasks() {
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) { console.error(error); return; }
    renderTasks(tasks);
  }

  function renderTasks(tasks) {
    taskList.innerHTML = '';
    if (tasks.length === 0) { emptyState.style.display = 'block'; return; }
    emptyState.style.display = 'none';
    tasks.forEach(t => {
      const li = createTaskElement(t.title, t.done, async (done) => {
        await supabase.from('tasks').update({ done }).eq('id', t.id);
        loadTasks();
      });
      taskList.appendChild(li);
    });
  }

  btnAddTask.addEventListener('click', async () => {
    const text = taskInput.value.trim();
    if (!text) return;
    btnAddTask.disabled = true;
    btnAddTask.textContent = '...';
    const { error } = await supabase.from('tasks').insert([{ user_id: user.id, title: text }]);
    if (error) { alert('Erro: ' + error.message); }
    else { taskInput.value = ''; }
    btnAddTask.disabled = false;
    btnAddTask.textContent = '+';
    loadTasks();
  });

  taskInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') btnAddTask.click();
  });

  loadTasks();
}

function createTaskElement(title, done, onToggle) {
  const li = document.createElement('li');
  li.style.cssText = 'display:flex; align-items:center; gap:12px; background:var(--color-surface); padding:1rem; border-radius:var(--radius-md); transition: opacity 0.2s;';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = done;
  checkbox.style.cssText = 'width:20px; height:20px; accent-color:var(--color-primary); cursor:pointer; flex-shrink:0;';

  const span = document.createElement('span');
  span.textContent = title;
  span.style.flex = '1';
  if (done) { span.style.textDecoration = 'line-through'; span.style.color = 'var(--color-text-secondary)'; }

  checkbox.addEventListener('change', async () => {
    span.style.textDecoration = checkbox.checked ? 'line-through' : 'none';
    span.style.color = checkbox.checked ? 'var(--color-text-secondary)' : '';
    await onToggle(checkbox.checked);
  });

  li.appendChild(checkbox);
  li.appendChild(span);
  return li;
}
