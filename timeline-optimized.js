/**
 * 时间轴应用主对象
 * 包含时间轴的所有功能，如事件加载、渲染、筛选、搜索等
 */
const TimelineApp = {
    // 事件数据数组
    events: [],
    // 人物数据数组
    characters: [],
    // 按名称长度排序的人物数组（用于文本中人物链接的处理）
    sortedCharacters: [],
    // 人物名称正则表达式映射（用于文本中人物链接的处理）
    characterRegexMap: {},
    // 当前缩放级别，默认100%
    zoomLevel: 100,
    
    // 性能优化：虚拟滚动配置
    virtualScroll: {
        // 当前可见的事件
        visibleEvents: [],
        // 已加载的年份集合
        loadedYears: new Set(),
        // 事件高度
        eventHeight: 150,
        // 年份标记高度
        yearHeight: 50,
        // 缓冲区大小
        bufferSize: 5,
        // 交叉观察器实例
        observer: null
    },
    
    // DOM元素缓存，避免重复查询DOM
    domCache: {},
    
    /**
     * 初始化应用
     * 加载数据、设置事件监听器、渲染时间轴
     */
    async init() {
        console.log('开始初始化应用...');
        try {
            // 缓存DOM元素
            this.cacheDOMElements();
            // 显示加载状态
            this.showLoading();
            // 加载事件数据
            await this.loadEvents();
            // 加载人物数据
            await this.loadCharacters();
            // 设置虚拟滚动
            this.setupVirtualScroll();
            // 设置事件监听器
            this.setupEventListeners();
            // 隐藏加载状态
            this.hideLoading();
            
            // 直接显示时间轴
            console.log('直接显示时间轴');
            this.renderTimeline();
            this.showTimelineContent();
            
            console.log('应用初始化完成');
        } catch (error) {
            console.error('初始化失败:', error);
            this.hideLoading();
            this.toast.error('初始化失败', '应用初始化失败，请刷新页面重试');
        }
    },
    
    /**
     * 缓存DOM元素
     * 将页面中所有需要频繁访问的DOM元素缓存到domCache对象中
     * 避免重复查询DOM，提高性能
     */
    cacheDOMElements() {
        this.domCache = {
            // 时间轴容器
            timeline: document.getElementById('timeline'),
            // 搜索输入框
            searchInput: document.getElementById('searchInput'),
            // 搜索范围选择器
            searchScope: document.getElementById('searchScope'),
            // 事件类型筛选器
            categoryFilter: document.getElementById('categoryFilter'),
            // 人物分类筛选器
            characterCategoryFilter: document.getElementById('characterCategoryFilter'),
            // 地区分类筛选器
            regionFilter: document.getElementById('regionFilter'),
            // 时期分类筛选器
            periodFilter: document.getElementById('periodFilter'),
            // 缩放级别显示
            zoomLevel: document.getElementById('zoomLevel'),
            // 人物档案弹窗
            characterModal: document.getElementById('characterModal'),
            // 人物信息容器
            characterInfo: document.getElementById('characterInfo'),
            // 搜索结果为空提示
            noResults: document.getElementById('noResults'),
            // 倒计时文本
            countdownText: document.getElementById('countdownText'),
            // 时间轴容器
            timelineContainer: document.querySelector('.timeline-container'),
            // 导航栏
            navBar: document.querySelector('.fixed-nav-bar'),
            // 搜索按钮
            searchBtn: document.getElementById('searchBtn'),
            // 重置按钮
            resetBtn: document.getElementById('resetBtn')
        };

        console.log('DOM 元素缓存完成:', Object.keys(this.domCache));
        
        // 检查是否有缺失的DOM元素
        const missingElements = Object.entries(this.domCache)
            .filter(([key, value]) => !value)
            .map(([key]) => key);
        
        if (missingElements.length > 0) {
            console.warn('缺少的 DOM 元素:', missingElements);
        }
    },
    
    /**
     * 设置虚拟滚动
     * 使用IntersectionObserver监听年份标记的可见性
     * 当年份标记进入视口时，加载该年份的事件
     */
    setupVirtualScroll() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const year = entry.target.dataset.year;
                    this.loadYearEvents(year);
                }
            });
        }, {
            // 根元素外边距，提前加载
            rootMargin: '200px',
            // 阈值，当元素可见部分达到10%时触发
            threshold: 0.1
        });
        
        this.virtualScroll.observer = observer;
    },
    
    /**
     * 加载年份的事件
     * @param {string} year - 年份字符串
     * 检查该年份是否已经加载过，如果没有则加载并渲染该年份的事件
     */
    loadYearEvents(year) {
        // 如果该年份已经加载过，直接返回
        if (this.virtualScroll.loadedYears.has(year)) return;
        
        // 标记该年份已加载
        this.virtualScroll.loadedYears.add(year);
        // 筛选出该年份的所有事件
        const yearEvents = this.events.filter(e => e.year === year);
        
        // 如果有事件，渲染它们
        if (yearEvents.length > 0) {
            this.renderYearEvents(year, yearEvents);
        }
    },
    
    /**
     * 渲染年份事件
     * @param {string} year - 年份字符串
     * @param {Array} events - 该年份的事件数组
     * 为指定年份创建事件元素并添加到时间轴
     */
    renderYearEvents(year, events) {
        const timeline = this.domCache.timeline;
        const yearPosition = this.yearPositions[year];
        
        // 如果年份位置不存在，直接返回
        if (!yearPosition) return;
        
        const zoomFactor = this.zoomLevel / 100;
        const yearToEventSpacing = 50; // 年份到事件的间距
        const eventSpacing = 150; // 事件之间的间距
        const categoryOrder = ['organize', 'political', 'military', 'diplomacy', 'cultural', 'technology', 'date']; // 事件分类排序
        
        // 使用 DocumentFragment 批量插入 DOM，提高性能
        const fragment = document.createDocumentFragment();
        
        // 找到年份的索引
        const sortedYears = Object.keys(this.yearPositions).sort((a, b) => this.parseYear(a) - this.parseYear(b));
        const yearIndex = sortedYears.indexOf(year);
        
        // 按分类排序事件
        events.sort((a, b) => {
            const categoryIndexA = categoryOrder.indexOf(a.category);
            const categoryIndexB = categoryOrder.indexOf(b.category);
            
            if (categoryIndexA !== categoryIndexB) {
                return categoryIndexA - categoryIndexB;
            }
            
            return 0;
        }).forEach((event, eventIndex) => {
            // 使用全局索引来决定事件的位置，实现整个时间轴上的交错分布
            const globalIndex = yearIndex * 10 + eventIndex;
            const eventElement = this.createEventElement(
                event, 
                globalIndex, 
                yearPosition + yearToEventSpacing, 
                zoomFactor, 
                eventSpacing
            );
            
            // 添加到 fragment 而不是直接添加到 DOM
            fragment.appendChild(eventElement);
        });
        
        // 批量插入到 DOM
        timeline.appendChild(fragment);
    },
    
    /**
     * 加载历史事件数据
     * 从全局变量historicalEvents中加载事件数据
     * 如果historicalEvents未定义，则使用空数组
     */
    async loadEvents() {
        console.log('开始加载事件数据...');
        if (typeof historicalEvents !== 'undefined') {
            this.events = historicalEvents;
            console.log('事件数据加载完成，共', this.events.length, '个事件');
        } else {
            console.error('historicalEvents 未定义');
            this.events = [];
        }
    },
    
    /**
     * 加载人物档案数据
     * 从全局变量historicalCharacters中加载人物数据
     * 对人物数据进行排序，并创建人物名称的正则表达式映射
     * 如果historicalCharacters未定义，则使用空数组
     */
    async loadCharacters() {
        console.log('开始加载人物数据...');
        if (typeof historicalCharacters !== 'undefined') {
            this.characters = historicalCharacters;
            // 按人物名称长度排序，长名称优先匹配
            this.sortedCharacters = [...this.characters].sort((a, b) => b.name.length - a.name.length);
            // 创建人物名称的正则表达式映射，用于文本中人物链接的处理
            this.characterRegexMap = {};
            this.characters.forEach(character => {
                this.characterRegexMap[character.id] = new RegExp(`(${character.name})`, 'g');
            });
            console.log('人物数据加载完成，共', this.characters.length, '个人物');
        } else {
            console.error('historicalCharacters 未定义');
            this.characters = [];
            this.sortedCharacters = [];
            this.characterRegexMap = {};
        }
    },
    
    /**
     * 显示加载状态
     * @param {string} message - 加载提示文本，默认为"正在加载..."
     * 显示页面中央的加载遮罩层
     */
    showLoading(message = '正在加载...') {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            const loadingText = loadingOverlay.querySelector('.loading-text');
            if (loadingText) {
                loadingText.textContent = message;
            }
            loadingOverlay.classList.remove('fade-out');
            loadingOverlay.style.display = 'flex';
        }
    },

    /**
     * 隐藏加载状态
     * 隐藏页面中央的加载遮罩层，并添加淡出动画
     */
    hideLoading() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.classList.add('fade-out');
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
            }, 300);
        }
    },

    /**
     * Toast通知系统
     * 用于显示各种类型的通知消息
     */
    toast: {
        // Toast容器
        container: null,
        
        /**
         * 初始化Toast容器
         * 如果容器不存在，则创建一个新的容器元素
         */
        init() {
            this.container = document.getElementById('toastContainer');
            if (!this.container) {
                this.container = document.createElement('div');
                this.container.id = 'toastContainer';
                this.container.className = 'toast-container';
                document.body.appendChild(this.container);
            }
        },
        
        /**
         * 显示Toast通知
         * @param {string} type - 通知类型：success, error, warning, info
         * @param {string} title - 通知标题
         * @param {string} message - 通知内容
         * @param {number} duration - 通知显示时长（毫秒），默认为3000
         * @returns {HTMLElement} - 创建的Toast元素
         */
        show(type, title, message, duration = 3000) {
            if (!this.container) {
                this.init();
            }
            
            const icons = {
                success: '✓',
                error: '✕',
                warning: '⚠',
                info: 'ℹ'
            };
            
            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            toast.innerHTML = `
                <div class="toast-icon">${icons[type] || icons.info}</div>
                <div class="toast-content">
                    <div class="toast-title">${title}</div>
                    <div class="toast-message">${message}</div>
                </div>
                <button class="toast-close">&times;</button>
            `;
            
            this.container.appendChild(toast);
            
            // 关闭按钮事件
            const closeBtn = toast.querySelector('.toast-close');
            closeBtn.addEventListener('click', () => this.dismiss(toast));
            
            // 自动关闭
            if (duration > 0) {
                setTimeout(() => this.dismiss(toast), duration);
            }
            
            return toast;
        },
        
        /**
         * 关闭Toast通知
         * @param {HTMLElement} toast - 要关闭的Toast元素
         * 添加淡出动画并移除元素
         */
        dismiss(toast) {
            if (!toast || !toast.parentNode) return;
            
            toast.classList.add('slide-out');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        },
        
        /**
         * 显示成功消息
         * @param {string} title - 消息标题
         * @param {string} message - 消息内容
         * @param {number} duration - 显示时长（毫秒）
         * @returns {HTMLElement} - 创建的Toast元素
         */
        success(title, message, duration) {
            return this.show('success', title, message, duration);
        },
        
        /**
         * 显示错误消息
         * @param {string} title - 消息标题
         * @param {string} message - 消息内容
         * @param {number} duration - 显示时长（毫秒）
         * @returns {HTMLElement} - 创建的Toast元素
         */
        error(title, message, duration) {
            return this.show('error', title, message, duration);
        },
        
        /**
         * 显示警告消息
         * @param {string} title - 消息标题
         * @param {string} message - 消息内容
         * @param {number} duration - 显示时长（毫秒）
         * @returns {HTMLElement} - 创建的Toast元素
         */
        warning(title, message, duration) {
            return this.show('warning', title, message, duration);
        },
        
        /**
         * 显示信息消息
         * @param {string} title - 消息标题
         * @param {string} message - 消息内容
         * @param {number} duration - 显示时长（毫秒）
         * @returns {HTMLElement} - 创建的Toast元素
         */
        info(title, message, duration) {
            return this.show('info', title, message, duration);
        },
        
        /**
         * 清除所有Toast
         * 关闭并移除所有当前显示的Toast通知
         */
        clearAll() {
            if (!this.container) return;
            
            const toasts = this.container.querySelectorAll('.toast');
            toasts.forEach(toast => this.dismiss(toast));
        }
    },
    

    
    /**
     * 渲染时间轴（优化版）
     * 核心函数，负责整个时间轴的渲染逻辑
     * 包括筛选事件、排序事件、按年份分组、创建年份标记和事件元素
     */
    renderTimeline() {
        try {
            console.log('开始渲染时间轴...');
            const timeline = this.domCache.timeline;
            const timelineLine = timeline.querySelector('.timeline-line');
            
            if (!timeline) {
                console.error('timeline 元素不存在');
                return;
            }
            
            // 清空现有内容
            timeline.querySelectorAll('.timeline-event').forEach(el => el.remove());
            timeline.querySelectorAll('.timeline-year-marker').forEach(el => el.remove());
            
            // 更新页面文本
            this.updatePageText();
            
            // 筛选事件
            const filteredEvents = this.filterEvents();
            // 按年份排序事件
            const sortedEvents = filteredEvents.sort((a, b) => this.parseYear(a.year) - this.parseYear(b.year));
            
            // 按年份分组事件
            const eventsByYear = {};
            sortedEvents.forEach(event => {
                if (!eventsByYear[event.year]) {
                    eventsByYear[event.year] = [];
                }
                eventsByYear[event.year].push(event);
            });
            
            // 事件分类排序顺序
            const categoryOrder = ['organize', 'military', 'diplomacy', 'personage'];
            
            const noResultsElement = this.domCache.noResults;
            const timelineContainer = this.domCache.timelineContainer;
            
            // 处理无结果情况
            if (sortedEvents.length === 0) {
                noResultsElement.style.display = 'block';
                timelineContainer.style.display = 'none';
                
                let countdown = 5;
                const countdownElement = this.domCache.countdownText;
                
                const timer = setInterval(() => {
                    countdown--;
                    countdownElement.textContent = `${countdown}秒后自动返回`;
                    
                    if (countdown <= 0) {
                        clearInterval(timer);
                        this.clearSearch();
                    }
                }, 1000);
            } else {
                noResultsElement.style.display = 'none';
                timelineContainer.style.display = 'block';
            }
        
        // 只渲染可见的年份（虚拟滚动）
        const sortedYears = Object.keys(eventsByYear).sort((a, b) => this.parseYear(a) - this.parseYear(b));
        
        const eventSpacing = 150; // 事件之间的间距
        const yearToEventSpacing = 50; // 年份到事件的间距
        const yearSpacing = 150; // 年份之间的间距
        const zoomFactor = this.zoomLevel / 100; // 缩放因子
        
        let currentTop = 80; // 当前顶部位置
        const yearPositions = {}; // 年份位置映射
        
        // 使用 DocumentFragment 批量插入，提高性能
        const fragment = document.createDocumentFragment();
        
        // 遍历每个年份
        sortedYears.forEach((year, yearIndex) => {
            const yearEvents = eventsByYear[year];
            
            // 按分类排序事件
            yearEvents.sort((a, b) => {
                const categoryIndexA = categoryOrder.indexOf(a.category);
                const categoryIndexB = categoryOrder.indexOf(b.category);
                
                if (categoryIndexA !== categoryIndexB) {
                    return categoryIndexA - categoryIndexB;
                }
                
                return 0;
            });
            
            // 创建年份标记
            const yearMarker = this.createYearMarker({ year }, currentTop, zoomFactor);
            fragment.appendChild(yearMarker);
            
            // 记录年份位置
            yearPositions[year] = currentTop;
            
            // 只渲染前 10 个事件，其他使用懒加载
            const eventsToRender = yearEvents.slice(0, 10);
            eventsToRender.forEach((event, eventIndex) => {
                // 使用全局索引来决定事件的位置，实现整个时间轴上的交错分布
                const globalIndex = yearIndex * 10 + eventIndex;
                const eventElement = this.createEventElement(event, globalIndex, currentTop + yearToEventSpacing, zoomFactor, eventSpacing);
                fragment.appendChild(eventElement);
            });
            
            // 如果有更多事件，添加"加载更多"按钮
            if (yearEvents.length > 10) {
                const loadMoreBtn = document.createElement('button');
                loadMoreBtn.className = 'load-more-btn';
                loadMoreBtn.textContent = `加载更多 (${yearEvents.length - 10} 个事件)`;
                loadMoreBtn.dataset.year = year;
                loadMoreBtn.onclick = () => this.loadMoreEvents(year, 10);
                fragment.appendChild(loadMoreBtn);
            }
            
            // 计算下一年的位置
            currentTop += yearToEventSpacing + yearEvents.length * eventSpacing + yearSpacing;
        });
        
        // 批量插入到 DOM
        timeline.appendChild(fragment);
        
        // 保存年份位置
        this.yearPositions = yearPositions;
        // 更新时间轴高度
        this.updateTimelineHeight();
        console.log('时间轴渲染完成');
        } catch (error) {
            console.error('渲染时间轴失败:', error);
            this.toast.error('渲染失败', '渲染时间轴失败，请刷新页面重试');
        }
    },
    
    /**
     * 加载更多事件
     * @param {string} year - 年份字符串
     * @param {number} startIndex - 开始索引
     * 加载并渲染指定年份的更多事件，用于懒加载功能
     */
    loadMoreEvents(year, startIndex) {
        // 筛选出该年份的所有事件
        const yearEvents = this.events.filter(e => e.year === year);
        // 从开始索引处加载10个事件
        const eventsToLoad = yearEvents.slice(startIndex, startIndex + 10);
        
        // 如果没有更多事件，移除"加载更多"按钮
        if (eventsToLoad.length === 0) {
            const loadMoreBtn = document.querySelector(`.load-more-btn[data-year="${year}"]`);
            if (loadMoreBtn) {
                loadMoreBtn.remove();
            }
            return;
        }
        
        const timeline = this.domCache.timeline;
        const yearPosition = this.yearPositions[year];
        const zoomFactor = this.zoomLevel / 100;
        const yearToEventSpacing = 50;
        const eventSpacing = 150;
        
        // 找到年份的索引
        const sortedYears = Object.keys(this.yearPositions).sort((a, b) => this.parseYear(a) - this.parseYear(b));
        const yearIndex = sortedYears.indexOf(year);
        
        const fragment = document.createDocumentFragment();
        
        // 为每个事件创建元素
        eventsToLoad.forEach((event, index) => {
            // 使用全局索引来决定事件的位置，实现整个时间轴上的交错分布
            const globalIndex = yearIndex * 10 + startIndex + index;
            const eventElement = this.createEventElement(
                event,
                globalIndex,
                yearPosition + yearToEventSpacing,
                zoomFactor,
                eventSpacing
            );
            fragment.appendChild(eventElement);
        });
        
        // 添加到时间轴
        timeline.appendChild(fragment);
        
        // 更新"加载更多"按钮
        const loadMoreBtn = document.querySelector(`.load-more-btn[data-year="${year}"]`);
        if (loadMoreBtn) {
            const remainingEvents = yearEvents.length - (startIndex + eventsToLoad.length);
            if (remainingEvents <= 0) {
                loadMoreBtn.remove();
            } else {
                loadMoreBtn.textContent = `加载更多 (${remainingEvents} 个事件)`;
            }
        }
        
        // 更新时间轴高度
        this.updateTimelineHeight();
    },
    
    /**
     * 更新页面文本
     * 更新页面上显示的事件数量和年份数量
     */
    updatePageText() {
        const filteredEvents = this.filterEvents();
        const totalEvents = filteredEvents.length;
        const totalYears = new Set(filteredEvents.map(e => e.year)).size;
        
        const pageText = document.querySelector('.page-text');
        if (pageText) {
            pageText.textContent = `共 ${totalEvents} 个事件，${totalYears} 个年份`;
        }
    },
    
    /**
     * 清除搜索和筛选条件
     * 重置所有筛选器和搜索输入框的值
     * 然后重新渲染时间轴
     */
    clearSearch() {
        // 清空搜索输入框
        this.domCache.searchInput.value = '';
        // 重置搜索范围
        if (this.domCache.searchScope) {
            this.domCache.searchScope.value = 'all';
        }
        // 重置事件类型筛选器
        this.domCache.categoryFilter.value = 'all';
        // 重置人物分类筛选器
        this.domCache.characterCategoryFilter.value = 'all';
        // 重置地区筛选器
        if (this.domCache.regionFilter) {
            this.domCache.regionFilter.value = 'all';
        }
        // 重置时期筛选器
        if (this.domCache.periodFilter) {
            this.domCache.periodFilter.value = 'all';
        }
        // 重新渲染时间轴
        this.renderTimeline();
    },
    
    /**
     * 高亮搜索文本
     * @param {string} text - 原始文本
     * @param {string} searchTerm - 搜索词
     * @returns {string} - 带有高亮标记的文本
     * 在文本中高亮显示搜索词
     */
    highlightSearchText(text, searchTerm) {
        if (!searchTerm || !text) return text;
        
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        return text.replace(regex, '<span class="search-highlight">$1</span>');
    },
    
    /**
     * 在文本中链接人物
     * @param {string} text - 原始文本
     * @param {string} searchTerm - 搜索词
     * @returns {string} - 带有人物链接和搜索高亮的文本
     * 在文本中识别并链接人物名称，同时高亮搜索词
     */
    linkCharactersInText(text, searchTerm) {
        if (!text || !this.characters || this.characters.length === 0) return text;
        
        let result = text;
        const placeholders = [];
        let placeholderIndex = 0;
        
        // 在文本中链接人物名称
        this.sortedCharacters.forEach(character => {
            const regex = this.characterRegexMap[character.id];
            result = result.replace(regex, `<span class="character-link" data-char-id="${character.id}">$1</span>`);
        });
        
        // 如果有搜索词，高亮搜索词
        if (searchTerm) {
            // 先将人物链接替换为占位符
            result = result.replace(/<span class="character-link" data-char-id="([^"]+)">([^<]*)<\/span>/g, (match, charId, charName) => {
                const placeholder = `__PLACEHOLDER_${placeholderIndex}__`;
                placeholders.push({ placeholder, charId, charName });
                placeholderIndex++;
                return placeholder;
            });
            
            // 高亮搜索词
            result = result.replace(new RegExp(`(${searchTerm})`, 'gi'), '<span class="search-highlight">$1</span>');
            
            // 恢复人物链接并在人物名称中高亮搜索词
            placeholders.forEach(({ placeholder, charId, charName }) => {
                const highlightedName = charName.replace(new RegExp(`(${searchTerm})`, 'gi'), '<span class="search-highlight">$1</span>');
                result = result.replace(placeholder, `<span class="character-link" data-char-id="${charId}">${highlightedName}</span>`);
            });
        }
        
        return result;
    },
    
    /**
     * 创建事件元素
     * @param {Object} event - 事件对象
     * @param {number} index - 事件索引
     * @param {number} currentTop - 当前顶部位置
     * @param {number} zoomFactor - 缩放因子
     * @param {number} eventSpacing - 事件间距
     * @returns {HTMLElement} - 创建的事件元素
     * 为指定事件创建DOM元素，包括事件卡片和标记点
     */
    createEventElement(event, index, currentTop, zoomFactor, eventSpacing) {
        // 提取局部索引（每个年份内的索引）和全局索引
        // 全局索引用于决定左右位置，局部索引用于计算垂直位置
        // 从index中提取局部索引：如果index大于10，取余数，否则直接使用index
        const localIndex = index % 10;
        
        const eventDiv = document.createElement('div');
        // 根据索引决定事件显示在左边还是右边
        eventDiv.className = `timeline-event ${index % 2 === 0 ? 'left' : 'right'}`;
        eventDiv.dataset.index = index;
        eventDiv.dataset.yearOffset = currentTop;
        
        // 使用局部索引来计算垂直位置，确保每个年份内的事件垂直排列正确
        const topPosition = (currentTop + localIndex * eventSpacing) * zoomFactor;
        
        eventDiv.style.top = `${topPosition}px`;
        eventDiv.style.transform = `scale(${zoomFactor})`;
        
        const searchTerm = this.domCache.searchInput.value.trim();
        const categoryLabel = this.getCategoryLabel(event.category);
        
        // 在文本中链接人物并高亮搜索词
        const linkedTitle = this.linkCharactersInText(event.title, searchTerm);
        const descriptionText = Array.isArray(event.description) ? event.description.join('<br>') : event.description;
        const linkedDescription = this.linkCharactersInText(descriptionText, searchTerm);
        const linkedCategory = this.linkCharactersInText(categoryLabel, searchTerm);
        
        // 创建事件卡片HTML
        const isLeft = index % 2 === 0;
        const tagAlignment = isLeft ? 'flex-end' : 'flex-start';
        
        eventDiv.innerHTML = `
            <div class="event-card ${event.category}">
                <div class="event-category">${linkedCategory}</div>
                <div class="event-title">${linkedTitle}</div>
                <div class="event-description">${linkedDescription}</div>
                ${event.tags ? `
                    <div class="event-tags" style="justify-content: ${tagAlignment};">
                        ${event.tags.map(tag => `<span class="event-tag">${tag}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
            <div class="event-marker"></div>
        `;
        
        return eventDiv;
    },
    
    /**
     * 创建年份标记
     * @param {Object} event - 包含年份的对象
     * @param {number} currentTop - 当前顶部位置
     * @param {number} zoomFactor - 缩放因子
     * @returns {HTMLElement} - 创建的年份标记元素
     * 为指定年份创建年份标记元素
     */
    createYearMarker(event, currentTop, zoomFactor) {
        const yearMarker = document.createElement('div');
        yearMarker.className = 'timeline-year-marker';
        yearMarker.textContent = event.year;
        yearMarker.dataset.year = event.year;
        yearMarker.dataset.yearOffset = currentTop;
        
        const topPosition = currentTop * zoomFactor;
        
        yearMarker.style.top = `${topPosition}px`;
        yearMarker.style.transform = 'translateX(-50%)';
        
        return yearMarker;
    },
    
    /**
     * 更新时间轴高度
     * 计算时间轴的高度，确保所有事件都能正常显示
     * 取最大的事件或年份标记位置，加上足够的缓冲
     */
    updateTimelineHeight() {
        const timeline = this.domCache.timeline;
        const yearMarkers = timeline.querySelectorAll('.timeline-year-marker');
        const events = timeline.querySelectorAll('.timeline-event');
        
        let maxTopPosition = 0;
        
        // 计算所有年份标记的最大位置
        yearMarkers.forEach(marker => {
            const topPosition = parseFloat(marker.style.top) || 0;
            maxTopPosition = Math.max(maxTopPosition, topPosition);
        });
        
        // 计算所有事件的最大位置
        events.forEach(event => {
            const topPosition = parseFloat(event.style.top) || 0;
            maxTopPosition = Math.max(maxTopPosition, topPosition);
        });
        
        // 设置时间轴高度，确保至少和文档高度一样，以覆盖整个页面
        const documentHeight = document.documentElement.scrollHeight;
        const windowHeight = window.innerHeight;
        const requiredHeight = Math.max(maxTopPosition + 400, documentHeight, windowHeight);
        timeline.style.height = `${requiredHeight}px`;
        
        // 同时更新时间轴容器的高度
        const timelineContainer = this.domCache.timelineContainer;
        if (timelineContainer) {
            timelineContainer.style.minHeight = `${requiredHeight}px`;
        }
    },
    
    /**
     * 解析年份字符串
     * @param {string} yearStr - 年份字符串，如"2023年"或"公元前221年"
     * @returns {number} - 解析后的年份数字
     * 处理普通年份和公元前年份
     */
    parseYear(yearStr) {
        if (yearStr.includes('公元前')) {
            // 公元前年份返回负数
            return -parseInt(yearStr.replace('公元前', '').replace('年', ''));
        }
        // 普通年份返回正数，移除"公元"前缀和"年"后缀
        return parseInt(yearStr.replace('公元', '').replace('年', ''));
    },
    
    /**
     * 获取分类标签
     * @param {string} category - 分类英文名称
     * @returns {string} - 分类中文名称
     * 将分类的英文名称转换为中文名称
     */
    getCategoryLabel(category) {
        const labels = {
            'organize': '组织',
            'military': '军事',
            'diplomacy': '外交',
            'personage': '人物'
        };
        return labels[category] || category;
    },
    
    /**
     * 筛选事件
     * @returns {Array} - 筛选后的事件数组
     * 根据各种筛选条件筛选事件
     * 包括事件类型、人物分类、地区、时期和搜索词
     */
    filterEvents() {
        const categoryFilter = this.domCache.categoryFilter.value;
        const characterCategoryFilter = this.domCache.characterCategoryFilter.value;
        const regionFilter = this.domCache.regionFilter?.value || 'all';
        const periodFilter = this.domCache.periodFilter?.value || 'all';
        const searchInput = this.domCache.searchInput.value.toLowerCase();
        const searchScope = this.domCache.searchScope?.value || 'all';
        
        return this.events.filter(event => {
            // 事件类型筛选
            const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter;
            
            // 人物分类筛选
            let matchesCharacterCategory = true;
            if (characterCategoryFilter !== 'all' && event.characters) {
                matchesCharacterCategory = event.characters.some(char => {
                    const character = this.characters.find(c => c.id === char.id);
                    return character && Array.isArray(character.category) ? 
                        character.category.includes(characterCategoryFilter) : 
                        character.category === characterCategoryFilter;
                });
            }
            
            // 地区筛选：从事件标签或相关人物标签中筛选包含地区信息的事件
            const matchesRegion = regionFilter === 'all' || 
                (event.tags && event.tags.some(tag => tag.includes(regionFilter))) ||
                (event.characters && event.characters.some(char => {
                    const character = this.characters.find(c => c.id === char.id);
                    return character && character.tags && character.tags.some(tag => tag.includes(regionFilter));
                }));
            
            // 时期筛选：从事件标签或相关人物标签中筛选包含时期信息的事件
            const matchesPeriod = periodFilter === 'all' || 
                (event.tags && event.tags.some(tag => tag.includes(periodFilter))) ||
                (event.characters && event.characters.some(char => {
                    const character = this.characters.find(c => c.id === char.id);
                    return character && character.tags && character.tags.some(tag => tag.includes(periodFilter));
                }));
            
            // 搜索筛选
            const matchesSearch = !searchInput || {
                'all': event.title.toLowerCase().includes(searchInput) ||
                    (Array.isArray(event.description) ? event.description.some(d => d.toLowerCase().includes(searchInput)) : event.description && event.description.toLowerCase().includes(searchInput)) ||
                    (event.tags && event.tags.some(tag => tag.toLowerCase().includes(searchInput))) ||
                    (event.characters && event.characters.some(char => 
                        char.name.toLowerCase().includes(searchInput)
                    )),
                'events': event.title.toLowerCase().includes(searchInput) ||
                    (Array.isArray(event.description) ? event.description.some(d => d.toLowerCase().includes(searchInput)) : event.description && event.description.toLowerCase().includes(searchInput)),
                'characters': event.characters && event.characters.some(char => 
                    char.name.toLowerCase().includes(searchInput)
                ),
                'region': event.tags && event.tags.some(tag => tag.toLowerCase().includes(searchInput)),
                'period': event.tags && event.tags.some(tag => tag.toLowerCase().includes(searchInput))
            }[searchScope];
            
            // 所有条件都满足才返回true
            return matchesCategory && matchesCharacterCategory && matchesRegion && matchesPeriod && matchesSearch;
        });
    },
    
    /**
     * 获取人物分类名称
     * @param {string|Array} category - 人物分类英文名称或分类数组
     * @returns {string} - 人物分类中文名称
     * 将人物分类的英文名称转换为中文名称
     */
    getCategoryName(category) {
        const categoryNames = {
            'political': '政治家',
            'military': '军事家',
            'scientist': '科学家',
            'literary': '文学家',
            'philosopher': '哲学家',
            'projective': '投影派',
            'intervene': '干涉派',
            'energy': '能量派',
            'orientate': '定位派'
        };
        if (Array.isArray(category)) {
            return category.map(cat => categoryNames[cat] || cat).join('、');
        }
        return categoryNames[category] || category;
    },
    
    /**
     * 设置事件监听器
     * 为页面上的所有交互元素添加事件监听器
     * 包括筛选器、搜索框、按钮等
     */
    setupEventListeners() {
        // 使用缓存的元素并添加 null 检查
        if (this.domCache.categoryFilter) {
            this.domCache.categoryFilter.addEventListener('change', () => this.renderTimeline());
        }
        if (this.domCache.characterCategoryFilter) {
            this.domCache.characterCategoryFilter.addEventListener('change', () => this.renderTimeline());
        }
        if (this.domCache.regionFilter) {
            this.domCache.regionFilter.addEventListener('change', () => this.renderTimeline());
        }
        if (this.domCache.periodFilter) {
            this.domCache.periodFilter.addEventListener('change', () => this.renderTimeline());
        }
        if (this.domCache.searchScope) {
            this.domCache.searchScope.addEventListener('change', () => this.renderTimeline());
        }
        if (this.domCache.searchBtn) {
            this.domCache.searchBtn.addEventListener('click', () => this.renderTimeline());
        }
        if (this.domCache.searchInput) {
            this.domCache.searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.renderTimeline();
                }
            });
        }
        if (this.domCache.resetBtn) {
            this.domCache.resetBtn.addEventListener('click', () => this.clearSearch());
        }
        if (document.getElementById('zoomInBtn')) {
            document.getElementById('zoomInBtn').addEventListener('click', () => this.zoomIn());
        }
        if (document.getElementById('zoomOutBtn')) {
            document.getElementById('zoomOutBtn').addEventListener('click', () => this.zoomOut());
        }
        if (document.getElementById('modalClose')) {
            document.getElementById('modalClose').addEventListener('click', () => this.hideCharacterModal());
        }
        if (document.getElementById('modalOverlay')) {
            document.getElementById('modalOverlay').addEventListener('click', () => this.hideCharacterModal());
        }
        
        // 人物链接点击事件
        document.addEventListener('click', (e) => {
            const characterLink = e.target.closest('.character-link');
            if (characterLink) {
                e.preventDefault();
                e.stopPropagation();
                const charId = characterLink.dataset.charId;
                this.showCharacterModal(charId);
            }
        });
        
        // 窗口大小改变事件
        window.addEventListener('resize', () => this.updateTimelineHeight());
    },
    
    /**
     * 处理滚轮缩放
     * @param {Event} e - 滚轮事件对象
     * 预留的滚轮缩放处理函数
     */
    handleWheelZoom(e) {
    },
    
    /**
     * 放大时间轴
     * 将缩放级别增加10%，最大不超过150%
     */
    zoomIn() {
        if (this.zoomLevel < 150) {
            this.zoomLevel += 10;
            this.updateZoom();
        }
    },
    
    /**
     * 缩小时间轴
     * 将缩放级别减少10%，最小不低于80%
     */
    zoomOut() {
        if (this.zoomLevel > 80) {
            this.zoomLevel -= 10;
            this.updateZoom();
        }
    },
    
    /**
     * 更新缩放
     * 根据当前缩放级别更新时间轴的显示
     * 包括更新缩放级别显示、调整事件和年份标记的位置和大小
     */
    updateZoom() {
        const zoomLevelElement = this.domCache.zoomLevel;
        if (zoomLevelElement) {
            zoomLevelElement.textContent = `${this.zoomLevel}%`;
        }
        
        const timeline = this.domCache.timeline;
        if (!timeline) return;
        
        const events = timeline.querySelectorAll('.timeline-event');
        const yearMarkers = timeline.querySelectorAll('.timeline-year-marker');
        
        const yearToEventSpacing = 50;
        const eventSpacing = 150;
        const zoomFactor = this.zoomLevel / 100;
        
        // 更新事件位置和大小
        events.forEach(event => {
            const currentTop = parseInt(event.dataset.yearOffset);
            const index = parseInt(event.dataset.index);
            // 使用局部索引来计算垂直位置，确保缩放时位置计算正确
            const localIndex = index % 10;
            const topPosition = (currentTop + yearToEventSpacing + localIndex * eventSpacing) * zoomFactor;
            
            event.style.top = `${topPosition}px`;
            event.style.transform = `scale(${zoomFactor})`;
        });
        
        // 更新年份标记位置
        yearMarkers.forEach(marker => {
            const currentTop = parseInt(marker.dataset.yearOffset);
            const topPosition = currentTop * zoomFactor;
            
            marker.style.top = `${topPosition}px`;
            marker.style.transform = 'translateX(-50%)';
        });
        
        // 更新时间轴高度
        this.updateTimelineHeight();
    },
    


    /**
     * 显示时间轴内容
     * 显示时间轴容器和导航栏
     */
    showTimelineContent() {
        const timelineContainer = this.domCache.timelineContainer;
        const navBar = this.domCache.navBar;
        if (timelineContainer) {
            timelineContainer.style.display = 'block';
        }
        if (navBar) {
            navBar.classList.remove('hidden');
        }
    },
    
    /**
     * 隐藏时间轴内容
     * 隐藏时间轴容器和导航栏
     */
    hideTimelineContent() {
        const timelineContainer = this.domCache.timelineContainer;
        const navBar = this.domCache.navBar;
        if (timelineContainer) {
            timelineContainer.style.display = 'none';
        }
        if (navBar) {
            navBar.classList.add('hidden');
        }
    },
    
    /**
     * 显示人物档案弹窗
     * @param {string} charId - 人物ID
     * 显示指定人物的详细信息弹窗
     */
    showCharacterModal(charId) {
        const character = this.characters.find(c => c.id === charId);
        if (!character) return;
        
        const characterInfo = this.domCache.characterInfo;
        
        characterInfo.innerHTML = `
            <h2>${character.name}</h2>
            <div class="character-title">${character.title}</div>
            <div class="character-dates">${character.birth} - ${character.death}</div>
            ${character.category ? `<div class="character-category">${this.getCategoryName(character.category)}</div>` : ''}
            <div class="character-bio">${character.description}</div>
            
            ${character.achievements ? `
                <div class="character-section">
                    <h3>主要成就</h3>
                    <ul class="character-list">
                        ${character.achievements.map(ach => `<li>${ach}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
            
            ${character.relatedEvents ? `
                <div class="character-section">
                    <h3>相关事件</h3>
                    <ul class="character-list">
                        ${character.relatedEvents.map(eventId => {
                            const event = this.events.find(e => e.id === eventId);
                            return event ? { event, year: this.parseYear(event.year) } : null;
                        }).filter(item => item !== null).sort((a, b) => a.year - b.year).map(item => {
                            return `<li>${item.event.year} - ${item.event.title}</li>`;
                        }).join('')}
                    </ul>
                </div>
            ` : ''}
        `;
        
        this.domCache.characterModal.classList.add('active');
    },
    
    /**
     * 隐藏人物档案弹窗
     * 隐藏人物详细信息弹窗
     */
    hideCharacterModal() {
        this.domCache.characterModal.classList.remove('active');
    },
    

    

    

};

document.addEventListener('DOMContentLoaded', async () => {
    await TimelineApp.init();
});
