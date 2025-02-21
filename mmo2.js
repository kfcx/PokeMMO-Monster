const API_URL = 'https://mmo.ydev.tech/monster/current';
const REFRESH_INTERVAL = 10 * 60 * 1000; // 10分钟
let lastFetchTime = 0;

// 修改fetchMonsterData函数，使用localStorage作为缓存
async function fetchMonsterData() {
    const CACHE_KEY = 'pokemmo_monster_data';
    const CACHE_DURATION = 30 * 60 * 1000; // 30分钟缓存时间

    try {
        // 检查是否有缓存数据
        const cachedData = localStorage.getItem(CACHE_KEY);
        if (cachedData) {
            const cache = JSON.parse(cachedData);
            // 检查缓存是否过期
            if (Date.now() - cache.timestamp < CACHE_DURATION) {
                console.log('使用缓存数据，剩余有效期：',
                    Math.floor((CACHE_DURATION - (Date.now() - cache.timestamp)) / 60000), '分钟');
                return cache.data;
            }
        }

        // 缓存不存在或已过期，从API获取新数据
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // 数据格式转换，确保与现有结构匹配
        const formattedData = data.map(item => ({
            ...item,
            // 确保时间相关字段为数字类型
            startHour: parseInt(item.startHour),
            startMinute: parseInt(item.startMinute),
            endHour: parseInt(item.endHour),
            endMinute: parseInt(item.endMinute),
            // 确保 ID 相关字段为数字类型
            monsterId: parseInt(item.monsterId),
            regionId: parseInt(item.regionId),
            move1Id: parseInt(item.move1Id),
            move2Id: parseInt(item.move2Id),
            move3Id: parseInt(item.move3Id),
            move4Id: parseInt(item.move4Id),
            alphaTimeId: parseInt(item.alphaTimeId)
        }));

        // 保存到缓存
        localStorage.setItem(CACHE_KEY, JSON.stringify({
            timestamp: Date.now(),
            data: formattedData
        }));
        return formattedData;
    } catch (error) {
        console.error('获取数据失败:', error);

        // 获取失败时，尝试使用过期的缓存数据
        const expiredCache = localStorage.getItem(CACHE_KEY);
        if (expiredCache) {
            console.warn('使用过期的缓存数据');
            return JSON.parse(expiredCache).data;
        }

        // 如果连过期数据都没有，使用默认数据
        return null;
    }
}

function shouldRefreshData() {
    const now = Date.now();
    return !lastFetchTime || (now - lastFetchTime) >= REFRESH_INTERVAL;
}

const regionNames = {
    0: "关都",
    1: "丰源",
    2: "合众",
    3: "神奥",
    4: "城都"
};

// 模拟数据加载 - 这里我们直接使用硬编码的数据
const monsterData = [
    {
        "userId": "1881316780629635074",
        "userIgn": "XDGGDD",
        "date": "2025-02-21",
        "startHour": 15,
        "startMinute": 29,
        "endHour": 16,
        "endMinute": 44,
        "timeUncheck": false,
        "monsterId": 49,
        "regionId": 0,
        "locationName": "10号道路",
        "hmId": 0,
        "move1Id": 405,
        "move2Id": 390,
        "move3Id": 18,
        "move4Id": 355,
        "alphaTimeId": 2,
        "text": "[09:29~~10:44][头目:摩鲁蛾][梦特:奇迹皮肤]虫鸣, 毒菱, 吹飞, 羽栖[10号道路][报点人:XDGGDD]",
        "itemCosmeticConfigUrl": "https://cdn.api.pokemmo.com.cn/static/dress/2/2/0/2174/0/1443/0/0/1312d7/0/1317d7/1326d0/2241.png"
    },
    {
        "id": "1892725672005677057",
        "userId": "1881316780629635074",
        "userIgn": "XDGGDD",
        "date": "2025-02-21",
        "startHour": 4,
        "startMinute": 47,
        "endHour": 6,
        "endMinute": 2,
        "timeUncheck": false,
        "monsterId": 264,
        "regionId": 1,
        "locationName": "102号道路",
        "hmId": 0,
        "move1Id": 34,
        "move2Id": 402,
        "move3Id": 421,
        "move4Id": 187,
        "alphaTimeId": 1,
        "text": "[04:47~~06:02][头目:直冲熊][梦特:飞毛腿]泰山压顶, 种子炸弹, 暗影爪, 腹鼓[102号道路][报点人:XDGGDD]",
        "itemCosmeticConfigUrl": "https://cdn.api.pokemmo.com.cn/static/dress/2/2/0/2174/0/1443/0/0/1312d7/0/1317d7/1326d0/2241.png"
    },
];

