const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios'); // OpenAI API

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// Root (/) yo'lini belgilash
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Foydalanuvchi kiritgan javobni OpenAI orqali tekshirish
app.post('/check-text', async (req, res) => {
  const { text } = req.body;

  try {
    // OpenAI API so'rovi
    const response = await axios.post('https://api.openai.com/v1/completions', {
      model: 'text-davinci-003',
      prompt: `Translate the following sentence to English: "${text}"`, // Foydalanuvchidan olingan matnni OpenAI ga yuborish
      max_tokens: 100
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      }
    });

    // OpenAI javobini yuborish
    const generatedText = response.data.choices[0].text.trim();

    // Foydalanuvchining javobini va OpenAI javobini solishtirish
    const correct = generatedText.toLowerCase() === "i am a student.";  // Bu yerda siz tekshirmoqchi bo'lgan to'g'ri javobni o'zgartirishingiz mumkin

    res.json({
      correct,
      message: correct ? "Correct answer!" : "Incorrect answer. Try again."
    });
  } catch (error) {
    res.status(500).send('API so‘rovida xato yuz berdi');
  }
});

// Serverni ishga tushirish
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});