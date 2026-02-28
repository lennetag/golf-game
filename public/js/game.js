// ============================================
// CARD DATA MODEL
// ============================================
const CardType = {
    CLUB: 'club',
    POWER: 'power',
    LOFT: 'loft',
    SHAPING: 'shaping',
    UTILITY: 'utility'
};

const ShapeDirection = {
    NONE: 'none',
    CUT: 'cut',
    FADE: 'fade'
};

class CardData {
    constructor({
        id,
        name,
        type,
        tags = [],
        baseDistance = 0,
        powerValue = 0,
        loftChange = 0,
        shapeDirection = ShapeDirection.NONE,
        utilityEffect = '',
        maxInStroke = -1,
        requiresClub = true,
        immediateEffect = false
    }) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.tags = tags;
        this.baseDistance = baseDistance;
        this.powerValue = powerValue;
        this.loftChange = loftChange;
        this.shapeDirection = shapeDirection;
        this.utilityEffect = utilityEffect;
        this.maxInStroke = maxInStroke;
        this.requiresClub = requiresClub;
        this.immediateEffect = immediateEffect;
        this.instanceId = Math.random().toString(36).substr(2, 9);
    }

    getTypeString() {
        return this.type.charAt(0).toUpperCase() + this.type.slice(1);
    }

    getDescription() {
        switch (this.type) {
            case CardType.CLUB:
                return `${(this.baseDistance * 100).toFixed(0)}% range`;
            case CardType.POWER:
                return `×${this.powerValue.toFixed(2)} power`;
            case CardType.LOFT:
                return this.loftChange > 0 ? 'Higher, shorter' : 'Lower, farther';
            case CardType.SHAPING:
                return this.shapeDirection.toUpperCase();
            case CardType.UTILITY:
                switch (this.utilityEffect) {
                    case 'big_gimme': return 'Snap if close';
                    case 'long_run': return '+25% roll';
                    case 'draw_2': return 'Draw 2 cards';
                }
        }
        return '';
    }

    clone() {
        const clone = new CardData(this);
        clone.instanceId = Math.random().toString(36).substr(2, 9);
        return clone;
    }
}