// 宝可梦数据
const pokemonTypes = {
    49: {
        name: "摩鲁蛾",
        type: "bug",
        img: "https://www.serebii.net/pokemongo/pokemon/049.png",
        ability: "奇迹皮肤"
    },
    264: {
        name: "直冲熊",
        type: "normal",
        img: "https://www.serebii.net/pokemongo/pokemon/264.png",
        ability: "飞毛腿"
    }
};

// 技能数据
const moveNames = {1: '拍击', 2: '空手劈', 3: '连环巴掌', 4: '连续拳', 5: '百万吨重拳', 6: '聚宝功', 7: '火焰拳', 8: '冰冻拳', 9: '雷电拳', 10: '抓', 11: '夹住', 12: '极落钳', 13: '旋风刀', 14: '剑舞', 15: '居合劈', 16: '起风', 17: '翅膀攻击', 18: '吹飞', 19: '飞翔', 20: '绑紧', 21: '摔打', 22: '藤鞭', 23: '踩踏', 24: '二连踢', 25: '百万吨重踢', 26: '飞踢', 27: '回旋踢', 28: '泼沙', 29: '头锤', 30: '角撞', 31: '乱击', 32: '角钻', 33: '撞击', 34: '泰山压顶', 35: '紧束', 36: '猛撞', 37: '大闹一番', 38: '舍身冲撞', 39: '摇尾巴', 40: '毒针', 41: '双针', 42: '飞弹针', 43: '瞪眼', 44: '咬住', 45: '叫声', 46: '吼叫', 47: '唱歌', 48: '超音波', 49: '音爆', 50: '定身法', 51: '溶解液', 52: '火花', 53: '喷射火焰', 54: '白雾', 55: '水枪', 56: '水炮', 57: '冲浪', 58: '冰冻光束', 59: '暴风雪', 60: '幻象光线', 61: '泡沫光线', 62: '极光束', 63: '破坏光线', 64: '啄', 65: '啄钻', 66: '深渊翻滚', 67: '踢倒', 68: '双倍奉还', 69: '地球上投', 70: '怪力', 71: '吸取', 72: '超级吸取', 73: '寄生种子', 74: '生长', 75: '飞叶快刀', 76: '日光束', 77: '毒粉', 78: '麻痹粉', 79: '催眠粉', 80: '花瓣舞', 81: '吐丝', 82: '龙之怒', 83: '火焰旋涡', 84: '电击', 85: '十万伏特', 86: '电磁波', 87: '打雷', 88: '落石', 89: '地震', 90: '地裂', 91: '挖洞', 92: '剧毒', 93: '念力', 94: '精神强念', 95: '催眠术', 96: '瑜伽姿势', 97: '高速移动', 98: '电光一闪', 99: '愤怒', 100: '瞬间移动', 101: '黑夜魔影', 102: '模仿', 103: '刺耳声', 104: '影子分身', 105: '自我再生', 106: '变硬', 107: '变小', 108: '烟幕', 109: '奇异之光', 110: '缩入壳中', 111: '变圆', 112: '屏障', 113: '光墙', 114: '黑雾', 115: '反射壁', 116: '聚气', 117: '忍耐', 118: '挥指', 119: '鹦鹉学舌', 120: '玉石俱碎', 121: '炸蛋', 122: '舌舔', 123: '浊雾', 124: '污泥攻击', 125: '骨棒', 126: '大字爆炎', 127: '攀瀑', 128: '贝壳夹击', 129: '高速星星', 130: '火箭头锤', 131: '尖刺加农炮', 132: '缠绕', 133: '瞬间失忆', 134: '折弯汤匙', 135: '生蛋', 136: '飞膝踢', 137: '大蛇瞪眼', 138: '食梦', 139: '毒瓦斯', 140: '投球', 141: '汲取', 142: '恶魔之吻', 143: '神鸟猛击', 144: '变身', 145: '泡沫', 146: '迷昏拳', 147: '蘑菇孢子', 148: '闪光', 149: '精神波', 150: '跃起', 151: '溶化', 152: '蟹钳锤', 153: '大爆炸', 154: '乱抓', 155: '骨头回力镖', 156: '睡觉', 157: '岩崩', 158: '终结门牙', 159: '棱角化', 160: '纹理', 161: '三重攻击', 162: '愤怒门牙', 163: '劈开', 164: '替身', 165: '挣扎', 166: '写生', 167: '三连踢', 168: '小偷', 169: '蛛网', 170: '心之眼', 171: '恶梦', 172: '火焰轮', 173: '打鼾', 174: '咒术', 175: '抓狂', 176: '纹理2', 177: '气旋攻击', 178: '棉孢子', 179: '绝处逢生', 180: '怨恨', 181: '细雪', 182: '守住', 183: '音速拳', 184: '可怕面孔', 185: '出奇一击', 186: '天使之吻', 187: '腹鼓', 188: '污泥炸弹', 189: '掷泥', 190: '章鱼桶炮', 191: '撒菱', 192: '电磁炮', 193: '识破', 194: '同命', 195: '终焉之歌', 196: '冰冻之风', 197: '看穿', 198: '骨棒乱打', 199: '锁定', 200: '逆鳞', 201: '沙暴', 202: '终极吸取', 203: '挺住', 204: '撒娇', 205: '滚动', 206: '点到为止', 207: '虚张声势', 208: '喝牛奶', 209: '电光', 210: '连斩', 211: '钢翼', 212: '黑色目光', 213: '迷人', 214: '梦话', 215: '治愈铃声', 216: '报恩', 217: '礼物', 218: '迁怒', 219: '神秘守护', 220: '分担痛楚', 221: '神圣之火', 222: '震级', 223: '爆裂拳', 224: '超级角击', 225: '龙息', 226: '接棒', 227: '再来一次', 228: '追打', 229: '高速旋转', 230: '甜甜香气', 231: '铁尾', 232: '金属爪', 233: '借力摔', 234: '晨光', 235: '光合作用', 236: '月光', 237: '觉醒力量', 238: '十字劈', 239: '龙卷风', 240: '求雨', 241: '大晴天', 242: '咬碎', 243: '镜面反射', 244: '自我暗示', 245: '神速', 246: '原始之力', 247: '暗影球', 248: '预知未来', 249: '碎岩', 250: '潮旋', 251: '围攻', 252: '击掌奇袭', 253: '吵闹', 254: '蓄力', 255: '喷出', 256: '吞下', 257: '热风', 258: '冰雹', 259: '无理取闹', 260: '吹捧', 261: '磷火', 262: '临别礼物', 263: '硬撑', 264: '真气拳', 265: '清醒', 266: '看我嘛', 267: '自然之力', 268: '充电', 269: '挑衅', 270: '帮助', 271: '戏法', 272: '扮演', 273: '祈愿', 274: '借助', 275: '扎根', 276: '蛮力', 277: '魔法反射', 278: '回收利用', 279: '报复', 280: '劈瓦', 281: '哈欠', 282: '拍落', 283: '蛮干', 284: '喷火', 285: '特性互换', 286: '封印', 287: '焕然一新', 288: '怨念', 289: '化为己用', 290: '秘密之力', 291: '潜水', 292: '猛推', 293: '保护色', 294: '萤火', 295: '洁净光芒', 296: '薄雾球', 297: '羽毛舞', 298: '摇晃舞', 299: '火焰踢', 300: '玩泥巴', 301: '冰球', 302: '尖刺臂', 303: '偷懒', 304: '巨声', 305: '剧毒牙', 306: '撕裂爪', 307: '爆炸烈焰', 308: '加农水炮', 309: '彗星拳', 310: '惊吓', 311: '气象球', 312: '芳香治疗', 313: '假哭', 314: '空气利刃', 315: '过热', 316: '气味侦测', 317: '岩石封锁', 318: '银色旋风', 319: '金属音', 320: '草笛', 321: '挠痒', 322: '宇宙力量', 323: '喷水', 324: '信号光束', 325: '暗影拳', 326: '神通力', 327: '冲天拳', 328: '流沙深渊', 329: '绝对零度', 330: '浊流', 331: '种子机关枪', 332: '燕返', 333: '冰锥', 334: '铁壁', 335: '挡路', 336: '长嚎', 337: '龙爪', 338: '疯狂植物', 339: '健美', 340: '弹跳', 341: '泥巴射击', 342: '毒尾', 343: '渴望', 344: '伏特攻击', 345: '魔法叶', 346: '玩水', 347: '冥想', 348: '叶刃', 349: '龙之舞', 350: '岩石爆击', 351: '电击波', 352: '水之波动', 353: '破灭之愿', 354: '精神突进', 355: '羽栖', 356: '重力', 357: '奇迹之眼', 358: '唤醒巴掌', 359: '臂锤', 360: '陀螺球', 361: '治愈之愿', 362: '盐水', 363: '自然之恩', 364: '佯攻', 365: '啄食', 366: '顺风', 367: '点穴', 368: '金属爆炸', 369: '急速折返', 370: '近身战', 371: '以牙还牙', 372: '恶意追击', 373: '查封', 374: '投掷', 375: '精神转移', 376: '王牌', 377: '回复封锁', 378: '绞紧', 379: '力量戏法', 380: '胃液', 381: '幸运咒语', 382: '抢先一步', 383: '仿效', 384: '力量互换', 385: '防守互换', 386: '惩罚', 387: '珍藏', 388: '烦恼种子', 389: '突袭', 390: '毒菱', 391: '心灵互换', 392: '水流环', 393: '电磁飘浮', 394: '闪焰冲锋', 395: '发劲', 396: '波导弹', 397: '岩石打磨', 398: '毒击', 399: '恶之波动', 400: '暗袭要害', 401: '水流尾', 402: '种子炸弹', 403: '空气之刃', 404: '十字剪', 405: '虫鸣', 406: '龙之波动', 407: '龙之俯冲', 408: '力量宝石', 409: '吸取拳', 410: '真空波', 411: '真气弹', 412: '能量球', 413: '勇鸟猛攻', 414: '大地之力', 415: '掉包', 416: '终极冲击', 417: '诡计', 418: '子弹拳', 419: '雪崩', 420: '冰砾', 421: '暗影爪', 422: '雷电牙', 423: '冰冻牙', 424: '火焰牙', 425: '影子偷袭', 426: '泥巴炸弹', 427: '精神利刃', 428: '意念头锤', 429: '镜光射击', 430: '加农光炮', 431: '攀岩', 432: '清除浓雾', 433: '戏法空间', 434: '流星群', 435: '放电', 436: '喷烟', 437: '飞叶风暴', 438: '强力鞭打', 439: '岩石炮', 440: '十字毒刃', 441: '垃圾射击', 442: '铁头', 443: '磁铁炸弹', 444: '尖石攻击', 445: '诱惑', 446: '隐形岩', 447: '打草结', 448: '喋喋不休', 449: '制裁光砾', 450: '虫咬', 451: '充电光束', 452: '木槌', 453: '水流喷射', 454: '攻击指令', 455: '防御指令', 456: '回复指令', 457: '双刃头锤', 458: '二连击', 459: '时光咆哮', 460: '亚空裂斩', 461: '新月舞', 462: '捏碎', 463: '熔岩风暴', 464: '暗黑洞', 465: '种子闪光', 466: '奇异之风', 467: '暗影潜袭', 468: '磨爪', 469: '广域防守', 470: '防守平分', 471: '力量平分', 472: '奇妙空间', 473: '精神冲击', 474: '毒液冲击', 475: '身体轻量化', 476: '愤怒粉', 477: '意念移物', 478: '魔法空间', 479: '击落', 480: '山岚摔', 481: '烈焰溅射', 482: '污泥波', 483: '蝶舞', 484: '重磅冲撞', 485: '同步干扰', 486: '电球', 487: '浸水', 488: '蓄能焰袭', 489: '盘蜷', 490: '下盘踢', 491: '酸液炸弹', 492: '移花接木', 493: '单纯光束', 494: '找伙伴', 495: '您先请', 496: '轮唱', 497: '回声', 498: '逐步击破', 499: '清除之烟', 500: '辅助力量', 501: '快速防守', 502: '交换场地', 503: '热水', 504: '破壳', 505: '治愈波动', 506: '祸不单行', 507: '自由落体', 508: '换挡', 509: '巴投', 510: '烧净', 511: '延后', 512: '杂技', 513: '镜面属性', 514: '报仇', 515: '搏命', 516: '传递礼物', 517: '烈火深渊', 518: '水之誓约', 519: '火之誓约', 520: '草之誓约', 521: '伏特替换', 522: '虫之抵抗', 523: '重踏', 524: '冰息', 525: '龙尾', 526: '自我激励', 527: '电网', 528: '疯狂伏特', 529: '直冲钻', 530: '二连劈', 531: '爱心印章', 532: '木角', 533: '圣剑', 534: '贝壳刃', 535: '高温重压', 536: '青草搅拌器', 537: '疯狂滚压', 538: '棉花防守', 539: '暗黑爆破', 540: '精神击破', 541: '扫尾拍打', 542: '暴风', 543: '爆炸头突击', 544: '齿轮飞盘', 545: '火焰弹', 546: '高科技光炮', 547: '古老之歌', 548: '神秘之剑', 549: '冰封世界', 550: '雷击', 551: '青焰', 552: '火之舞', 553: '冰冻伏特', 554: '极寒冷焰', 555: '大声咆哮', 556: '冰柱坠击', 557: 'V热焰', 558: '交错火焰', 559: '交错闪电', 1000: '不给糖就捣乱', 1001: '炽热梦境', 1004: '残酷掠夺', 1006: '幻影打击', 1007: '摄魂术', 1008: '狂暴冲击', 1009: '咔砰!', 1010: '精灵驱逐', 1011: '贪婪吞咽', 1012: '幽灵视角', 1013: '瘴气', 1014: '下拽', 1015: '噬灭', 1017: '蹦得再高点!', 1018: '蹦得真高啊!'};

