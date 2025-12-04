// Размер сетки
const GRID_SIZE = 4;
const ENTRANCE = [0, 0];
const EXIT = [3, 0];

// Хранилище выбранных продуктов
let selectedProducts = new Map(); // key: "x,y", value: {coords: [x,y], icon: "🍎"}

// Хранилище текущего решения для обновления инструкций при смене языка
let currentSolution = null;
let currentProductsForSolution = null;

// Переводы
const translations = {
    en: {
        title: "Select Your Products",
        navigationTitle: "Your Shopping Route",
        selectProducts: "Select products on the grid",
        selectProductsDesc: "Tap on a location to add a product. Tap again to remove.",
        findPath: "Find Products",
        clearAll: "Clear All",
        back: "← Back to Selection",
        instructions: "Navigation Instructions",
        goForward: "Go forward",
        goBackward: "Go backward",
        turnRight: "Turn right",
        turnLeft: "Turn left",
        collectProduct: "Collect product",
        reachCheckout: "Reach checkout"
    },
    nl: {
        title: "Selecteer Uw Producten",
        navigationTitle: "Uw Winkelroute",
        selectProducts: "Selecteer producten op het raster",
        selectProductsDesc: "Tik op een locatie om een product toe te voegen. Tik opnieuw om te verwijderen.",
        findPath: "Vind Producten",
        clearAll: "Alles Wissen",
        back: "← Terug naar Selectie",
        instructions: "Navigatie Instructies",
        goForward: "Ga vooruit",
        goBackward: "Ga achteruit",
        turnRight: "Sla rechtsaf",
        turnLeft: "Sla linksaf",
        collectProduct: "Verzamel product",
        reachCheckout: "Bereik kassa"
    }
};

let currentLanguage = 'en';

// Функция перевода
function t(key, params = {}) {
    let text = translations[currentLanguage][key] || translations.en[key] || key;
    if (params) {
        Object.keys(params).forEach(param => {
            text = text.replace(`{${param}}`, params[param]);
        });
    }
    return text;
}

// Обновление текста на странице
function updateLanguage() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        element.textContent = t(key);
    });
    
    // Обновляем инструкции, если мы на экране навигации и есть решение
    const navigationScreen = document.getElementById('navigationScreen');
    if (navigationScreen && navigationScreen.classList.contains('active') && currentSolution && currentProductsForSolution) {
        const instructions = generateNavigationInstructions(currentSolution.path, currentProductsForSolution);
        const instructionsList = document.getElementById('instructionsList');
        if (instructionsList) {
            instructionsList.innerHTML = instructions.map(inst => 
                `<div class="instruction-item">${inst}</div>`
            ).join('');
        }
    }
}

// Парсинг входных данных
function parseProducts(input) {
    const regex = /\((\d+),(\d+)\)/g;
    const products = [];
    let match;
    
    while ((match = regex.exec(input)) !== null) {
        const x = parseInt(match[1]);
        const y = parseInt(match[2]);
        if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
            products.push([x, y]);
        }
    }
    
    return products;
}

// Проверка возможности горизонтального движения
function canMoveHorizontally(y) {
    return y === 0 || y === 3;
}

// Вычисление расстояния между двумя точками с учетом ограничений
function distance(p1, p2) {
    const [x1, y1] = p1;
    const [x2, y2] = p2;
    
    // Если на одной вертикали - можно двигаться вертикально
    if (x1 === x2) {
        return Math.abs(y2 - y1);
    }
    
    // Если на одной горизонтали и можно двигаться горизонтально
    if (y1 === y2 && canMoveHorizontally(y1)) {
        return Math.abs(x2 - x1);
    }
    
    // Нужно дойти до горизонтальной линии, где можно двигаться горизонтально
    // Находим ближайшую горизонтальную линию (y=0 или y=3)
    const horizontalLines = [0, 3];
    let minDist = Infinity;
    
    for (const hLine of horizontalLines) {
        // Расстояние от p1 до горизонтальной линии
        const distToLine1 = Math.abs(y1 - hLine);
        // Расстояние от p2 до горизонтальной линии
        const distToLine2 = Math.abs(y2 - hLine);
        // Горизонтальное расстояние
        const horizontalDist = Math.abs(x2 - x1);
        // Общее расстояние
        const totalDist = distToLine1 + horizontalDist + distToLine2;
        minDist = Math.min(minDist, totalDist);
    }
    
    return minDist;
}