// ============================================
// CARD DATABASE - 24 Starter Cards
// ============================================
function createStarterDeck() {
    const cards = [];

    // CLUBS (4)
    cards.push(new CardData({
        id: 'putter', name: 'Putter', type: CardType.CLUB,
        tags: ['club'], baseDistance: 0.12, maxInStroke: 1
    }));
    cards.push(new CardData({
        id: 'wedge', name: 'Wedge', type: CardType.CLUB,
        tags: ['club'], baseDistance: 0.22, maxInStroke: 1
    }));
    cards.push(new CardData({
        id: '7_iron', name: '7 Iron', type: CardType.CLUB,
        tags: ['club'], baseDistance: 0.33, maxInStroke: 1
    }));
    cards.push(new CardData({
        id: 'driver', name: 'Driver', type: CardType.CLUB,
        tags: ['club'], baseDistance: 0.50, maxInStroke: 1
    }));

    // POWER MODIFIERS (8)
    cards.push(new CardData({
        id: 'full_1', name: 'Full', type: CardType.POWER,
        tags: ['power', 'modifier'], powerValue: 1.0
    }));
    cards.push(new CardData({
        id: 'full_2', name: 'Full', type: CardType.POWER,
        tags: ['power', 'modifier'], powerValue: 1.0
    }));
    cards.push(new CardData({
        id: 'half_1', name: 'Half', type: CardType.POWER,
        tags: ['power', 'modifier'], powerValue: 0.5
    }));
    cards.push(new CardData({
        id: 'half_2', name: 'Half', type: CardType.POWER,
        tags: ['power', 'modifier'], powerValue: 0.5
    }));
    cards.push(new CardData({
        id: 'quarter_1', name: 'Quarter', type: CardType.POWER,
        tags: ['power', 'modifier'], powerValue: 0.25
    }));
    cards.push(new CardData({
        id: 'quarter_2', name: 'Quarter', type: CardType.POWER,
        tags: ['power', 'modifier'], powerValue: 0.25
    }));
    cards.push(new CardData({
        id: 'quarter_3', name: 'Quarter', type: CardType.POWER,
        tags: ['power', 'modifier'], powerValue: 0.25
    }));
    cards.push(new CardData({
        id: 'quarter_4', name: 'Quarter', type: CardType.POWER,
        tags: ['power', 'modifier'], powerValue: 0.25
    }));

    // LOFT CHANGE (4)
    cards.push(new CardData({
        id: 'loft_up_1', name: 'Increase Loft', type: CardType.LOFT,
        tags: ['loft', 'modifier'], loftChange: 1
    }));
    cards.push(new CardData({
        id: 'loft_up_2', name: 'Increase Loft', type: CardType.LOFT,
        tags: ['loft', 'modifier'], loftChange: 1
    }));
    cards.push(new CardData({
        id: 'loft_down_1', name: 'Decrease Loft', type: CardType.LOFT,
        tags: ['loft', 'modifier'], loftChange: -1
    }));
    cards.push(new CardData({
        id: 'loft_down_2', name: 'Decrease Loft', type: CardType.LOFT,
        tags: ['loft', 'modifier'], loftChange: -1
    }));

    // SHAPING (4)
    cards.push(new CardData({
        id: 'cut_1', name: 'Cut', type: CardType.SHAPING,
        tags: ['shaping', 'modifier'], shapeDirection: ShapeDirection.CUT
    }));
    cards.push(new CardData({
        id: 'cut_2', name: 'Cut', type: CardType.SHAPING,
        tags: ['shaping', 'modifier'], shapeDirection: ShapeDirection.CUT
    }));
    cards.push(new CardData({
        id: 'fade_1', name: 'Fade', type: CardType.SHAPING,
        tags: ['shaping', 'modifier'], shapeDirection: ShapeDirection.FADE
    }));
    cards.push(new CardData({
        id: 'fade_2', name: 'Fade', type: CardType.SHAPING,
        tags: ['shaping', 'modifier'], shapeDirection: ShapeDirection.FADE
    }));

    // UTILITY (4)
    cards.push(new CardData({
        id: 'big_gimme', name: 'Big Gimme', type: CardType.UTILITY,
        tags: ['utility'], utilityEffect: 'big_gimme'
    }));
    cards.push(new CardData({
        id: 'long_run', name: 'Long Run', type: CardType.UTILITY,
        tags: ['utility'], utilityEffect: 'long_run'
    }));
    cards.push(new CardData({
        id: 'draw_2_1', name: 'Draw 2', type: CardType.UTILITY,
        tags: ['utility'], utilityEffect: 'draw_2',
        immediateEffect: true, requiresClub: false
    }));
    cards.push(new CardData({
        id: 'draw_2_2', name: 'Draw 2', type: CardType.UTILITY,
        tags: ['utility'], utilityEffect: 'draw_2',
        immediateEffect: true, requiresClub: false
    }));

    return cards;
}

// ============================================
// DECK MANAGEMENT
// ============================================
class Deck {
    constructor() {
        this.drawPile = [];
        this.discardPile = [];
        this.hand = [];
        this.handSize = 5;
    }

    initialize(cards) {
        this.drawPile = cards.map(c => c.clone());
        this.discardPile = [];
        this.hand = [];
        this.shuffle();
    }

    shuffle() {
        for (let i = this.drawPile.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.drawPile[i], this.drawPile[j]] = [this.drawPile[j], this.drawPile[i]];
        }
    }

    recycleDiscard() {
        this.drawPile.push(...this.discardPile);
        this.discardPile = [];
        this.shuffle();
        return true;
    }

    drawCards(count) {
        const drawn = [];
        for (let i = 0; i < count; i++) {
            if (this.drawPile.length === 0) {
                if (this.discardPile.length === 0) break;
                this.recycleDiscard();
                showMessage('Shuffled discard into draw pile!');
            }
            if (this.drawPile.length > 0) {
                drawn.push(this.drawPile.pop());
            }
        }
        return drawn;
    }

    drawToHand(count = null) {
        const targetCount = count ?? (this.handSize - this.hand.length);
        const drawn = this.drawCards(targetCount);
        this.hand.push(...drawn);
        return drawn;
    }

    fillHand() {
        const needed = this.handSize - this.hand.length;
        if (needed > 0) {
            return this.drawToHand(needed);
        }
        return [];
    }

    discardCard(card) {
        this.discardPile.push(card);
    }

    discardHand() {
        this.discardPile.push(...this.hand);
        this.hand = [];
    }

    removeFromHand(card) {
        const idx = this.hand.findIndex(c => c.instanceId === card.instanceId);
        if (idx >= 0) {
            this.hand.splice(idx, 1);
            return true;
        }
        return false;
    }

    addToHand(card) {
        this.hand.push(card);
    }
}