// 时段名称
const alphaTimeNames = {
    1: "清晨", // 5:00-8:59
    2: "上午", // 9:00-11:59
    3: "中午", // 12:00-13:59
    4: "下午", // 14:00-16:59
    5: "傍晚", // 17:00-19:59
    6: "晚上", // 20:00-22:59
    7: "深夜"  // 23:00-4:59
};

// 添加时间段判断函数
function getAlphaTimeId(hour) {
    if (hour >= 5 && hour < 9) return 1;
    if (hour >= 9 && hour < 12) return 2;
    if (hour >= 12 && hour < 14) return 3;
    if (hour >= 14 && hour < 17) return 4;
    if (hour >= 17 && hour < 20) return 5;
    if (hour >= 20 && hour < 23) return 6;
    return 7; // 23:00-4:59
}

// 格式化时间
function formatTime(hour, minute) {
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

// 获取持续时间（分钟）
function getDuration(startHour, startMinute, endHour, endMinute) {
    const startTotal = startHour * 60 + startMinute;
    const endTotal = endHour * 60 + endMinute;
    return endTotal - startTotal;
}

// 计算剩余时间
function getRemainingTime(endHour, endMinute) {
    const now = new Date();
    const end = new Date();
    end.setHours(endHour, endMinute, 0);

    if (end < now) {
        return {text: "已结束", status: "ended"};
    }

    const diff = end - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    let statusClass = "active";
    if (diff < 15 * 60 * 1000) { // 少于15分钟
        statusClass = "urgent";
    }

    return {
        text: `剩余 ${hours}小时 ${minutes}分钟`,
        status: statusClass
    };
}

// 检查是否活跃
function isActive(endHour, endMinute) {
    const now = new Date();
    const end = new Date();
    end.setHours(endHour, endMinute, 0);
    return end > now;
}

// 更新统计数据
function updateStats(monsters) {
    const activeCount = monsters.filter(m =>
        isActive(m.endHour, m.endMinute)
    ).length;
    document.getElementById('active-count').textContent = activeCount;
    document.getElementById('total-count').textContent = monsters.length;
    const locations = {};
    monsters.forEach(m => {
        const region = regionNames[m.regionId] || "未知地区";
        locations[`${region} ${m.locationName}`] = (locations[m.locationName] || 0) + 1;
    });

    const commonLocation = Object.keys(locations).sort((a, b) =>
        locations[b] - locations[a]
    )[0] || "无数据";

    document.getElementById('common-location').textContent = commonLocation;
}

// 渲染宝可梦卡片
function renderMonsterCards(monsters) {
    const container = document.getElementById("monster-container");

    if (!monsters || monsters.length === 0) {
        container.innerHTML = '<div class="no-data">暂无报点数据</div>';
        return;
    }

    container.innerHTML = monsters.map(monster => {
        const pokemon = pokemonTypes[monster.monsterId] || {
            name: `未知宝可梦(#${monster.monsterId})`,
            type: "normal",
            img: "",
            ability: "未知"
        };
        const startTime = formatTime(monster.startHour, monster.startMinute);
        const endTime = formatTime(monster.endHour, monster.endMinute);
        const duration = getDuration(monster.startHour, monster.startMinute, monster.endHour, monster.endMinute);
        const remaining = getRemainingTime(monster.endHour, monster.endMinute);
        const regionName = regionNames[monster.regionId] || "未知地区";

        // 确定状态类和图标
        let statusClass = "active";
        let statusIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
        let statusColor = "#2ecc71";

        if (remaining.status === "ended") {
            statusClass = "ended";
            statusIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
            statusColor = "#e74c3c";
        } else if (remaining.status === "urgent") {
            statusClass = "urgent";
            statusIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
            statusColor = "#f39c12";
        }

        return `
        <div class="monster-card">
            <div class="monster-header type-${pokemon.type}">
                <div class="monster-img">
                    <img src="${pokemon.img}" alt="${pokemon.name}" onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png'">
                </div>
                <div class="monster-info">
                    <div class="monster-name">${pokemon.name}</div>
                    <div class="monster-location">
                        <span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            ${monster.locationName}
                        </span>
                        <span class="region-badge">${regionName}</span>
                    </div>
                </div>
                <div class="monster-time">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    ${startTime} - ${endTime}
                </div>
            </div>

          <div class="monster-details">
            <div class="monster-status" style="background-color: ${statusColor}20; border-left-color: ${statusColor};">
              <div class="status-icon" style="color: ${statusColor};">
                ${statusIcon}
              </div>
              <div class="status-text">${remaining.text}</div>
            </div>

            <div class="monster-meta">
              <div class="monster-meta-item">
                <div class="monster-meta-label">持续时间</div>
                <div class="monster-meta-value">${duration}分钟</div>
              </div>
              <div class="monster-meta-item">
                <div class="monster-meta-label">时段</div>
                <div class="monster-meta-value">${alphaTimeNames[getAlphaTimeId(monster.endHour)] || "未知"}</div>
              </div>
              <div class="monster-meta-item">
                <div class="monster-meta-label">特性</div>
                <div class="monster-meta-value">${pokemon.ability}</div>
              </div>
            </div>

            <div class="monster-moves">
              <div class="monster-moves-title">技能列表</div>
              <div class="move-grid">
                <div class="move-item">${moveNames[monster.move1Id] || `技能#${monster.move1Id}`}</div>
                <div class="move-item">${moveNames[monster.move2Id] || `技能#${monster.move2Id}`}</div>
                <div class="move-item">${moveNames[monster.move3Id] || `技能#${monster.move3Id}`}</div>
                <div class="move-item">${moveNames[monster.move4Id] || `技能#${monster.move4Id}`}</div>
              </div>
            </div>
          </div>

          <div class="monster-footer">
            <div class="time-badge" style="
                background: linear-gradient(135deg, #3a5dd9, #00b4d8);
                color: white;
                padding: 6px 12px;
                border-radius: 6px;
                font-size: 0.85rem;
                font-weight: 600;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                text-shadow: 0 1px 2px rgba(0,0,0,0.1);
            ">${monster.date}</div>
            <div class="reporter">
                <div class="reporter-avatar">
                    <img src="${monster.itemCosmeticConfigUrl}" alt="${monster.userIgn}" style="
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                        border-radius: 50%;
                    ">
                </div>
                <div class="reported-by">报点人: ${monster.userIgn}</div>
            </div>
        </div>
        </div>
      `;
    }).join('');
}

// 渲染时间分布图表
function renderTimeDistributionChart(monsters) {
    const ctx = document.getElementById('timeDistributionChart').getContext('2d');

    // 修改标签显示，加入地区信息
    const labels = monsters.map(m => {
        const pokemon = pokemonTypes[m.monsterId] || {name: `未知(#${m.monsterId})`};
        return pokemon.name;
    });

    const startTimes = monsters.map(m => m.startHour * 60 + m.startMinute);

    // 创建图表
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: '出现时间 (分钟)',
                data: startTimes,
                backgroundColor: monsters.map(m => {
                    const pokemon = pokemonTypes[m.monsterId] || {type: "normal"};
                    return getTypeColor(pokemon.type, 0.7);
                }),
                borderColor: monsters.map(m => {
                    const pokemon = pokemonTypes[m.monsterId] || {type: "normal"};
                    return getTypeColor(pokemon.type, 1);
                }),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 24 * 60,
                    ticks: {
                        callback: function (value) {
                            const hours = Math.floor(value / 60);
                            const minutes = value % 60;
                            return formatTime(hours, minutes);
                        },
                        stepSize: 120
                    },
                    title: {
                        display: true,
                        text: '出现时间'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: '宝可梦'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        title: function (context) {
                            const index = context[0].dataIndex;
                            const m = monsters[index];
                            const pokemon = pokemonTypes[m.monsterId] || {name: `未知(#${m.monsterId})`};
                            const region = regionNames[m.regionId] || "未知地区";
                            return `${pokemon.name} (${region}-${m.locationName})`;
                        },
                        label: function (context) {
                            const value = context.parsed.y;
                            const hours = Math.floor(value / 60);
                            const minutes = value % 60;
                            return `出现时间: ${formatTime(hours, minutes)}`;
                        },
                        afterLabel: function (context) {
                            const index = context.dataIndex;
                            const m = monsters[index];
                            const endTime = formatTime(m.endHour, m.endMinute);
                            const duration = getDuration(m.startHour, m.startMinute, m.endHour, m.endMinute);
                            return [
                                `结束时间: ${endTime}`,
                                `持续时间: ${duration}分钟`,
                                `报点人: ${m.userIgn}`
                            ];
                        }
                    }
                }
            }
        }
    });
}

