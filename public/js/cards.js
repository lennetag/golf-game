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
        immediateEffect = false,
        rarity = 'common',
        description = ''
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
        this.rarity = rarity;
        this.customDescription = description;
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
                    case 'draw_3': return 'Draw 3 cards';
                    case 'mulligan': return 'Retry shot';
                    case 'wind_shield': return 'Ignore wind';
                    case 'precision': return '+20% accuracy';
                    case 'sand_master': return 'No sand penalty';
                    case 'water_skip': return 'Skip over water';
                }
        }
        return '';
    }

    getRarity() {
        return this.rarity || 'common';
    }

    clone() {
        const clone = new CardData(this);
        clone.instanceId = Math.random().toString(36).substr(2, 9);
        return clone;
    }
}

// ============================================
// DEFAULT PUTTER (always available)
// ============================================
function createPutter() {
    return new CardData({
        id: 'putter', name: 'Putter', type: CardType.CLUB,
        tags: ['club'], baseDistance: 0.12, maxInStroke: 1
    });
}

// ============================================
// PRACTICE SWING (always in stroke with putter, cannot be removed)
// ============================================
function createPracticeSwing() {
    return new CardData({
        id: 'practice_swing', name: 'Practice Swing', type: CardType.POWER,
        tags: ['power', 'modifier'], powerValue: 0.10
    });
}

