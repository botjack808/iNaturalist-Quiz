// ==========================================
// 核心配置与全面汉化字典
// ==========================================
const Config = {
    perPage: 100,
    rankNames: {
        'domain': '域', 'kingdom': '界', 'subkingdom': '亚界',
        'phylum': '门', 'subphylum': '亚门', 'superclass': '总纲',
        'class': '纲', 'subclass': '亚纲', 'infraclass': '下纲',
        'superorder': '总目', 'order': '目', 'suborder': '亚目', 'infraorder': '下目',
        'superfamily': '总科', 'family': '科', 'subfamily': '亚科',
        'supertribe': '总族', 'tribe': '族', 'subtribe': '亚族',
        'genus': '属', 'subgenus': '亚属', 'complex': '复合群',
        'species': '种', 'subspecies': '亚种', 'variety': '变种', 'form': '变型'
    }
};

const ROOT_TAXA = [
    { id: 1, name: "动物界", desc: "Animalia", rank: "kingdom" },
    { id: 47126, name: "植物界", desc: "Plantae", rank: "kingdom" },
    { id: 47170, name: "真菌界", desc: "Fungi", rank: "kingdom" }
];

const TAXON_SHORTCUTS = [
    { id: 3, name: "鸟纲", sci: "Aves", icon: "🦅", rank: "class" },
    { id: 40151, name: "哺乳纲", sci: "Mammalia", icon: "🦁", rank: "class" },
    { id: 47178, name: "鱼纲", sci: "Actinopterygii", icon: "🐟", rank: "class" },
    { id: 26036, name: "爬行纲", sci: "Reptilia", icon: "🦎", rank: "class" },
    { id: 20978, name: "两栖纲", sci: "Amphibia", icon: "🐸", rank: "class" },
    { id: 47158, name: "昆虫纲", sci: "Insecta", icon: "🪲", rank: "class" },
    { id: 47119, name: "蛛形纲", sci: "Arachnida", icon: "🕷️", rank: "class" },
    { id: 47187, name: "软甲纲", sci: "Malacostraca", icon: "🦀", rank: "class" },
    { id: 47125, name: "木兰纲", sci: "Magnoliopsida", icon: "🌺", rank: "class" },
    { id: 47163, name: "百合纲", sci: "Liliopsida", icon: "🌾", rank: "class" },
    { id: 136329, name: "松柏纲", sci: "Pinopsida", icon: "🌲", rank: "class" }
];

// 专业的地理分区配置 (完全去硬编码，依靠动态查询)
const GEO_REGIONS = [
    {
        name: "🌏 亚洲 Asia",
        children: [
            { name: "中国", query: "China" }, { name: "日本", query: "Japan" }, { name: "韩国", query: "South Korea" }, { name: "台湾", query: "Taiwan" },
            { name: "印尼 (东南亚)", query: "Indonesia" }, { name: "印度", query: "India" }, { name: "中东", query: "Middle East" }
        ]
    },
    {
        name: "🌍 欧洲 Europe",
        children: [
            { name: "欧洲全境", query: "Europe" },
            { name: "英国", query: "United Kingdom" }, { name: "法国", query: "France" }, { name: "德国", query: "Germany" },
            { name: "意大利", query: "Italy" }, { name: "西班牙", query: "Spain" }, { name: "挪威 (北欧)", query: "Norway" }
        ]
    },
    {
        name: "🌎 美洲 Americas",
        children: [
            { name: "北美洲", query: "North America" }, { name: "美国", query: "United States" }, { name: "加拿大", query: "Canada" },
            { name: "南美洲", query: "South America" }, { name: "墨西哥", query: "Mexico" }, { name: "巴西", query: "Brazil" },
            { name: "哥斯达黎加", query: "Costa Rica" }, { name: "阿根廷", query: "Argentina" }
        ]
    },
    {
        name: "🌍 非洲 Africa",
        children: [
            { name: "非洲全境", query: "Africa" },
            { name: "南非", query: "South Africa" }, { name: "肯尼亚", query: "Kenya" }, { name: "马达加斯加", query: "Madagascar" }, { name: "埃及", query: "Egypt" }
        ]
    },
    {
        name: "🦘 大洋洲与海洋 Oceania & Oceans",
        children: [
            { name: "大洋洲", query: "Oceania" }, { name: "澳大利亚", query: "Australia" }, { name: "新西兰", query: "New Zealand" },
            { name: "夏威夷 (太平洋)", query: "Hawaii" }, { name: "百慕大 (大西洋)", query: "Bermuda" }, { name: "南乔治亚岛 (近南极)", query: "South Georgia" }
        ]
    }
];

let State = {
    baseTaxonId: "3", baseTaxonName: "鸟纲", baseTaxonSciName: "Aves",
    placeId: "6903", placeName: "中国",
    rarity: "common", quizLimit: 10,
    pool: [],
    masterPool: [],
    seenIds: new Set(),
    currentTarget: null, isAnswered: false, score: 0, total: 0, currentPage: 1,
    currentWikiTitle: "",
    isActiveQuiz: false
};