// Построение пути между двумя точками
function buildPathBetween(p1, p2) {
    const [x1, y1] = p1;
    const [x2, y2] = p2;
    const path = [];
    
    // Если на одной вертикали
    if (x1 === x2) {
        const step = y2 > y1 ? 1 : -1;
        for (let y = y1; y !== y2; y += step) {
            path.push([[x1, y], [x1, y + step]]);
        }
        return path;
    }
    
    // Если на одной горизонтали и можно двигаться горизонтально
    if (y1 === y2 && canMoveHorizontally(y1)) {
        const step = x2 > x1 ? 1 : -1;
        for (let x = x1; x !== x2; x += step) {
            path.push([[x, y1], [x + step, y1]]);
        }
        return path;
    }
    
    // Общий случай: нужно дойти до горизонтальной линии
    const horizontalLines = [0, 3];
    let bestPath = null;
    let minDist = Infinity;
    
    for (const hLine of horizontalLines) {
        const dist1 = Math.abs(y1 - hLine);
        const dist2 = Math.abs(y2 - hLine);
        const horizontalDist = Math.abs(x2 - x1);
        const totalDist = dist1 + horizontalDist + dist2;
        
        if (totalDist < minDist) {
            minDist = totalDist;
            const tempPath = [];
            
            // Движение от p1 до горизонтальной линии
            const step1 = hLine > y1 ? 1 : -1;
            for (let y = y1; y !== hLine; y += step1) {
                tempPath.push([[x1, y], [x1, y + step1]]);
            }
            
            // Горизонтальное движение
            const step2 = x2 > x1 ? 1 : -1;
            for (let x = x1; x !== x2; x += step2) {
                tempPath.push([[x, hLine], [x + step2, hLine]]);
            }
            
            // Движение от горизонтальной линии до p2
            const step3 = y2 > hLine ? 1 : -1;
            for (let y = hLine; y !== y2; y += step3) {
                tempPath.push([[x2, y], [x2, y + step3]]);
            }
            
            bestPath = tempPath;
        }
    }
    
    return bestPath;
}

// Решение задачи коммивояжера методом полного перебора
function solveTSP(products) {
    if (products.length === 0) {
        // Просто путь от входа до выхода
        return {
            path: buildPathBetween(ENTRANCE, EXIT),
            totalDistance: distance(ENTRANCE, EXIT)
        };
    }
    
    // Генерируем все перестановки продуктов
    function permute(arr) {
        if (arr.length <= 1) return [arr];
        const result = [];
        for (let i = 0; i < arr.length; i++) {
            const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
            const perms = permute(rest);
            for (const perm of perms) {
                result.push([arr[i], ...perm]);
            }
        }
        return result;
    }
    
    const permutations = permute(products);
    let bestPath = null;
    let minDistance = Infinity;
    
    for (const perm of permutations) {
        let totalDist = distance(ENTRANCE, perm[0]);
        for (let i = 0; i < perm.length - 1; i++) {
            totalDist += distance(perm[i], perm[i + 1]);
        }
        totalDist += distance(perm[perm.length - 1], EXIT);
        
        if (totalDist < minDistance) {
            minDistance = totalDist;
            
            // Строим полный путь
            const fullPath = [];
            
            // От входа до первого продукта
            fullPath.push(...buildPathBetween(ENTRANCE, perm[0]));
            
            // Между продуктами
            for (let i = 0; i < perm.length - 1; i++) {
                fullPath.push(...buildPathBetween(perm[i], perm[i + 1]));
            }
            
            // От последнего продукта до выхода
            fullPath.push(...buildPathBetween(perm[perm.length - 1], EXIT));
            
            bestPath = fullPath;
        }
    }
    
    // Находим оптимальный порядок
    let optimalOrder = [ENTRANCE, ...products, EXIT];
    if (products.length > 0) {
        const optimalPerm = permutations.find(p => {
            let dist = distance(ENTRANCE, p[0]);
            for (let i = 0; i < p.length - 1; i++) {
                dist += distance(p[i], p[i + 1]);
            }
            dist += distance(p[p.length - 1], EXIT);
            return dist === minDistance;
        });
        if (optimalPerm) {
            optimalOrder = [ENTRANCE, ...optimalPerm, EXIT];
        }
    }
    
    return {
        path: bestPath,
        totalDistance: minDistance,
        order: optimalOrder
    };
}