// ============================================
// SHOT CALCULATION
// ============================================
const GIMME_RADIUS = 0.04;
const LONG_RUN_BONUS = 0.25;

class Shot {
    constructor() {
        this.clubName = '';
        this.baseDistance = 0;
        this.totalPower = 1.0;
        this.finalDistance = 0;
        this.loftScalar = 0;
        this.shape = ShapeDirection.NONE;
        this.hasBigGimme = false;
        this.hasLongRun = false;
        this.isValid = false;
        this.errorMessage = '';
    }

    getDebugString() {
        if (!this.isValid) {
            return `<span class="shot-invalid">INVALID: ${this.errorMessage}</span>`;
        }

        const shapeStr = this.shape === ShapeDirection.NONE ? 'Straight' : this.shape.toUpperCase();
        const utilities = [];
        if (this.hasBigGimme) utilities.push('Big Gimme');
        if (this.hasLongRun) utilities.push('Long Run');
        const utilStr = utilities.length ? utilities.join(', ') : 'None';
        
        const loftDistMod = 1 - (this.loftScalar * 0.15);
        const loftEffect = this.loftScalar > 0 ? 'Higher arc, shorter' : (this.loftScalar < 0 ? 'Lower arc, farther' : 'Normal');

        return `<span class="shot-valid">═══ SHOT COMPUTED ═══</span>
Club: ${this.clubName}
Base Distance: ${(this.baseDistance * 100).toFixed(1)}% map
Power Multiplier: ×${this.totalPower.toFixed(2)}
Loft: ${this.loftScalar >= 0 ? '+' : ''}${this.loftScalar} (${loftEffect}, ×${loftDistMod.toFixed(2)})
<strong>Final Distance: ${(this.finalDistance * 100).toFixed(1)}% map</strong>
Shape: ${shapeStr}
Utilities: ${utilStr}
═════════════════════`;
    }
}

function calculateShot(strokeCards) {
    const shot = new Shot();

    const clubs = strokeCards.filter(c => c.type === CardType.CLUB);

    if (clubs.length === 0) {
        shot.isValid = false;
        shot.errorMessage = 'No club selected! You must play exactly one club card.';
        return shot;
    }
    if (clubs.length > 1) {
        shot.isValid = false;
        shot.errorMessage = 'Too many clubs! Only one club per stroke allowed.';
        return shot;
    }

    const club = clubs[0];
    shot.clubName = club.name;
    shot.baseDistance = club.baseDistance;

    let powerSum = 0;
    for (const card of strokeCards) {
        if (card.type === CardType.POWER) {
            powerSum += card.powerValue;
        }
    }
    shot.totalPower = powerSum;

    for (const card of strokeCards) {
        if (card.type === CardType.LOFT) {
            shot.loftScalar += card.loftChange;
        }
    }

    for (const card of strokeCards) {
        if (card.type === CardType.SHAPING) {
            shot.shape = card.shapeDirection;
        }
    }

    for (const card of strokeCards) {
        if (card.type === CardType.UTILITY) {
            if (card.utilityEffect === 'big_gimme') shot.hasBigGimme = true;
            if (card.utilityEffect === 'long_run') shot.hasLongRun = true;
        }
    }

    const loftDistanceModifier = 1 - (shot.loftScalar * 0.15);
    shot.finalDistance = shot.baseDistance * shot.totalPower * loftDistanceModifier;
    shot.isValid = true;

    return shot;
}

// ============================================
// GAME STATE
// ============================================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const MAP_SIZE = 500;

