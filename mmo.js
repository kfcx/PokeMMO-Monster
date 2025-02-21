const API_URL = 'https://mmo.naihe.eu.org/monster/current';
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
    2: "城都",
    3: "神奥",
    4: "合众"
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
const moveNames = {
    18: "吹飞",
    34: "泰山压顶",
    355: "羽栖",
    390: "毒菱",
    402: "种子炸弹",
    405: "虫鸣",
    421: "暗影爪",
    187: "腹鼓"
};

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
