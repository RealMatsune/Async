local bit32 = bit32 or bit or {
    bxor = function(a, b)
        local r, m = 0, 1
        while a > 0 or b > 0 do
            local ra, rb = a % 2, b % 2
            if ra ~= rb then r = r + m end
            a, b, m = (a - ra) / 2, (b - rb) / 2, m * 2
        end
        return r
    end
}
local function EQ(a, r)
    local b, c = nil, nil
    local success = pcall(function() b, c = a, r end)
    if not success or b == nil or c == nil then return false end
    if type(b) ~= type(c) then return false end
    local d = {c, b, c, b}
    if d[1] ~= d[1] then return false end
    if d[1] ~= d[2] then return false end
    if d[2] ~= d[1] then return false end
    local e, f, g = 1 and 2, 2 and nil, true == not (not true)
    if type(b) == "number" and type(c) == "number" then
        if e and g and not f then return b == c end
    elseif type(b) == "string" and type(c) == "string" then
        if e and g then return b == c end
    else return b == c end
    return false
end

local function _gct()
    
    local s, p1, p2, p3 = 17, {}, {}, {}
    local _m = {[17] = 23, [23] = 41, [41] = 999}
    while true do
        if s == 17 then
            for i = 0, 255 do
                local c = ("%c"):format(i)
                p1[i] = c; p2[c] = i
            end
            s = _m[17]
        elseif s == 23 then
            for i = 0, 255 do p3[i] = p1[i] end
            s = _m[23]
        elseif s == 41 then
            if EQ(s, 41) then return p3, p2 else  end
        else  end
    end