// 渲染持续时间图表
function renderDurationChart(monsters) {
    const ctx = document.getElementById('durationChart').getContext('2d');

    // 提取数据
    const durations = monsters.map(m => {
        return getDuration(m.startHour, m.startMinute, m.endHour, m.endMinute);
    });

    // 修改标签显示，加入地区信息
    const labels = monsters.map(m => {
        const pokemon = pokemonTypes[m.monsterId] || {name: `未知(#${m.monsterId})`};
        return pokemon.name;
    });

    // 创建图表 - 修复horizontalBar的问题，使用bar类型并设置indexAxis为'y'
    new Chart(ctx, {
        type: 'bar', // 改用标准bar类型
        data: {
            labels: labels,
            datasets: [{
                label: '持续时间 (分钟)',
                data: durations,
                backgroundColor: monsters.map(m => {
                    const pokemon = pokemonTypes[m.monsterId] || {type: "normal"};
                    return getTypeColor(pokemon.type, 0.7);
                }),
                borderColor: monsters.map(m => {
                    const pokemon = pokemonTypes[m.monsterId] || {type: "normal"};
                    return getTypeColor(pokemon.type, 1);
                }),
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y', // 水平方向的条形图
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '持续时间 (分钟)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: '宝可梦'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `持续时间: ${context.parsed.x} 分钟`;
                        },
                        afterLabel: function (context) {
                            const index = context.dataIndex;
                            const m = monsters[index];
                            const startTime = formatTime(m.startHour, m.startMinute);
                            const endTime = formatTime(m.endHour, m.endMinute);
                            return [
                                `时间段: ${startTime} - ${endTime}`,
                                `报点人: ${m.userIgn}`
                            ];
                        }
                    }
                }
            }
        }
    });
}