// Размер узла
const NODE_SIZE = 30;
const NODE_SPACING = 100;
const GRID_PADDING = 50;

// Получение координат центра узла
function getNodeCenter(x, y) {
    const centerX = GRID_PADDING + x * NODE_SPACING;
    const centerY = GRID_PADDING + y * NODE_SPACING;
    return { x: centerX, y: centerY };
}

// Получение всех разрешенных дуг (где можно двигаться)
function getAllowedArcs() {
    const arcs = [];
    
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            // Вертикальное движение всегда разрешено
            if (y < GRID_SIZE - 1) {
                arcs.push([[x, y], [x, y + 1]]);
            }
            if (y > 0) {
                arcs.push([[x, y], [x, y - 1]]);
            }
            
            // Горизонтальное движение разрешено только на y=0 и y=3
            if (canMoveHorizontally(y)) {
                if (x < GRID_SIZE - 1) {
                    arcs.push([[x, y], [x + 1, y]]);
                }
                if (x > 0) {
                    arcs.push([[x, y], [x - 1, y]]);
                }
            }
        }
    }
    
    return arcs;
}

// Фрукты и овощи для продуктов
const FRUITS_VEGETABLES = ['🍎', '🍌', '🥕', '🍇', '🥒', '🍊', '🥬', '🍓', '🥑', '🍑', '🥝', '🍅', '🌽', '🥦', '🫐', '🍐'];

function getRandomFruitIcon() {
    return FRUITS_VEGETABLES[Math.floor(Math.random() * FRUITS_VEGETABLES.length)];
}

// Создание интерактивной сетки ввода
function createInputGrid() {
    const inputGrid = document.getElementById('inputGrid');
    const inputSvg = document.getElementById('inputSvg');
    const inputGridWrapper = document.querySelector('.input-grid-wrapper');
    
    // Очищаем
    inputGrid.innerHTML = '';
    inputSvg.innerHTML = '';
    
    // Устанавливаем размер
    const totalSize = (GRID_SIZE - 1) * NODE_SPACING + 2 * GRID_PADDING;
    inputSvg.setAttribute('width', totalSize);
    inputSvg.setAttribute('height', totalSize);
    if (inputGridWrapper) {
        inputGridWrapper.style.width = `${totalSize}px`;
        inputGridWrapper.style.height = `${totalSize}px`;
    }
    
    // Рисуем разрешенные дуги
    const allowedArcs = getAllowedArcs();
    allowedArcs.forEach(([from, to]) => {
        drawInputLine(inputSvg, from, to);
    });
    
    // Создаем узлы
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            const node = document.createElement('div');
            node.className = 'input-node';
            node.dataset.x = x;
            node.dataset.y = y;
            
            const center = getNodeCenter(x, y);
            node.style.left = `${center.x - NODE_SIZE / 2}px`;
            node.style.top = `${center.y - NODE_SIZE / 2}px`;
            
            // Проверяем тип узла
            if (x === ENTRANCE[0] && y === ENTRANCE[1]) {
                node.classList.add('entrance');
                node.textContent = '🛒';
            } else if (x === EXIT[0] && y === EXIT[1]) {
                node.classList.add('exit');
                node.textContent = '💰';
            } else {
                node.classList.add('empty');
                // Проверяем, есть ли продукт в этом узле
                const key = `${x},${y}`;
                if (selectedProducts.has(key)) {
                    node.classList.add('product');
                    node.textContent = selectedProducts.get(key).icon;
                }
            }
            
            const label = document.createElement('div');
            label.className = 'node-label';
            label.textContent = `(${x},${y})`;
            node.appendChild(label);
            
            // Добавляем обработчик клика (только для не-входа и не-выхода)
            if (!(x === ENTRANCE[0] && y === ENTRANCE[1]) && !(x === EXIT[0] && y === EXIT[1])) {
                node.addEventListener('click', () => toggleProduct(x, y));
                node.style.cursor = 'pointer';
            }
            
            inputGrid.appendChild(node);
        }
    }
}