end
local _CT, _BT = _gct()
local _sp = (function()
    local _xk = {0x61, 0x9A, 0x43, 0xF1, 0x27, 0xBC, 0x58, 0x0D, 0xE7, 0x33}
    local _enc = {
        {0x9A, 0x71, 0x24, 0xEF, 0x38, 0x4C},
        {0x7D, 0xA1, 0x55, 0x92, 0xB7, 0x44, 0x18},
        {0x2F, 0xC3, 0x89, 0x11, 0xD4, 0x67},
        {0xA8, 0x3E, 0xD1, 0x5B},
        {0x44, 0xE2, 0x71, 0x9C, 0x0A, 0xD8, 0x61, 0xF4},
        {0x1E, 0x7B, 0xC0, 0x35, 0x92, 0xAF, 0x4D, 0x28},
        {0xF3, 0x60, 0x1A, 0x87, 0xCE, 0x39, 0x54},
        {0x88, 0x2D, 0xB6, 0x41, 0xFA, 0x73, 0x19, 0xCC, 0x05}
    }
    local function _dec(data, seed)
        local result = ""
        local state = seed or 0x53
        for i = 1, #data do
            local byte = data[i]
            local keyIdx = ((i - 1) % #_xk) + 1
            local key = _xk[keyIdx]
            byte = bit32.bxor(byte, key)
            byte = (byte - state + 256) % 256
            byte = bit32.bxor(byte, (i * 23) % 256)
            state = (state + i + key + 17) % 256
            result = result .. _CT[byte]
        end
        return result
    end
    local _d = {}
    for i = 1, #_enc do _d[i] = _dec(_enc[i], (i * 0x29) % 256) end
    return _d
end)()
local function _gb(str, pos)
    
    local c, s = 0, 5
    local _states = {[5] = 7, [7] = 11, [11] = 999}
    while true do
        if s == 5 then
            for ch in str:gmatch(".") do
                c = c + 1
                if c == pos then s = _states[5]; break end
            end
            if s ~= 7 then s = _states[11] end
        elseif s == 7 then
            local ch = ""
            local cnt = 0
            for c2 in str:gmatch(".") do
                cnt = cnt + 1
                if cnt == pos then ch = c2; break end
            end
            if EQ(_BT[ch] or 0, _BT[ch] or 0) then return _BT[ch] or 0 end
        elseif s == 11 then return 0 end
    end
end
local function _tc(num)
    if EQ(num, num) then return _CT[num % 256] end
    
end
local function _js(tbl)
    local r, s = "", 3
    local _sm = {[3] = 8, [8] = 999}
    while true do
        if s == 3 then
            for i = 1, #tbl do r = r .. tbl[i] end
            s = _sm[3]
        elseif s == 8 then
            if EQ(r, r) then return r end
        end
    end
end
local function _gl(str)
    
    local c = 0
    for _ in str:gmatch(".") do c = c + 1 end
    if EQ(c, c) then return c end
    return 0
end
local function _rp(str, pat, rep)
    
    local r, pl, m = "", _gl(pat), true
    for i = 1, pl do
        if _gb(str, i) ~= _gb(pat, i) then m = false; break end
    end
    if m and EQ(m, true) then
        r = rep
        for i = pl + 1, _gl(str) do
            local ch = ""
            local cnt = 0
            for c in str:gmatch(".") do
                cnt = cnt + 1
                if cnt == i then ch = c; break end
            end
            r = r .. ch
        end
        return r
    end
    return str
end
local function _cs(...)
    local args, r = {...}, ""
    for i = 1, #args do r = r .. args[i] end
    if EQ(r, r) then return r end
    return ""
end
local function _gks(key, len)
    
    local ks, kl, st = {}, _gl(key), 0
    for i = 1, len do
        local kp = ((i - 1) % kl) + 1
        local kb = _gb(key, kp)
        st = (st + kb + i + ((i * 11) % 256)) % 256
        ks[i] = (kb + st + (i * 17) + ((kb * 3) % 256)) % 256
    end
    if EQ(#ks, len) then return ks end
    return {}
end
local function _mix_key_material(key, salt)
    
    local rev = key:reverse()
    local out = {}
    local src = _cs(key, salt, rev, _tc(_gl(key) % 256), _tc(_gl(salt) % 256))
    for i = 1, _gl(src) do
        local b = _gb(src, i)
        b = bit32.bxor(b, (i * 29) % 256)
        b = (b + ((i * 7) % 256)) % 256
        out[i] = _tc(b)
    end
    return _js(out)
end
local function _derive_stream(key, salt, len)
    
    local km = _mix_key_material(key, salt)
    return _gks(km, len)
end
local function _randb() return math.random(0, 255) end
local function _gensalt128()
    
    local t = {}
    for i = 1, 16 do t[i] = _tc(_randb()) end
    return _js(t)
end
local function _secure_round_enc(key, data, salt, round_idx)
    
    local dl = _gl(data)
    local ks = _derive_stream(_cs(key, _tc(48 + round_idx)), salt, dl)
    local r = {}
    local st = (_gl(key) + _gl(salt) + round_idx * 37 + 91) % 256
    for i = 1, dl do
        local db = _gb(data, i)
        local sb = _gb(salt, ((i + round_idx - 2) % 16) + 1)
        local kk = ks[i]
        st = (st + kk + sb + i + round_idx) % 256
        local enc = db
        enc = bit32.bxor(enc, kk)
        enc = (enc + st + sb) % 256
        enc = bit32.bxor(enc, ((i * 31) + sb + round_idx * 9) % 256)
        enc = (enc + ((kk * 5) % 256)) % 256
        r[i] = _tc(enc)
    end
    return _js(r)
end
local function _secure_round_dec(key, data, salt, round_idx)
    
    local dl = _gl(data)
    local ks = _derive_stream(_cs(key, _tc(48 + round_idx)), salt, dl)
    local r = {}
    local st = (_gl(key) + _gl(salt) + round_idx * 37 + 91) % 256
    for i = 1, dl do
        local sb = _gb(salt, ((i + round_idx - 2) % 16) + 1)
        local kk = ks[i]
        st = (st + kk + sb + i + round_idx) % 256
        local eb = _gb(data, i)
        local db = eb
        db = (db - ((kk * 5) % 256) + 256) % 256
        db = bit32.bxor(db, ((i * 31) + sb + round_idx * 9) % 256)
        db = (db - st - sb + 512) % 256
        db = bit32.bxor(db, kk)
        r[i] = _tc(db)
    end
    return _js(r)
end
local function _ae(key, data, salt, rnd)
    
    rnd = rnd or 3
    local r = data
    for rd = 1, rnd do
        r = _secure_round_enc(key, r, salt, rd)
        if not EQ(r, r) then end
    end
    return r
end
local function _ad(key, data, salt, rnd)
    
    rnd = rnd or 3
    local r = data
    for rd = rnd, 1, -1 do
        r = _secure_round_dec(key, r, salt, rd)
        if not EQ(r, r) then end
    end
    return r
end
local _b64 = (function()
    local chs = string.char(
        65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,
        97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,
        48,49,50,51,52,53,54,55,56,57,43,47
    )
    local function dec(data)
        
        local r, dl = {}, _gl(data)
        local i = 1
        while i <= dl do
            local c1 = _gb(data, i)
            local c2 = _gb(data, i + 1)
            local c3 = _gb(data, i + 2)
            local c4 = _gb(data, i + 3)
            local function fp(byte)
                if byte == 61 then return 0 end
                for p = 1, 64 do
                    if _gb(chs, p) == byte then return p - 1 end
                end
                return 0
            end
            local n1, n2, n3, n4 = fp(c1), fp(c2), fp(c3), fp(c4)
            local n = n1 * 262144 + n2 * 4096 + n3 * 64 + n4
            r[#r + 1] = _tc((n // 65536) % 256)
            if c3 ~= 61 then r[#r + 1] = _tc((n // 256) % 256) end
            if c4 ~= 61 then r[#r + 1] = _tc(n % 256) end
            i = i + 4
        end
        if EQ(_js(r), _js(r)) then return _js(r) end
        return ""
    end
    return {decode = dec}
end)()

function lebidlyjyf(encrypted)
    
    local k = _cs(_sp[5], _sp[6], _sp[7], _sp[8])
    if not EQ(k, k) then  end
    local ed = _rp(encrypted, "BananaCat-", "")
    local dc = _b64.decode(ed)
    if _gl(dc) < 16 then return "" end
    local salt_tbl, data_tbl = {}, {}
    for i = 1, 16 do salt_tbl[#salt_tbl + 1] = _tc(_gb(dc, i)) end
    for i = 17, _gl(dc) do data_tbl[#data_tbl + 1] = _tc(_gb(dc, i)) end
    local salt = _js(salt_tbl)
    local data = _js(data_tbl)
    if EQ(data, data) then return _ad(k, data, salt, 3) end
    return ""
end