// 更新计时器状态
function updateTimerStatus(monsters) {
    const now = new Date();
    const container = document.getElementById('timer-status');

    // 查找当前正在进行的事件
    const activeMonsters = monsters.filter(m => {
        const end = new Date();
        end.setHours(m.endHour, m.endMinute, 0);
        return end > now;
    });

    if (activeMonsters.length === 0) {
        container.innerHTML = `
    <div class="timer-icon" style="background-color: #e74c3c;">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
    </div>
    <div class="timer-info">
      <div class="timer-title">当前没有进行中的头目</div>
      <div class="timer-subtitle">最近的报点已经结束，请等待新的报点信息</div>
    </div>
  `;
        // 修改边框颜色
        container.style.borderLeftColor = "#e74c3c";
        return;
    }

    // 按结束时间排序，获取最快结束的事件
    activeMonsters.sort((a, b) => {
        const endA = a.endHour * 60 + a.endMinute;
        const endB = b.endHour * 60 + b.endMinute;
        return endA - endB;
    });

    const nextEnd = activeMonsters[0];
    const pokemon = pokemonTypes[nextEnd.monsterId] || {name: `未知宝可梦(#${nextEnd.monsterId})`};
    const region = regionNames[nextEnd.regionId] || "未知地区";
    const remaining = getRemainingTime(nextEnd.endHour, nextEnd.endMinute);
    const startTime = formatTime(nextEnd.startHour, nextEnd.startMinute);
    const endTime = formatTime(nextEnd.endHour, nextEnd.endMinute);

    let timerColor = "#2ecc71";
    let statusIcon = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 2px 3px rgba(0,0,0,0.2));">
            <circle cx="12" cy="12" r="8"/>
            <path d="M12 8v4l3 1.5"/>
        </svg>`;
    if (remaining.status === "urgent") {
        timerColor = "#f39c12";
        statusIcon = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 2px 3px rgba(0,0,0,0.2));">
                <path d="M12 8v4M12 16h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>`;
    }

    container.innerHTML = `
        <div class="timer-icon" style="background: linear-gradient(135deg, ${timerColor}, ${timerColor}dd); box-shadow: 0 3px 10px ${timerColor}40;">
            ${statusIcon}
        </div>
        <div class="timer-info">
            <div class="timer-title" style="font-size: 1.25rem; margin-bottom: 8px;">
                <span style="color: ${timerColor}; font-weight: bold; text-shadow: 0 1px 2px ${timerColor}20;">${pokemon.name}</span>
                正在
                <span style="color: ${timerColor}; font-weight: bold; text-shadow: 0 1px 2px ${timerColor}20;">${region}-${nextEnd.locationName}</span>
                出现！
            </div>
            <div class="timer-subtitle" style="display: flex; flex-direction: column; gap: 6px; opacity: 0.9;">
                <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="color: ${timerColor};">⏰</span>
                    出现时间：${startTime} - ${endTime}
                </div>
                <div style="display: flex; align-items: center; gap: 6px; color: ${timerColor}; font-weight: 600;">
                    <span>⚠️</span>
                    ${remaining.text}
                </div>
                <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="color: ${timerColor};">👤</span>
                    报点人：${nextEnd.userIgn}
                </div>
            </div>
        </div>
    `;

    // 修改容器样式
    container.style.borderLeftColor = timerColor;
    container.style.borderLeftWidth = "5px";
    container.style.background = `linear-gradient(to right, ${timerColor}08, white)`;
    container.style.boxShadow = "0 4px 15px rgba(0,0,0,0.05)";
}