function setupCanvas() {
    const isMobileLandscape = window.innerWidth <= 900 && window.innerHeight <= 500 && window.innerWidth > window.innerHeight;
    
    if (isMobileLandscape) {
        const canvasSize = window.innerWidth <= 750 ? 240 : 280;
        canvas.style.width = canvasSize + 'px';
        canvas.style.height = canvasSize + 'px';
    } else {
        canvas.style.width = '500px';
        canvas.style.height = '500px';
    }
    
    canvas.width = MAP_SIZE;
    canvas.height = MAP_SIZE;
}

setupCanvas();
window.addEventListener('resize', () => {
    setupCanvas();
    draw();
});

const deck = new Deck();
let strokeCards = [];
let strokeCount = 0;
let isAnimating = false;
let gameWon = false;
let rerollsRemaining = 2;
const MAX_REROLLS = 2;

// Course setup
const islandA = { x: 60, y: 60, width: 150, height: 130 };
const islandB = { x: 290, y: 310, width: 150, height: 130 };
const islandC = { x: 190, y: 170, width: 150, height: 130 };

const teeBox = { x: islandA.x + islandA.width / 2, y: islandA.y + islandA.height / 2 };
const flag = { x: islandB.x + islandB.width / 2, y: islandB.y + islandB.height / 2 };
let ball = { x: teeBox.x, y: teeBox.y };

const BALL_RADIUS = 8;
const HOLE_RADIUS = 12;

// DOM Elements
const messageEl = document.getElementById('message');
const strokeCountEl = document.getElementById('strokeCount');
const handContainer = document.getElementById('handContainer');
const strokeContainer = document.getElementById('strokeContainer');
const strokeArea = document.getElementById('strokeArea');
const strokePowerEl = document.getElementById('strokePower');
const debugOutput = document.getElementById('debugOutput');
const swingBtn = document.getElementById('swingBtn');
const clearBtn = document.getElementById('clearBtn');
const endHoleBtn = document.getElementById('endHoleBtn');
const rerollBtn = document.getElementById('rerollBtn');
const rerollInfo = document.getElementById('rerollInfo');
const drawPile = document.getElementById('drawPile');
const drawPileVisual = document.getElementById('drawPileVisual');
const drawPileCount = document.getElementById('drawPileCount');
const discardPile = document.getElementById('discardPile');
const discardPileVisual = document.getElementById('discardPileVisual');
const discardPileCount = document.getElementById('discardPileCount');

// ============================================
// UI FUNCTIONS
// ============================================
function showMessage(msg, isError = false) {
    messageEl.textContent = msg;
    messageEl.className = isError ? 'message error' : 'message';
}

function updateDeckInfo() {
    const drawCount = deck.drawPile.length;
    const discardCount = deck.discardPile.length;

    drawPileVisual.textContent = drawCount;
    drawPileCount.textContent = `${drawCount} card${drawCount !== 1 ? 's' : ''}`;
    drawPile.classList.toggle('empty', drawCount === 0);

    discardPileVisual.textContent = discardCount;
    discardPileCount.textContent = `${discardCount} card${discardCount !== 1 ? 's' : ''}`;
    discardPile.classList.toggle('empty', discardCount === 0);
    discardPile.classList.toggle('has-cards', discardCount > 0);

    updateRerollUI();
}

function updateRerollUI() {
    rerollInfo.textContent = `(${rerollsRemaining} left)`;
    rerollBtn.disabled = rerollsRemaining <= 0 || isAnimating || gameWon;
}

function createCardElement(card, onClick) {
    const el = document.createElement('div');
    el.className = `card ${card.type}`;
    el.innerHTML = `
        <div class="card-name">${card.name}</div>
        <div class="card-type">${card.getTypeString()}</div>
        <div class="card-desc">${card.getDescription()}</div>
    `;
    el.addEventListener('click', () => onClick(card));
    return el;
}

function renderHand() {
    handContainer.innerHTML = '';
    for (const card of deck.hand) {
        const el = createCardElement(card, onHandCardClicked);
        handContainer.appendChild(el);
    }
}