// Рисование линии для входной сетки
function drawInputLine(svg, from, to) {
    const fromCenter = getNodeCenter(from[0], from[1]);
    const toCenter = getNodeCenter(to[0], to[1]);
    
    const dx = toCenter.x - fromCenter.x;
    const dy = toCenter.y - fromCenter.y;
    const angle = Math.atan2(dy, dx);
    const radius = NODE_SIZE / 2;
    
    const startX = fromCenter.x + Math.cos(angle) * radius;
    const startY = fromCenter.y + Math.sin(angle) * radius;
    const endX = toCenter.x - Math.cos(angle) * radius;
    const endY = toCenter.y - Math.sin(angle) * radius;
    
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', startX);
    line.setAttribute('y1', startY);
    line.setAttribute('x2', endX);
    line.setAttribute('y2', endY);
    line.setAttribute('stroke', '#ccc');
    line.setAttribute('stroke-width', '1.5');
    line.setAttribute('opacity', '0.5');
    line.setAttribute('stroke-linecap', 'round');
    svg.appendChild(line);
}

// Переключение продукта в узле
function toggleProduct(x, y) {
    const key = `${x},${y}`;
    
    if (selectedProducts.has(key)) {
        // Удаляем продукт
        selectedProducts.delete(key);
    } else {
        // Добавляем продукт
        selectedProducts.set(key, {
            coords: [x, y],
            icon: getRandomFruitIcon()
        });
    }
    
    // Обновляем сетку ввода
    createInputGrid();
}

// Получение списка продуктов для решения
function getProductsArray() {
    return Array.from(selectedProducts.values()).map(item => item.coords);
}

// Инициализация SVG маркеров (стрелок)
function initSvgMarkers(svg) {
    let defs = svg.querySelector('defs');
    if (!defs) {
        defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        svg.appendChild(defs);
    }
    
    // Проверяем, есть ли уже маркер
    if (!defs.querySelector('#arrowhead')) {
        const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        marker.setAttribute('id', 'arrowhead');
        marker.setAttribute('markerWidth', '8');
        marker.setAttribute('markerHeight', '8');
        marker.setAttribute('refX', '7');
        marker.setAttribute('refY', '4');
        marker.setAttribute('orient', 'auto');
        
        const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        polygon.setAttribute('points', '0 0, 8 4, 0 8');
        polygon.setAttribute('fill', '#00ADE6');
        marker.appendChild(polygon);
        defs.appendChild(marker);
    }
}

// Рисование прямой линии между двумя узлами
function drawLine(svg, from, to, isPathArc = false, arcIndex = -1) {
    const fromCenter = getNodeCenter(from[0], from[1]);
    const toCenter = getNodeCenter(to[0], to[1]);
    
    // Вычисляем точки на границе узлов
    const dx = toCenter.x - fromCenter.x;
    const dy = toCenter.y - fromCenter.y;
    const angle = Math.atan2(dy, dx);
    const radius = NODE_SIZE / 2;
    
    const startX = fromCenter.x + Math.cos(angle) * radius;
    const startY = fromCenter.y + Math.sin(angle) * radius;
    const endX = toCenter.x - Math.cos(angle) * radius;
    const endY = toCenter.y - Math.sin(angle) * radius;
    
    // Создаем линию
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', startX);
    line.setAttribute('y1', startY);
    line.setAttribute('x2', endX);
    line.setAttribute('y2', endY);
    
    if (isPathArc) {
        line.setAttribute('stroke', '#00ADE6');
        line.setAttribute('stroke-width', '3');
        line.setAttribute('opacity', '0.4');
        line.setAttribute('class', 'path-arc');
        line.setAttribute('data-index', arcIndex);
        line.setAttribute('marker-end', 'url(#arrowhead)');
    } else {
        line.setAttribute('stroke', '#ccc');
        line.setAttribute('stroke-width', '1.5');
        line.setAttribute('opacity', '0.5');
        line.setAttribute('class', 'allowed-arc');
    }
    
    line.setAttribute('stroke-linecap', 'round');
    svg.appendChild(line);
    
    return line;
}

