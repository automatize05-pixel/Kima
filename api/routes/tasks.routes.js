const express = require('express');
const supabase = require('../supabaseClient');
const router = express.Router();

// Middleware simples para checar token JWT (em app real usariamos um validador)
const requireAuth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token não fornecido' });
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Token inválido' });
  req.user = user;
  next();
};

// Obter tarefas
router.get('/', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Criar tarefa
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title } = req.body;
    const { data, error } = await supabase
      .from('tasks')
      .insert([{ user_id: req.user.id, title }])
      .select();
      
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    console.error("ERRO POST /tasks:", err);
    res.status(500).json({ error: err.message });
  }
});

// Atualizar status (concluir/desmarcar)
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { done } = req.body;
    
    const { data, error } = await supabase
      .from('tasks')
      .update({ done })
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select();
      
    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
