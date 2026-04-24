const express = require('express');
const supabase = require('../supabaseClient');
const router = express.Router();

const requireAuth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token não fornecido' });
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Token inválido' });
  req.user = user;
  next();
};

// Registrar fim de um pomodoro e dar XP
router.post('/pomodoro', requireAuth, async (req, res) => {
  try {
    const { duration = 30 } = req.body;
    
    // 1. Inserir sessão
    const { error: sessionError } = await supabase
      .from('focus_sessions')
      .insert([{ user_id: req.user.id, duration_minutes: duration, completed: true }]);
      
    if (sessionError) throw sessionError;
    
    // 2. Atualizar XP e Streak
    // Busca perfil atual
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();
      
    const newScore = profile.score + 50; // +50 por pomodoro
    const newLevel = Math.floor(newScore / 500) + 1; // 1 nível a cada 500 XP
    
    const { data: updatedProfile, error: profileError } = await supabase
      .from('profiles')
      .update({ score: newScore, level: newLevel })
      .eq('id', req.user.id)
      .select();
      
    if (profileError) throw profileError;

    res.json({ message: 'Sessão concluída! +50 XP', profile: updatedProfile[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
