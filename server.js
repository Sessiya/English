const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = 3000;

app.use(express.json());  // JSON formatda so'rovlarni qabul qilish uchun

// Grammar checking API endpoint
app.post('/check', async (req, res) => {
  const userInput = req.body.input;  // Foydalanuvchidan kelgan matn

  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/your-model-name',
      { inputs: userInput },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGING_FACE_API_TOKEN}`,
        },
      }
    );

    // Model javobini foydalanuvchiga qaytarish
    res.json(response.data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Xato yuz berdi');
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
