// api/checkin.js
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  const { action, shift, camp, room, totalPeople, headCount, bgpid, dormitoryHead, comment } = req.query;

  // ⚠️ 替换成你的真实 Apps Script 地址
  const SHEET_API_URL = 'https://script.google.com/macros/s/你的真实地址/exec';

  // ===== REPORT =====
  if (action === 'report') {
    try {
      const params = new URLSearchParams({ action: 'report', shift: shift || '' });
      const url = `${SHEET_API_URL}?${params}`;
      const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
      const text = await response.text();
      let data;
      try { data = JSON.parse(text); } catch { data = { success: false, raw: text }; }
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // ===== CHECKIN - 同步模式（等待 Google Sheets 响应） =====
  if (action === 'checkin') {
    if (!camp || !room) {
      return res.status(400).json({ success: false, message: 'Missing required fields: camp, room' });
    }

    try {
      const params = new URLSearchParams({
        action: 'vercelWrite',
        camp, room,
        totalPeople: totalPeople || '',
        headCount: headCount || '',
        shift: shift || '',
        bgpid: bgpid || '',
        dormitoryHead: dormitoryHead || '',
        comment: comment || ''
      });

      const url = `${SHEET_API_URL}?${params}`;
      console.log('Sending request to:', url);
      
      const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
      const text = await response.text();
      console.log('Google Sheets response:', text);
      
      let data;
      try { data = JSON.parse(text); } catch { data = { success: false, raw: text };}
      
      return res.status(200).json(data);
    } catch (error) {
      console.error('Error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Vercel API error: ' + error.message
      });
    }
  }

  return res.status(400).json({
    success: false,
    message: 'Invalid action. Use ?action=checkin or ?action=report'
  });
};