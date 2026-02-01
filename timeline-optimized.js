const TimelineApp = {
    events: [],
    characters: [],
    sortedCharacters: [],
    characterRegexMap: {},
    zoomLevel: 100,
    
    // 性能优化：虚拟滚动配置
    virtualScroll: {
        visibleEvents: [],
        loadedYears: new Set(),
        eventHeight: 150,
        yearHeight: 50,
        bufferSize: 5,
        observer: null
    },
    
    // DOM元素缓存
    domCache: {},
    
    // 初始化应用
    async init() {
        console.log('开始初始化应用...');
        try {
            this.cacheDOMElements();
            this.showLoading();
            await this.loadEvents();
            await this.loadCharacters();
            this.setupVirtualScroll();
            this.setupEventListeners();
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
    
    // 缓存DOM元素
    cacheDOMElements() {
        this.domCache = {
            timeline: document.getElementById('timeline'),
            searchInput: document.getElementById('searchInput'),
            searchScope: document.getElementById('searchScope'),
            categoryFilter: document.getElementById('categoryFilter'),
            characterCategoryFilter: document.getElementById('characterCategoryFilter'),
            zoomLevel: document.getElementById('zoomLevel'),
            characterModal: document.getElementById('characterModal'),
            characterInfo: document.getElementById('characterInfo'),
            noResults: document.getElementById('noResults'),
            countdownText: document.getElementById('countdownText'),
            timelineContainer: document.querySelector('.timeline-container'),
            navBar: document.querySelector('.fixed-nav-bar'),
            searchBtn: document.getElementById('searchBtn')
        };

        console.log('DOM 元素缓存完成:', Object.keys(this.domCache));
        
        const missingElements = Object.entries(this.domCache)
            .filter(([key, value]) => !value)
            .map(([key]) => key);
        
        if (missingElements.length > 0) {
            console.warn('缺少的 DOM 元素:', missingElements);
        }
    },
    
    // 设置虚拟滚动
    setupVirtualScroll() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const year = entry.target.dataset.year;
                    this.loadYearEvents(year);
                }
            });
        }, {
            rootMargin: '200px',
            threshold: 0.1
        });
        
        this.virtualScroll.observer = observer;
    },
    
    // 加载年份的事件
    loadYearEvents(year) {
        if (this.virtualScroll.loadedYears.has(year)) return;
        
        this.virtualScroll.loadedYears.add(year);
        const yearEvents = this.events.filter(e => e.year === year);
        
        if (yearEvents.length > 0) {
            this.renderYearEvents(year, yearEvents);
        }
    },
    
    // 渲染年份事件
    renderYearEvents(year, events) {
        const timeline = this.domCache.timeline;
        const yearPosition = this.yearPositions[year];
        
        if (!yearPosition) return;
        
        const zoomFactor = this.zoomLevel / 100;
        const yearToEventSpacing = 50;
        const eventSpacing = 150;
        const categoryOrder = ['political', 'military', 'technology', 'cultural'];
        
        // 使用 DocumentFragment 批量插入 DOM
        const fragment = document.createDocumentFragment();
        
        // 找到年份的索引
        const sortedYears = Object.keys(this.yearPositions).sort((a, b) => this.parseYear(a) - this.parseYear(b));
        const yearIndex = sortedYears.indexOf(year);
        
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
    
    // 加载历史事件数据
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
    
    // 加载人物档案数据
    async loadCharacters() {
        console.log('开始加载人物数据...');
        if (typeof historicalCharacters !== 'undefined') {
            this.characters = historicalCharacters;
            this.sortedCharacters = [...this.characters].sort((a, b) => b.name.length - a.name.length);
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
    
    // 显示加载状态
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

    // 隐藏加载状态
    hideLoading() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.classList.add('fade-out');
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
            }, 300);
        }
    },

    // Toast通知系统
    toast: {
        container: null,
        
        // 初始化Toast容器
        init() {
            this.container = document.getElementById('toastContainer');
            if (!this.container) {
                this.container = document.createElement('div');
                this.container.id = 'toastContainer';
                this.container.className = 'toast-container';
                document.body.appendChild(this.container);
            }
        },
        
        // 显示Toast通知
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
        
        // 关闭Toast通知
        dismiss(toast) {
            if (!toast || !toast.parentNode) return;
            
            toast.classList.add('slide-out');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        },
        
        // 显示成功消息
        success(title, message, duration) {
            return this.show('success', title, message, duration);
        },
        
        // 显示错误消息
        error(title, message, duration) {
            return this.show('error', title, message, duration);
        },
        
        // 显示警告消息
        warning(title, message, duration) {
            return this.show('warning', title, message, duration);
        },
        
        // 显示信息消息
        info(title, message, duration) {
            return this.show('info', title, message, duration);
        },
        
        // 清除所有Toast
        clearAll() {
            if (!this.container) return;
            
            const toasts = this.container.querySelectorAll('.toast');
            toasts.forEach(toast => this.dismiss(toast));
        }
    },
    

    
    // 渲染时间轴（优化版）
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
            
            this.updatePageText();
            
            const filteredEvents = this.filterEvents();
            const sortedEvents = filteredEvents.sort((a, b) => this.parseYear(a.year) - this.parseYear(b.year));
            
            const eventsByYear = {};
            sortedEvents.forEach(event => {
                if (!eventsByYear[event.year]) {
                    eventsByYear[event.year] = [];
                }
                eventsByYear[event.year].push(event);
            });
            
            const categoryOrder = ['political', 'military', 'technology', 'cultural'];
            
            const noResultsElement = this.domCache.noResults;
            const timelineContainer = this.domCache.timelineContainer;
            
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
        
        const eventSpacing = 150;
        const yearToEventSpacing = 50;
        const yearSpacing = 150;
        const zoomFactor = this.zoomLevel / 100;
        
        let currentTop = 80;
        const yearPositions = {};
        
        // 使用 DocumentFragment 批量插入
        const fragment = document.createDocumentFragment();
        
        sortedYears.forEach((year, yearIndex) => {
            const yearEvents = eventsByYear[year];
            
            yearEvents.sort((a, b) => {
                const categoryIndexA = categoryOrder.indexOf(a.category);
                const categoryIndexB = categoryOrder.indexOf(b.category);
                
                if (categoryIndexA !== categoryIndexB) {
                    return categoryIndexA - categoryIndexB;
                }
                
                return 0;
            });
            
            const yearMarker = this.createYearMarker({ year }, currentTop, zoomFactor);
            fragment.appendChild(yearMarker);
            
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
            
            currentTop += yearToEventSpacing + yearEvents.length * eventSpacing + yearSpacing;
        });
        
        // 批量插入到 DOM
        timeline.appendChild(fragment);
        
        this.yearPositions = yearPositions;
        this.updateTimelineHeight();
        console.log('时间轴渲染完成');
        } catch (error) {
            console.error('渲染时间轴失败:', error);
            this.toast.error('渲染失败', '渲染时间轴失败，请刷新页面重试');
        }
    },
    
    // 加载更多事件
    loadMoreEvents(year, startIndex) {
        const yearEvents = this.events.filter(e => e.year === year);
        const eventsToLoad = yearEvents.slice(startIndex, startIndex + 10);
        
        if (eventsToLoad.length === 0) {
            // 移除"加载更多"按钮
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
        
        this.updateTimelineHeight();
    },
    
    updatePageText() {
        const filteredEvents = this.filterEvents();
        const totalEvents = filteredEvents.length;
        const totalYears = new Set(filteredEvents.map(e => e.year)).size;
        
        const pageText = document.querySelector('.page-text');
        if (pageText) {
            pageText.textContent = `共 ${totalEvents} 个事件，${totalYears} 个年份`;
        }
    },
    
    clearSearch() {
        this.domCache.searchInput.value = '';
        if (this.domCache.searchScope) {
            this.domCache.searchScope.value = 'all';
        }
        this.domCache.categoryFilter.value = 'all';
        this.domCache.characterCategoryFilter.value = 'all';
        this.renderTimeline();
    },
    
    highlightSearchText(text, searchTerm) {
        if (!searchTerm || !text) return text;
        
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        return text.replace(regex, '<span class="search-highlight">$1</span>');
    },
    
    linkCharactersInText(text, searchTerm) {
        if (!text || !this.characters || this.characters.length === 0) return text;
        
        let result = text;
        const placeholders = [];
        let placeholderIndex = 0;
        
        this.sortedCharacters.forEach(character => {
            const regex = this.characterRegexMap[character.id];
            result = result.replace(regex, `<span class="character-link" data-char-id="${character.id}">$1</span>`);
        });
        
        if (searchTerm) {
            result = result.replace(/<span class="character-link" data-char-id="([^"]+)">([^<]*)<\/span>/g, (match, charId, charName) => {
                const placeholder = `__PLACEHOLDER_${placeholderIndex}__`;
                placeholders.push({ placeholder, charId, charName });
                placeholderIndex++;
                return placeholder;
            });
            
            result = result.replace(new RegExp(`(${searchTerm})`, 'gi'), '<span class="search-highlight">$1</span>');
            
            placeholders.forEach(({ placeholder, charId, charName }) => {
                const highlightedName = charName.replace(new RegExp(`(${searchTerm})`, 'gi'), '<span class="search-highlight">$1</span>');
                result = result.replace(placeholder, `<span class="character-link" data-char-id="${charId}">${highlightedName}</span>`);
            });
        }
        
        return result;
    },
    
    createEventElement(event, index, currentTop, zoomFactor, eventSpacing) {
        // 提取局部索引（每个年份内的索引）和全局索引
        // 全局索引用于决定左右位置，局部索引用于计算垂直位置
        // 从index中提取局部索引：如果index大于10，取余数，否则直接使用index
        const localIndex = index % 10;
        
        const eventDiv = document.createElement('div');
        eventDiv.className = `timeline-event ${index % 2 === 0 ? 'left' : 'right'}`;
        eventDiv.dataset.index = index;
        eventDiv.dataset.yearOffset = currentTop;
        
        // 使用局部索引来计算垂直位置，确保每个年份内的事件垂直排列正确
        const topPosition = (currentTop + localIndex * eventSpacing) * zoomFactor;
        
        eventDiv.style.top = `${topPosition}px`;
        eventDiv.style.transform = `scale(${zoomFactor})`;
        
        const searchTerm = this.domCache.searchInput.value.trim();
        const categoryLabel = this.getCategoryLabel(event.category);
        
        const linkedTitle = this.linkCharactersInText(event.title, searchTerm);
        const linkedDescription = this.linkCharactersInText(event.description, searchTerm);
        const linkedCategory = this.linkCharactersInText(categoryLabel, searchTerm);
        
        eventDiv.innerHTML = `
            <div class="event-card ${event.category}">
                <div class="event-category">${linkedCategory}</div>
                <div class="event-title">${linkedTitle}</div>
                <div class="event-description">${linkedDescription}</div>
                ${event.tags ? `
                    <div class="event-tags">
                        ${event.tags.map(tag => `<span class="event-tag">${tag}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
            <div class="event-marker"></div>
        `;
        
        return eventDiv;
    },
    
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
    
    updateTimelineHeight() {
        const timeline = this.domCache.timeline;
        const yearMarkers = timeline.querySelectorAll('.timeline-year-marker');
        const events = timeline.querySelectorAll('.timeline-event');
        
        let maxTopPosition = 0;
        
        yearMarkers.forEach(marker => {
            const topPosition = parseFloat(marker.style.top) || 0;
            maxTopPosition = Math.max(maxTopPosition, topPosition);
        });
        
        events.forEach(event => {
            const topPosition = parseFloat(event.style.top) || 0;
            maxTopPosition = Math.max(maxTopPosition, topPosition);
        });
        
        const height = Math.max(maxTopPosition + 200, window.innerHeight);
        timeline.style.height = `${height}px`;
    },
    
    parseYear(yearStr) {
        if (yearStr.includes('公元前')) {
            return -parseInt(yearStr.replace('公元前', '').replace('年', ''));
        }
        return parseInt(yearStr.replace('年', ''));
    },
    
    getCategoryLabel(category) {
        const labels = {
            'political': '政治',
            'cultural': '文化',
            'technology': '科技',
            'military': '军事'
        };
        return labels[category] || category;
    },
    
    filterEvents() {
        const categoryFilter = this.domCache.categoryFilter.value;
        const characterCategoryFilter = this.domCache.characterCategoryFilter.value;
        const searchInput = this.domCache.searchInput.value.toLowerCase();
        const searchScope = this.domCache.searchScope?.value || 'all';
        
        return this.events.filter(event => {
            const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter;
            
            let matchesCharacterCategory = true;
            if (characterCategoryFilter !== 'all' && event.characters) {
                matchesCharacterCategory = event.characters.some(char => {
                    const character = this.characters.find(c => c.id === char.id);
                    return character && character.category === characterCategoryFilter;
                });
            }
            
            const matchesSearch = !searchInput || {
                'all': event.title.toLowerCase().includes(searchInput) ||
                    event.description.toLowerCase().includes(searchInput) ||
                    (event.tags && event.tags.some(tag => tag.toLowerCase().includes(searchInput))) ||
                    (event.characters && event.characters.some(char => 
                        char.name.toLowerCase().includes(searchInput)
                    )),
                'events': event.title.toLowerCase().includes(searchInput) ||
                    event.description.toLowerCase().includes(searchInput),
                'characters': event.characters && event.characters.some(char => 
                    char.name.toLowerCase().includes(searchInput)
                ),
                'tags': event.tags && event.tags.some(tag => tag.toLowerCase().includes(searchInput))
            }[searchScope];
            return matchesCategory && matchesCharacterCategory && matchesSearch;
        });
    },
    
    getCategoryName(category) {
        const categoryNames = {
            'political': '政治家',
            'military': '军事家',
            'scientist': '科学家',
            'literary': '文学家',
            'philosopher': '哲学家'
        };
        return categoryNames[category] || category;
    },
    
    setupEventListeners() {
        // 使用缓存的元素并添加 null 检查
        if (this.domCache.categoryFilter) {
            this.domCache.categoryFilter.addEventListener('change', () => this.renderTimeline());
        }
        if (this.domCache.characterCategoryFilter) {
            this.domCache.characterCategoryFilter.addEventListener('change', () => this.renderTimeline());
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
        
        document.addEventListener('click', (e) => {
            const characterLink = e.target.closest('.character-link');
            if (characterLink) {
                e.preventDefault();
                e.stopPropagation();
                const charId = characterLink.dataset.charId;
                this.showCharacterModal(charId);
            }
        });
        
        window.addEventListener('resize', () => this.updateTimelineHeight());
    },
    
    handleWheelZoom(e) {
    },
    
    zoomIn() {
        if (this.zoomLevel < 150) {
            this.zoomLevel += 10;
            this.updateZoom();
        }
    },
    
    zoomOut() {
        if (this.zoomLevel > 80) {
            this.zoomLevel -= 10;
            this.updateZoom();
        }
    },
    
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
        
        events.forEach(event => {
            const currentTop = parseInt(event.dataset.yearOffset);
            const index = parseInt(event.dataset.index);
            // 使用局部索引来计算垂直位置，确保缩放时位置计算正确
            const localIndex = index % 10;
            const topPosition = (currentTop + yearToEventSpacing + localIndex * eventSpacing) * zoomFactor;
            
            event.style.top = `${topPosition}px`;
            event.style.transform = `scale(${zoomFactor})`;
        });
        
        yearMarkers.forEach(marker => {
            const currentTop = parseInt(marker.dataset.yearOffset);
            const topPosition = currentTop * zoomFactor;
            
            marker.style.top = `${topPosition}px`;
            marker.style.transform = 'translateX(-50%)';
        });
        
        this.updateTimelineHeight();
    },
    


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
                            return event ? `<li>${event.year} - ${event.title}</li>` : '';
                        }).join('')}
                    </ul>
                </div>
            ` : ''}
        `;
        
        this.domCache.characterModal.classList.add('active');
    },
    
    hideCharacterModal() {
        this.domCache.characterModal.classList.remove('active');
    },
    

    

    

};

document.addEventListener('DOMContentLoaded', async () => {
    await TimelineApp.init();
});
