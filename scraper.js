const axios = require('axios');
const fs = require('fs');
const dns = require('dns'); 
const { lua, lauxlib, lualib, to_luastring } = require('fengari');

dns.setDefaultResultOrder('ipv4first');

const L = lauxlib.luaL_newstate();
lualib.luaL_openlibs(L);
lauxlib.luaL_dostring(L, to_luastring(fs.readFileSync('a.lua', 'utf8')));

// Các API nguồn phụ (dạng success/data)
const extraApis = [
    { name: "RipIndra",      url: "http://fi11.bot-hosting.net:20758/api/name=RipIndra" },
    { name: "RipIndra",      url: "http://fi6.bot-hosting.net:21934/api?name=RipIndra" },
    { name: "Darkbeard",     url: "http://fi11.bot-hosting.net:20758/api/name=Darkbeard" },
    { name: "Darkbeard",     url: "http://fi6.bot-hosting.net:21934/api?name=Darkbeard" },
    { name: "Fullmoon",      url: "http://fi11.bot-hosting.net:20758/api/name=Fullmoon" },
    { name: "Fullmoon",      url: "http://fi6.bot-hosting.net:21934/api?name=Fullmoon" },
    { name: "DoughKing",     url: "http://fi11.bot-hosting.net:20758/api/name=DoughKing" },
    { name: "DoughKing",     url: "http://fi6.bot-hosting.net:21934/api?name=DoughKing" },
    { name: "CakePrince",    url: "http://fi11.bot-hosting.net:20758/api/name=CakePrince" },
    { name: "CakePrince",    url: "http://fi6.bot-hosting.net:21934/api?name=CakePrince" },
    { name: "CursedCaptain", url: "http://fi11.bot-hosting.net:20758/api/name=CursedCaptain" },
    { name: "CursedCaptain", url: "http://fi6.bot-hosting.net:21934/api?name=CursedCaptain" },
    { name: "Elite",         url: "http://fi11.bot-hosting.net:20758/api/name=Elite" },
    { name: "Elite",         url: "http://fi6.bot-hosting.net:21934/api?name=Elite" },
    { name: "Mirage",        url: "http://fi6.bot-hosting.net:21934/api?name=Mirage" },
    { name: "Mirage",        url: "http://fi11.bot-hosting.net:20758/api/name=Mirage" },
    { name: "CakeQueen",     url: "http://fi11.bot-hosting.net:20758/api/name=CakeQueen" },
];

// Nguồn API "noencode"
const apiCau3 = [
    { name: "FullMoon",      url: "http://160.187.246.8:9999/output/noencode/premium/fullmoon" },
    { name: "Elite",         url: "http://160.187.246.8:9999/output/noencode/premium/elite" },
    { name: "CakeQueen",     url: "http://160.187.246.8:9999/output/noencode/premium/cakequeen" },
    { name: "RipIndra",      url: "http://160.187.246.8:9999/output/noencode/premium/ripindra" },
    { name: "CakePrince",    url: "http://160.187.246.8:9999/output/noencode/premium/cakeprince" },
    { name: "CursedCaptain", url: "http://160.187.246.8:9999/output/noencode/premium/cursedcaptain" },
    { name: "Mirage",        url: "http://160.187.246.8:9999/output/noencode/premium/mirage" },
    { name: "DoughKing",     url: "http://160.187.246.8:9999/output/noencode/premium/doughking" },
];

const bananaApi = 'https://raw.banana-hub.xyz/api/data/recent';

function pickField(item, candidates) {
    if (!item || typeof item !== 'object') return undefined;
    for (const c of candidates) {
        if (item[c] !== undefined && item[c] !== null) return item[c];
    }
    const norm = (s) => String(s).toLowerCase().replace(/_/g, '');
    const wanted = candidates.map(norm);
    for (const key of Object.keys(item)) {
        if (wanted.includes(norm(key)) && item[key] !== undefined && item[key] !== null) {
            return item[key];
        }
    }
    return undefined;
}

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

