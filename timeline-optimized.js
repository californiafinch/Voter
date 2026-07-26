const TimelineApp = {
    events: [],
    characters: [],
    sortedCharacters: [],
    characterRegexMap: {},
    characterMap: {},
    zoomLevel: 100,
    domCache: {},
    yearPositions: {},
    searchDebounceTimer: null,
    currentView: 'timeline',
    favorites: {
        events: new Set(),
        characters: new Set()
    },
    currentEventIndex: -1,
    filteredEventList: [],
    currentFavoriteTab: 'events',

    async init() {
        console.log('开始初始化应用...');
        try {
            this.cacheDOMElements();
            this.showLoading();
            await this.loadEvents();
            await this.loadCharacters();
            this.buildCharacterMap();
            this.loadFavorites();
            this.setupEventListeners();
            this.hideLoading();
            this.renderTimeline();
            this.showTimelineContent();
            this.updateFilterTags();
            console.log('应用初始化完成');
        } catch (error) {
            console.error('初始化失败:', error);
            this.hideLoading();
            this.toast.error('初始化失败', '应用初始化失败，请刷新页面重试');
        }
    },

    buildCharacterMap() {
        this.characterMap = {};
        this.characters.forEach(char => {
            this.characterMap[char.id] = char;
        });
    },

    cacheDOMElements() {
        this.domCache = {
            timeline: document.getElementById('timeline'),
            searchInput: document.getElementById('searchInput'),
            searchScope: document.getElementById('searchScope'),
            categoryFilter: document.getElementById('categoryFilter'),
            characterCategoryFilter: document.getElementById('characterCategoryFilter'),
            regionFilter: document.getElementById('regionFilter'),
            periodFilter: document.getElementById('periodFilter'),
            zoomLevel: document.getElementById('zoomLevel'),
            characterModal: document.getElementById('characterModal'),
            characterInfo: document.getElementById('characterInfo'),
            noResults: document.getElementById('noResults'),
            countdownText: document.getElementById('countdownText'),
            timelineContainer: document.querySelector('.timeline-container'),
            navBar: document.querySelector('.fixed-nav-bar'),
            searchBtn: document.getElementById('searchBtn'),
            resetBtn: document.getElementById('resetBtn'),
            backToTop: document.getElementById('backToTop'),
            charactersGrid: document.getElementById('charactersGrid'),
            timelineView: document.getElementById('timelineView'),
            charactersView: document.getElementById('charactersView'),
            favoritesView: document.getElementById('favoritesView'),
            favoritesContent: document.getElementById('favoritesContent'),
            eventModal: document.getElementById('eventModal'),
            eventDetail: document.getElementById('eventDetail'),
            eventModalClose: document.getElementById('eventModalClose'),
            eventModalOverlay: document.getElementById('eventModalOverlay'),
            prevEventBtn: document.getElementById('prevEventBtn'),
            nextEventBtn: document.getElementById('nextEventBtn'),
            mobileFilterBtn: document.getElementById('mobileFilterBtn'),
            mobileFilterDrawer: document.getElementById('mobileFilterDrawer'),
            drawerOverlay: document.getElementById('drawerOverlay'),
            drawerClose: document.getElementById('drawerClose'),
            drawerApply: document.getElementById('drawerApply'),
            drawerReset: document.getElementById('drawerReset'),
            mobileCategoryFilter: document.getElementById('mobileCategoryFilter'),
            mobileCharacterCategoryFilter: document.getElementById('mobileCharacterCategoryFilter'),
            mobileRegionFilter: document.getElementById('mobileRegionFilter'),
            mobilePeriodFilter: document.getElementById('mobilePeriodFilter'),
            mobileSearchScope: document.getElementById('mobileSearchScope'),
            mobileSearchInput: document.getElementById('mobileSearchInput'),
            filterTagsBar: document.getElementById('filterTagsBar'),
            fixedNavBar: document.getElementById('fixedNavBar'),
            navExpandBtn: document.getElementById('navExpandBtn'),
            bottomNav: document.querySelector('.bottom-nav')
        };

        const missingElements = Object.entries(this.domCache)
            .filter(([key, value]) => !value)
            .map(([key]) => key);

        if (missingElements.length > 0) {
            console.warn('缺少的 DOM 元素:', missingElements);
        }
    },

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

    hideLoading() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.classList.add('fade-out');
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
            }, 300);
        }
    },

    toast: {
        container: null,

        init() {
            this.container = document.getElementById('toastContainer');
            if (!this.container) {
                this.container = document.createElement('div');
                this.container.id = 'toastContainer';
                this.container.className = 'toast-container';
                document.body.appendChild(this.container);
            }
        },

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

            const closeBtn = toast.querySelector('.toast-close');
            closeBtn.addEventListener('click', () => this.dismiss(toast));

            if (duration > 0) {
                setTimeout(() => this.dismiss(toast), duration);
            }

            return toast;
        },

        dismiss(toast) {
            if (!toast || !toast.parentNode) return;

            toast.classList.add('slide-out');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        },

        success(title, message, duration) {
            return this.show('success', title, message, duration);
        },

        error(title, message, duration) {
            return this.show('error', title, message, duration);
        },

        warning(title, message, duration) {
            return this.show('warning', title, message, duration);
        },

        info(title, message, duration) {
            return this.show('info', title, message, duration);
        },

        clearAll() {
            if (!this.container) return;

            const toasts = this.container.querySelectorAll('.toast');
            toasts.forEach(toast => this.dismiss(toast));
        }
    },

    loadFavorites() {
        try {
            const saved = localStorage.getItem('timelineFavorites');
            if (saved) {
                const data = JSON.parse(saved);
                this.favorites.events = new Set(data.events || []);
                this.favorites.characters = new Set(data.characters || []);
            }
        } catch (error) {
            console.error('加载收藏失败:', error);
        }
    },

    saveFavorites() {
        try {
            const data = {
                events: Array.from(this.favorites.events),
                characters: Array.from(this.favorites.characters)
            };
            localStorage.setItem('timelineFavorites', JSON.stringify(data));
        } catch (error) {
            console.error('保存收藏失败:', error);
        }
    },

    toggleFavorite(type, id) {
        const set = this.favorites[type];
        if (!set) return false;

        if (set.has(id)) {
            set.delete(id);
            this.toast.info('已取消收藏', '');
        } else {
            set.add(id);
            this.toast.success('已收藏', '');
        }

        this.saveFavorites();

        if (this.currentView === 'favorites') {
            this.renderFavorites();
        }

        return set.has(id);
    },

    isFavorite(type, id) {
        const set = this.favorites[type];
        return set ? set.has(id) : false;
    },

    switchView(viewName) {
        if (this.currentView === viewName) return;

        this.currentView = viewName;

        if (this.domCache.timelineView) {
            this.domCache.timelineView.style.display = viewName === 'timeline' ? 'block' : 'none';
        }
        if (this.domCache.charactersView) {
            this.domCache.charactersView.style.display = viewName === 'characters' ? 'block' : 'none';
        }
        if (this.domCache.favoritesView) {
            this.domCache.favoritesView.style.display = viewName === 'favorites' ? 'block' : 'none';
        }

        this.updateBottomNavActive(viewName);

        if (viewName === 'timeline') {
            this.renderTimeline();
        } else if (viewName === 'characters') {
            this.renderCharacters();
        } else if (viewName === 'favorites') {
            this.renderFavorites();
        }
    },

    updateBottomNavActive(viewName) {
        if (!this.domCache.bottomNav) return;

        const navItems = this.domCache.bottomNav.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.view === viewName) {
                item.classList.add('active');
            }
        });
    },

    renderTimeline() {
        try {
            console.log('开始渲染时间轴...');
            const timeline = this.domCache.timeline;

            if (!timeline) {
                console.error('timeline 元素不存在');
                return;
            }

            timeline.querySelectorAll('.timeline-event, .timeline-year-marker, .load-more-btn').forEach(el => el.remove());

            const filteredEvents = this.filterEvents();
            this.filteredEventList = filteredEvents.sort((a, b) => this.parseYear(a.year) - this.parseYear(b.year));
            const sortedEvents = this.filteredEventList;

            const eventsByYear = {};
            sortedEvents.forEach(event => {
                if (!eventsByYear[event.year]) {
                    eventsByYear[event.year] = [];
                }
                eventsByYear[event.year].push(event);
            });

            const categoryOrder = ['organize', 'military', 'diplomacy', 'personage'];

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

            const sortedYears = Object.keys(eventsByYear).sort((a, b) => this.parseYear(a) - this.parseYear(b));

            const eventSpacing = 150;
            const yearToEventSpacing = 50;
            const yearSpacing = 150;
            const zoomFactor = this.zoomLevel / 100;

            let currentTop = 80;
            const yearPositions = {};
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

                yearEvents.forEach((event, eventIndex) => {
                    const eventElement = this.createEventElement(
                        event,
                        yearIndex,
                        eventIndex,
                        currentTop + yearToEventSpacing,
                        zoomFactor,
                        eventSpacing
                    );
                    fragment.appendChild(eventElement);
                });

                currentTop += yearToEventSpacing + yearEvents.length * eventSpacing + yearSpacing;
            });

            timeline.appendChild(fragment);

            this.yearPositions = yearPositions;
            this.updateTimelineHeight();
            this.updateFilterTags();
            console.log('时间轴渲染完成');
        } catch (error) {
            console.error('渲染时间轴失败:', error);
            this.toast.error('渲染失败', '渲染时间轴失败，请刷新页面重试');
        }
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

    createEventElement(event, yearIndex, eventIndex, currentTop, zoomFactor, eventSpacing) {
        const eventDiv = document.createElement('div');
        const globalEventIndex = yearIndex * 100 + eventIndex;
        eventDiv.className = `timeline-event ${globalEventIndex % 2 === 0 ? 'left' : 'right'}`;
        eventDiv.dataset.yearOffset = currentTop;
        eventDiv.dataset.eventIndex = eventIndex;
        eventDiv.dataset.eventId = event.id;

        const topPosition = (currentTop + eventIndex * eventSpacing) * zoomFactor;

        eventDiv.style.top = `${topPosition}px`;
        eventDiv.style.transform = `scale(${zoomFactor})`;

        const searchTerm = this.domCache.searchInput.value.trim();
        const categoryLabel = this.getCategoryLabel(event.category);

        const linkedTitle = this.linkCharactersInText(event.title, searchTerm);
        const descriptionText = Array.isArray(event.description) ? event.description.join('<br>') : event.description;
        const linkedDescription = this.linkCharactersInText(descriptionText, searchTerm);
        const linkedCategory = this.linkCharactersInText(categoryLabel, searchTerm);

        const isLeft = globalEventIndex % 2 === 0;
        const tagAlignment = isLeft ? 'flex-end' : 'flex-start';

        const isFav = this.isFavorite('events', event.id);

        eventDiv.innerHTML = `
            <div class="event-card ${event.category}">
                <button class="event-favorite-btn ${isFav ? 'active' : ''}" data-event-id="${event.id}" title="${isFav ? '取消收藏' : '收藏'}">
                    ${isFav ? '★' : '☆'}
                </button>
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

        eventDiv.addEventListener('click', (e) => {
            if (e.target.closest('.event-favorite-btn') || e.target.closest('.character-link')) {
                return;
            }
            this.showEventModal(event.id);
        });

        const favBtn = eventDiv.querySelector('.event-favorite-btn');
        if (favBtn) {
            favBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleFavorite('events', event.id);
                const isNowFav = this.isFavorite('events', event.id);
                favBtn.classList.toggle('active', isNowFav);
                favBtn.textContent = isNowFav ? '★' : '☆';
                favBtn.title = isNowFav ? '取消收藏' : '收藏';
            });
        }

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

        const documentHeight = document.documentElement.scrollHeight;
        const windowHeight = window.innerHeight;
        const requiredHeight = Math.max(maxTopPosition + 400, documentHeight, windowHeight);
        timeline.style.height = `${requiredHeight}px`;

        const timelineContainer = this.domCache.timelineContainer;
        if (timelineContainer) {
            timelineContainer.style.minHeight = `${requiredHeight}px`;
        }
    },

    parseYear(yearStr) {
        if (yearStr.includes('公元前')) {
            return -parseInt(yearStr.replace('公元前', '').replace('年', ''));
        }
        return parseInt(yearStr.replace('公元', '').replace('年', ''));
    },

    getCategoryLabel(category) {
        const labels = {
            'organize': '组织',
            'military': '军事',
            'diplomacy': '外交',
            'personage': '人物'
        };
        return labels[category] || category;
    },

    filterEvents() {
        const categoryFilter = this.domCache.categoryFilter.value;
        const characterCategoryFilter = this.domCache.characterCategoryFilter.value;
        const regionFilter = this.domCache.regionFilter?.value || 'all';
        const periodFilter = this.domCache.periodFilter?.value || 'all';
        const searchInput = this.domCache.searchInput.value.toLowerCase();
        const searchScope = this.domCache.searchScope?.value || 'all';

        const getCharacter = (charId) => this.characterMap[charId];

        return this.events.filter(event => {
            const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter;

            let matchesCharacterCategory = true;
            if (characterCategoryFilter !== 'all' && event.characters) {
                matchesCharacterCategory = event.characters.some(char => {
                    const character = getCharacter(char.id);
                    if (!character) return false;
                    return Array.isArray(character.category) ?
                        character.category.includes(characterCategoryFilter) :
                        character.category === characterCategoryFilter;
                });
            }

            const matchesRegion = regionFilter === 'all' ||
                (event.tags && event.tags.some(tag => tag.includes(regionFilter))) ||
                (event.characters && event.characters.some(char => {
                    const character = getCharacter(char.id);
                    return character && character.tags && character.tags.some(tag => tag.includes(regionFilter));
                }));

            const matchesPeriod = periodFilter === 'all' ||
                (event.tags && event.tags.some(tag => tag.includes(periodFilter))) ||
                (event.characters && event.characters.some(char => {
                    const character = getCharacter(char.id);
                    return character && character.tags && character.tags.some(tag => tag.includes(periodFilter));
                }));

            let matchesSearch = true;
            if (searchInput) {
                const searchScopes = {
                    'all': () => {
                        const descMatch = Array.isArray(event.description)
                            ? event.description.some(d => d.toLowerCase().includes(searchInput))
                            : event.description && event.description.toLowerCase().includes(searchInput);
                        return event.title.toLowerCase().includes(searchInput) ||
                            descMatch ||
                            (event.tags && event.tags.some(tag => tag.toLowerCase().includes(searchInput))) ||
                            (event.characters && event.characters.some(char => char.name.toLowerCase().includes(searchInput)));
                    },
                    'events': () => {
                        const descMatch = Array.isArray(event.description)
                            ? event.description.some(d => d.toLowerCase().includes(searchInput))
                            : event.description && event.description.toLowerCase().includes(searchInput);
                        return event.title.toLowerCase().includes(searchInput) || descMatch;
                    },
                    'characters': () => event.characters && event.characters.some(char => char.name.toLowerCase().includes(searchInput)),
                    'region': () => event.tags && event.tags.some(tag => tag.toLowerCase().includes(searchInput)),
                    'period': () => event.tags && event.tags.some(tag => tag.toLowerCase().includes(searchInput))
                };
                matchesSearch = searchScopes[searchScope] ? searchScopes[searchScope]() : true;
            }

            return matchesCategory && matchesCharacterCategory && matchesRegion && matchesPeriod && matchesSearch;
        });
    },

    filterCharacters() {
        const characterCategoryFilter = this.domCache.characterCategoryFilter.value;
        const regionFilter = this.domCache.regionFilter?.value || 'all';
        const periodFilter = this.domCache.periodFilter?.value || 'all';
        const searchInput = this.domCache.searchInput.value.toLowerCase();
        const searchScope = this.domCache.searchScope?.value || 'all';

        return this.characters.filter(character => {
            let matchesCategory = true;
            if (characterCategoryFilter !== 'all') {
                matchesCategory = Array.isArray(character.category)
                    ? character.category.includes(characterCategoryFilter)
                    : character.category === characterCategoryFilter;
            }

            const matchesRegion = regionFilter === 'all' ||
                (character.tags && character.tags.some(tag => tag.includes(regionFilter)));

            const matchesPeriod = periodFilter === 'all' ||
                (character.tags && character.tags.some(tag => tag.includes(periodFilter)));

            let matchesSearch = true;
            if (searchInput) {
                const searchInAll = () => {
                    const nameMatch = character.name.toLowerCase().includes(searchInput);
                    const titleMatch = character.title && character.title.toLowerCase().includes(searchInput);
                    const descMatch = character.description && character.description.toLowerCase().includes(searchInput);
                    const tagMatch = character.tags && character.tags.some(tag => tag.toLowerCase().includes(searchInput));
                    return nameMatch || titleMatch || descMatch || tagMatch;
                };

                const searchInName = () => character.name.toLowerCase().includes(searchInput);

                const searchInTags = () => character.tags && character.tags.some(tag => tag.toLowerCase().includes(searchInput));

                if (searchScope === 'all' || searchScope === 'characters') {
                    matchesSearch = searchInAll();
                } else if (searchScope === 'region' || searchScope === 'period') {
                    matchesSearch = searchInTags();
                } else {
                    matchesSearch = searchInName();
                }
            }

            return matchesCategory && matchesRegion && matchesPeriod && matchesSearch;
        });
    },

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

    renderCharacters() {
        try {
            console.log('开始渲染人物列表...');
            const grid = this.domCache.charactersGrid;

            if (!grid) {
                console.error('charactersGrid 元素不存在');
                return;
            }

            grid.innerHTML = '';

            const filteredCharacters = this.filterCharacters();
            const fragment = document.createDocumentFragment();

            if (filteredCharacters.length === 0) {
                const noResults = document.createElement('div');
                noResults.className = 'no-characters';
                noResults.textContent = '没有找到匹配的人物';
                grid.appendChild(noResults);
                return;
            }

            filteredCharacters.forEach(character => {
                const card = this.createCharacterCard(character);
                fragment.appendChild(card);
            });

            grid.appendChild(fragment);
            console.log('人物列表渲染完成，共', filteredCharacters.length, '人');
        } catch (error) {
            console.error('渲染人物列表失败:', error);
            this.toast.error('渲染失败', '渲染人物列表失败，请刷新页面重试');
        }
    },

    createCharacterCard(character) {
        const card = document.createElement('div');
        card.className = 'character-card';
        card.dataset.charId = character.id;

        const firstChar = character.name ? character.name.charAt(0) : '?';
        const isFav = this.isFavorite('characters', character.id);
        const categoryText = this.getCategoryName(character.category);

        card.innerHTML = `
            <button class="character-favorite-btn ${isFav ? 'active' : ''}" data-char-id="${character.id}" title="${isFav ? '取消收藏' : '收藏'}">
                ${isFav ? '★' : '☆'}
            </button>
            <div class="character-avatar">${firstChar}</div>
            <div class="character-card-name">${character.name}</div>
            <div class="character-card-title">${character.title || ''}</div>
            <div class="character-card-dates">${character.birth || ''} - ${character.death || ''}</div>
            ${character.category ? `<div class="character-card-category">${categoryText}</div>` : ''}
        `;

        card.addEventListener('click', (e) => {
            if (e.target.closest('.character-favorite-btn')) {
                return;
            }
            this.showCharacterModal(character.id);
        });

        const favBtn = card.querySelector('.character-favorite-btn');
        if (favBtn) {
            favBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleFavorite('characters', character.id);
                const isNowFav = this.isFavorite('characters', character.id);
                favBtn.classList.toggle('active', isNowFav);
                favBtn.textContent = isNowFav ? '★' : '☆';
                favBtn.title = isNowFav ? '取消收藏' : '收藏';
            });
        }

        return card;
    },

    renderFavorites() {
        try {
            const content = this.domCache.favoritesContent;
            if (!content) return;

            const favEvents = Array.from(this.favorites.events)
                .map(id => this.events.find(e => e.id === id))
                .filter(e => e)
                .sort((a, b) => this.parseYear(a.year) - this.parseYear(b.year));

            const favCharacters = Array.from(this.favorites.characters)
                .map(id => this.characterMap[id])
                .filter(c => c);

            content.innerHTML = `
                <div class="favorites-tabs">
                    <button class="fav-tab ${this.currentFavoriteTab === 'events' ? 'active' : ''}" data-tab="events">
                        事件收藏 (${favEvents.length})
                    </button>
                    <button class="fav-tab ${this.currentFavoriteTab === 'characters' ? 'active' : ''}" data-tab="characters">
                        人物收藏 (${favCharacters.length})
                    </button>
                </div>
                <div class="favorites-tab-content">
                    ${this.currentFavoriteTab === 'events' ? this.renderFavoritesEvents(favEvents) : this.renderFavoritesCharacters(favCharacters)}
                </div>
            `;

            const tabs = content.querySelectorAll('.fav-tab');
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    this.currentFavoriteTab = tab.dataset.tab;
                    this.renderFavorites();
                });
            });

            const eventCards = content.querySelectorAll('.fav-event-item');
            eventCards.forEach(card => {
                card.addEventListener('click', (e) => {
                    if (e.target.closest('.fav-item-fav-btn') || e.target.closest('.character-link')) {
                        return;
                    }
                    const eventId = card.dataset.eventId;
                    this.showEventModal(eventId);
                });
            });

            const charCards = content.querySelectorAll('.fav-character-item');
            charCards.forEach(card => {
                card.addEventListener('click', (e) => {
                    if (e.target.closest('.fav-item-fav-btn')) {
                        return;
                    }
                    const charId = card.dataset.charId;
                    this.showCharacterModal(charId);
                });
            });

            const favBtns = content.querySelectorAll('.fav-item-fav-btn');
            favBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const type = btn.dataset.type;
                    const id = btn.dataset.id;
                    this.toggleFavorite(type, id);
                });
            });
        } catch (error) {
            console.error('渲染收藏页失败:', error);
        }
    },

    renderFavoritesEvents(events) {
        if (events.length === 0) {
            return '<div class="empty-favorites">暂无收藏的事件</div>';
        }

        return `
            <div class="fav-events-list">
                ${events.map(event => {
                    const categoryLabel = this.getCategoryLabel(event.category);
                    const isFav = this.isFavorite('events', event.id);
                    return `
                        <div class="fav-event-item" data-event-id="${event.id}">
                            <button class="fav-item-fav-btn ${isFav ? 'active' : ''}" data-type="events" data-id="${event.id}">
                                ${isFav ? '★' : '☆'}
                            </button>
                            <div class="fav-event-year">${event.year}</div>
                            <div class="fav-event-category">${categoryLabel}</div>
                            <div class="fav-event-title">${event.title}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    renderFavoritesCharacters(characters) {
        if (characters.length === 0) {
            return '<div class="empty-favorites">暂无收藏的人物</div>';
        }

        return `
            <div class="fav-characters-list">
                ${characters.map(char => {
                    const firstChar = char.name ? char.name.charAt(0) : '?';
                    const isFav = this.isFavorite('characters', char.id);
                    const categoryText = this.getCategoryName(char.category);
                    return `
                        <div class="fav-character-item" data-char-id="${char.id}">
                            <button class="fav-item-fav-btn ${isFav ? 'active' : ''}" data-type="characters" data-id="${char.id}">
                                ${isFav ? '★' : '☆'}
                            </button>
                            <div class="fav-char-avatar">${firstChar}</div>
                            <div class="fav-char-info">
                                <div class="fav-char-name">${char.name}</div>
                                <div class="fav-char-title">${char.title || ''}</div>
                                <div class="fav-char-category">${categoryText}</div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    showEventModal(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (!event) return;

        const index = this.filteredEventList.findIndex(e => e.id === eventId);
        this.currentEventIndex = index >= 0 ? index : 0;

        this.renderEventDetail(event);

        if (this.domCache.eventModal) {
            this.domCache.eventModal.classList.add('active');
        }

        this.updateEventNavButtons();
    },

    renderEventDetail(event) {
        const detail = this.domCache.eventDetail;
        if (!detail) return;

        const categoryLabel = this.getCategoryLabel(event.category);
        const isFav = this.isFavorite('events', event.id);
        const descriptionText = Array.isArray(event.description) ? event.description.join('<br><br>') : event.description;
        const linkedDescription = this.linkCharactersInText(descriptionText, '');

        let charactersHtml = '';
        if (event.characters && event.characters.length > 0) {
            charactersHtml = `
                <div class="event-detail-section">
                    <h4>关联人物</h4>
                    <div class="event-detail-characters">
                        ${event.characters.map(char => {
                            const character = this.characterMap[char.id];
                            if (!character) return '';
                            const firstChar = character.name ? character.name.charAt(0) : '?';
                            return `
                                <div class="event-character-item character-link" data-char-id="${character.id}">
                                    <div class="event-char-avatar">${firstChar}</div>
                                    <div class="event-char-name">${character.name}</div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }

        detail.innerHTML = `
            <div class="event-detail-header">
                <button class="event-detail-fav ${isFav ? 'active' : ''}" data-event-id="${event.id}" title="${isFav ? '取消收藏' : '收藏'}">
                    ${isFav ? '★' : '☆'}
                </button>
                <div class="event-detail-year">${event.year}</div>
                <h2 class="event-detail-title">${event.title}</h2>
                <div class="event-detail-category">${categoryLabel}</div>
            </div>
            <div class="event-detail-body">
                <div class="event-detail-section">
                    <h4>详细描述</h4>
                    <div class="event-detail-description">${linkedDescription}</div>
                </div>
                ${event.location ? `
                    <div class="event-detail-section">
                        <h4>地点</h4>
                        <div class="event-detail-location">${event.location}</div>
                    </div>
                ` : ''}
                ${event.tags && event.tags.length > 0 ? `
                    <div class="event-detail-section">
                        <h4>标签</h4>
                        <div class="event-detail-tags">
                            ${event.tags.map(tag => `<span class="event-tag">${tag}</span>`).join('')}
                        </div>
                    </div>
                ` : ''}
                ${charactersHtml}
            </div>
        `;

        const favBtn = detail.querySelector('.event-detail-fav');
        if (favBtn) {
            favBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleFavorite('events', event.id);
                const isNowFav = this.isFavorite('events', event.id);
                favBtn.classList.toggle('active', isNowFav);
                favBtn.textContent = isNowFav ? '★' : '☆';
                favBtn.title = isNowFav ? '取消收藏' : '收藏';
            });
        }

        const charLinks = detail.querySelectorAll('.event-character-item');
        charLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.stopPropagation();
                const charId = link.dataset.charId;
                this.hideEventModal();
                setTimeout(() => this.showCharacterModal(charId), 100);
            });
        });
    },

    updateEventNavButtons() {
        if (this.domCache.prevEventBtn) {
            this.domCache.prevEventBtn.disabled = this.currentEventIndex <= 0;
        }
        if (this.domCache.nextEventBtn) {
            this.domCache.nextEventBtn.disabled = this.currentEventIndex >= this.filteredEventList.length - 1;
        }
    },

    hideEventModal() {
        if (this.domCache.eventModal) {
            this.domCache.eventModal.classList.remove('active');
        }
        this.currentEventIndex = -1;
    },

    showPrevEvent() {
        if (this.currentEventIndex > 0) {
            this.currentEventIndex--;
            const event = this.filteredEventList[this.currentEventIndex];
            if (event) {
                this.renderEventDetail(event);
                this.updateEventNavButtons();
            }
        }
    },

    showNextEvent() {
        if (this.currentEventIndex < this.filteredEventList.length - 1) {
            this.currentEventIndex++;
            const event = this.filteredEventList[this.currentEventIndex];
            if (event) {
                this.renderEventDetail(event);
                this.updateEventNavButtons();
            }
        }
    },

    openFilterDrawer() {
        this.syncFiltersToDrawer();

        if (this.domCache.mobileFilterDrawer) {
            this.domCache.mobileFilterDrawer.classList.add('active');
        }
        if (this.domCache.drawerOverlay) {
            this.domCache.drawerOverlay.classList.add('active');
        }
    },

    closeFilterDrawer() {
        if (this.domCache.mobileFilterDrawer) {
            this.domCache.mobileFilterDrawer.classList.remove('active');
        }
        if (this.domCache.drawerOverlay) {
            this.domCache.drawerOverlay.classList.remove('active');
        }
    },

    syncFiltersToDrawer() {
        if (this.domCache.mobileCategoryFilter && this.domCache.categoryFilter) {
            this.domCache.mobileCategoryFilter.value = this.domCache.categoryFilter.value;
        }
        if (this.domCache.mobileCharacterCategoryFilter && this.domCache.characterCategoryFilter) {
            this.domCache.mobileCharacterCategoryFilter.value = this.domCache.characterCategoryFilter.value;
        }
        if (this.domCache.mobileRegionFilter && this.domCache.regionFilter) {
            this.domCache.mobileRegionFilter.value = this.domCache.regionFilter.value;
        }
        if (this.domCache.mobilePeriodFilter && this.domCache.periodFilter) {
            this.domCache.mobilePeriodFilter.value = this.domCache.periodFilter.value;
        }
        if (this.domCache.mobileSearchScope && this.domCache.searchScope) {
            this.domCache.mobileSearchScope.value = this.domCache.searchScope.value;
        }
        if (this.domCache.mobileSearchInput && this.domCache.searchInput) {
            this.domCache.mobileSearchInput.value = this.domCache.searchInput.value;
        }
    },

    syncDrawerToFilters() {
        if (this.domCache.mobileCategoryFilter && this.domCache.categoryFilter) {
            this.domCache.categoryFilter.value = this.domCache.mobileCategoryFilter.value;
        }
        if (this.domCache.mobileCharacterCategoryFilter && this.domCache.characterCategoryFilter) {
            this.domCache.characterCategoryFilter.value = this.domCache.mobileCharacterCategoryFilter.value;
        }
        if (this.domCache.mobileRegionFilter && this.domCache.regionFilter) {
            this.domCache.regionFilter.value = this.domCache.mobileRegionFilter.value;
        }
        if (this.domCache.mobilePeriodFilter && this.domCache.periodFilter) {
            this.domCache.periodFilter.value = this.domCache.mobilePeriodFilter.value;
        }
        if (this.domCache.mobileSearchScope && this.domCache.searchScope) {
            this.domCache.searchScope.value = this.domCache.mobileSearchScope.value;
        }
        if (this.domCache.mobileSearchInput && this.domCache.searchInput) {
            this.domCache.searchInput.value = this.domCache.mobileSearchInput.value;
        }
    },

    applyDrawerFilters() {
        this.syncDrawerToFilters();
        this.closeFilterDrawer();

        if (this.currentView === 'timeline') {
            this.renderTimeline();
        } else if (this.currentView === 'characters') {
            this.renderCharacters();
        }
    },

    resetDrawerFilters() {
        if (this.domCache.mobileCategoryFilter) {
            this.domCache.mobileCategoryFilter.value = 'all';
        }
        if (this.domCache.mobileCharacterCategoryFilter) {
            this.domCache.mobileCharacterCategoryFilter.value = 'all';
        }
        if (this.domCache.mobileRegionFilter) {
            this.domCache.mobileRegionFilter.value = 'all';
        }
        if (this.domCache.mobilePeriodFilter) {
            this.domCache.mobilePeriodFilter.value = 'all';
        }
        if (this.domCache.mobileSearchScope) {
            this.domCache.mobileSearchScope.value = 'all';
        }
        if (this.domCache.mobileSearchInput) {
            this.domCache.mobileSearchInput.value = '';
        }
    },

    updateFilterTags() {
        const tagsBar = this.domCache.filterTagsBar;
        if (!tagsBar) return;

        const tags = [];

        const categoryFilter = this.domCache.categoryFilter?.value;
        if (categoryFilter && categoryFilter !== 'all') {
            tags.push({
                type: 'category',
                label: this.getCategoryLabel(categoryFilter),
                value: categoryFilter
            });
        }

        const charCatFilter = this.domCache.characterCategoryFilter?.value;
        if (charCatFilter && charCatFilter !== 'all') {
            tags.push({
                type: 'characterCategory',
                label: this.getCategoryName(charCatFilter),
                value: charCatFilter
            });
        }

        const regionFilter = this.domCache.regionFilter?.value;
        if (regionFilter && regionFilter !== 'all') {
            tags.push({
                type: 'region',
                label: regionFilter,
                value: regionFilter
            });
        }

        const periodFilter = this.domCache.periodFilter?.value;
        if (periodFilter && periodFilter !== 'all') {
            tags.push({
                type: 'period',
                label: periodFilter,
                value: periodFilter
            });
        }

        const searchInput = this.domCache.searchInput?.value?.trim();
        if (searchInput) {
            tags.push({
                type: 'search',
                label: `搜索: ${searchInput}`,
                value: searchInput
            });
        }

        if (tags.length === 0) {
            tagsBar.style.display = 'none';
            return;
        }

        tagsBar.style.display = 'flex';
        tagsBar.innerHTML = tags.map(tag => `
            <span class="filter-tag" data-type="${tag.type}" data-value="${tag.value}">
                ${tag.label}
                <span class="filter-tag-remove">&times;</span>
            </span>
        `).join('');

        const tagElements = tagsBar.querySelectorAll('.filter-tag');
        tagElements.forEach(tagEl => {
            tagEl.addEventListener('click', () => {
                this.removeFilterTag(tagEl.dataset.type);
            });
        });
    },

    removeFilterTag(type) {
        switch (type) {
            case 'category':
                if (this.domCache.categoryFilter) {
                    this.domCache.categoryFilter.value = 'all';
                }
                break;
            case 'characterCategory':
                if (this.domCache.characterCategoryFilter) {
                    this.domCache.characterCategoryFilter.value = 'all';
                }
                break;
            case 'region':
                if (this.domCache.regionFilter) {
                    this.domCache.regionFilter.value = 'all';
                }
                break;
            case 'period':
                if (this.domCache.periodFilter) {
                    this.domCache.periodFilter.value = 'all';
                }
                break;
            case 'search':
                if (this.domCache.searchInput) {
                    this.domCache.searchInput.value = '';
                }
                break;
        }

        if (this.currentView === 'timeline') {
            this.renderTimeline();
        } else if (this.currentView === 'characters') {
            this.renderCharacters();
        }
    },

    setupEventListeners() {
        if (this.domCache.categoryFilter) {
            this.domCache.categoryFilter.addEventListener('change', () => {
                if (this.currentView === 'timeline') {
                    this.renderTimeline();
                } else if (this.currentView === 'characters') {
                    this.renderCharacters();
                }
            });
        }
        if (this.domCache.characterCategoryFilter) {
            this.domCache.characterCategoryFilter.addEventListener('change', () => {
                if (this.currentView === 'timeline') {
                    this.renderTimeline();
                } else if (this.currentView === 'characters') {
                    this.renderCharacters();
                }
            });
        }
        if (this.domCache.regionFilter) {
            this.domCache.regionFilter.addEventListener('change', () => {
                if (this.currentView === 'timeline') {
                    this.renderTimeline();
                } else if (this.currentView === 'characters') {
                    this.renderCharacters();
                }
            });
        }
        if (this.domCache.periodFilter) {
            this.domCache.periodFilter.addEventListener('change', () => {
                if (this.currentView === 'timeline') {
                    this.renderTimeline();
                } else if (this.currentView === 'characters') {
                    this.renderCharacters();
                }
            });
        }
        if (this.domCache.searchScope) {
            this.domCache.searchScope.addEventListener('change', () => {
                if (this.currentView === 'timeline') {
                    this.renderTimeline();
                } else if (this.currentView === 'characters') {
                    this.renderCharacters();
                }
            });
        }
        if (this.domCache.searchBtn) {
            this.domCache.searchBtn.addEventListener('click', () => {
                if (this.currentView === 'timeline') {
                    this.renderTimeline();
                } else if (this.currentView === 'characters') {
                    this.renderCharacters();
                }
            });
        }
        if (this.domCache.searchInput) {
            this.domCache.searchInput.addEventListener('input', () => {
                this.debouncedSearch();
            });
            this.domCache.searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    if (this.currentView === 'timeline') {
                        this.renderTimeline();
                    } else if (this.currentView === 'characters') {
                        this.renderCharacters();
                    }
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

        if (this.domCache.eventModalClose) {
            this.domCache.eventModalClose.addEventListener('click', () => this.hideEventModal());
        }
        if (this.domCache.eventModalOverlay) {
            this.domCache.eventModalOverlay.addEventListener('click', () => this.hideEventModal());
        }
        if (this.domCache.prevEventBtn) {
            this.domCache.prevEventBtn.addEventListener('click', () => this.showPrevEvent());
        }
        if (this.domCache.nextEventBtn) {
            this.domCache.nextEventBtn.addEventListener('click', () => this.showNextEvent());
        }

        if (this.domCache.mobileFilterBtn) {
            this.domCache.mobileFilterBtn.addEventListener('click', () => this.openFilterDrawer());
        }
        if (this.domCache.drawerClose) {
            this.domCache.drawerClose.addEventListener('click', () => this.closeFilterDrawer());
        }
        if (this.domCache.drawerOverlay) {
            this.domCache.drawerOverlay.addEventListener('click', () => this.closeFilterDrawer());
        }
        if (this.domCache.drawerApply) {
            this.domCache.drawerApply.addEventListener('click', () => this.applyDrawerFilters());
        }
        if (this.domCache.drawerReset) {
            this.domCache.drawerReset.addEventListener('click', () => this.resetDrawerFilters());
        }

        if (this.domCache.bottomNav) {
            const navItems = this.domCache.bottomNav.querySelectorAll('.nav-item');
            navItems.forEach(item => {
                item.addEventListener('click', () => {
                    const view = item.dataset.view;
                    if (view) {
                        this.switchView(view);
                    }
                });
            });
        }

        if (this.domCache.navExpandBtn) {
            this.domCache.navExpandBtn.addEventListener('click', () => this.expandNavBar());
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

        window.addEventListener('resize', () => {
            if (this.currentView === 'timeline') {
                this.updateTimelineHeight();
            }
        });

        window.addEventListener('scroll', () => {
            this.toggleBackToTop();
            this.handleNavBarScroll();
        });

        if (this.domCache.backToTop) {
            this.domCache.backToTop.addEventListener('click', () => this.scrollToTop());
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.domCache.eventModal && this.domCache.eventModal.classList.contains('active')) {
                    this.hideEventModal();
                } else if (this.domCache.characterModal && this.domCache.characterModal.classList.contains('active')) {
                    this.hideCharacterModal();
                } else if (this.domCache.mobileFilterDrawer && this.domCache.mobileFilterDrawer.classList.contains('active')) {
                    this.closeFilterDrawer();
                }
            }

            if (this.domCache.eventModal && this.domCache.eventModal.classList.contains('active')) {
                if (e.key === 'ArrowLeft') {
                    this.showPrevEvent();
                } else if (e.key === 'ArrowRight') {
                    this.showNextEvent();
                }
            }
        });
    },

    toggleBackToTop() {
        if (!this.domCache.backToTop) return;
        if (window.scrollY > 300) {
            this.domCache.backToTop.classList.add('visible');
        } else {
            this.domCache.backToTop.classList.remove('visible');
        }
    },

    handleNavBarScroll() {
        if (!this.domCache.fixedNavBar || !this.domCache.navExpandBtn) return;

        const scrollY = window.scrollY;
        const navBar = this.domCache.fixedNavBar;
        const expandBtn = this.domCache.navExpandBtn;

        if (scrollY > 120 && !navBar.classList.contains('collapsed')) {
            navBar.classList.add('collapsed');
            expandBtn.classList.add('visible');
        }
    },

    expandNavBar() {
        if (!this.domCache.fixedNavBar || !this.domCache.navExpandBtn) return;
        this.domCache.fixedNavBar.classList.remove('collapsed');
        this.domCache.navExpandBtn.classList.remove('visible');
    },

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        this.expandNavBar();
    },

    debouncedSearch() {
        if (this.searchDebounceTimer) {
            clearTimeout(this.searchDebounceTimer);
        }
        this.searchDebounceTimer = setTimeout(() => {
            if (this.currentView === 'timeline') {
                this.renderTimeline();
            } else if (this.currentView === 'characters') {
                this.renderCharacters();
            }
        }, 300);
    },

    clearSearch() {
        this.domCache.searchInput.value = '';
        if (this.domCache.searchScope) {
            this.domCache.searchScope.value = 'all';
        }
        this.domCache.categoryFilter.value = 'all';
        this.domCache.characterCategoryFilter.value = 'all';
        if (this.domCache.regionFilter) {
            this.domCache.regionFilter.value = 'all';
        }
        if (this.domCache.periodFilter) {
            this.domCache.periodFilter.value = 'all';
        }
        if (this.currentView === 'timeline') {
            this.renderTimeline();
        } else if (this.currentView === 'characters') {
            this.renderCharacters();
        }
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
            const eventIndex = parseInt(event.dataset.eventIndex);
            const topPosition = (currentTop + eventIndex * eventSpacing) * zoomFactor;

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
        const character = this.characterMap[charId];
        if (!character) return;

        const characterInfo = this.domCache.characterInfo;
        const category = character.category;
        const categoryText = Array.isArray(category)
            ? category.map(c => this.getCategoryName(c)).join('、')
            : this.getCategoryName(category);

        const isFav = this.isFavorite('characters', character.id);

        characterInfo.innerHTML = `
            <div class="character-modal-header">
                <button class="character-modal-fav ${isFav ? 'active' : ''}" data-char-id="${character.id}" title="${isFav ? '取消收藏' : '收藏'}">
                    ${isFav ? '★' : '☆'}
                </button>
            </div>
            <h2>${character.name}</h2>
            <div class="character-title">${character.title}</div>
            <div class="character-dates">${character.birth} - ${character.death}</div>
            ${category ? `<div class="character-category">${categoryText}</div>` : ''}
            <div class="character-bio">${character.description}</div>

            ${character.achievements ? `
                <div class="character-section">
                    <h3>主要成就</h3>
                    <ul class="character-list">
                        ${character.achievements.map(ach => `<li>${ach}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}

            ${character.tags ? `
                <div class="character-section">
                    <h3>标签</h3>
                    <div class="character-tags">
                        ${character.tags.map(tag => `<span class="character-tag">${tag}</span>`).join('')}
                    </div>
                </div>
            ` : ''}

            ${character.relatedEvents ? `
                <div class="character-section">
                    <h3>相关事件</h3>
                    <ul class="character-list">
                        ${this.getRelatedEventsSorted(character.relatedEvents).map(item => {
                            return `<li class="character-event-link" data-event-id="${item.event.id}">${item.event.year} - ${item.event.title}</li>`;
                        }).join('')}
                    </ul>
                </div>
            ` : ''}
        `;

        const favBtn = characterInfo.querySelector('.character-modal-fav');
        if (favBtn) {
            favBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleFavorite('characters', character.id);
                const isNowFav = this.isFavorite('characters', character.id);
                favBtn.classList.toggle('active', isNowFav);
                favBtn.textContent = isNowFav ? '★' : '☆';
                favBtn.title = isNowFav ? '取消收藏' : '收藏';
            });
        }

        const eventLinks = characterInfo.querySelectorAll('.character-event-link');
        eventLinks.forEach(link => {
            link.style.cursor = 'pointer';
            link.addEventListener('click', (e) => {
                e.stopPropagation();
                const eventId = link.dataset.eventId;
                this.hideCharacterModal();
                setTimeout(() => this.showEventModal(eventId), 100);
            });
        });

        this.domCache.characterModal.classList.add('active');
    },

    getRelatedEventsSorted(relatedEventIds) {
        return relatedEventIds
            .map(eventId => {
                const event = this.events.find(e => e.id === eventId);
                return event ? { event, year: this.parseYear(event.year) } : null;
            })
            .filter(item => item !== null)
            .sort((a, b) => a.year - b.year);
    },

    hideCharacterModal() {
        this.domCache.characterModal.classList.remove('active');
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    await TimelineApp.init();
});
