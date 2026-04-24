const express = require('express');
const supabase = require('../supabaseClient');
const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // 1. Criar user no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (authError) throw authError;
    
    // 2. Inserir perfil na nossa tabela customizada 'profiles'
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          { id: authData.user.id, name: name || email.split('@')[0] }
        ]);
        
      if (profileError) throw profileError;
    }

    res.status(201).json({ message: 'Usuário registrado com sucesso!', user: authData.user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    // Buscar perfil
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    res.json({ session: data.session, user: { ...data.user, profile } });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

module.exports = router;