let ModalCache = { wikiHtml: null, inatHtml: null, activeTab: "wiki" };

const UI = {
    setupScreen: document.getElementById('setup-screen'),
    quizScreen: document.getElementById('quiz-screen'),
    loadingOverlay: document.getElementById('loading-overlay'),
    taxaTreeContainer: document.getElementById('taxa-tree-container'),
    geoTreeContainer: document.getElementById('geo-tree-container'),
    currentTaxonDisplay: document.getElementById('current-taxon-display'),
    taxonObsCount: document.getElementById('taxon-obs-count'),
    taxonWikiSummary: document.getElementById('taxon-wiki-summary'),

    placeInput: document.getElementById('place-search-input'),
    placeResults: document.getElementById('place-search-results'),
    mapSelectionText: document.getElementById('map-selection-text'),
    clearPlaceBtn: document.getElementById('clear-place-btn'),

    taxonSearchInput: document.getElementById('taxon-search-input'),
    taxonSearchResults: document.getElementById('taxon-search-results'),
    taxonShortcuts: document.getElementById('taxon-shortcuts'),

    startBtn: document.getElementById('start-btn'),
    homeBtn: document.getElementById('home-btn'),
    scoreBoard: document.getElementById('score-board'),
    optionsGrid: document.getElementById('options-grid'),
    resultPanel: document.getElementById('result-panel'),
    resultOrigLink: document.getElementById('result-orig-link'),

    wikiModal: document.getElementById('wiki-modal'),
    modalTitle: document.getElementById('modal-title'),
    modalContent: document.getElementById('modal-content')
};

// ==========================================
// 核心 1：维基百科直连与清洗器
// ==========================================
async function fetchWikiData(title, type = "summary") {
    try {
        const res = await fetch(`https://zh.wikipedia.org/api/rest_v1/page/${type}/${encodeURIComponent(title)}?redirect=true`);
        if (res.ok) {
            if (type === "summary") return (await res.json()).extract_html;
            else return await res.text();
        }
    } catch (e) { console.error("Wiki fetch error:", e); }
    return null;
}

function sanitizeWikiHtml(rawHtml) {
    if (!rawHtml) return "";
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawHtml, 'text/html');
    doc.querySelectorAll('style, script, link, meta, .mw-empty-elt, .reference, .mw-editsection, .noprint, .navbox').forEach(el => el.remove());
    doc.querySelectorAll('*').forEach(el => {
        if (el.classList.contains('infobox')) return;
        el.removeAttribute('class');
    });
    return doc.body.innerHTML;
}

// ==========================================
// 地理体系树渲染与动态检索系统
// ==========================================
function initGeoTree() {
    UI.geoTreeContainer.innerHTML = '';
    GEO_REGIONS.forEach(region => {
        const section = document.createElement('div');
        section.className = 'mb-4';

        const header = document.createElement('div');
        header.className = 'text-[13px] text-teal-800 font-bold mb-2 tracking-wider border-b border-teal-100 pb-1 flex items-center gap-1.5';
        header.innerHTML = `<i class="fa-solid fa-earth-americas opacity-70"></i> ${region.name}`;
        section.appendChild(header);

        if (region.children) {
            const childrenWrapper = document.createElement('div');
            childrenWrapper.className = 'flex flex-wrap gap-2 pl-1';

            region.children.forEach(child => {
                const childDiv = document.createElement('div');

                if (child.children) {
                    // 新增：组合大区 一键全选按钮
                    const groupHeader = document.createElement('div');
                    groupHeader.className = 'flex items-center gap-2 mt-1 mb-1';

                    const groupBtn = document.createElement('button');
                    groupBtn.className = 'quick-place-group-btn px-2.5 py-1 bg-teal-50 border border-teal-200 rounded text-[12px] text-teal-800 font-bold hover:bg-teal-500 hover:text-white transition shadow-sm flex items-center gap-1.5';
                    const subQueries = child.children.filter(c => c.query).map(c => c.query);
                    groupBtn.dataset.queries = JSON.stringify(subQueries);
                    groupBtn.innerHTML = `<i class="fa-solid fa-layer-group"></i> ${child.name} (一键全选)`;

                    groupHeader.appendChild(groupBtn);
                    childDiv.appendChild(groupHeader);

                    const subContainer = document.createElement('div');
                    subContainer.className = 'flex flex-wrap gap-2 mb-3 ml-2 pl-3 border-l-2 border-teal-100/50';
                    child.children.forEach(grandchild => {
                        if (grandchild.query) {
                            const subBtn = document.createElement('button');
                            subBtn.className = 'quick-place-search-btn px-2.5 py-1 bg-white border border-gray-200 rounded text-[12px] text-gray-700 hover:bg-teal-500 hover:text-white hover:border-teal-500 transition shadow-sm';
                            subBtn.dataset.search = grandchild.query;
                            subBtn.textContent = grandchild.name;
                            subContainer.appendChild(subBtn);
                        }
                    });
                    childDiv.appendChild(subContainer);
                } else if (child.query) {
                    const btn = document.createElement('button');
                    btn.className = 'quick-place-search-btn px-3 py-1.5 bg-white border border-blue-200 rounded-lg text-[13px] text-blue-800 font-medium hover:bg-blue-500 hover:text-white hover:border-blue-500 transition shadow-sm w-fit text-left flex items-center gap-2';
                    btn.dataset.search = child.query;
                    btn.innerHTML = `<i class="fa-solid fa-location-crosshairs opacity-50"></i> ${child.name}`;
                    childDiv.appendChild(btn);
                } else {
                    const lbl = document.createElement('span');
                    lbl.className = 'text-xs font-bold text-gray-500 my-1 ml-1 mr-2 flex items-center';
                    lbl.textContent = child.name;
                    childDiv.appendChild(lbl);
                }

                childrenWrapper.appendChild(childDiv);
            });
            section.appendChild(childrenWrapper);
        }
        UI.geoTreeContainer.appendChild(section);
    });
}

