// ============================================
// GAME STATE
// ============================================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const MAP_SIZE = 800;
const BALL_RADIUS = 8;
const HOLE_RADIUS = 12;
const MAX_REROLLS = 2;
const AIM_SPEED = 0.03;

function setupCanvas() {
    const isMobileLandscape = window.innerWidth <= 900 && window.innerHeight <= 500 && window.innerWidth > window.innerHeight;
    
    if (isMobileLandscape) {
        const canvasSize = window.innerWidth <= 750 ? 280 : 320;
        canvas.style.width = canvasSize + 'px';
        canvas.style.height = canvasSize + 'px';
    } else {
        canvas.style.width = '600px';
        canvas.style.height = '600px';
    }
    
    canvas.width = MAP_SIZE;
    canvas.height = MAP_SIZE;
}

setupCanvas();
window.addEventListener('resize', () => {
    setupCanvas();
    draw();
});

// Game state
const deck = new Deck();
let strokeCards = [];
let strokeCount = 0;
let holeNumber = 1;
let totalStrokes = 0;
let isAnimating = false;
let gameWon = false;
let rerollsRemaining = MAX_REROLLS;
let aimAngle = 0;

// Course state
const holeGenerator = new HoleGenerator(MAP_SIZE);
let currentHole = holeGenerator.generateHole();
let teeBox = { ...currentHole.teeBox };
let flag = { ...currentHole.flag };
let ball = { x: teeBox.x, y: teeBox.y };

// DOM Elements
const messageEl = document.getElementById('message');
const strokeCountEl = document.getElementById('strokeCount');
const holeNumberEl = document.getElementById('holeNumber');
const totalStrokesEl = document.getElementById('totalStrokes');
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

// Initialize UI systems
SkillChallenge.init({
    overlay: document.getElementById('skillChallengeOverlay'),
    modal: document.querySelector('.skill-challenge-modal'),
    track: document.getElementById('skillChallengeTrack'),
    target: document.getElementById('skillChallengeTarget'),
    marker: document.getElementById('skillChallengeMarker'),
    btn: document.getElementById('skillChallengeBtn'),
    difficulty: document.getElementById('skillDifficulty')
});

CardReward.init(deck, {
    overlay: document.getElementById('rewardOverlay'),
    title: document.getElementById('rewardTitle'),
    strokes: document.getElementById('rewardStrokes'),
    cards: document.getElementById('rewardCards'),
    skipBtn: document.getElementById('skipRewardBtn')
}, newHoleAfterReward);

// ============================================
// AIM CONTROL SYSTEM
// ============================================
const aimLeftBtn = document.getElementById('aimLeftBtn');
const aimRightBtn = document.getElementById('aimRightBtn');
const aimAngleDisplay = document.getElementById('aimAngleDisplay');

let isAimingLeft = false;
let isAimingRight = false;
let aimAnimationId = null;

function updateAimDisplay() {
    const degrees = Math.round(aimAngle * 180 / Math.PI);
    aimAngleDisplay.textContent = `${degrees}°`;
}

function processAiming() {
    if (isAnimating || gameWon) return;
    
    if (isAimingLeft) aimAngle -= AIM_SPEED;
    if (isAimingRight) aimAngle += AIM_SPEED;
    
    aimAngle = Math.max(-Math.PI, Math.min(Math.PI, aimAngle));
    
    updateAimDisplay();
    draw();
    
    if (isAimingLeft || isAimingRight) {
        aimAnimationId = requestAnimationFrame(processAiming);
    }
}

function startAiming(direction) {
    if (direction === 'left') isAimingLeft = true;
    else isAimingRight = true;
    if (!aimAnimationId) processAiming();
}

function stopAiming(direction) {
    if (direction === 'left') isAimingLeft = false;
    else isAimingRight = false;
    if (!isAimingLeft && !isAimingRight && aimAnimationId) {
        cancelAnimationFrame(aimAnimationId);
        aimAnimationId = null;
    }
}

aimLeftBtn.addEventListener('mousedown', () => startAiming('left'));
aimLeftBtn.addEventListener('mouseup', () => stopAiming('left'));
aimLeftBtn.addEventListener('mouseleave', () => stopAiming('left'));
aimLeftBtn.addEventListener('touchstart', (e) => { e.preventDefault(); startAiming('left'); });
aimLeftBtn.addEventListener('touchend', () => stopAiming('left'));