// 获取宝可梦类型颜色
function getTypeColor(type, alpha = 1) {
    const colors = {
        normal: `rgba(168, 168, 120, ${alpha})`,
        fire: `rgba(240, 128, 48, ${alpha})`,
        water: `rgba(104, 144, 240,${alpha})`,
        grass: `rgba(120, 200, 80, ${alpha})`,
        electric: `rgba(248, 208, 48, ${alpha})`,
        ice: `rgba(152, 216, 216, ${alpha})`,
        fighting: `rgba(192, 48, 40, ${alpha})`,
        poison: `rgba(160, 64, 160, ${alpha})`,
        ground: `rgba(224, 192, 104, ${alpha})`,
        flying: `rgba(168, 144, 240, ${alpha})`,
        psychic: `rgba(248, 88, 136, ${alpha})`,
        bug: `rgba(168, 184, 32, ${alpha})`,
        rock: `rgba(184, 160, 56, ${alpha})`,
        ghost: `rgba(112, 88, 152, ${alpha})`,
        dragon: `rgba(112, 56, 248, ${alpha})`,
        dark: `rgba(112, 88, 72, ${alpha})`,
        steel: `rgba(184, 184, 208, ${alpha})`,
        fairy: `rgba(238, 153, 172, ${alpha})`
    };

    return colors[type] || `rgba(100, 100, 100, ${alpha})`;
}

