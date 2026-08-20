const express = require('express');
const fs = require('fs');
const cors = require('cors');
const { lua, lauxlib, lualib, to_luastring } = require('fengari');
const path = require('path');

const app = express();

// --- LOGIC FENGARI LUA ---
const L = lauxlib.luaL_newstate();
lualib.luaL_openlibs(L);

try {
    const luaCode = fs.readFileSync('a.lua', 'utf8');
    lauxlib.luaL_dostring(L, to_luastring(luaCode));
    lua.lua_getglobal(L, to_luastring('lebidlyjyf'));
    if (lua.lua_isnil(L, -1)) {
        console.error("Hàm lebidlyjyf chưa được nạp!");
    } else {
        console.log("Hàm lebidlyjyf đã sẵn sàng!");
    }
    lua.lua_pop(L, 1);
} catch (err) {
    console.error("Lỗi nạp file Lua 'a.lua':", err.message);
}

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json());

const bloxfruitRouter = require('./bloxfruit');
app.use('/api/bloxfruit', bloxfruitRouter);

// Route gốc kiểm tra trạng thái
app.get('/', (req, res) => {
    res.json({ status: "Meyy Hub API is running smoothly!" });
});

// Route xóa linh hoạt
app.delete('/api/:game/delete/:type/:jobid', (req, res) => {
    const fs = require('fs');
    const path = require('path');
    const { game, type, jobid } = req.params;
    const filePath = path.join(__dirname, 'api', `${type}.json`);

    if (fs.existsSync(filePath)) {
        let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const newData = data.filter(item => item.jobId !== jobid);
        fs.writeFileSync(filePath, JSON.stringify(newData, null, 2));
        res.json({ success: true, message: `Đã dọn dẹp server khỏi ${game} - ${type}` });
    } else {
        res.status(404).json({ error: `Không tìm thấy data của ${game} - ${type}` });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server chạy tại port ${PORT}`);
});
