const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');  // OpenAI API uchun axios kutubxonasi

const app = express();
const port = process.env.PORT || 3000;

// Body Parser yordamida JSON ma'lumotlarini olish
app.use(bodyParser.json());

// OpenAI API kaliti
const apiKey = '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';

// OpenAI API uchun endpoint
const openaiUrl = 'https://api.openai.com/v1/completions';

// OpenAI API ga so'rov yuborish uchun route
app.post('/ask', async (req, res) => {
  const userMessage = req.body.message; // Foydalanuvchidan xabar olish

  if (!userMessage) {
    return res.status(400).send({ error: 'Message is required' });
  }

  try {
    // OpenAI API ga so'rov yuborish
    const response = await axios.post(openaiUrl, {
      model: "text-davinci-003",  // Modelni tanlash
      prompt: userMessage,       // Foydalanuvchi so'rovini yuborish
      max_tokens: 100,           // Javob uzunligi
      temperature: 0.7           // Temperatura sozlamasi
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    // OpenAI'dan olingan javobni yuborish
    res.json({ response: response.data.choices[0].text.trim() });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Failed to fetch response from OpenAI' });
  }
});

// Serverni ishga tushurish
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
