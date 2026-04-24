import { supabase } from '../lib/supabase.js';

export async function render() {
  return `
    <div style="height: 100%; display: flex; flex-direction: column;">
      <header style="display: flex; align-items: center; margin-bottom: 1.5rem;">
        <h2 style="flex: 1;">🗺️ Mapas Mentais</h2>
        <button id="btnNewMap" class="btn btn-primary" style="padding: 0.5rem 1rem; font-size: 0.85rem;">+ Novo</button>
      </header>

      <div id="mapList" style="flex: 1; display: flex; flex-direction: column; gap: 0.75rem; overflow-y: auto;">
        <div class="text-center" style="color: var(--color-text-secondary); margin-top: 2rem;">A carregar...</div>
      </div>

      <!-- Map Editor Modal -->
      <div id="mapModal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 2000; align-items: flex-end; justify-content: center;">
        <div style="background: var(--color-surface); border-radius: var(--radius-lg) var(--radius-lg) 0 0; padding: 1.5rem; width: 100%; max-width: 480px; max-height: 80vh; overflow-y: auto;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <h3 id="modalTitle">Novo Mapa Mental</h3>
            <button id="btnCloseModal" style="background: none; border: none; color: var(--color-text-secondary); font-size: 1.5rem; cursor: pointer;">✕</button>
          </div>
          
          <div class="input-group" style="margin-bottom: 1rem;">
            <label>Título do Mapa</label>
            <input type="text" id="mapTitle" placeholder="Ex: Plano de Estudos" />
          </div>

          <div style="margin-bottom: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <label style="font-size: 0.85rem; color: var(--color-text-secondary);">Nós / Ideias</label>
              <button id="btnAddNode" class="btn btn-secondary" style="padding: 0.25rem 0.75rem; font-size: 0.8rem;">+ Adicionar</button>
            </div>
            <div id="nodeList" style="display: flex; flex-direction: column; gap: 0.5rem;"></div>
            <input type="text" id="nodeInput" placeholder="Escreva uma ideia e clique em +" style="margin-top: 0.5rem; width: 100%; padding: var(--space-sm) var(--space-md); border-radius: var(--radius-md); border: 1px solid var(--color-surface-light); background: var(--color-bg); color: var(--color-text-primary);" />
          </div>

          <button id="btnSaveMap" class="btn btn-primary" style="width: 100%; padding: 0.9rem;">Guardar Mapa</button>
        </div>
      </div>
    </div>
  `;
}

export async function afterRender() {
  const mapList = document.getElementById('mapList');
  const mapModal = document.getElementById('mapModal');
  const btnNewMap = document.getElementById('btnNewMap');
  const btnCloseModal = document.getElementById('btnCloseModal');
  const btnSaveMap = document.getElementById('btnSaveMap');
  const btnAddNode = document.getElementById('btnAddNode');
  const nodeInput = document.getElementById('nodeInput');
  const nodeList = document.getElementById('nodeList');
  const mapTitleInput = document.getElementById('mapTitle');
  
  let nodes = [];

  // Load maps from localStorage (MVP approach)
  function loadMaps() {
    const maps = JSON.parse(localStorage.getItem('kima_mindmaps') || '[]');
    if (maps.length === 0) {
      mapList.innerHTML = `
        <div class="text-center" style="margin-top: 3rem; color: var(--color-text-secondary);">
          <p style="font-size: 3rem; margin-bottom: 1rem;">🗺️</p>
          <p>Nenhum mapa mental ainda.</p>
          <p style="font-size: 0.9rem; margin-top: 0.5rem;">Crie um para organizar as suas ideias e estudos!</p>
        </div>`;
      return;
    }
    
    mapList.innerHTML = '';
    maps.forEach((map, i) => {
      const card = document.createElement('div');
      card.className = 'card';
      card.style.cursor = 'pointer';
      card.style.transition = 'transform 0.2s';
      card.onmouseenter = () => card.style.transform = 'translateX(4px)';
      card.onmouseleave = () => card.style.transform = '';
      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <h3 style="margin-bottom: 0.25rem;">${map.title}</h3>
            <p style="color: var(--color-text-secondary); font-size: 0.8rem;">${map.nodes.length} ideias • ${new Date(map.createdAt).toLocaleDateString('pt-PT')}</p>
          </div>
          <button data-index="${i}" class="btn-delete-map" style="background: none; border: none; cursor: pointer; font-size: 1.1rem; opacity: 0.5;">🗑️</button>
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 0.4rem; margin-top: 0.75rem;">
          ${map.nodes.slice(0,4).map(n => `<span style="background: rgba(46,125,50,0.15); color: var(--color-primary-light); border-radius: 999px; padding: 2px 10px; font-size: 0.75rem;">${n}</span>`).join('')}
          ${map.nodes.length > 4 ? `<span style="color: var(--color-text-secondary); font-size: 0.75rem; padding: 2px 4px;">+${map.nodes.length - 4} mais</span>` : ''}
        </div>
      `;
      mapList.appendChild(card);
    });

    document.querySelectorAll('.btn-delete-map').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.index);
        const maps = JSON.parse(localStorage.getItem('kima_mindmaps') || '[]');
        maps.splice(idx, 1);
        localStorage.setItem('kima_mindmaps', JSON.stringify(maps));
        loadMaps();
      });
    });
  }

  function openModal() {
    nodes = [];
    nodeList.innerHTML = '';
    mapTitleInput.value = '';
    nodeInput.value = '';
    mapModal.style.display = 'flex';
  }

  function closeModal() { mapModal.style.display = 'none'; }

  function renderNodes() {
    nodeList.innerHTML = '';
    nodes.forEach((n, i) => {
      const div = document.createElement('div');
      div.style.cssText = 'display: flex; align-items: center; gap: 8px; background: var(--color-bg); padding: 0.5rem 0.75rem; border-radius: var(--radius-md);';
      div.innerHTML = `
        <span style="flex: 1; font-size: 0.9rem;">• ${n}</span>
        <button data-i="${i}" style="background: none; border: none; cursor: pointer; opacity: 0.5; font-size: 0.9rem;">✕</button>
      `;
      div.querySelector('button').addEventListener('click', () => {
        nodes.splice(i, 1);
        renderNodes();
      });
      nodeList.appendChild(div);
    });
  }

  btnAddNode.addEventListener('click', () => {
    const text = nodeInput.value.trim();
    if (!text) return;
    nodes.push(text);
    nodeInput.value = '';
    renderNodes();
  });
  nodeInput.addEventListener('keydown', e => { if (e.key === 'Enter') btnAddNode.click(); });

  btnNewMap.addEventListener('click', openModal);
  btnCloseModal.addEventListener('click', closeModal);
  mapModal.addEventListener('click', (e) => { if (e.target === mapModal) closeModal(); });

  btnSaveMap.addEventListener('click', () => {
    const title = mapTitleInput.value.trim();
    if (!title) { alert('Dê um título ao mapa!'); return; }
    const maps = JSON.parse(localStorage.getItem('kima_mindmaps') || '[]');
    maps.unshift({ title, nodes, createdAt: new Date().toISOString() });
    localStorage.setItem('kima_mindmaps', JSON.stringify(maps));
    closeModal();
    loadMaps();
  });

  loadMaps();
}
