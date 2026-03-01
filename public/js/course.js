// ============================================
// PROCEDURAL HOLE GENERATOR
// ============================================
const TerrainType = {
    FAIRWAY: 'fairway',
    ROUGH: 'rough',
    SAND: 'sand',
    GRASS_OOB: 'grass_oob'
};

class HoleGenerator {
    constructor(mapSize) {
        this.mapSize = mapSize;
        this.islands = [];
        this.sandPits = [];
        this.grassPatches = [];
        this.teeBox = { x: 0, y: 0 };
        this.flag = { x: 0, y: 0 };
    }

    random(min, max) {
        return Math.random() * (max - min) + min;
    }

    randomInt(min, max) {
        return Math.floor(this.random(min, max + 1));
    }

    generateBlobPoints(cx, cy, baseRadius, variance, pointCount) {
        const points = [];
        for (let i = 0; i < pointCount; i++) {
            const angle = (i / pointCount) * Math.PI * 2;
            const radiusVariance = this.random(1 - variance, 1 + variance);
            const r = baseRadius * radiusVariance;
            points.push({
                x: cx + Math.cos(angle) * r,
                y: cy + Math.sin(angle) * r
            });
        }
        return points;
    }

    generateElongatedShape(cx, cy, length, width, angle, waviness = 0.2) {
        const points = [];
        const segments = 16;
        
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const localX = (t - 0.5) * length;
            const waveOffset = Math.sin(t * Math.PI * 3) * width * waviness;
            const localY = width / 2 + waveOffset;
            
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            points.push({
                x: cx + localX * cos - localY * sin,
                y: cy + localX * sin + localY * cos
            });
        }
        
        for (let i = segments; i >= 0; i--) {
            const t = i / segments;
            const localX = (t - 0.5) * length;
            const waveOffset = Math.sin(t * Math.PI * 3) * width * waviness;
            const localY = -(width / 2 + waveOffset);
            
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            points.push({
                x: cx + localX * cos - localY * sin,
                y: cy + localX * sin + localY * cos
            });
        }
        