// 新增：处理一键全选的批量并发搜寻事件
async function triggerGroupPlaceSearch(queries, groupName) {
    UI.placeInput.value = groupName;
    UI.placeResults.innerHTML = '<div class="p-3 text-sm text-teal-600 flex items-center gap-2"><i class="fa-solid fa-satellite-dish fa-beat"></i> 正在并发锁定大区内所有省份坐标...</div>';
    UI.placeResults.classList.remove('hidden');

    try {
        const ids = [];
        // 使用 Promise.all 并发请求所有子区域的 API，极速秒出
        const fetchPromises = queries.map(q =>
            fetch(`https://api.inaturalist.org/v1/places/autocomplete?q=${encodeURIComponent(q)}`).then(r => r.json())
        );

        const results = await Promise.all(fetchPromises);
        results.forEach(data => {
            if (data.results && data.results.length > 0) {
                ids.push(data.results[0].id);
            }
        });

        if (ids.length > 0) {
            State.placeId = ids.join(','); // 组合所有 ID 发送给 API
            State.placeName = groupName.replace(' (一键全选)', '').trim() + " (多选合并区系)";
            UI.mapSelectionText.textContent = State.placeName;
            UI.placeInput.value = "";
            UI.placeResults.classList.add('hidden');
            UI.clearPlaceBtn.classList.remove('hidden');
        } else {
            UI.placeResults.innerHTML = `<div class="p-3 text-sm text-red-500">无法在官方库中批量定位该大区</div>`;
        }
    } catch (err) {
        UI.placeResults.innerHTML = '<div class="p-3 text-sm text-red-500">网络检索请求失败</div>';
    }
}

// 处理自动搜索事件
async function triggerPlaceSearch(query) {
    UI.placeInput.value = query;
    UI.placeResults.innerHTML = '<div class="p-3 text-sm text-teal-600 flex items-center gap-2"><i class="fa-solid fa-satellite-dish fa-beat"></i> 正在定位该生态区系官方坐标...</div>';
    UI.placeResults.classList.remove('hidden');

    try {
        const res = await fetch(`https://api.inaturalist.org/v1/places/autocomplete?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.results.length > 0) {
            const place = data.results[0];
            State.placeId = place.id.toString();
            State.placeName = place.display_name;
            UI.mapSelectionText.textContent = State.placeName;
            UI.placeInput.value = "";
            UI.placeResults.classList.add('hidden');
            UI.clearPlaceBtn.classList.remove('hidden');
        } else {
            UI.placeResults.innerHTML = `<div class="p-3 text-sm text-red-500">无法在官方库中精准定位 "${query}"，请尝试手动搜索其它名</div>`;
        }
    } catch (err) {
        UI.placeResults.innerHTML = '<div class="p-3 text-sm text-red-500">网络检索请求失败</div>';
    }
}

// 绑定搜索框实时事件
let searchTimeout;
UI.placeInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const query = e.target.value.trim();
    if (query.length < 2) {
        UI.placeResults.classList.add('hidden');
        return;
    }
    searchTimeout = setTimeout(async () => {
        try {
            const res = await fetch(`https://api.inaturalist.org/v1/places/autocomplete?q=${encodeURIComponent(query)}`);
            const data = await res.json();
            UI.placeResults.innerHTML = '';
            if (data.results.length === 0) {
                UI.placeResults.innerHTML = '<div class="p-3 text-sm text-gray-500">未找到相关地理区域</div>';
            } else {
                data.results.forEach(place => {
                    const div = document.createElement('div');
                    div.className = "p-3 border-b hover:bg-teal-50 cursor-pointer text-sm text-gray-700 transition flex justify-between items-center";
                    let typeTag = place.place_type_name ? `<span class="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded shrink-0">${place.place_type_name}</span>` : '';
                    div.innerHTML = `<div class="truncate pr-2"><strong>${place.name}</strong> <span class="text-xs text-gray-400">(${place.display_name})</span></div> ${typeTag}`;
                    div.onclick = () => {
                        State.placeId = place.id.toString();
                        State.placeName = place.display_name;
                        UI.mapSelectionText.textContent = State.placeName;
                        UI.placeInput.value = "";
                        UI.placeResults.classList.add('hidden');
                        UI.clearPlaceBtn.classList.remove('hidden');
                    };
                    UI.placeResults.appendChild(div);
                });
            }
            UI.placeResults.classList.remove('hidden');
        } catch (err) { }
    }, 400);
});

