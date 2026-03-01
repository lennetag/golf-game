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
                if (typeof showMessage === 'function') {
                    showMessage('Shuffled discard into draw pile!');
                }
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