function renderStroke() {
    strokeContainer.innerHTML = '';
    for (const card of strokeCards) {
        const el = createCardElement(card, onStrokeCardClicked);
        strokeContainer.appendChild(el);
    }
    strokeArea.classList.toggle('empty', strokeCards.length === 0);

    const shot = calculateShot(strokeCards);
    if (strokeCards.length > 0 && shot.isValid) {
        strokePowerEl.textContent = `→ ${(shot.finalDistance * 100).toFixed(0)}% distance`;
    } else {
        strokePowerEl.textContent = '';
    }
}

function onHandCardClicked(card) {
    if (isAnimating || gameWon) return;

    if (card.immediateEffect && card.utilityEffect === 'draw_2') {
        deck.removeFromHand(card);
        deck.discardCard(card);
        deck.drawToHand(2);
        renderHand();
        updateDeckInfo();
        showMessage('Drew 2 cards!');
        return;
    }

    if (card.type === CardType.CLUB) {
        const existingClub = strokeCards.find(c => c.type === CardType.CLUB);
        if (existingClub) {
            showMessage('Only one club allowed per stroke!', true);
            return;
        }
    }

    deck.removeFromHand(card);
    strokeCards.push(card);
    renderHand();
    renderStroke();
}

function onStrokeCardClicked(card) {
    if (isAnimating || gameWon) return;

    const idx = strokeCards.findIndex(c => c.instanceId === card.instanceId);
    if (idx >= 0) {
        strokeCards.splice(idx, 1);
        deck.addToHand(card);
        renderHand();
        renderStroke();
    }
}

// ============================================
// GAME ACTIONS
// ============================================
function startTurn() {
    strokeCards = [];
    deck.fillHand();
    renderHand();
    renderStroke();
    updateDeckInfo();
    showMessage('Select cards for your stroke!');
}

function doSwing() {
    if (isAnimating || gameWon) return;

    const shot = calculateShot(strokeCards);
    debugOutput.innerHTML = shot.getDebugString();

    if (!shot.isValid) {
        showMessage(shot.errorMessage, true);
        return;
    }

    isAnimating = true;
    swingBtn.disabled = true;
    rerollBtn.disabled = true;
    strokeCount++;
    strokeCountEl.textContent = strokeCount;

    const dx = flag.x - ball.x;
    const dy = flag.y - ball.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const dirX = dx / dist;
    const dirY = dy / dist;

    let travelDist = shot.finalDistance * MAP_SIZE;
    if (shot.hasLongRun) {
        travelDist *= (1 + LONG_RUN_BONUS);
    }

    const perpX = -dirY;
    const perpY = dirX;
    
    let lateralOffset = 0;
    const SHAPE_OFFSET = 40;
    if (shot.shape === ShapeDirection.CUT) {
        lateralOffset = SHAPE_OFFSET;
    } else if (shot.shape === ShapeDirection.FADE) {
        lateralOffset = -SHAPE_OFFSET;
    }
    
    const targetX = ball.x + dirX * travelDist + perpX * lateralOffset;
    const targetY = ball.y + dirY * travelDist + perpY * lateralOffset;

    const startX = ball.x;
    const startY = ball.y;
    const duration = 600;
    const startTime = performance.now();
    
    let ballScale = 1.0;

    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);

        ball.x = startX + (targetX - startX) * easeProgress;
        ball.y = startY + (targetY - startY) * easeProgress;
        
        const heightProgress = Math.sin(progress * Math.PI);
        const maxScale = 1.0 + 0.4 * Math.max(0, 1 + shot.loftScalar * 0.2);
        ballScale = 1.0 + (maxScale - 1.0) * heightProgress;

        draw(ballScale);

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            ballScale = 1.0;
            finishSwing(shot);
        }
    }

    requestAnimationFrame(animate);
}