// 隐藏搜索框外的点击
document.addEventListener('click', (e) => {
    if (!UI.placeInput.contains(e.target) && !UI.placeResults.contains(e.target)) {
        UI.placeResults.classList.add('hidden');
    }
    // 事件委托处理动态生成的快捷按钮
    const btn = e.target.closest('.quick-place-search-btn');
    if (btn) {
        triggerPlaceSearch(btn.dataset.search);
    }
    // 新增：处理一键全选的组合按钮
    const groupBtn = e.target.closest('.quick-place-group-btn');
    if (groupBtn) {
        const queries = JSON.parse(groupBtn.dataset.queries);
        triggerGroupPlaceSearch(queries, groupBtn.innerText);
    }
});

UI.clearPlaceBtn.addEventListener('click', () => {
    State.placeId = "";
    State.placeName = "全球";
    UI.mapSelectionText.textContent = "全球 (无限定)";
    UI.clearPlaceBtn.classList.add('hidden');
});

// ==========================================
// 分类树与档案概览
// ==========================================
function setRarity(level, btn) {
    State.rarity = level;
    document.querySelectorAll('.rarity-btn').forEach(el => {
        el.classList.replace('bg-teal-600', 'bg-white');
        el.classList.replace('text-white', 'text-gray-600');
    });
    btn.classList.replace('bg-white', 'bg-teal-600');
    btn.classList.replace('text-gray-600', 'text-white');
}

function setLimit(limit, btn) {
    State.quizLimit = limit;
    document.querySelectorAll('.limit-btn').forEach(el => {
        el.classList.replace('bg-teal-600', 'bg-white');
        el.classList.replace('text-white', 'text-gray-600');
    });
    btn.classList.replace('bg-white', 'bg-teal-600');
    btn.classList.replace('text-gray-600', 'text-white');
}

async function fetchTaxonProfile(taxonId, taxonName, latinName) {
    UI.taxonWikiSummary.innerHTML = '<div class="flex items-center justify-center h-full text-teal-500"><i class="fa-solid fa-circle-notch fa-spin text-2xl mr-2"></i> 正在查阅百科文献...</div>';
    UI.taxonObsCount.textContent = '...';

    try {
        const res = await fetch(`https://api.inaturalist.org/v1/taxa/${taxonId}?locale=zh-CN`);
        const data = await res.json();
        const info = data.results[0];

        if (info) {
            UI.taxonObsCount.innerHTML = `<i class="fa-solid fa-eye"></i> ${info.observations_count.toLocaleString()} 记录`;
            let summaryHtml = "";

            const searchTitle = info.preferred_common_name || taxonName || latinName;
            let wikiRaw = await fetchWikiData(searchTitle, "summary");

            if (!wikiRaw && searchTitle !== latinName) {
                wikiRaw = await fetchWikiData(latinName, "summary");
            }

            if (wikiRaw) {
                let cleanWiki = sanitizeWikiHtml(wikiRaw);
                if (cleanWiki.replace(/<[^>]+>/g, '').trim().length > 20) {
                    summaryHtml = cleanWiki;
                }
            }

            if (!summaryHtml && info.wikipedia_summary) {
                let cleanInat = sanitizeWikiHtml(info.wikipedia_summary);
                if (cleanInat.replace(/<[^>]+>/g, '').trim().length > 20) {
                    summaryHtml = cleanInat;
                }
            }

            if (summaryHtml) {
                UI.taxonWikiSummary.innerHTML = summaryHtml;
            } else {
                UI.taxonWikiSummary.innerHTML = '<div class="text-gray-400 mt-2"><i class="fa-solid fa-ghost"></i> 数据库暂无该分类元的有效中文概述。</div>';
            }
        }
    } catch (e) { UI.taxonWikiSummary.innerHTML = '<span class="text-red-400">网络超时获取失败。</span>'; }
}

function initSetupUI() {
    UI.taxaTreeContainer.innerHTML = '';
    ROOT_TAXA.forEach(taxon => { UI.taxaTreeContainer.appendChild(createTreeNode(taxon, true)); });
    initGeoTree();
    initTaxonShortcuts();
    initTaxonSearch();

    if (State.placeId) {
        UI.mapSelectionText.textContent = State.placeName;
        UI.clearPlaceBtn.classList.remove('hidden');
    }

    fetchTaxonProfile(State.baseTaxonId, State.baseTaxonName, State.baseTaxonSciName);
}

