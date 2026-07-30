// api/checkin.js
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const { action, shift } = req.query;
  
  const SHEET_API_URL = 'https://script.google.com/macros/s/AKfycby_d-Q0vryRXKrayiIJYvz54zf8ji6q95rh_2wc4OsstFKEpsr9LH98enHnXxqE4fhe/exec';

  
  // ===== 报告接口 =====
  if (action === 'report') {
    try {
      const params = new URLSearchParams({
        action: 'report',
        shift: shift || ''
      });
      
      const url = `${SHEET_API_URL}?${params}`;
      const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
      const text = await response.text();
      let data;
      try { data = JSON.parse(text); } catch { data = { success: false, raw: text }; }
      
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Vercel API error: ' + error.message
      });
    }
  }
  
  // ===== 写入接口 =====
  if (action === 'checkin') {
    // ... 原有的写入逻辑
  }
  
  return res.status(400).json({ error: 'Invalid action' });
};

 

 