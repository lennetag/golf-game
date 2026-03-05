// ============================================
// HOLE CELEBRATION SYSTEM
// ============================================
const Celebration = {
    particles: [],
    isActive: false,
    animationId: null,
    flagColors: ['#ef4444', '#fbbf24', '#4ade80', '#60a5fa', '#a855f7', '#ec4899'],
    currentFlagColor: '#ef4444',
    flagColorIndex: 0,
    colorCycleTime: 0,
    ctx: null,
    flag: null,
    drawCallback: null,
    
    start(ctx, flag, drawCallback, onComplete) {
        this.ctx = ctx;
        this.flag = flag;
        this.drawCallback = drawCallback;
        this.isActive = true;
        this.particles = [];
        this.onComplete = onComplete;
        this.startTime = performance.now();
        this.flagColorIndex = 0;
        this.colorCycleTime = 0;
        
        for (let i = 0; i < 60; i++) {
            this.spawnParticle(flag.x, flag.y - 20, true);
        }
        
        this.animate();
    },
    
    spawnParticle(x, y, initial = false) {
        const angle = Math.random() * Math.PI * 2;
        const speed = initial ? Math.random() * 8 + 4 : Math.random() * 5 + 2;
        const colors = ['#fbbf24', '#f59e0b', '#ef4444', '#4ade80', '#60a5fa', '#a855f7', '#ffffff'];
        
        this.particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - (initial ? 5 : 2),
            life: 1.0,
            decay: Math.random() * 0.02 + 0.01,
            size: Math.random() * 6 + 3,
            color: colors[Math.floor(Math.random() * colors.length)],
            type: Math.random() > 0.5 ? 'spark' : 'star'
        });
    },
    
    animate() {
        if (!this.isActive) return;
        
        const elapsed = performance.now() - this.startTime;
        
        this.colorCycleTime += 16;
        if (this.colorCycleTime > 100) {
            this.colorCycleTime = 0;
            this.flagColorIndex = (this.flagColorIndex + 1) % this.flagColors.length;
            this.currentFlagColor = this.flagColors[this.flagColorIndex];
        }
        
        if (elapsed < 1500 && Math.random() > 0.7) {
            this.spawnParticle(this.flag.x + (Math.random() - 0.5) * 30, this.flag.y - 20);
        }
        
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.2;
            p.vx *= 0.98;
            p.life -= p.decay;
            
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
        
        if (this.drawCallback) this.drawCallback();
        this.drawParticles();
        
        if (elapsed > 2500) {
            this.stop();
            return;
        }
        
        this.animationId = requestAnimationFrame(() => this.animate());
    },
    
    drawParticles() {
        for (const p of this.particles) {
            this.ctx.globalAlpha = p.life;
            this.ctx.fillStyle = p.color;
            
            if (p.type === 'star') {
                this.drawStar(p.x, p.y, p.size);
            } else {
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
        this.ctx.globalAlpha = 1;
    },
    
    drawStar(x, y, size) {
        this.ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * 4 * Math.PI / 5) - Math.PI / 2;
            const px = x + Math.cos(angle) * size;
            const py = y + Math.sin(angle) * size;
            if (i === 0) this.ctx.moveTo(px, py);
            else this.ctx.lineTo(px, py);
        }
        this.ctx.closePath();
        this.ctx.fill();
    },
    
    stop() {
        this.isActive = false;
        this.currentFlagColor = '#ef4444';
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.particles = [];
        if (this.onComplete) {
            this.onComplete();
        }
    }
};

// ============================================
// CARD REWARD SYSTEM
// ============================================
const CardReward = {
    isActive: false,
    selectedCard: null,
    rewardOptions: [],
    deck: null,
    onComplete: null,
    elements: null,
    
    init(deck, elements, onComplete) {
        this.deck = deck;
        this.elements = elements;
        this.onComplete = onComplete;
        
        if (this.elements.skipBtn) {
            this.elements.skipBtn.addEventListener('click', () => this.skip());
        }
    },
    
    show(strokeCount) {
        this.isActive = true;
        this.selectedCard = null;
        this.rewardOptions = getRandomRewardCards(3);
        
        let title = 'Hole Complete!';
        if (strokeCount === 1) title = 'HOLE IN ONE!!!';
        else if (strokeCount === 2) title = 'Eagle!';
        else if (strokeCount <= 3) title = 'Birdie!';
        else if (strokeCount <= 4) title = 'Par!';
        
        this.elements.title.textContent = title;
        this.elements.strokes.textContent = `Completed in ${strokeCount} stroke${strokeCount !== 1 ? 's' : ''}`;
        
        this.elements.cards.innerHTML = '';
        for (const card of this.rewardOptions) {
            const el = this.createRewardCardElement(card);
            this.elements.cards.appendChild(el);
        }
        
        this.elements.overlay.classList.add('active');
    },
    
    createRewardCardElement(card) {
        const el = document.createElement('div');
        el.className = `reward-card ${card.type} ${card.rarity}`;
        
        const desc = card.customDescription || card.getDescription();
        
        el.innerHTML = `
            <div class="card-name">${card.name}</div>
            <div class="card-type">${card.getTypeString()}</div>
            <div class="card-desc">${desc}</div>
            <div class="card-rarity">${card.rarity}</div>
        `;
        
        el.addEventListener('click', () => this.selectCard(card));
        return el;
    },
    
    selectCard(card) {
        this.selectedCard = card;
        this.deck.drawPile.push(card);
        this.deck.shuffle();
        this.hide();
        showMessage(`Added ${card.name} to your deck!`);
        this.startNextHole();
    },
    
    skip() {
        this.hide();
        showMessage('Reward skipped');
        this.startNextHole();
    },
    
    hide() {
        this.isActive = false;
        this.elements.overlay.classList.remove('active');
    },
    
    startNextHole() {
        setTimeout(() => {
            if (this.onComplete) this.onComplete();
        }, 500);
    }
};