function parseLooseJsonArray(text) {
    if (!text) return [];
    text = text.trim();
    if (!text) return [];

    try {
        const parsed = JSON.parse(text);
        return Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) { }

    try {
        const wrapped = JSON.parse(`[${text}]`);
        return Array.isArray(wrapped) ? wrapped : [wrapped];
    } catch (e) { }

    const results = [];
    let depth = 0, start = -1;
    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (ch === '{') {
            if (depth === 0) start = i;
            depth++;
        } else if (ch === '}') {
            depth--;
            if (depth === 0 && start !== -1) {
                const chunk = text.slice(start, i + 1);
                try {
                    results.push(JSON.parse(chunk));
                } catch (e) { }
                start = -1;
            }
        }
    }
    return results;
}

function saveToApi(name, dataList) {
    if (!fs.existsSync('api')) fs.mkdirSync('api');
    
    // Chuẩn hóa tên file: bỏ dấu cách, viết thường
    const fileName = `api/${name.replace(/\s+/g, '').toLowerCase()}.json`;
    
    // Đọc dữ liệu cũ để tránh ghi đè
    let existingData = [];
    if (fs.existsSync(fileName)) {
        try {
            existingData = JSON.parse(fs.readFileSync(fileName, 'utf8'));
            if (!Array.isArray(existingData)) existingData = [];
        } catch (e) { existingData = []; }
    }
    
    // Merge và lọc trùng jobId
    const allData = [...existingData, ...dataList];
    const seen = {};
    const unique = [];
    allData.forEach(item => {
        if (!seen[item.jobId]) {
            seen[item.jobId] = true;
            unique.push(item);
        }
    });
    
    fs.writeFileSync(fileName, JSON.stringify(unique, null, 2));
    console.log(`✅ Lưu ${unique.length} mục (thêm ${dataList.length} mới) → ${fileName}`);
}