        return points;
    }

    generateOrganicIsland(cx, cy, size, type = 'blob') {
        let points;
        const rotation = this.random(0, Math.PI * 2);
        
        switch (type) {
            case 'elongated':
                const length = size * this.random(2, 3.5);
                const width = size * this.random(0.4, 0.8);
                points = this.generateElongatedShape(cx, cy, length, width, rotation, this.random(0.1, 0.3));
                break;
            case 'kidney':
                points = this.generateKidneyShape(cx, cy, size, rotation);
                break;
            case 'crescent':
                points = this.generateCrescentShape(cx, cy, size, rotation);
                break;
            case 'blob':
            default:
                points = this.generateBlobPoints(cx, cy, size, 0.3, this.randomInt(8, 14));
                break;
        }
        
        return { cx, cy, points, size, type };
    }

    generateKidneyShape(cx, cy, size, angle) {
        const points = [];
        const segments = 24;
        
        for (let i = 0; i < segments; i++) {
            const t = (i / segments) * Math.PI * 2;
            let r = size * (1 + 0.4 * Math.cos(t * 2));
            const indent = Math.max(0, Math.cos(t - Math.PI / 2)) * size * 0.3;
            r -= indent;
            
            const localX = Math.cos(t) * r;
            const localY = Math.sin(t) * r * 0.7;
            
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            points.push({
                x: cx + localX * cos - localY * sin,
                y: cy + localX * sin + localY * cos
            });
        }
        
        return points;
    }

    generateCrescentShape(cx, cy, size, angle) {
        const points = [];
        const segments = 20;
        
        for (let i = 0; i <= segments; i++) {
            const t = (i / segments) * Math.PI;
            const localX = Math.cos(t) * size * 1.2;
            const localY = Math.sin(t) * size * 0.8;
            
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            points.push({
                x: cx + localX * cos - localY * sin,
                y: cy + localX * sin + localY * cos
            });
        }
        
        for (let i = segments; i >= 0; i--) {
            const t = (i / segments) * Math.PI;
            const innerScale = 0.5;
            const localX = Math.cos(t) * size * 1.2 * innerScale + size * 0.3;
            const localY = Math.sin(t) * size * 0.5;
            
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            points.push({
                x: cx + localX * cos - localY * sin,
                y: cy + localX * sin + localY * cos
            });
        }
        
        return points;
    }

    generateSandPit(cx, cy, size) {
        const points = this.generateBlobPoints(cx, cy, size, 0.25, this.randomInt(6, 10));
        return { cx, cy, points, size };
    }

    generateGrassPatch(cx, cy, size) {
        const type = this.randomInt(0, 2);
        let points;
        const rotation = this.random(0, Math.PI * 2);
        
        if (type === 0) {
            points = this.generateBlobPoints(cx, cy, size, 0.35, this.randomInt(6, 10));
        } else {
            const length = size * this.random(1.5, 2.5);
            const width = size * this.random(0.5, 0.8);
            points = this.generateElongatedShape(cx, cy, length, width, rotation, 0.15);
        }
        
        return { cx, cy, points, size };
    }

    generateFairwayBridge(island1, island2) {
        const cx = (island1.cx + island2.cx) / 2;
        const cy = (island1.cy + island2.cy) / 2;
        const dx = island2.cx - island1.cx;
        const dy = island2.cy - island1.cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        
        const length = dist * 0.6;
        const width = this.random(25, 45);
        const points = this.generateElongatedShape(cx, cy, length, width, angle, 0.05);
        
        return { cx, cy, points, size: width, type: 'bridge' };
    }

    islandContainsPoint(island, px, py) {
        const points = island.points;
        let inside = false;
        for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
            const xi = points[i].x, yi = points[i].y;
            const xj = points[j].x, yj = points[j].y;
            if (((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi)) {
                inside = !inside;
            }
        }
        return inside;
    }

    distanceBetween(p1, p2) {
        return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
    }

    generateHole() {
        this.islands = [];
        this.sandPits = [];
        this.grassPatches = [];

        const holeDistance = this.random(0.5, 0.85);
        const numIslands = this.randomInt(4, 10);
        
        const teeAngle = this.random(0, Math.PI * 2);
        const centerX = this.mapSize / 2;
        const centerY = this.mapSize / 2;
        
        const teeX = centerX + Math.cos(teeAngle) * (this.mapSize * 0.3);
        const teeY = centerY + Math.sin(teeAngle) * (this.mapSize * 0.3);
        
        const flagAngle = teeAngle + Math.PI + this.random(-0.5, 0.5);
        const flagDistance = this.mapSize * holeDistance * 0.5;
        const flagX = centerX + Math.cos(flagAngle) * flagDistance * this.random(0.7, 1.0);
        const flagY = centerY + Math.sin(flagAngle) * flagDistance * this.random(0.7, 1.0);

        const clampedTeeX = Math.max(100, Math.min(this.mapSize - 100, teeX));
        const clampedTeeY = Math.max(100, Math.min(this.mapSize - 100, teeY));
        const clampedFlagX = Math.max(100, Math.min(this.mapSize - 100, flagX));
        const clampedFlagY = Math.max(100, Math.min(this.mapSize - 100, flagY));

        this.teeBox = { x: clampedTeeX, y: clampedTeeY };
        this.flag = { x: clampedFlagX, y: clampedFlagY };

        const teeIslandSize = this.random(70, 100);
        const teeIslandType = Math.random() < 0.3 ? 'elongated' : 'blob';
        this.islands.push(this.generateOrganicIsland(this.teeBox.x, this.teeBox.y, teeIslandSize, teeIslandType));

        const flagIslandSize = this.random(80, 120);
        const flagIslandType = this.randomInt(0, 3) === 0 ? 'kidney' : 'blob';
        this.islands.push(this.generateOrganicIsland(this.flag.x, this.flag.y, flagIslandSize, flagIslandType));

        const pathPoints = [];
        const pathSegments = this.randomInt(2, 4);
        for (let i = 0; i <= pathSegments; i++) {
            const t = i / pathSegments;
            const baseX = this.teeBox.x + (this.flag.x - this.teeBox.x) * t;
            const baseY = this.teeBox.y + (this.flag.y - this.teeBox.y) * t;
            const perpX = -(this.flag.y - this.teeBox.y);
            const perpY = this.flag.x - this.teeBox.x;
            const perpLen = Math.sqrt(perpX * perpX + perpY * perpY);
            const offset = (i === 0 || i === pathSegments) ? 0 : this.random(-100, 100);
            pathPoints.push({
                x: baseX + (perpX / perpLen) * offset,
                y: baseY + (perpY / perpLen) * offset
            });
        }

        const islandTypes = ['blob', 'blob', 'elongated', 'elongated', 'kidney', 'crescent'];
        
        for (let i = 2; i < numIslands; i++) {
            let placed = false;
            let attempts = 0;
            
            while (!placed && attempts < 50) {
                attempts++;
                
                let cx, cy;
                if (Math.random() < 0.6 && pathPoints.length > 2) {
                    const pathIdx = this.randomInt(1, pathPoints.length - 2);
                    const pathPoint = pathPoints[pathIdx];
                    cx = pathPoint.x + this.random(-80, 80);
                    cy = pathPoint.y + this.random(-80, 80);
                } else {
                    cx = this.random(80, this.mapSize - 80);
                    cy = this.random(80, this.mapSize - 80);
                }
                
                let tooClose = false;
                for (const existing of this.islands) {
                    if (this.distanceBetween({ x: cx, y: cy }, { x: existing.cx, y: existing.cy }) < existing.size + 40) {
                        tooClose = true;
                        break;
                    }
                }
                
                if (!tooClose) {
                    const size = this.random(50, 120);
                    const type = islandTypes[this.randomInt(0, islandTypes.length - 1)];
                    this.islands.push(this.generateOrganicIsland(cx, cy, size, type));
                    placed = true;
                }
            }
        }

        const numBridges = this.randomInt(1, 3);
        for (let i = 0; i < numBridges; i++) {
            if (this.islands.length < 2) break;
            
            let bestPair = null;
            let bestDist = Infinity;
            
            for (let a = 0; a < this.islands.length; a++) {
                for (let b = a + 1; b < this.islands.length; b++) {
                    const dist = this.distanceBetween(
                        { x: this.islands[a].cx, y: this.islands[a].cy },
                        { x: this.islands[b].cx, y: this.islands[b].cy }
                    );
                    const minReach = this.islands[a].size + this.islands[b].size + 30;
                    const maxReach = this.islands[a].size + this.islands[b].size + 150;
                    
                    if (dist > minReach && dist < maxReach && dist < bestDist) {
                        bestDist = dist;
                        bestPair = [this.islands[a], this.islands[b]];
                    }
                }
            }
            
            if (bestPair && Math.random() < 0.7) {
                this.islands.push(this.generateFairwayBridge(bestPair[0], bestPair[1]));
            }
        }

        const numSandPits = this.randomInt(1, 4);
        for (let i = 0; i < numSandPits; i++) {
            let placed = false;
            let attempts = 0;
            
            while (!placed && attempts < 30) {
                attempts++;
                
                const targetIsland = this.islands[this.randomInt(1, this.islands.length - 1)];
                const angle = this.random(0, Math.PI * 2);
                const dist = targetIsland.size * this.random(0.3, 0.7);
                const cx = targetIsland.cx + Math.cos(angle) * dist;
                const cy = targetIsland.cy + Math.sin(angle) * dist;
                
                if (this.islandContainsPoint(targetIsland, cx, cy)) {
                    const size = this.random(15, 35);
                    
                    const distToFlag = this.distanceBetween({ x: cx, y: cy }, this.flag);
                    const distToTee = this.distanceBetween({ x: cx, y: cy }, this.teeBox);
                    
                    if (distToFlag > 30 && distToTee > 30) {
                        this.sandPits.push(this.generateSandPit(cx, cy, size));
                        placed = true;
                    }
                }
            }
        }

        const numGrassPatches = this.randomInt(2, 6);
        for (let i = 0; i < numGrassPatches; i++) {
            let placed = false;
            let attempts = 0;
            
            while (!placed && attempts < 30) {
                attempts++;
                
                const cx = this.random(50, this.mapSize - 50);
                const cy = this.random(50, this.mapSize - 50);
                
                let onIsland = false;
                for (const island of this.islands) {
                    if (this.distanceBetween({ x: cx, y: cy }, { x: island.cx, y: island.cy }) < island.size * 1.5) {
                        onIsland = true;
                        break;
                    }
                }
                
                if (!onIsland) {
                    const size = this.random(30, 70);
                    this.grassPatches.push(this.generateGrassPatch(cx, cy, size));
                    placed = true;
                }
            }
        }

        return {
            islands: this.islands,
            sandPits: this.sandPits,
            grassPatches: this.grassPatches,
            teeBox: this.teeBox,
            flag: this.flag
        };
    }
}

// Terrain collision detection
function pointInPolygon(px, py, points) {
    let inside = false;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
        const xi = points[i].x, yi = points[i].y;
        const xj = points[j].x, yj = points[j].y;
        if (((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi)) {
            inside = !inside;
        }
    }
    return inside;
}

function isInWater(x, y, islands) {
    for (const island of islands) {
        if (pointInPolygon(x, y, island.points)) {
            return false;
        }
    }
    return true;
}

function isInSand(x, y, sandPits) {
    for (const pit of sandPits) {
        if (pointInPolygon(x, y, pit.points)) {
            return true;
        }
    }
    return false;
}

function isInGrassOOB(x, y, grassPatches) {
    for (const patch of grassPatches) {
        if (pointInPolygon(x, y, patch.points)) {
            return true;
        }
    }
    return false;
}