function selectTaxonById(id, name, sciName) {
    State.baseTaxonId = id;
    State.baseTaxonName = name;
    State.baseTaxonSciName = sciName;
    document.querySelectorAll('.tree-node-name').forEach(el => { el.classList.remove('text-teal-800', 'bg-teal-100', 'border-teal-300'); });
    UI.currentTaxonDisplay.innerHTML = `${name} <span class="scientific-name text-sm font-normal text-gray-600">${sciName}</span>`;
    // 高亮快捷入口按钮
    document.querySelectorAll('.taxon-shortcut-btn').forEach(el => {
        if (el.dataset.id == id) {
            el.classList.remove('bg-white', 'text-gray-700', 'border-gray-200');
            el.classList.add('bg-teal-600', 'text-white', 'border-teal-600');
        } else {
            el.classList.remove('bg-teal-600', 'text-white', 'border-teal-600');
            el.classList.add('bg-white', 'text-gray-700', 'border-gray-200');
        }
    });
    fetchTaxonProfile(id, name, sciName);
}

function initTaxonShortcuts() {
    UI.taxonShortcuts.innerHTML = '';
    TAXON_SHORTCUTS.forEach(s => {
        const btn = document.createElement('button');
        btn.className = 'taxon-shortcut-btn px-2.5 py-1 border rounded-lg text-[12px] font-medium transition shadow-sm flex items-center gap-1 hover:shadow-md '
            + (State.baseTaxonId == s.id 
                ? 'bg-teal-600 text-white border-teal-600' 
                : 'bg-white text-gray-700 border-gray-200 hover:bg-teal-500 hover:text-white hover:border-teal-500');
        btn.dataset.id = s.id;
        btn.innerHTML = `${s.icon} ${s.name}`;
        btn.onclick = () => selectTaxonById(s.id, s.name, s.sci);
        UI.taxonShortcuts.appendChild(btn);
    });
}

function initTaxonSearch() {
    let searchTimeout;
    UI.taxonSearchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();
        if (query.length < 2) {
            UI.taxonSearchResults.classList.add('hidden');
            return;
        }
        searchTimeout = setTimeout(async () => {
            try {
                const res = await fetch(`https://api.inaturalist.org/v1/taxa/autocomplete?q=${encodeURIComponent(query)}&per_page=10&locale=zh-CN`);
                const data = await res.json();
                UI.taxonSearchResults.innerHTML = '';
                if (data.results.length === 0) {
                    UI.taxonSearchResults.innerHTML = '<div class="p-3 text-sm text-gray-500">未找到相关分类阶元</div>';
                } else {
                    data.results.forEach(taxon => {
                        const div = document.createElement('div');
                        div.className = "p-3 border-b hover:bg-teal-50 cursor-pointer text-sm text-gray-700 transition flex justify-between items-center";
                        const cnName = taxon.preferred_common_name || '';
                        const rankTag = taxon.rank ? `<span class="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded shrink-0">${Config.rankNames[taxon.rank] || taxon.rank}</span>` : '';
                        div.innerHTML = `<div class="truncate pr-2"><strong>${cnName || taxon.name}</strong> <span class="text-xs text-gray-400 italic">${taxon.name}</span></div> ${rankTag}`;
                        div.onclick = () => {
                            selectTaxonById(taxon.id, cnName || taxon.name, taxon.name);
                            UI.taxonSearchInput.value = '';
                            UI.taxonSearchResults.classList.add('hidden');
                        };
                        UI.taxonSearchResults.appendChild(div);
                    });
                }
                UI.taxonSearchResults.classList.remove('hidden');
            } catch (err) { }
        }, 400);
    });
    document.addEventListener('click', (e) => {
        if (!UI.taxonSearchInput.contains(e.target) && !UI.taxonSearchResults.contains(e.target)) {
            UI.taxonSearchResults.classList.add('hidden');
        }
    });
}