async function updateAll() {
    console.log(`\n📡 [${new Date().toLocaleTimeString()}] Đang cập nhật dữ liệu...`);
    const allGroups = {};
    
    // 1. Nguồn chính (Banana)
    try {
        console.log("  ⏳ Lấy từ nguồn chính (Banana)...");
        const luaRes = await axios.get(bananaApi, {
            headers: { 'User-Agent': 'Roblox/WinInet' },
            timeout: 2000
        });
        
        if (luaRes.data?.data) {
            let count = 0;
            luaRes.data.data.forEach(item => {
                // Giải mã jobId
                lua.lua_getglobal(L, to_luastring('lebidlyjyf'));
                lua.lua_pushstring(L, to_luastring(item.jobid));
                if (lua.lua_pcall(L, 1, 1, 0) === 0) {
                    const decoded = lua.lua_tojsstring(L, -1);
                    // Lấy tên loại (chuẩn hóa)
                    let typeName = item.name;
                    // Map tên từ Banana sang tên chuẩn nếu cần
                    if (typeName === "FullMoon") typeName = "Fullmoon";
                    if (typeName === "Cake Queen") typeName = "CakeQueen";
                    if (typeName === "Cake Prince") typeName = "CakePrince";
                    if (typeName === "Cursed Captain") typeName = "CursedCaptain";
                    if (typeName === "Raid Castle") typeName = "RaidCastle";
                    
                    if (!allGroups[typeName]) allGroups[typeName] = [];
                    allGroups[typeName].push({
                        placeId: item.placeid || "27470683",
                        players: normalizePlayers(item.Players),
                        jobId: decoded || item.jobid
                    });
                    count++;
                    lua.lua_pop(L, 1);
                } else {
                    lua.lua_pop(L, 1);
                }
            });
            console.log(`  ✅ Nguồn chính: ${count} server`);
        }
    } catch (e) { 
        console.error(`  ❌ Lỗi nguồn chính:`, e.message); 
    }

    // 2. Nguồn phụ (extraApis)
    const fetchPromises = extraApis.map(async (api) => {
        try {
            const res = await fetch(api.url, {
                headers: {
                    'User-Agent': 'Roblox/WinInet',
                    'Accept': '*/*'
                },
                signal: AbortSignal.timeout(3000)
            });
            
            const json = await res.json();

            if (json?.success && json?.data) {
                if (!allGroups[api.name]) allGroups[api.name] = [];
                json.data.forEach(item => {
                    allGroups[api.name].push({
                        placeId: item.placeid || "27470683",
                        players: normalizePlayers(item.player || item.Players),
                        jobId: item.jobid || item.JobId
                    });
                });
                console.log(`  ✅ ${api.name}: ${json.count || json.data.length} server`);
            }
        } catch (e) {
            console.error(`  ❌ ${api.name}: ${e.message}`);
        }
    });

    // 3. Nguồn 103.77.241
    try {
        const res = await fetch('http://103.77.241.31:1901/server/api/moon?X-API-Key=trietgay_2mV0EbvgjwblbGTRxATml8RNDLgRR0l80wM5AM1M', {
            headers: {
                'User-Agent': 'Roblox/WinInet',
                'Accept': '*/*'
            },
            signal: AbortSignal.timeout(2000)
        });
        
        const json = await res.json();
        const sourceName = 'Fullmoon';

        if (json?.success && json?.data) {
            if (!allGroups[sourceName]) allGroups[sourceName] = [];
            json.data.forEach(item => {
                allGroups[sourceName].push({
                    placeId: item.PlaceId || "27470683",
                    players: normalizePlayers(item.Players),
                    jobId: item.JobId
                });
            });
            console.log(`  ✅ 103.77.241: ${json.count ?? json.data.length} server`);
        }
    } catch (e) {
        console.error(`  ❌ 103.77.241: ${e.message}`);
    }

    // 4. Nguồn noencode
    const noEncodeFetchPromises = apiCau3.map(async (api) => {
        try {
            const res = await fetch(api.url, {
                headers: {
                    'User-Agent': 'Roblox/WinInet',
                    'Accept': '*/*'
                },
                signal: AbortSignal.timeout(4000)
            });

            const text = await res.text();
            let list;
            try {
                const json = JSON.parse(text);
                list = Array.isArray(json) ? json : (json?.data || parseLooseJsonArray(text));
            } catch (e) {
                list = parseLooseJsonArray(text);
            }
            list = list.filter(item => pickField(item, ['Job_id', 'jobId', 'jobid', 'JobId']));

            if (list.length) {
                if (!allGroups[api.name]) allGroups[api.name] = [];
                list.forEach(item => {
                    allGroups[api.name].push({
                        placeId: pickField(item, ['place_id', 'placeId', 'placeid', 'PlaceId']) || "27470683",
                        players: normalizePlayers(pickField(item, ['player_count', 'players', 'Players', 'player', 'playerCount'])),
                        jobId: pickField(item, ['Job_id', 'jobId', 'jobid', 'JobId'])
                    });
                });
                console.log(`  ✅ ${api.name} (no): ${list.length} server`);
            } else {
                console.log(`  ⚠️ ${api.name} (no): không có dữ liệu hợp lệ`);
            }
        } catch (e) {
            console.error(`  ❌ ${api.name} (no): ${e.message}`);
        }
    });

    await Promise.allSettled([...fetchPromises, ...noEncodeFetchPromises]);

    // Gộp các nhóm và lưu
    const mergedGroups = {};
    for (const name in allGroups) {
        const key = name.replace(/\s+/g, '').toLowerCase();
        if (!mergedGroups[key]) mergedGroups[key] = [];
        mergedGroups[key].push(...allGroups[name]);
    }

    let totalSaved = 0;
    for (const name in mergedGroups) {
        saveToApi(name, mergedGroups[name]);
        totalSaved += mergedGroups[name].length;
    }

    const top = lua.lua_gettop(L);
    if (top > 0) lua.lua_settop(L, 0);

    console.log(`✨ Hoàn tất! Tổng ${totalSaved} server từ ${Object.keys(mergedGroups).length} nhóm\n`);
}

async function loop() {
    try {
        await updateAll();
    } catch (e) {
        console.error("❌ Lỗi vòng lặp:", e.message);
    }
    setTimeout(loop, 5000);
}

loop();
