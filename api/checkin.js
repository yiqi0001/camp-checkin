// api/checkin.js
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  // Vercel 自动解析 query 参数
  const { action, shift, camp, room, totalPeople, headCount, bgpid, dormitoryHead, comment } = req.query;

  const SHEET_API_URL = 'https://script.google.com/macros/s/AKfycby_d-Q0vryRXKrayiIJYvz54zf8ji6q95rh_2wc4OsstFKEpsr9LH98enHnXxqE4fhe/exec';

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

  // ===== CHECKIN =====
  if (action === 'checkin') {
    if (!camp || !room) {
      return res.status(400).json({ success: false, message: 'Missing required fields: camp, room' });
    }

    // 立即返回成功
    res.status(200).json({
      success: true,
      message: 'Check-in received, syncing to sheet...'
    });

    // 后台异步写入
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

    fetch(url, { signal: AbortSignal.timeout(30000) })
      .then(async (response) => {
        const text = await response.text();
        console.log('Google Sheets response:', text);
      })
      .catch(err => {
        console.error('Background sync failed:', err.message);
      });

    return;
  }

  return res.status(400).json({
    success: false,
    message: 'Invalid action. Use ?action=checkin or ?action=report'
  });
};