aimRightBtn.addEventListener('mousedown', () => startAiming('right'));
aimRightBtn.addEventListener('mouseup', () => stopAiming('right'));
aimRightBtn.addEventListener('mouseleave', () => stopAiming('right'));
aimRightBtn.addEventListener('touchstart', (e) => { e.preventDefault(); startAiming('right'); });
aimRightBtn.addEventListener('touchend', () => stopAiming('right'));

document.addEventListener('keydown', (e) => {
    if (isAnimating || gameWon) return;
    if (e.key === 'ArrowLeft' && !isAimingLeft) startAiming('left');
    else if (e.key === 'ArrowRight' && !isAimingRight) startAiming('right');
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') stopAiming('left');
    else if (e.key === 'ArrowRight') stopAiming('right');
});

let touchStartX = 0;
let isTouchAiming = false;

canvas.addEventListener('touchstart', (e) => {
    if (isAnimating || gameWon) return;
    touchStartX = e.touches[0].clientX;
    isTouchAiming = true;
});

canvas.addEventListener('touchmove', (e) => {
    if (!isTouchAiming || isAnimating || gameWon) return;
    e.preventDefault();
    
    const touchX = e.touches[0].clientX;
    const deltaX = touchX - touchStartX;
    
    aimAngle += deltaX * 0.003;
    aimAngle = Math.max(-Math.PI, Math.min(Math.PI, aimAngle));
    
    touchStartX = touchX;
    updateAimDisplay();
    draw();
});

canvas.addEventListener('touchend', () => {
    isTouchAiming = false;
});

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
            if (existingClub.id === 'putter') {
                const idx = strokeCards.findIndex(c => c.instanceId === existingClub.instanceId);
                if (idx >= 0) strokeCards.splice(idx, 1);
            } else {
                showMessage('Only one club allowed per stroke!', true);
                return;
            }
        }
    }

    deck.removeFromHand(card);
    strokeCards.push(card);
    renderHand();
    renderStroke();
}

function onStrokeCardClicked(card) {
    if (isAnimating || gameWon) return;

    if (card.id === 'putter' && card.type === CardType.CLUB) {
        const otherClubs = deck.hand.filter(c => c.type === CardType.CLUB);
        if (otherClubs.length === 0) {
            showMessage('Putter is your default club - play another club to replace it.', true);
            return;
        }
    }

    const idx = strokeCards.findIndex(c => c.instanceId === card.instanceId);
    if (idx >= 0) {
        strokeCards.splice(idx, 1);
        if (card.id !== 'putter' || card.type !== CardType.CLUB) {
            deck.addToHand(card);
        }
        renderHand();
        renderStroke();
    }
}

// ============================================
// GAME ACTIONS
// ============================================
function startTurn() {
    strokeCards = [];
    strokeCards.push(createPutter());
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

    swingBtn.disabled = true;
    rerollBtn.disabled = true;

    SkillChallenge.start(strokeCards.length, (accuracy) => {
        executeSwing(shot, accuracy);
    });
}

