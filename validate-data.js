const fs = require('fs');
const path = require('path');

function loadData(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const match = content.match(/=\s*(\[[\s\S]*\]);\s*$/);
    if (!match) {
        throw new Error(`无法解析 ${filePath}`);
    }
    return eval(`(${match[1]})`);
}

function validateEvents(events, characters) {
    const errors = [];
    const warnings = [];
    const eventIds = new Set();
    const charIds = new Set(characters.map(c => c.id));

    events.forEach((event, index) => {
        const prefix = `事件[${index}] ${event.id || '(无ID)'}`;

        if (!event.id) {
            errors.push(`${prefix}: 缺少 id 字段`);
        } else if (eventIds.has(event.id)) {
            errors.push(`${prefix}: id 重复`);
        } else {
            eventIds.add(event.id);
        }

        if (!event.year) {
            errors.push(`${prefix}: 缺少 year 字段`);
        } else if (!/^(公元前|公元)\d+年$/.test(event.year)) {
            warnings.push(`${prefix}: year 格式不规范 (${event.year})`);
        }

        if (!event.title) {
            errors.push(`${prefix}: 缺少 title 字段`);
        }

        if (!event.category) {
            warnings.push(`${prefix}: 缺少 category 字段`);
        } else if (!['political', 'military', 'diplomacy', 'organize', 'personage', 'cultural', 'technology'].includes(event.category)) {
            warnings.push(`${prefix}: 未知 category 值 (${event.category})`);
        }

        if (event.characters && Array.isArray(event.characters)) {
            event.characters.forEach((char, ci) => {
                if (!char.id) {
                    errors.push(`${prefix}: 关联人物[${ci}] 缺少 id`);
                } else if (!charIds.has(char.id)) {
                    warnings.push(`${prefix}: 关联人物[${ci}] (${char.id}) 在人物数据中不存在`);
                }
                if (!char.name) {
                    warnings.push(`${prefix}: 关联人物[${ci}] 缺少 name`);
                }
            });
        }

        if (!event.tags || !Array.isArray(event.tags) || event.tags.length === 0) {
            warnings.push(`${prefix}: 缺少 tags 标签`);
        }
    });

    return { errors, warnings };
}

function validateCharacters(characters) {
    const errors = [];
    const warnings = [];
    const charIds = new Set();

    const validCategories = ['energy', 'projective', 'intervene', 'orientate'];

    characters.forEach((char, index) => {
        const prefix = `人物[${index}] ${char.id || '(无ID)'}`;

        if (!char.id) {
            errors.push(`${prefix}: 缺少 id 字段`);
        } else if (charIds.has(char.id)) {
            errors.push(`${prefix}: id 重复`);
        } else {
            charIds.add(char.id);
        }

        if (!char.name) {
            errors.push(`${prefix}: 缺少 name 字段`);
        }

        if (!char.birth) {
            warnings.push(`${prefix}: 缺少 birth 字段`);
        }
        if (!char.death) {
            warnings.push(`${prefix}: 缺少 death 字段`);
        }

        if (char.category) {
            const cats = Array.isArray(char.category) ? char.category : [char.category];
            cats.forEach(cat => {
                if (!validCategories.includes(cat)) {
                    warnings.push(`${prefix}: 未知 category 值 (${cat})`);
                }
            });
        } else {
            warnings.push(`${prefix}: 缺少 category 字段`);
        }

        if (!char.tags || !Array.isArray(char.tags) || char.tags.length === 0) {
            warnings.push(`${prefix}: 缺少 tags 标签`);
        }
    });

    return { errors, warnings };
}

function normalizeCharacters(characters) {
    return characters.map(char => ({
        ...char,
        category: char.category ? (Array.isArray(char.category) ? char.category : [char.category]) : []
    }));
}

function main() {
    const eventsPath = path.join(__dirname, 'data', 'events.js');
    const charsPath = path.join(__dirname, 'data', 'characters.js');

    console.log('=== 数据校验开始 ===\n');

    try {
        const events = loadData(eventsPath);
        const characters = loadData(charsPath);

        console.log(`事件数量: ${events.length}`);
        console.log(`人物数量: ${characters.length}\n`);

        const charResult = validateCharacters(characters);
        console.log('--- 人物数据校验 ---');
        if (charResult.errors.length > 0) {
            console.log(`❌ 错误 (${charResult.errors.length}):`);
            charResult.errors.forEach(e => console.log(`  - ${e}`));
        } else {
            console.log('✅ 无错误');
        }
        if (charResult.warnings.length > 0) {
            console.log(`\n⚠️  警告 (${charResult.warnings.length}):`);
            charResult.warnings.forEach(w => console.log(`  - ${w}`));
        }
        console.log('');

        const eventResult = validateEvents(events, characters);
        console.log('--- 事件数据校验 ---');
        if (eventResult.errors.length > 0) {
            console.log(`❌ 错误 (${eventResult.errors.length}):`);
            eventResult.errors.forEach(e => console.log(`  - ${e}`));
        } else {
            console.log('✅ 无错误');
        }
        if (eventResult.warnings.length > 0) {
            console.log(`\n⚠️  警告 (${eventResult.warnings.length}):`);
            eventResult.warnings.forEach(w => console.log(`  - ${w}`));
        }

        const totalErrors = charResult.errors.length + eventResult.errors.length;
        console.log(`\n=== 校验完成：${totalErrors} 个错误，${charResult.warnings.length + eventResult.warnings.length} 个警告 ===`);

        process.exit(totalErrors > 0 ? 1 : 0);

    } catch (err) {
        console.error('校验失败:', err.message);
        process.exit(1);
    }
}

main();