function createTreeNode(taxon, isRoot = false) {
    const nodeDiv = document.createElement('div');
    nodeDiv.className = isRoot ? 'mt-2' : 'ml-4 mt-1 border-l border-gray-100 pl-1';
    const headerDiv = document.createElement('div');
    headerDiv.className = 'flex items-center gap-1.5 py-1.5 rounded hover:bg-teal-50 cursor-pointer group select-none transition-colors';

    const expandBtn = document.createElement('div');
    expandBtn.className = 'w-5 h-5 flex items-center justify-center text-gray-400 hover:text-teal-600 shrink-0';
    const canExpand = taxon.rank !== 'species' && taxon.rank !== 'subspecies';

    if (canExpand) {
        expandBtn.innerHTML = '<i class="fa-solid fa-chevron-right text-[10px]"></i>';
        expandBtn.onclick = (e) => { e.stopPropagation(); toggleNode(taxon.id, childrenContainer, expandBtn); };
    } else { expandBtn.innerHTML = '<i class="fa-solid fa-circle text-[4px] opacity-30"></i>'; }

    const nameDiv = document.createElement('div');
    nameDiv.className = `tree-node-name flex-1 text-gray-700 py-0.5 px-2 rounded-lg transition-colors border border-transparent`;
    let displayName = taxon.preferred_common_name || taxon.name || taxon.desc;
    let rankStr = taxon.rank ? `<span class="text-[10px] text-gray-500 bg-gray-200/60 px-1.5 py-0.5 rounded ml-1 uppercase">${Config.rankNames[taxon.rank] || taxon.rank}</span>` : '';
    nameDiv.innerHTML = `<span class="font-bold">${displayName}</span> <span class="scientific-name text-xs ml-1 text-gray-400">${taxon.name}</span>${rankStr}`;

    nameDiv.onclick = () => {
        State.baseTaxonId = taxon.id; State.baseTaxonName = displayName; State.baseTaxonSciName = taxon.name;
        document.querySelectorAll('.tree-node-name').forEach(el => { el.classList.remove('text-teal-800', 'bg-teal-100', 'border-teal-300'); });
        nameDiv.classList.add('text-teal-800', 'bg-teal-100', 'border-teal-300');
        UI.currentTaxonDisplay.innerHTML = `${displayName} <span class="scientific-name text-sm font-normal text-gray-600">${taxon.name}</span>`;
        fetchTaxonProfile(taxon.id, displayName, taxon.name);
    };

    if (State.baseTaxonId == taxon.id) nameDiv.classList.add('text-teal-800', 'bg-teal-100', 'border-teal-300');

    headerDiv.appendChild(expandBtn); headerDiv.appendChild(nameDiv); nodeDiv.appendChild(headerDiv);
    const childrenContainer = document.createElement('div');
    childrenContainer.className = 'hidden';
    if (taxon.children) {
        taxon.children.forEach(child => { childrenContainer.appendChild(createTreeNode(child, false)); });
    }
    nodeDiv.appendChild(childrenContainer);
    return nodeDiv;
}

async function toggleNode(taxonId, container, btn) {
    if (container.classList.contains('hidden')) {
        if (container.children.length === 0) {
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin text-[10px] text-teal-500"></i>';
            const res = await fetch(`https://api.inaturalist.org/v1/taxa?parent_id=${taxonId}&is_active=true&per_page=30&locale=zh-CN&order_by=observations_count`);
            const data = await res.json();
            data.results.forEach(child => { container.appendChild(createTreeNode(child)); });
        }
        container.classList.remove('hidden'); btn.innerHTML = '<i class="fa-solid fa-chevron-down text-[10px] text-teal-600"></i>';
    } else { container.classList.add('hidden'); btn.innerHTML = '<i class="fa-solid fa-chevron-right text-[10px]"></i>'; }
}

// ==========================================
// 游戏流转与题目生成
// ==========================================
UI.startBtn.addEventListener('click', () => {
    UI.setupScreen.classList.add('hidden');
    UI.quizScreen.classList.remove('hidden');
    UI.scoreBoard.classList.remove('hidden');
    UI.homeBtn.classList.remove('hidden');
    document.getElementById('victory-panel').classList.add('hidden');
    document.getElementById('question-area').classList.remove('hidden');
    document.getElementById('next-btn').innerHTML = '下一题 <i class="fa-solid fa-arrow-right"></i>';

    State.isActiveQuiz = true;
    State.pool = []; State.masterPool = []; State.seenIds.clear(); State.score = 0; State.total = 0;

    if (State.rarity === 'common') State.currentPage = 1;
    else if (State.rarity === 'uncommon') State.currentPage = Math.floor(Math.random() * 2) + 2;
    else State.currentPage = Math.floor(Math.random() * 4) + 4;

    updateScoreUI(); fetchSpeciesBatch();
});

function returnToHome() {
    UI.quizScreen.classList.add('hidden');
    UI.scoreBoard.classList.add('hidden');
    UI.homeBtn.classList.add('hidden');
    UI.loadingOverlay.classList.add('hidden');

    State.isActiveQuiz = false;

    const img = document.getElementById('species-image');
    img.onerror = null;
    img.src = "";
    img.classList.add('hidden');

    UI.setupScreen.classList.remove('hidden');

    State.pool = []; State.masterPool = []; State.seenIds.clear(); State.score = 0; State.total = 0;
    updateScoreUI();
}

function getApiUrl() {
    let url = `https://api.inaturalist.org/v1/`;
    if (State.placeId) {
        // 有具体地点时使用观测聚合接口，支持原生/引入过滤
        url += `observations/species_counts?taxon_id=${State.baseTaxonId}&place_id=${State.placeId}&quality_grade=research&captive=false`;
        if (document.getElementById('chk-native').checked) url += `&native=true`;
        if (document.getElementById('chk-threatened').checked) url += `&threatened=true`;
        if (document.getElementById('chk-introduced').checked) url += `&introduced=true`;
    } else {
        // 全球模式时不可使用地理属性参数，因为全球无所谓原生
        // 强制要求选项层级必须是物种或亚种，防止出现科属目的干扰项
        url += `taxa?taxon_id=${State.baseTaxonId}&rank=species,subspecies&order_by=observations_count&order=desc`;
    }

    url += `&has_photos=true&is_active=true&per_page=50&page=${State.currentPage}&locale=zh-CN`;
    return url;
}