// Визуализация сетки
function renderGrid(products, path) {
    const grid = document.getElementById('grid');
    const svg = document.getElementById('pathSvg');
    const gridWrapper = document.querySelector('.grid-wrapper');
    
    // Очищаем предыдущее состояние
    grid.innerHTML = '';
    svg.innerHTML = '';
    
    // Устанавливаем размер SVG и обертки
    const totalSize = (GRID_SIZE - 1) * NODE_SPACING + 2 * GRID_PADDING;
    svg.setAttribute('width', totalSize);
    svg.setAttribute('height', totalSize);
    if (gridWrapper) {
        gridWrapper.style.width = `${totalSize}px`;
        gridWrapper.style.height = `${totalSize}px`;
    }
    
    // Инициализируем SVG маркеры
    initSvgMarkers(svg);
    
    // Получаем все разрешенные дуги
    const allowedArcs = getAllowedArcs();
    
    // Рисуем все разрешенные дуги (светло-серые)
    allowedArcs.forEach(([from, to]) => {
        drawLine(svg, from, to, false);
    });
    
    // Создаем карту продуктов с фруктами (используем сохраненные иконки)
    const productMap = new Map();
    let tempFruitIndex = 0;
    products.forEach(([x, y]) => {
        const key = `${x},${y}`;
        if (selectedProducts.has(key)) {
            productMap.set(key, selectedProducts.get(key).icon);
        } else {
            // Если продукт не в selectedProducts, используем иконку по порядку
            productMap.set(key, FRUITS_VEGETABLES[tempFruitIndex % FRUITS_VEGETABLES.length]);
            tempFruitIndex++;
        }
    });
    
    // Создаем узлы
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            const node = document.createElement('div');
            node.className = 'node';
            node.dataset.x = x;
            node.dataset.y = y;
            
            const center = getNodeCenter(x, y);
            node.style.left = `${center.x - NODE_SIZE / 2}px`;
            node.style.top = `${center.y - NODE_SIZE / 2}px`;
            
            // Проверяем тип узла
            if (x === ENTRANCE[0] && y === ENTRANCE[1]) {
                node.classList.add('entrance');
                node.textContent = '🛒';
            } else if (x === EXIT[0] && y === EXIT[1]) {
                node.classList.add('exit');
                node.textContent = '💰';
            } else if (productMap.has(`${x},${y}`)) {
                node.classList.add('product');
                node.textContent = productMap.get(`${x},${y}`);
            } else {
                node.classList.add('empty');
            }
            
            const label = document.createElement('div');
            label.className = 'node-label';
            label.textContent = `(${x},${y})`;
            node.appendChild(label);
            
            grid.appendChild(node);
        }
    }
    
    // Рисуем дуги пути (синие с стрелками)
    if (path && path.length > 0) {
        path.forEach(([from, to], index) => {
            drawLine(svg, from, to, true, index);
        });
    }
}

// Анимация пути
function animatePath(path, products) {
    if (!path || path.length === 0) return;
    
    let currentIndex = 0;
    const svg = document.getElementById('pathSvg');
    
    // Сначала все дуги пути полупрозрачные
    document.querySelectorAll('.path-arc').forEach(arc => {
        arc.setAttribute('opacity', '0.3');
        arc.setAttribute('stroke-width', '2');
    });
    
    function animateStep() {
        if (currentIndex >= path.length) {
            // Завершение анимации - делаем все дуги яркими
            document.querySelectorAll('.path-arc').forEach(arc => {
                arc.setAttribute('opacity', '0.6');
                arc.setAttribute('stroke-width', '3');
            });
            return;
        }
        
        // Убираем подсветку с предыдущей дуги
        if (currentIndex > 0) {
            const prevArc = svg.querySelector(`.path-arc[data-index="${currentIndex - 1}"]`);
            if (prevArc) {
                prevArc.setAttribute('opacity', '0.6');
                prevArc.setAttribute('stroke-width', '3');
            }
        }
        
        // Подсвечиваем текущую дугу
        const currentArc = svg.querySelector(`.path-arc[data-index="${currentIndex}"]`);
        if (currentArc) {
            currentArc.setAttribute('opacity', '1');
            currentArc.setAttribute('stroke-width', '5');
            currentArc.setAttribute('stroke', '#00ADE6');
        }
        
        currentIndex++;
        
        setTimeout(animateStep, 500);
    }
    
    animateStep();
}