// ============================================
// CHECKPOINT REWARD (yellow flag)
// ============================================
const CheckpointReward = {
    isActive: false,
    onComplete: null,
    elements: null,

    init(elements, onComplete) {
        this.elements = elements;
        this.onComplete = onComplete;
        if (!this.elements?.choices) return;
        this.elements.choices.querySelectorAll('[data-reward]').forEach(el => {
            el.addEventListener('click', () => this.choose(el.dataset.reward));
        });
    },

    show(strokeCount, checkpointLabel) {
        this.isActive = true;
        if (this.elements.title) this.elements.title.textContent = 'Checkpoint reached!';
        if (this.elements.strokes) this.elements.strokes.textContent = `${checkpointLabel} in ${strokeCount} stroke${strokeCount !== 1 ? 's' : ''}. Choose a reward:`;
        if (this.elements.overlay) this.elements.overlay.classList.add('active');
    },

    choose(rewardId) {
        if (!this.onComplete) return;
        this.hide();
        this.onComplete(rewardId);
    },

    hide() {
        this.isActive = false;
        if (this.elements.overlay) this.elements.overlay.classList.remove('active');
    }
};

// ============================================
// SKILL CHALLENGE SYSTEM
// ============================================
const SkillChallenge = {
    isActive: false,
    animationId: null,
    markerPosition: 0,
    targetPosition: 0,
    direction: 1,
    speed: 2,
    trackWidth: 0,
    markerWidth: 12,
    targetWidth: 40,
    onComplete: null,
    elements: null,
    
    init(elements) {
        this.elements = elements;
        
        if (this.elements.btn) {
            this.elements.btn.addEventListener('click', () => {
                if (this.isActive) {
                    this.stop();
                }
            });
        }
    },
    
    start(cardCount, onComplete) {
        this.onComplete = onComplete;
        this.isActive = true;
        
        this.trackWidth = this.elements.track.offsetWidth;
        this.markerWidth = this.elements.marker.offsetWidth;
        this.targetWidth = this.elements.target.offsetWidth;
        
        this.targetPosition = Math.random() * (this.trackWidth - this.targetWidth - 40) + 20;
        this.elements.target.style.left = this.targetPosition + 'px';
        
        const baseSpeed = 2;
        const speedMultiplier = 1 + (cardCount - 1) * 0.4;
        this.speed = baseSpeed * speedMultiplier;
        
        this.updateDifficultyLabel(cardCount);
        
        this.markerPosition = 0;
        this.direction = 1;
        this.elements.marker.style.left = '0px';
        
        this.elements.modal.classList.remove('result-perfect', 'result-good', 'result-ok', 'result-poor');
        
        this.elements.overlay.classList.add('active');
        this.elements.btn.disabled = false;
        
        this.animate();
    },
    
    updateDifficultyLabel(cardCount) {
        let difficulty, color;
        if (cardCount <= 2) {
            difficulty = 'Easy';
            color = '#4ade80';
        } else if (cardCount <= 4) {
            difficulty = 'Normal';
            color = '#fbbf24';
        } else if (cardCount <= 6) {
            difficulty = 'Hard';
            color = '#f97316';
        } else {
            difficulty = 'Extreme';
            color = '#ef4444';
        }
        this.elements.difficulty.textContent = difficulty;
        this.elements.difficulty.style.color = color;
    },
    
    animate() {
        if (!this.isActive) return;
        
        this.markerPosition += this.speed * this.direction;
        
        const maxPosition = this.trackWidth - this.markerWidth;
        if (this.markerPosition >= maxPosition) {
            this.markerPosition = maxPosition;
            this.direction = -1;
        } else if (this.markerPosition <= 0) {
            this.markerPosition = 0;
            this.direction = 1;
        }
        
        this.elements.marker.style.left = this.markerPosition + 'px';
        
        this.animationId = requestAnimationFrame(() => this.animate());
    },
    
    stop() {
        this.isActive = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        const accuracy = this.calculateAccuracy();
        
        this.showResult(accuracy);
        
        this.elements.btn.disabled = true;
        
        setTimeout(() => {
            this.elements.overlay.classList.remove('active');
            if (this.onComplete) {
                this.onComplete(accuracy);
            }
        }, 800);
    },
    
    calculateAccuracy() {
        const markerCenter = this.markerPosition + this.markerWidth / 2;
        const targetCenter = this.targetPosition + this.targetWidth / 2;
        const distance = Math.abs(markerCenter - targetCenter);
        
        const perfectZone = this.targetWidth / 2;
        
        if (distance <= perfectZone * 0.3) {
            return 1.0;
        }
        
        const maxDistance = this.trackWidth / 2;
        const normalizedDistance = Math.min(distance / maxDistance, 1);
        const accuracy = 1 - normalizedDistance;
        
        return Math.max(0, Math.min(1, accuracy));
    },
    
    showResult(accuracy) {
        let resultClass;
        if (accuracy >= 0.95) {
            resultClass = 'result-perfect';
        } else if (accuracy >= 0.8) {
            resultClass = 'result-good';
        } else if (accuracy >= 0.6) {
            resultClass = 'result-ok';
        } else {
            resultClass = 'result-poor';
        }
        this.elements.modal.classList.add(resultClass);
    }
};