function finishSwing(shot) {
    if (shot.hasBigGimme) {
        const distToFlag = Math.sqrt((ball.x - flag.x) ** 2 + (ball.y - flag.y) ** 2);
        const gimmeRadius = GIMME_RADIUS * MAP_SIZE;
        if (distToFlag <= gimmeRadius) {
            ball.x = flag.x;
            ball.y = flag.y;
            showMessage('Big Gimme activated! Ball snapped to hole!');
        }
    }

    const distToFlag = Math.sqrt((ball.x - flag.x) ** 2 + (ball.y - flag.y) ** 2);
    if (distToFlag < HOLE_RADIUS) {
        gameWon = true;
        ball.x = flag.x;
        ball.y = flag.y;
        showMessage(`Holed in ${strokeCount} strokes! 🎉`);
        swingBtn.disabled = true;
        draw();
        return;
    }

    if (isInWater(ball.x, ball.y)) {
        showMessage('Splash! Ball in water - reset to tee.', true);
        setTimeout(() => {
            ball.x = teeBox.x;
            ball.y = teeBox.y;
            endTurn();
        }, 800);
        return;
    }

    const distRemaining = (distToFlag / MAP_SIZE * 100).toFixed(0);
    showMessage(`${distRemaining}% to flag`);

    endTurn();
}

function endTurn() {
    for (const card of strokeCards) {
        deck.discardCard(card);
    }
    strokeCards = [];

    deck.discardHand();

    isAnimating = false;
    swingBtn.disabled = false;
    updateRerollUI();

    startTurn();
    draw();
}

function clearStroke() {
    if (isAnimating || gameWon) return;

    for (const card of strokeCards) {
        deck.addToHand(card);
    }
    strokeCards = [];
    renderHand();
    renderStroke();
    showMessage('Stroke cleared.');
}

function doReroll() {
    if (isAnimating || gameWon) return;
    if (rerollsRemaining <= 0) {
        showMessage('No rerolls remaining!', true);
        return;
    }

    deck.discardHand();
    deck.fillHand();
    rerollsRemaining--;

    renderHand();
    renderStroke();
    updateDeckInfo();
    showMessage(`Rerolled hand! ${rerollsRemaining} reroll${rerollsRemaining !== 1 ? 's' : ''} remaining.`);
}

function newHole() {
    ball = { x: teeBox.x, y: teeBox.y };
    strokeCount = 0;
    strokeCountEl.textContent = '0';
    gameWon = false;
    isAnimating = false;
    rerollsRemaining = MAX_REROLLS;

    deck.initialize(createStarterDeck());
    strokeCards = [];

    swingBtn.disabled = false;
    rerollBtn.disabled = false;
    debugOutput.innerHTML = 'Waiting for swing...';

    startTurn();
    draw();
    showMessage('New hole started!');
}

// ============================================
// COURSE DRAWING
// ============================================
function drawWater() {
    const gradient = ctx.createLinearGradient(0, 0, MAP_SIZE, MAP_SIZE);
    gradient.addColorStop(0, '#1e40af');
    gradient.addColorStop(0.5, '#2563eb');
    gradient.addColorStop(1, '#1e40af');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, MAP_SIZE, MAP_SIZE);

    ctx.strokeStyle = 'rgba(147, 197, 253, 0.3)';
    ctx.lineWidth = 1;
    for (let i = 0; i < MAP_SIZE; i += 30) {
        ctx.beginPath();
        ctx.moveTo(0, i + Math.sin(Date.now() / 1000 + i) * 3);
        ctx.bezierCurveTo(
            MAP_SIZE / 3, i + Math.sin(Date.now() / 800 + i) * 5,
            MAP_SIZE * 2 / 3, i + Math.sin(Date.now() / 900 + i) * 4,
            MAP_SIZE, i + Math.sin(Date.now() / 1000 + i) * 3
        );
        ctx.stroke();
    }
}