function executeSwing(shot, accuracy) {
    isAnimating = true;
    strokeCount++;
    totalStrokes++;
    strokeCountEl.textContent = strokeCount;
    totalStrokesEl.textContent = totalStrokes;

    const inSandAtStart = isInSand(ball.x, ball.y, sandPits);
    const sandPenalty = inSandAtStart ? 0.6 : 1.0;
    
    const MAX_VARIANCE = 0.20;
    const sandExtraVariance = inSandAtStart ? 0.15 : 0;
    const inaccuracy = 1 - accuracy;
    const distanceVariance = (Math.random() * 2 - 1) * (inaccuracy * MAX_VARIANCE + sandExtraVariance);
    const lateralVariance = (Math.random() * 2 - 1) * (inaccuracy * MAX_VARIANCE + sandExtraVariance) * MAP_SIZE;

    const baseAngle = Math.atan2(flag.y - ball.y, flag.x - ball.x);
    const finalAngle = baseAngle + aimAngle;
    
    const dirX = Math.cos(finalAngle);
    const dirY = Math.sin(finalAngle);

    let travelDist = shot.finalDistance * MAP_SIZE;
    if (shot.hasLongRun) travelDist *= (1 + LONG_RUN_BONUS);
    travelDist *= sandPenalty;
    travelDist *= (1 + distanceVariance);

    const perpX = -dirY;
    const perpY = dirX;
    
    let lateralOffset = 0;
    const SHAPE_OFFSET = 40;
    if (shot.shape === ShapeDirection.CUT) lateralOffset = SHAPE_OFFSET;
    else if (shot.shape === ShapeDirection.FADE) lateralOffset = -SHAPE_OFFSET;
    lateralOffset += lateralVariance;
    
    const targetX = ball.x + dirX * travelDist + perpX * lateralOffset;
    const targetY = ball.y + dirY * travelDist + perpY * lateralOffset;

    const accuracyPercent = (accuracy * 100).toFixed(0);
    let accuracyLabel;
    if (accuracy >= 0.95) accuracyLabel = 'Perfect!';
    else if (accuracy >= 0.8) accuracyLabel = 'Good';
    else if (accuracy >= 0.6) accuracyLabel = 'OK';
    else accuracyLabel = 'Poor';
    
    let sandInfo = inSandAtStart ? '\n<span class="shot-invalid">SAND: -40% distance, extra variance</span>' : '';
    debugOutput.innerHTML = shot.getDebugString() + `\n<span class="${accuracy >= 0.8 ? 'shot-valid' : 'shot-invalid'}">Timing: ${accuracyLabel} (${accuracyPercent}%)</span>` + sandInfo;

    const startX = ball.x;
    const startY = ball.y;
    const duration = 600;
    const startTime = performance.now();

    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);

        ball.x = startX + (targetX - startX) * easeProgress;
        ball.y = startY + (targetY - startY) * easeProgress;
        
        const heightProgress = Math.sin(progress * Math.PI);
        const maxScale = 1.0 + 0.4 * Math.max(0, 1 + shot.loftScalar * 0.2);
        const ballScale = 1.0 + (maxScale - 1.0) * heightProgress;

        draw(ballScale);

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            animateBounce(shot, dirX, dirY);
        }
    }

    requestAnimationFrame(animate);
}

function animateBounce(shot, dirX, dirY) {
    const bounceCount = shot.bounceCount;
    const totalBounceDistance = shot.bounceDistance * MAP_SIZE;
    
    if (bounceCount <= 0 || totalBounceDistance <= 0) {
        finishSwing(shot);
        return;
    }
    
    let currentBounce = 0;
    let bounceDistances = [];
    let remainingDist = totalBounceDistance;
    
    for (let i = 0; i < bounceCount; i++) {
        const fraction = 1 / Math.pow(2, i);
        bounceDistances.push(remainingDist * 0.5);
        remainingDist *= 0.5;
    }
    
    function doBounce() {
        if (currentBounce >= bounceCount) {
            finishSwing(shot);
            return;
        }
        
        const bounceDist = bounceDistances[currentBounce];
        const startX = ball.x;
        const startY = ball.y;
        const endX = startX + dirX * bounceDist;
        const endY = startY + dirY * bounceDist;
        
        const bounceDuration = 150 + currentBounce * 50;
        const bounceHeight = 0.15 * Math.pow(0.6, currentBounce);
        const startTime = performance.now();
        
        function animateSingleBounce(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / bounceDuration, 1);
            
            const easeProgress = 1 - Math.pow(1 - progress, 2);
            ball.x = startX + (endX - startX) * easeProgress;
            ball.y = startY + (endY - startY) * easeProgress;
            
            const heightProgress = Math.sin(progress * Math.PI);
            const maxScale = 1.0 + bounceHeight * (1 + shot.loftScalar * 0.1);
            const ballScale = 1.0 + (maxScale - 1.0) * heightProgress;
            
            draw(ballScale);
            
            if (progress < 1) {
                requestAnimationFrame(animateSingleBounce);
            } else {
                currentBounce++;
                doBounce();
            }
        }
        
        requestAnimationFrame(animateSingleBounce);
    }
    
    doBounce();
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
        isAnimating = true;
        ball.x = flag.x;
        ball.y = flag.y;
        showMessage(`Holed in ${strokeCount} strokes!`);
        swingBtn.disabled = true;
        
        const finalStrokeCount = strokeCount;
        Celebration.start(ctx, flag, () => draw(), () => {
            CardReward.show(finalStrokeCount);
        });
        return;
    }

    if (isInWater(ball.x, ball.y, currentHole)) {
        showMessage('Splash! Ball in water - reset to tee.', true);
        setTimeout(() => {
            ball.x = teeBox.x;
            ball.y = teeBox.y;
            endTurn();
        }, 800);
        return;
    }

    if (isOutOfBounds(ball.x, ball.y, currentHole, MAP_SIZE)) {
        showMessage('Out of bounds! Reset to tee.', true);
        setTimeout(() => {
            ball.x = teeBox.x;
            ball.y = teeBox.y;
            endTurn();
        }, 800);
        return;
    }

    const inSand = isInSand(ball.x, ball.y, currentHole.sandPits);
    const inRough = isInRough(ball.x, ball.y, currentHole);
    const distRemaining = (distToFlag / MAP_SIZE * 100).toFixed(0);
    
    if (inSand) showMessage(`${distRemaining}% to flag - In sand bunker!`);
    else if (inRough) showMessage(`${distRemaining}% to flag - In the rough`);
    else showMessage(`${distRemaining}% to flag`);

    endTurn();
}

