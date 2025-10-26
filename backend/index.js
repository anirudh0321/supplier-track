require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const app = express();

app.use(cors());
app.use(express.json());

const SHEET_ID = process.env.GOOGLE_SHEET_ID;

let auth;
try {
  auth = new google.auth.GoogleAuth({
    credentials: process.env.GOOGLE_CREDENTIALS ? JSON.parse(process.env.GOOGLE_CREDENTIALS) : undefined,
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
} catch (err) {
  console.error('Error initializing Google Auth:', err);
}

const sheets = google.sheets({ version: 'v4', auth });

// List all suppliers (sheet tabs)
app.get('/suppliers', async (req, res) => {
  try {
    const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
    const tabs = meta.data.sheets.map(s => s.properties.title);
    res.json(tabs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get the latest row for a supplier
app.get('/supplier/:name/latest', async (req, res) => {
  const tab = req.params.name;
  try {
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${tab}`,
    });
    const rows = result.data.values;
    if (!rows || rows.length < 2) {
      return res.json(null); // No data
    }
    const headers = rows[0];
    const lastRow = rows[rows.length - 1];
    const rowObj = {};
    headers.forEach((h, i) => (rowObj[h] = lastRow[i]));
    res.json(rowObj);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new supplier (create a new sheet/tab)
app.post('/suppliers', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Supplier name required' });

  try {
    // 1. Add new sheet/tab
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: name,
              },
            },
          },
        ],
      },
    });

    // 2. Add header row
    const headers = [
      ['Date', 'Opening Balance', 'Purchases', 'Payments', 'Closing Balance', 'Remarks'],
    ];
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${name}!A1:F1`,
      valueInputOption: 'RAW',
      requestBody: { values: headers },
    });

    res.json({ success: true });
  } catch (err) {
    // If the sheet already exists, Google API throws an error
    if (err.message && err.message.includes('already exists')) {
      return res.status(400).json({ error: 'Supplier already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

// Add a new row for a supplier
app.post('/supplier/:name', async (req, res) => {
  const tab = req.params.name;
  const { date, openingBalance, purchase, payment, closingBalance, remarks } = req.body;
  try {
    const row = [
      date,
      openingBalance,
      purchase,
      payment,
      closingBalance,
      remarks || '',
    ];
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${tab}`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [row],
      },
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/', (req, res) => {
  res.send('Supplier backend is running!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