async function fetchSpeciesBatch() {
    if (!State.isActiveQuiz) return;
    UI.loadingOverlay.classList.remove('hidden');
    try {
        const url = getApiUrl();
        const response = await fetch(url);
        if (!State.isActiveQuiz) return;
        const data = await response.json();

        let results = State.placeId ? data.results.map(r => {
            r.taxon.observations_count = r.taxon.observations_count || r.count;
            return r.taxon;
        }) : data.results;

        results.sort(() => Math.random() - 0.5);
        const validSpecies = results.filter(sp => sp.default_photo && sp.default_photo.medium_url && sp.name && !State.seenIds.has(sp.id));

        State.pool = [...State.pool, ...validSpecies];

        validSpecies.forEach(sp => {
            if (!State.masterPool.find(m => m.id === sp.id)) State.masterPool.push(sp);
        });

        State.currentPage++;

        if (State.pool.length >= 4) { UI.loadingOverlay.classList.add('hidden'); setupNextQuestion(); }
        else if (results.length > 0) { fetchSpeciesBatch(); }
        else {
            if (State.currentPage > 2) { State.currentPage = 1; fetchSpeciesBatch(); }
            else {
                alert(`当前条件下未找到足够物种数据。请尝试放宽过滤条件（如取消勾选“纯本土原生”）再试！`);
                returnToHome();
            }
        }
    } catch (err) {
        console.error("API Error: ", err);
        alert("与 iNaturalist 通讯失败，或遇到请求异常。请改变搜索范围重试。");
        returnToHome();
    }
}

function setupNextQuestion() {
    if (State.pool.length < 5) { fetchSpeciesBatch(); return; }
    State.isAnswered = false; UI.resultPanel.classList.add('hidden');

    updateScoreUI(); // Update UI at the start of next question!

    State.currentTarget = State.pool.shift(); State.seenIds.add(State.currentTarget.id);

    State.currentWikiTitle = "";
    if (State.currentTarget.wikipedia_url) {
        const parts = State.currentTarget.wikipedia_url.split('/wiki/');
        if (parts.length > 1) State.currentWikiTitle = decodeURIComponent(parts[1]);
    } else {
        State.currentWikiTitle = State.currentTarget.preferred_common_name || State.currentTarget.name;
    }

    UI.resultOrigLink.href = `https://www.inaturalist.org/taxa/${State.currentTarget.id}`;

    let availableDistractors = State.masterPool.filter(sp => sp.id !== State.currentTarget.id);
    availableDistractors.sort(() => Math.random() - 0.5);
    const distractors = availableDistractors.slice(0, 3);

    let options = [State.currentTarget, ...distractors].sort(() => Math.random() - 0.5);

    const img = document.getElementById('species-image');
    img.classList.add('hidden'); document.getElementById('image-spinner').classList.remove('hidden');
    img.src = State.currentTarget.default_photo.medium_url;
    img.onerror = () => { if (State.isActiveQuiz) setupNextQuestion(); };
    img.onload = () => { document.getElementById('image-spinner').classList.add('hidden'); img.classList.remove('hidden'); };

    UI.optionsGrid.innerHTML = '';
    options.forEach(sp => {
        const btn = document.createElement('button');
        btn.className = "option-btn w-full text-left bg-white border-2 border-gray-200 hover:border-teal-500 text-gray-800 py-4 px-5 rounded-xl flex flex-col items-start relative";
        let primaryName = sp.preferred_common_name || sp.english_common_name || sp.name;
        btn.innerHTML = `<span class="text-lg font-bold mb-1 pr-6 truncate w-full">${primaryName}</span><span class="text-xs text-gray-400 font-normal scientific-name truncate w-full">${sp.name}</span>`;
        btn.onclick = () => handleAnswer(sp, btn);
        UI.optionsGrid.appendChild(btn);
    });
}

function handleAnswer(selectedSp, clickedBtn) {
    if (State.isAnswered) return;
    State.isAnswered = true; State.total++;
    const isCorrect = selectedSp.id === State.currentTarget.id;
    if (isCorrect) State.score++;
    updateScoreUI();

    UI.optionsGrid.querySelectorAll('button').forEach(btn => {
        btn.disabled = true;
        const isTargetBtn = btn.querySelector('.scientific-name').innerText === State.currentTarget.name;
        if (isTargetBtn) {
            btn.classList.add('bg-green-50', 'border-green-500', 'text-green-800');
            btn.innerHTML += '<i class="fa-solid fa-check absolute right-4 top-1/2 -translate-y-1/2 text-2xl text-green-500"></i>';
        } else if (btn === clickedBtn && !isCorrect) {
            btn.classList.add('bg-red-50', 'border-red-500', 'text-red-800');
            btn.innerHTML += '<i class="fa-solid fa-xmark absolute right-4 top-1/2 -translate-y-1/2 text-2xl text-red-500"></i>';
        } else { btn.classList.add('opacity-50', 'bg-gray-50'); }
    });

    showDetails(isCorrect);
}

