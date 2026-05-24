
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

function generateRisk(text) {
  const lower = text.toLowerCase();

  let score = 10;
  const signals = [];

  if (lower.includes('urgent')) {
    score += 20;
    signals.push('Urgency manipulation');
  }

  if (lower.includes('send money')) {
    score += 25;
    signals.push('Suspicious payment request');
  }

  if (lower.includes('otp')) {
    score += 20;
    signals.push('Sensitive OTP request');
  }

  if (lower.includes('bank')) {
    score += 10;
    signals.push('Banking impersonation');
  }

  return {
    riskScore: Math.min(score, 95),
    threatType: score > 50 ? 'Potential Scam' : 'Low Risk',
    summary: 'AI detected suspicious patterns inside the uploaded content.',
    recommendation: score > 50
      ? 'Avoid sharing money or sensitive information.'
      : 'No major threat indicators detected.',
    signals
  };
}

app.post('/analyze-image', upload.single('image'), async (req, res) => {
  try {
    const filePath = req.file.path;

    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));
    formData.append('apikey', process.env.OCR_API_KEY || 'helloworld');
    formData.append('language', 'eng');

    const response = await axios.post(
      'https://api.ocr.space/parse/image',
      formData,
      {
        headers: formData.getHeaders()
      }
    );

    const text =
      response.data?.ParsedResults?.[0]?.ParsedText || 'No text found';

    const analysis = generateRisk(text);

    fs.unlinkSync(filePath);

    res.json({
      extractedText: text,
      ...analysis
    });
  } catch (error) {
    console.error(error);

    res.json({
      riskScore: 40,
      threatType: 'Unknown',
      summary: 'Fallback analysis triggered.',
      recommendation: 'Manual verification recommended.',
      signals: ['OCR fallback mode']
    });
  }
});

app.post('/analyze-url', async (req, res) => {
  const { url } = req.body;

  let score = 15;
  const signals = [];

  if (url.includes('bit.ly')) {
    score += 25;
    signals.push('Shortened URL detected');
  }

  if (url.includes('login')) {
    score += 20;
    signals.push('Login phishing pattern');
  }

  if (url.includes('verify')) {
    score += 15;
    signals.push('Suspicious verification keyword');
  }

  if (url.includes('@')) {
    score += 20;
    signals.push('Potential spoofing structure');
  }

  res.json({
    riskScore: Math.min(score, 95),
    threatType: score > 50 ? 'Phishing Risk' : 'Low Risk',
    summary: 'URL scanned for phishing indicators.',
    recommendation:
      score > 50
        ? 'Avoid visiting this link.'
        : 'No major phishing indicators detected.',
    signals
  });
});

app.get('/', (req, res) => {
  res.send('ProofChain AI Backend Running');
});

app.listen(5000, () => {
  console.log('Backend running on port 5000');
});
