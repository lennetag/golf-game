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
