
// api/checkin.js
// Vercel Serverless Function - 处理打卡写入和报告查询

module.exports = async function handler(req, res) {
  // 允许跨域
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // 只接受 GET 请求
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  const { action, shift, camp, room, totalPeople, headCount, bgpid, dormitoryHead, comment } = req.query;

  // ============================================================
  //  你的 Google Apps Script Web App URL
  // ============================================================
  const SHEET_API_URL = 'https://script.google.com/macros/s/AKfycby_d-Q0vryRXKrayiIJYvz54zf8ji6q95rh_2wc4OsstFKEpsr9LH98enHnXxqE4fhe/exec';


  // ============================================================
  //  1. REPORT - 获取未汇报房间
  // ============================================================
  if (action === 'report') {
    try {
      const params = new URLSearchParams({
        action: 'report',
        shift: shift || ''
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

  // ============================================================
  //  2. CHECKIN - 写入打卡数据
  // ============================================================
  if (action === 'checkin') {
    // 必填校验
    if (!camp || !room) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: camp, room'
      });
    }

    try {
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

  // ============================================================
  //  3. 无效 action
  // ============================================================
  return res.status(400).json({
    success: false,
    message: 'Invalid action. Use ?action=checkin or ?action=report'
  });
};