function endTurn() {
    for (const card of strokeCards) {
        if (card.id === 'putter' && card.type === CardType.CLUB) {
            continue;
        }
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
    holeNumber = 1;
    totalStrokes = 0;
    holeNumberEl.textContent = '1';
    totalStrokesEl.textContent = '0';
    
    currentHole = holeGenerator.generateHole();
    teeBox = { ...currentHole.teeBox };
    flag = { ...currentHole.flag };

    ball = { x: teeBox.x, y: teeBox.y };
    strokeCount = 0;
    strokeCountEl.textContent = '0';
    gameWon = false;
    isAnimating = false;
    rerollsRemaining = MAX_REROLLS;
    aimAngle = 0;
    updateAimDisplay();

    deck.initialize(createStarterDeck());
    strokeCards = [];

    swingBtn.disabled = false;
    rerollBtn.disabled = false;
    debugOutput.innerHTML = 'Waiting for swing...';

    startTurn();
    draw();

    const distance = Math.sqrt((flag.x - teeBox.x) ** 2 + (flag.y - teeBox.y) ** 2);
    const distPercent = ((distance / MAP_SIZE) * 100).toFixed(0);
    const holeType = currentHole.holeStyle === HoleStyle.ISLAND ? 'Island' : 'Parkland';
    showMessage(`New game! ${holeType} hole | Distance: ${distPercent}%`);
}

function newHoleAfterReward() {
    holeNumber++;
    holeNumberEl.textContent = holeNumber;
    
    currentHole = holeGenerator.generateHole();
    teeBox = { ...currentHole.teeBox };
    flag = { ...currentHole.flag };

    ball = { x: teeBox.x, y: teeBox.y };
    strokeCount = 0;
    strokeCountEl.textContent = '0';
    gameWon = false;
    isAnimating = false;
    rerollsRemaining = MAX_REROLLS;
    aimAngle = 0;
    updateAimDisplay();

    strokeCards = [];
    swingBtn.disabled = false;
    rerollBtn.disabled = false;
    debugOutput.innerHTML = 'Waiting for swing...';

    startTurn();
    draw();

    const distance = Math.sqrt((flag.x - teeBox.x) ** 2 + (flag.y - teeBox.y) ** 2);
    const distPercent = ((distance / MAP_SIZE) * 100).toFixed(0);
    const deckSize = deck.drawPile.length + deck.discardPile.length + deck.hand.length;
    const holeType = currentHole.holeStyle === HoleStyle.ISLAND ? 'Island' : 'Parkland';
    showMessage(`Hole ${holeNumber}! ${holeType} | Distance: ${distPercent}% | Deck: ${deckSize} cards`);
}

// ============================================
// MAIN DRAW FUNCTION
// ============================================
function draw(ballScale = 1.0) {
    ctx.clearRect(0, 0, MAP_SIZE, MAP_SIZE);
    
    drawCourse(ctx, currentHole, MAP_SIZE);
    
    drawTeeBox(ctx, teeBox);
    drawFlag(ctx, flag, HOLE_RADIUS, Celebration);
    
    drawAimingLine(ctx, {
        gameWon,
        isAnimating,
        strokeCards,
        flag,
        ball,
        aimAngle,
        mapSize: MAP_SIZE
    });
    
    drawBall(ctx, ball, BALL_RADIUS, ballScale);
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
