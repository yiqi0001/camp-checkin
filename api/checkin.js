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
     // 允许跨域
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // 只接受 GET 请求（方便测试，也可以改成 POST）
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  // 从 URL 参数读取数据
  const { camp, room, totalPeople, headCount, shift, bgpid, dormitoryHead, comment } = req.query;

  // 必填校验
  if (!camp || !room) {
    return res.status(400).json({ 
      success: false, 
      message: 'Missing required fields: camp, room' 
    });
  }

  // 你的 Google Apps Script Web App URL
 
  try {
    // 构建请求参数
    const params = new URLSearchParams({
      action: 'vercelWrite',
      camp: camp,
      room: room,
      totalPeople: totalPeople || '',
      headCount: headCount || '',
      shift: shift || '',
      bgpid: bgpid || '',
      dormitoryHead: dormitoryHead || '',
      comment: comment || ''
    });

    const url = `${SHEET_API_URL}?${params}`;
    
    const response = await fetch(url, {
      signal: AbortSignal.timeout(30000)
    });
    
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { success: false, message: 'Invalid response from sheet API', raw: text };
    }

    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Vercel API error: ' + error.message
    });
  }
  }
  
  return res.status(400).json({ error: 'Invalid action' });
};

 

 