function drawIsland(island) {
    ctx.fillStyle = '#166534';
    ctx.beginPath();
    ctx.ellipse(island.x + island.width / 2, island.y + island.height / 2,
        island.width / 2, island.height / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.ellipse(island.x + island.width / 2 - 8, island.y + island.height / 2 - 8,
        island.width / 2 - 15, island.height / 2 - 12, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#4ade80';
    ctx.beginPath();
    ctx.ellipse(island.x + island.width / 2 - 15, island.y + island.height / 2 - 15,
        island.width / 4, island.height / 4, 0, 0, Math.PI * 2);
    ctx.fill();
}

function drawTeeBox() {
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(teeBox.x - 12, teeBox.y - 6, 24, 12);
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 2;
    ctx.strokeRect(teeBox.x - 12, teeBox.y - 6, 24, 12);
    ctx.fillStyle = '#92400e';
    ctx.font = 'bold 8px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('TEE', teeBox.x, teeBox.y);
}

function drawFlag() {
    ctx.fillStyle = '#1f2937';
    ctx.beginPath();
    ctx.arc(flag.x, flag.y, HOLE_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.arc(flag.x, flag.y, HOLE_RADIUS - 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#f5f5f5';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(flag.x, flag.y);
    ctx.lineTo(flag.x, flag.y - 35);
    ctx.stroke();

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(flag.x, flag.y - 35);
    ctx.lineTo(flag.x + 20, flag.y - 28);
    ctx.lineTo(flag.x, flag.y - 21);
    ctx.closePath();
    ctx.fill();
}

function drawAimingLine() {
    if (gameWon || isAnimating) return;

    const shot = calculateShot(strokeCards);
    if (!shot.isValid) return;

    const dx = flag.x - ball.x;
    const dy = flag.y - ball.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const dirX = dx / dist;
    const dirY = dy / dist;
    
    const perpX = -dirY;
    const perpY = dirX;
    
    let lateralOffset = 0;
    const SHAPE_OFFSET = 40;
    if (shot.shape === ShapeDirection.CUT) {
        lateralOffset = SHAPE_OFFSET;
    } else if (shot.shape === ShapeDirection.FADE) {
        lateralOffset = -SHAPE_OFFSET;
    }

    let travelDist = shot.finalDistance * MAP_SIZE;
    if (shot.hasLongRun) travelDist *= (1 + LONG_RUN_BONUS);

    const endX = ball.x + dirX * travelDist + perpX * lateralOffset;
    const endY = ball.y + dirY * travelDist + perpY * lateralOffset;

    if (shot.shape !== ShapeDirection.NONE) {
        ctx.setLineDash([8, 4]);
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.9)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(ball.x, ball.y);
        const cpX = ball.x + dirX * travelDist * 0.5 + perpX * lateralOffset * 0.3;
        const cpY = ball.y + dirY * travelDist * 0.5 + perpY * lateralOffset * 0.3;
        ctx.quadraticCurveTo(cpX, cpY, endX, endY);
        ctx.stroke();
        ctx.setLineDash([]);
    } else {
        ctx.setLineDash([8, 4]);
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.9)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(ball.x, ball.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(endX, endY, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 8]);
    ctx.beginPath();
    ctx.moveTo(ball.x, ball.y);
    ctx.lineTo(flag.x, flag.y);
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawBall(scale = 1.0) {
    const scaledRadius = BALL_RADIUS * scale;
    
    ctx.fillStyle = '#f5f5f5';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, scaledRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(ball.x - 2 * scale, ball.y - 2 * scale, 3 * scale, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#d4d4d4';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, scaledRadius, 0, Math.PI * 2);
    ctx.stroke();
}

function draw(ballScale = 1.0) {
    ctx.clearRect(0, 0, MAP_SIZE, MAP_SIZE);
    drawWater();
    drawIsland(islandA);
    drawIsland(islandC);
    drawIsland(islandB);
    drawTeeBox();
    drawFlag();
    drawAimingLine();
    drawBall(ballScale);
}

function isInWater(x, y) {
    function pointInEllipse(px, py, island) {
        const cx = island.x + island.width / 2;
        const cy = island.y + island.height / 2;
        const rx = island.width / 2;
        const ry = island.height / 2;
        return ((px - cx) ** 2 / rx ** 2 + (py - cy) ** 2 / ry ** 2) <= 1;
    }
    return !pointInEllipse(x, y, islandA) && 
           !pointInEllipse(x, y, islandB) && 
           !pointInEllipse(x, y, islandC);
}

// ============================================
// INITIALIZATION
// ============================================
swingBtn.addEventListener('click', doSwing);
clearBtn.addEventListener('click', clearStroke);
rerollBtn.addEventListener('click', doReroll);
endHoleBtn.addEventListener('click', newHole);

deck.initialize(createStarterDeck());
startTurn();

function gameLoop() {
    draw();
    requestAnimationFrame(gameLoop);
}
gameLoop();