// ============================================
// CARD DATABASE - 23 Starter Cards
// ============================================
function createStarterDeck() {
    const cards = [];

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
// REWARD CARD POOL - Cards that can be earned
// ============================================
function getRewardCardPool() {
    return [
        new CardData({
            id: 'third', name: 'Third', type: CardType.POWER,
            tags: ['power', 'modifier'], powerValue: 0.33, rarity: 'common'
        }),
        new CardData({
            id: 'three_quarter', name: 'Three Quarter', type: CardType.POWER,
            tags: ['power', 'modifier'], powerValue: 0.75, rarity: 'common'
        }),
        new CardData({
            id: 'full_power', name: 'Full', type: CardType.POWER,
            tags: ['power', 'modifier'], powerValue: 1.0, rarity: 'common'
        }),
        new CardData({
            id: 'overpower', name: 'Overpower', type: CardType.POWER,
            tags: ['power', 'modifier'], powerValue: 1.15, rarity: 'rare',
            description: 'Risk it for distance'
        }),
        new CardData({
            id: 'mega_drive', name: 'Mega Drive', type: CardType.POWER,
            tags: ['power', 'modifier'], powerValue: 1.30, rarity: 'epic',
            description: 'Maximum distance'
        }),
        new CardData({
            id: 'chip', name: 'Chip', type: CardType.POWER,
            tags: ['power', 'modifier'], powerValue: 0.15, rarity: 'common'
        }),

        new CardData({
            id: '3_wood', name: '3 Wood', type: CardType.CLUB,
            tags: ['club'], baseDistance: 0.45, maxInStroke: 1, rarity: 'uncommon'
        }),
        new CardData({
            id: '5_iron', name: '5 Iron', type: CardType.CLUB,
            tags: ['club'], baseDistance: 0.38, maxInStroke: 1, rarity: 'common'
        }),
        new CardData({
            id: '9_iron', name: '9 Iron', type: CardType.CLUB,
            tags: ['club'], baseDistance: 0.25, maxInStroke: 1, rarity: 'common'
        }),
        new CardData({
            id: 'sand_wedge', name: 'Sand Wedge', type: CardType.CLUB,
            tags: ['club'], baseDistance: 0.18, maxInStroke: 1, rarity: 'uncommon',
            description: 'Great from bunkers'
        }),
        new CardData({
            id: 'lob_wedge', name: 'Lob Wedge', type: CardType.CLUB,
            tags: ['club'], baseDistance: 0.15, maxInStroke: 1, rarity: 'uncommon',
            description: 'High arc, short distance'
        }),
        new CardData({
            id: 'hybrid', name: 'Hybrid', type: CardType.CLUB,
            tags: ['club'], baseDistance: 0.40, maxInStroke: 1, rarity: 'rare'
        }),
        new CardData({
            id: 'big_bertha', name: 'Big Bertha', type: CardType.CLUB,
            tags: ['club'], baseDistance: 0.55, maxInStroke: 1, rarity: 'epic',
            description: 'Legendary distance'
        }),

        new CardData({
            id: 'draw_3', name: 'Draw 3', type: CardType.UTILITY,
            tags: ['utility'], utilityEffect: 'draw_3',
            immediateEffect: true, requiresClub: false, rarity: 'uncommon'
        }),
        new CardData({
            id: 'mulligan', name: 'Mulligan', type: CardType.UTILITY,
            tags: ['utility'], utilityEffect: 'mulligan', rarity: 'rare',
            description: 'Redo your last shot'
        }),
        new CardData({
            id: 'precision', name: 'Precision', type: CardType.UTILITY,
            tags: ['utility'], utilityEffect: 'precision', rarity: 'uncommon',
            description: 'Tighter accuracy'
        }),
        new CardData({
            id: 'sand_master', name: 'Sand Master', type: CardType.UTILITY,
            tags: ['utility'], utilityEffect: 'sand_master', rarity: 'uncommon',
            description: 'No bunker penalty'
        }),
        new CardData({
            id: 'water_skip', name: 'Water Skip', type: CardType.UTILITY,
            tags: ['utility'], utilityEffect: 'water_skip', rarity: 'epic',
            description: 'Ball skips on water'
        }),
        new CardData({
            id: 'big_gimme_2', name: 'Big Gimme', type: CardType.UTILITY,
            tags: ['utility'], utilityEffect: 'big_gimme', rarity: 'common'
        }),
        new CardData({
            id: 'long_run_2', name: 'Long Run', type: CardType.UTILITY,
            tags: ['utility'], utilityEffect: 'long_run', rarity: 'common'
        }),

        new CardData({
            id: 'sky_high', name: 'Sky High', type: CardType.LOFT,
            tags: ['loft', 'modifier'], loftChange: 2, rarity: 'uncommon'
        }),
        new CardData({
            id: 'stinger', name: 'Stinger', type: CardType.LOFT,
            tags: ['loft', 'modifier'], loftChange: -2, rarity: 'uncommon',
            description: 'Low punch shot'
        }),

        new CardData({
            id: 'big_cut', name: 'Big Cut', type: CardType.SHAPING,
            tags: ['shaping', 'modifier'], shapeDirection: ShapeDirection.CUT, rarity: 'uncommon',
            description: 'Extra curve right'
        }),
        new CardData({
            id: 'big_fade', name: 'Big Fade', type: CardType.SHAPING,
            tags: ['shaping', 'modifier'], shapeDirection: ShapeDirection.FADE, rarity: 'uncommon',
            description: 'Extra curve left'
        }),
    ];
}

function getRandomRewardCards(count = 3) {
    const pool = getRewardCardPool();
    const selected = [];
    const poolCopy = [...pool];
    
    for (let i = 0; i < count && poolCopy.length > 0; i++) {
        const weights = poolCopy.map(card => {
            switch (card.rarity) {
                case 'common': return 50;
                case 'uncommon': return 30;
                case 'rare': return 15;
                case 'epic': return 5;
                default: return 50;
            }
        });
        
        const totalWeight = weights.reduce((a, b) => a + b, 0);
        let random = Math.random() * totalWeight;
        
        let selectedIndex = 0;
        for (let j = 0; j < weights.length; j++) {
            random -= weights[j];
            if (random <= 0) {
                selectedIndex = j;
                break;
            }
        }
        
        selected.push(poolCopy[selectedIndex].clone());
        poolCopy.splice(selectedIndex, 1);
    }
    
    return selected;
}