function updateScoreUI() {
    let currentQNum = State.isAnswered ? State.total : State.total + 1;
    if (State.quizLimit > 0 && currentQNum > State.quizLimit) currentQNum = State.quizLimit;
    document.getElementById('current-q-display').textContent = `第 ${currentQNum} 题`;
    document.getElementById('score-display').textContent = State.score;
    document.getElementById('limit-display').textContent = State.quizLimit > 0 ? `/ 总题数: ${State.quizLimit}` : `/ 无尽模式`;
}

async function showDetails(isCorrect) {
    UI.resultPanel.classList.remove('hidden');
    const target = State.currentTarget;

    document.getElementById('result-title').innerHTML = isCorrect ? '<span class="text-green-600"><i class="fa-solid fa-face-smile text-green-500"></i> 鉴定正确</span>' : '<span class="text-red-500"><i class="fa-solid fa-triangle-exclamation"></i> 鉴定失误</span>';
    document.getElementById('detail-zh').textContent = target.preferred_common_name || '无官方中文俗名';
    document.getElementById('detail-en').textContent = target.english_common_name || 'N/A';
    document.getElementById('detail-la').textContent = target.name;

    let obsText = State.placeId ? `该区系研究级观测: ${target.observations_count ? target.observations_count.toLocaleString() : 0} 次` : `全球累计目击: ${target.observations_count ? target.observations_count.toLocaleString() : 0} 次`;
    document.getElementById('result-obs-count').innerHTML = `<i class="fa-solid fa-globe"></i> ${obsText}`;

    if (State.quizLimit > 0 && State.total >= State.quizLimit) {
        document.getElementById('next-btn').innerHTML = '完成测验 <i class="fa-solid fa-flag-checkered"></i>';
        document.getElementById('next-btn').onclick = showVictoryScreen;
    } else {
        document.getElementById('next-btn').innerHTML = '下一题 <i class="fa-solid fa-arrow-right"></i>';
        document.getElementById('next-btn').onclick = setupNextQuestion;
    }

    setTimeout(() => { UI.resultPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, 100);
}

function showVictoryScreen() {
    UI.resultPanel.classList.add('hidden');
    document.getElementById('question-area').classList.add('hidden');

    const vPanel = document.getElementById('victory-panel');
    vPanel.classList.remove('hidden');

    const pct = Math.round((State.score / State.total) * 100);
    let msg = "";
    if (pct === 100) msg = "太棒了！你完美识别了所有的物种，简直就是野生动植物专家！";
    else if (pct >= 80) msg = "很厉害！你拥有极高的自然生态储备。";
    else if (pct >= 60) msg = "干得不错，及格了，下次还能更上一层楼！";
    else msg = "再接再厉，每一次探索都会让你认识更多的物种。";

    document.getElementById('victory-stats').innerHTML = `你在 ${State.total} 题中答对了 <strong>${State.score}</strong> 题。准确率：<strong>${pct}%</strong>。<br><br>${msg}`;
}

// ==========================================
// 双源阅读器：Wikipedia vs iNaturalist (已简化为仅 Wikipedia)
// ==========================================
async function openFullWikiModal() {
    UI.wikiModal.classList.remove('hidden');
    UI.modalTitle.textContent = State.currentTarget.preferred_common_name || State.currentTarget.name;

    ModalCache = { wikiHtml: null };

    UI.modalContent.innerHTML = `
                <div class="absolute inset-0 flex flex-col items-center justify-center text-gray-500 bg-white">
                    <i class="fa-solid fa-spinner fa-spin text-5xl mb-4 text-teal-600"></i>
                    <p class="font-bold text-lg">正在从 Wikipedia 提取档案...</p>
                </div>`;

    try {
        let fullHtml = await fetchWikiData(State.currentWikiTitle, "html");
        let cleanHtml = sanitizeWikiHtml(fullHtml);

        if ((!cleanHtml || cleanHtml.replace(/<[^>]+>/g, '').trim().length < 50) && State.currentTarget.name) {
            let fallbackHtml = await fetchWikiData(State.currentTarget.name, "html");
            let cleanFallback = sanitizeWikiHtml(fallbackHtml);
            if (cleanFallback && cleanFallback.replace(/<[^>]+>/g, '').trim().length >= 50) {
                cleanHtml = cleanFallback;
            }
        }

        if (cleanHtml && cleanHtml.replace(/<[^>]+>/g, '').trim().length >= 50) {
            ModalCache.wikiHtml = cleanHtml;
        } else {
            ModalCache.wikiHtml = `<div class="text-center text-gray-500 mt-20"><i class="fa-solid fa-ghost text-5xl mb-3"></i><br>中文维基百科暂无有效词条内容，或该中文俗名重定向至消歧义页，请尝试访问原网页。</div>`;
        }
        UI.modalContent.innerHTML = ModalCache.wikiHtml;
    } catch (error) {
        UI.modalContent.innerHTML = `<div class="text-center text-red-500 mt-20"><i class="fa-solid fa-triangle-exclamation text-4xl mb-2"></i><br>网络连接失败，请检查网络设置。</div>`;
    }
}

function closeWikiModal() { UI.wikiModal.classList.add('hidden'); }
// Next button is solely controlled by the onClick handler during showDetails/victory switch

initSetupUI();