const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const BLOX_FRUIT_PLACE_ID = "27470683"; 

function normalizePlayers(value) {
    if (value === undefined || value === null) return 0;

    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : 0;
    }

    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) return 0;

        const match = trimmed.match(/(\d+)/);
        return match ? Number(match[1]) : 0;
    }

    return 0;
}

// ==========================================
// POST: nhận dữ liệu server-status đơn giản từ script Lua
// (jobId, placeId, players) - KHÔNG quét/scan gì thêm
// Ví dụ: POST /api/bloxfruit/status  { "jobid": "...", "placeId": 27470683, "players": 5 }
// ==========================================
router.post('/:type', (req, res) => {
    const typeParam = req.params.type;
    const { jobid, placeId, players } = req.body;

    if (!jobid) {
        return res.status(400).json({ error: "Missing jobid" });
    }

    const apiDir = __dirname;
    if (!fs.existsSync(apiDir)) fs.mkdirSync(apiDir, { recursive: true });

    const fileName = `${typeParam.replace(/\s+/g, '').toLowerCase()}.json`;
    const filePath = path.join(apiDir, fileName);

    let data = [];
    if (fs.existsSync(filePath)) {
        try {
            data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            if (!Array.isArray(data)) data = [];
        } catch (e) {
            data = [];
        }
    }

    const entry = {
        jobId: jobid,
        placeId: placeId || BLOX_FRUIT_PLACE_ID,
        players: normalizePlayers(players),
        updatedAt: Date.now()
    };

    const idx = data.findIndex(s => s.jobId === jobid);
    if (idx === -1) {
        data.push(entry);
    } else {
        data[idx] = entry;
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    res.json({ success: true, message: `Đã cập nhật server-status cho ${typeParam}` });
});

// Client GET danh sách theo loại (vd: /api/bloxfruit/mirage)
router.get('/:type', (req, res) => {
    const typeParam = req.params.type; 
    const apiDir = __dirname;

    fs.readdir(apiDir, (err, files) => {
        if (err) {
            console.error("[BloxFruit API] Lỗi đọc thư mục:", err);
            return res.status(500).json({ error: "Lỗi hệ thống", servers: [] });
        }

        const targetFile = files.find(f => f.toLowerCase() === `${typeParam.toLowerCase()}.json`);

        if (targetFile) {
            const filePath = path.join(apiDir, targetFile);
            try {
                const fileData = fs.readFileSync(filePath, 'utf8');
                let parsedData = JSON.parse(fileData);

                // FIX LỖI Ở ĐÂY: Lấy đúng placeId và players từ file Scraper
                if (Array.isArray(parsedData)) {
                    parsedData = parsedData.map(server => ({
                        jobId: server.jobId , 
                        placeId: server.placeId , // Ưu tiên placeId từ JSON
                        players: normalizePlayers(server.players)
                    }));
                }

                res.json({
                    servers: parsedData
                });
            } catch (readErr) {
                console.error(`[BloxFruit API] Lỗi đọc file ${targetFile}:`, readErr);
                res.status(500).json({ error: "Lỗi phân tích dữ liệu", servers: [] });
            }
        } else {
            res.status(404).json({ 
                error: `Không tìm thấy dữ liệu cho loại: ${typeParam}`, 
                servers: [] 
            });
        }
    });
});

// Route gốc thông báo trạng thái
router.get('/', (req, res) => {
    res.json({ 
        status: "Blox Fruit API is active",
        message: "Hãy truy cập theo định dạng: /api/bloxfruit/<tên_loại> (Ví dụ: /api/bloxfruit/mirage)"
    });
});

// Tự dọn dẹp server cũ (quá 30 phút không update) trong tất cả file json trong thư mục api
setInterval(() => {
    const apiDir = __dirname;
    const halfAnHourAgo = Date.now() - (15 * 60 * 1000);

    fs.readdir(apiDir, (err, files) => {
        if (err) return;
        files.filter(f => f.endsWith('.json')).forEach(file => {
            const filePath = path.join(apiDir, file);
            try {
                let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                if (!Array.isArray(data)) return;
                const filtered = data.filter(s => !s.updatedAt || s.updatedAt > halfAnHourAgo);
                if (filtered.length !== data.length) {
                    fs.writeFileSync(filePath, JSON.stringify(filtered, null, 2));
                }
            } catch (e) { /* bỏ qua file lỗi */ }
        });
    });
}, 5 * 60 * 1000);

module.exports = router;
