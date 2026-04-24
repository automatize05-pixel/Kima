const express = require('express');
const { OpenAI } = require('openai');
require('dotenv').config();

const router = express.Router();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post('/motivate', async (req, res) => {
  try {
    const { action, streak, level, aiStyle } = req.body;
    
    // aiStyle: 'mentor', 'firme', 'pressao'
    let systemPrompt = 'Você é Kima, uma IA focada em produtividade. Responda em 1 ou 2 frases curtas, em português de Angola.';
    if (aiStyle === 'mentor') systemPrompt += ' Seja acolhedor e encorajador.';
    if (aiStyle === 'firme') systemPrompt += ' Seja direto, sem rodeios e firme.';
    if (aiStyle === 'pressao') systemPrompt += ' Seja muito exigente, como um sargento de exército, focado na disciplina extrema.';

    const userPrompt = `O usuário acabou de realizar a ação: "${action}". O streak atual é de ${streak} dias e o nível é ${level}. Dê uma mensagem apropriada.`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // ou gpt-4
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 100,
    });

    res.json({ message: response.choices[0].message.content });
  } catch (error) {
    console.error('Erro ao gerar mensagem AI:', error);
    res.status(500).json({ error: 'Erro ao conectar com a IA comportamental.' });
  }
});

module.exports = router;
