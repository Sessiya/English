const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios'); // OpenAI API

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// Root (/) yo'lini belgilash
app.get('/', (req, res) => {
  res.send('Hello World!'); // Bu yerga kerakli ma'lumotni yuboring
});

// OpenAI API bilan ishlash uchun yangi yo'l
app.post('/api/openai', async (req, res) => {
  const { prompt } = req.body;

  try {
    const response = await axios.post('https://api.openai.com/v1/completions', {
      model: 'text-davinci-003',
      prompt: prompt,
      max_tokens: 100
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      }
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).send('API so‘rovida xato yuz berdi');
  }
});

// Serverni ishga tushirish
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