// Генерация пошаговых инструкций навигации
function generateNavigationInstructions(path, products) {
    if (!path || path.length === 0) return [];
    
    const instructions = [];
    let stepNumber = 1;
    let currentPos = ENTRANCE;
    let currentDirection = 'east'; // Начальное направление - смотрим на восток (вправо)
    
    // Карта продуктов для проверки
    const productMap = new Map();
    products.forEach(([x, y]) => {
        productMap.set(`${x},${y}`, true);
    });
    
    for (let i = 0; i < path.length; i++) {
        const [from, to] = path[i];
        const [x1, y1] = from;
        const [x2, y2] = to;
        
        // Определяем направление движения
        const dx = x2 - x1;
        const dy = y2 - y1;
        
        let moveDirection = '';
        if (dx > 0) moveDirection = 'east';
        else if (dx < 0) moveDirection = 'west';
        else if (dy > 0) moveDirection = 'south';
        else if (dy < 0) moveDirection = 'north';
        
        // Определяем, нужно ли поворачивать
        if (moveDirection !== currentDirection) {
            // Нужен поворот
            if ((currentDirection === 'east' && moveDirection === 'south') ||
                (currentDirection === 'south' && moveDirection === 'west') ||
                (currentDirection === 'west' && moveDirection === 'north') ||
                (currentDirection === 'north' && moveDirection === 'east')) {
                instructions.push(`${stepNumber}. ${t('turnRight')}`);
                stepNumber++;
            } else if ((currentDirection === 'east' && moveDirection === 'north') ||
                       (currentDirection === 'north' && moveDirection === 'west') ||
                       (currentDirection === 'west' && moveDirection === 'south') ||
                       (currentDirection === 'south' && moveDirection === 'east')) {
                instructions.push(`${stepNumber}. ${t('turnLeft')}`);
                stepNumber++;
            }
            currentDirection = moveDirection;
        }
        
        // Добавляем движение вперед
        instructions.push(`${stepNumber}. ${t('goForward')}`);
        stepNumber++;
        
        // Проверяем, достигли ли мы продукта
        const toKey = `${x2},${y2}`;
        if (productMap.has(toKey)) {
            instructions.push(`${stepNumber}. ${t('collectProduct')} at (${x2},${y2})`);
            stepNumber++;
        }
        
        // Проверяем, достигли ли кассы
        if (x2 === EXIT[0] && y2 === EXIT[1]) {
            instructions.push(`${stepNumber}. ${t('reachCheckout')}`);
        }
        
        currentPos = to;
    }
    
    return instructions;
}

// Переключение экранов
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// Обработчики переключения языка и инициализация
document.addEventListener('DOMContentLoaded', () => {
    // Обработчик кнопки решения
    document.getElementById('solveBtn').addEventListener('click', () => {
        const products = getProductsArray();
        const solution = solveTSP(products);
        
        // Сохраняем решение для обновления при смене языка
        currentSolution = solution;
        currentProductsForSolution = products;
        
        // Визуализируем путь
        renderGrid(products, solution.path);
        
        // Генерируем инструкции
        const instructions = generateNavigationInstructions(solution.path, products);
        const instructionsList = document.getElementById('instructionsList');
        instructionsList.innerHTML = instructions.map(inst => 
            `<div class="instruction-item">${inst}</div>`
        ).join('');
        
        // Переключаемся на экран навигации
        showScreen('navigationScreen');
        
        // Анимация
        setTimeout(() => {
            animatePath(solution.path, products);
        }, 500);
    });

    // Обработчик кнопки очистки
    document.getElementById('clearBtn').addEventListener('click', () => {
        selectedProducts.clear();
        currentSolution = null;
        currentProductsForSolution = null;
        createInputGrid();
    });
    
    // Обработчик кнопки "Назад"
    document.getElementById('backBtn').addEventListener('click', () => {
        showScreen('selectionScreen');
        // Не сбрасываем решение, чтобы можно было вернуться и инструкции остались
    });
    
    // Обработчики переключения языка
    const langEn = document.getElementById('langEn');
    const langNl = document.getElementById('langNl');
    
    if (langEn) {
        langEn.addEventListener('click', () => {
            currentLanguage = 'en';
            langEn.classList.add('active');
            langNl.classList.remove('active');
            updateLanguage();
        });
    }
    
    if (langNl) {
        langNl.addEventListener('click', () => {
            currentLanguage = 'nl';
            langNl.classList.add('active');
            langEn.classList.remove('active');
            updateLanguage();
        });
    }
    
    // Инициализация языка и сетки
    updateLanguage();
    createInputGrid();
});