// 修改初始化函数
async function initializePage() {
    try {
        let data = await fetchMonsterData();

        // 如果请求失败，使用默认数据
        if (!data || data.length === 0) {
            console.log('使用默认数据');
            data = monsterData;
        }

        // 清除之前的图表实例（如果存在）
        const timeChartInstance = Chart.getChart('timeDistributionChart');
        const durationChartInstance = Chart.getChart('durationChart');
        if (timeChartInstance) timeChartInstance.destroy();
        if (durationChartInstance) durationChartInstance.destroy();

        // 更新所有视图
        renderMonsterCards(data);
        renderTimeDistributionChart(data);
        renderDurationChart(data);
        updateTimerStatus(data);
        updateStats(data);

    } catch (error) {
        console.error('初始化失败:', error);
        // 出错时使用默认数据
        renderMonsterCards(monsterData);
        renderTimeDistributionChart(monsterData);
        renderDurationChart(monsterData);
        updateTimerStatus(monsterData);
        updateStats(monsterData);
    }
}

// 修改定时刷新逻辑
let refreshInterval;

function startRefreshInterval() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }

    refreshInterval = setInterval(async () => {
        const data = await fetchMonsterData();
        if (data) {
            // 清除之前的图表实例
            const timeChartInstance = Chart.getChart('timeDistributionChart');
            const durationChartInstance = Chart.getChart('durationChart');
            if (timeChartInstance) timeChartInstance.destroy();
            if (durationChartInstance) durationChartInstance.destroy();

            // 更新所有视图
            updateTimerStatus(data);
            renderMonsterCards(data);
            renderTimeDistributionChart(data);
            renderDurationChart(data);
            updateStats(data);
        }
    }, 60000); // 每分钟检查一次，但实际刷新由缓存机制控制
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    initializePage();
    startRefreshInterval();
    const githubLink = document.querySelector('.developer-link');
    githubLink.addEventListener('click', function(e) {
        e.preventDefault(); // 阻止默认行为
        const newWindow = window.open(this.href, '_blank');
        if (newWindow === null) {
            window.location.href = this.href;
        }
    });
});

// 页面隐藏时停止刷新，显示时恢复刷新
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        if (refreshInterval) {
            clearInterval(refreshInterval);
        }
    } else {
        initializePage();
        startRefreshInterval();
    }
});
