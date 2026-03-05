// ============================================
// PROCEDURAL HOLE GENERATOR
// ============================================
const TerrainType = {
    GREEN: 'green',
    FAIRWAY: 'fairway',
    ROUGH: 'rough',
    SAND: 'sand',
    WATER: 'water'
};

const HoleStyle = {
    ISLAND: 'island',
    PARKLAND: 'parkland'
};

class HoleGenerator {
    constructor(mapSize) {
        this.mapSize = mapSize;
        this.green = null;
        this.fairways = [];
        this.roughs = [];
        this.sandPits = [];
        this.waterFeatures = [];
        this.trees = [];
        this.teeBox = { x: 0, y: 0 };
        this.flag = { x: 0, y: 0 };
        this.holeStyle = HoleStyle.PARKLAND;
    }

    random(min, max) {
        return Math.random() * (max - min) + min;
    }

    randomInt(min, max) {
        return Math.floor(this.random(min, max + 1));
    }

    lerp(a, b, t) {
        return a + (b - a) * t;
    }

    smoothstep(t) {
        return t * t * (3 - 2 * t);
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

    generateKidneyShape(cx, cy, size, angle, indent = 0.35) {
        const points = [];
        const segments = 32;
        
        for (let i = 0; i < segments; i++) {
            const t = (i / segments) * Math.PI * 2;
            let r = size * (1 + 0.3 * Math.cos(t * 2));
            const indentAmount = Math.max(0, Math.sin(t - Math.PI * 0.5)) * size * indent;
            r -= indentAmount;
            r += this.random(-size * 0.05, size * 0.05);
            
            const stretch = 0.65 + this.random(-0.05, 0.05);
            const localX = Math.cos(t) * r;
            const localY = Math.sin(t) * r * stretch;
            
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            points.push({
                x: cx + localX * cos - localY * sin,
                y: cy + localX * sin + localY * cos
            });
        }
        
        return points;
    }

    generateOrganicShape(cx, cy, size, angle, complexity = 3) {
        const points = [];
        const segments = 28 + complexity * 4;
        const frequencies = [];
        
        for (let f = 0; f < complexity; f++) {
            frequencies.push({
                freq: 2 + f * 2,
                amp: this.random(0.1, 0.25) / (f + 1),
                phase: this.random(0, Math.PI * 2)
            });
        }
        
        for (let i = 0; i < segments; i++) {
            const t = (i / segments) * Math.PI * 2;
            let r = size;
            
            for (const freq of frequencies) {
                r += Math.sin(t * freq.freq + freq.phase) * size * freq.amp;
            }
            
            const stretch = this.random(0.7, 0.9);
            const localX = Math.cos(t) * r;
            const localY = Math.sin(t) * r * stretch;
            
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            points.push({
                x: cx + localX * cos - localY * sin,
                y: cy + localX * sin + localY * cos
            });
        }
        
        return points;
    }

    generateFairwayPath(start, end, width, waviness = 0.3) {
        const points = [];
        const segments = 24;
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        
        const wavePhase = this.random(0, Math.PI * 2);
        const waveFreq = this.random(2, 4);
        
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const easeT = this.smoothstep(t);
            
            const baseX = this.lerp(start.x, end.x, easeT);
            const baseY = this.lerp(start.y, end.y, easeT);
            
            const waveOffset = Math.sin(t * Math.PI * waveFreq + wavePhase) * width * waviness;
            const widthAtPoint = width * (0.8 + 0.4 * Math.sin(t * Math.PI));
            
            const perpX = -Math.sin(angle);
            const perpY = Math.cos(angle);
            
            points.push({
                x: baseX + perpX * (widthAtPoint / 2 + waveOffset),
                y: baseY + perpY * (widthAtPoint / 2 + waveOffset)
            });
        }
        
        for (let i = segments; i >= 0; i--) {
            const t = i / segments;
            const easeT = this.smoothstep(t);
            
            const baseX = this.lerp(start.x, end.x, easeT);
            const baseY = this.lerp(start.y, end.y, easeT);
            
            const waveOffset = Math.sin(t * Math.PI * waveFreq + wavePhase) * width * waviness;
            const widthAtPoint = width * (0.8 + 0.4 * Math.sin(t * Math.PI));
            
            const perpX = -Math.sin(angle);
            const perpY = Math.cos(angle);
            
            points.push({
                x: baseX - perpX * (widthAtPoint / 2 - waveOffset * 0.5),
                y: baseY - perpY * (widthAtPoint / 2 - waveOffset * 0.5)
            });
        }
        
        return points;
    }

    generateGreen(cx, cy, size) {
        const angle = this.random(0, Math.PI * 2);
        const shapeType = this.randomInt(0, 2);
        let points;
        
        if (shapeType === 0) {
            points = this.generateKidneyShape(cx, cy, size, angle, this.random(0.2, 0.4));
        } else if (shapeType === 1) {
            points = this.generateOrganicShape(cx, cy, size, angle, 2);
        } else {
            points = this.generateBlobPoints(cx, cy, size, 0.2, this.randomInt(10, 14));
        }
        
        return { cx, cy, points, size, type: TerrainType.GREEN };
    }

    generateRough(cx, cy, size) {
        const angle = this.random(0, Math.PI * 2);
        const points = this.generateOrganicShape(cx, cy, size, angle, this.randomInt(2, 4));
        return { cx, cy, points, size, type: TerrainType.ROUGH };
    }

    generateSandPit(cx, cy, size) {
        const angle = this.random(0, Math.PI * 2);
        const shapeType = this.randomInt(0, 2);
        let points;
        
        if (shapeType === 0) {
            points = this.generateKidneyShape(cx, cy, size, angle, this.random(0.15, 0.3));
        } else {
            points = this.generateBlobPoints(cx, cy, size, 0.25, this.randomInt(8, 12));
        }
        
        return { cx, cy, points, size, type: TerrainType.SAND };
    }

    generateWaterFeature(cx, cy, size) {
        const angle = this.random(0, Math.PI * 2);
        const points = this.generateOrganicShape(cx, cy, size, angle, this.randomInt(2, 4));
        return { cx, cy, points, size, type: TerrainType.WATER };
    }

    generateTree(x, y) {
        const size = this.random(8, 18);
        const type = this.randomInt(0, 2);
        return { x, y, size, type };
    }

    distanceBetween(p1, p2) {
        return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
    }

    pointInPolygon(px, py, points) {
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

    generateIslandHole() {
        this.fairways = [];
        this.roughs = [];
        this.sandPits = [];
        this.waterFeatures = [];
        this.trees = [];
        this.holeStyle = HoleStyle.ISLAND;

        const holeDistance = this.random(0.5, 0.8);
        const teeAngle = this.random(0, Math.PI * 2);
        const centerX = this.mapSize / 2;
        const centerY = this.mapSize / 2;
        
        const teeX = centerX + Math.cos(teeAngle) * (this.mapSize * 0.32);
        const teeY = centerY + Math.sin(teeAngle) * (this.mapSize * 0.32);
        
        const flagAngle = teeAngle + Math.PI + this.random(-0.4, 0.4);
        const flagDistance = this.mapSize * holeDistance * 0.45;
        const flagX = centerX + Math.cos(flagAngle) * flagDistance;
        const flagY = centerY + Math.sin(flagAngle) * flagDistance;

        const margin = 90;
        this.teeBox = { 
            x: Math.max(margin, Math.min(this.mapSize - margin, teeX)),
            y: Math.max(margin, Math.min(this.mapSize - margin, teeY))
        };
        this.flag = { 
            x: Math.max(margin, Math.min(this.mapSize - margin, flagX)),
            y: Math.max(margin, Math.min(this.mapSize - margin, flagY))
        };

        const greenSize = this.random(55, 75);
        this.green = this.generateGreen(this.flag.x, this.flag.y, greenSize);

        const roughAroundGreen = this.generateRough(
            this.flag.x, 
            this.flag.y, 
            greenSize * this.random(1.8, 2.2)
        );
        this.roughs.push(roughAroundGreen);

        const teeRough = this.generateRough(
            this.teeBox.x,
            this.teeBox.y,
            this.random(70, 100)
        );
        this.roughs.push(teeRough);

        const fairwayWidth = this.random(45, 70);
        const midX = (this.teeBox.x + this.flag.x) / 2 + this.random(-60, 60);
        const midY = (this.teeBox.y + this.flag.y) / 2 + this.random(-60, 60);

        const fairway1 = {
            cx: (this.teeBox.x + midX) / 2,
            cy: (this.teeBox.y + midY) / 2,
            points: this.generateFairwayPath(this.teeBox, { x: midX, y: midY }, fairwayWidth, 0.25),
            type: TerrainType.FAIRWAY
        };
        this.fairways.push(fairway1);

        const fairway2 = {
            cx: (midX + this.flag.x) / 2,
            cy: (midY + this.flag.y) / 2,
            points: this.generateFairwayPath({ x: midX, y: midY }, this.flag, fairwayWidth * 0.9, 0.2),
            type: TerrainType.FAIRWAY
        };
        this.fairways.push(fairway2);

        const roughWidth = fairwayWidth * 1.6;
        const rough1 = {
            cx: fairway1.cx,
            cy: fairway1.cy,
            points: this.generateFairwayPath(this.teeBox, { x: midX, y: midY }, roughWidth, 0.3),
            type: TerrainType.ROUGH
        };
        this.roughs.unshift(rough1);

        const rough2 = {
            cx: fairway2.cx,
            cy: fairway2.cy,
            points: this.generateFairwayPath({ x: midX, y: midY }, this.flag, roughWidth * 0.95, 0.25),
            type: TerrainType.ROUGH
        };
        this.roughs.unshift(rough2);

        const numBunkers = this.randomInt(2, 4);
        for (let i = 0; i < numBunkers; i++) {
            const t = this.random(0.3, 0.9);
            const pathX = this.lerp(this.teeBox.x, this.flag.x, t);
            const pathY = this.lerp(this.teeBox.y, this.flag.y, t);
            
            const angle = Math.atan2(this.flag.y - this.teeBox.y, this.flag.x - this.teeBox.x) + Math.PI / 2;
            const offset = this.random(25, 55) * (Math.random() < 0.5 ? 1 : -1);
            
            const bunkerX = pathX + Math.cos(angle) * offset;
            const bunkerY = pathY + Math.sin(angle) * offset;
            
            if (this.distanceBetween({ x: bunkerX, y: bunkerY }, this.flag) > 25 &&
                this.distanceBetween({ x: bunkerX, y: bunkerY }, this.teeBox) > 40) {
                const bunkerSize = this.random(18, 32);
                this.sandPits.push(this.generateSandPit(bunkerX, bunkerY, bunkerSize));
            }
        }

        const greenBunkers = this.randomInt(1, 2);
        for (let i = 0; i < greenBunkers; i++) {
            const angle = this.random(0, Math.PI * 2);
            const dist = greenSize + this.random(15, 30);
            const bx = this.flag.x + Math.cos(angle) * dist;
            const by = this.flag.y + Math.sin(angle) * dist;
            this.sandPits.push(this.generateSandPit(bx, by, this.random(15, 25)));
        }
    }

    generateParklandHole() {
        this.fairways = [];
        this.roughs = [];
        this.sandPits = [];
        this.waterFeatures = [];
        this.trees = [];
        this.holeStyle = HoleStyle.PARKLAND;

        const holeDistance = this.random(0.55, 0.85);
        const teeAngle = this.random(0, Math.PI * 2);
        const centerX = this.mapSize / 2;
        const centerY = this.mapSize / 2;
        
        const teeX = centerX + Math.cos(teeAngle) * (this.mapSize * 0.35);
        const teeY = centerY + Math.sin(teeAngle) * (this.mapSize * 0.35);
        
        const flagAngle = teeAngle + Math.PI + this.random(-0.35, 0.35);
        const flagDistance = this.mapSize * holeDistance * 0.42;
        const flagX = centerX + Math.cos(flagAngle) * flagDistance;
        const flagY = centerY + Math.sin(flagAngle) * flagDistance;

        const margin = 80;
        this.teeBox = { 
            x: Math.max(margin, Math.min(this.mapSize - margin, teeX)),
            y: Math.max(margin, Math.min(this.mapSize - margin, teeY))
        };
        this.flag = { 
            x: Math.max(margin, Math.min(this.mapSize - margin, flagX)),
            y: Math.max(margin, Math.min(this.mapSize - margin, flagY))
        };

        const baseRough = {
            cx: centerX,
            cy: centerY,
            points: this.generateOrganicShape(centerX, centerY, this.mapSize * 0.55, 0, 4),
            type: TerrainType.ROUGH,
            isBase: true
        };
        this.roughs.push(baseRough);

        const greenSize = this.random(50, 70);
        this.green = this.generateGreen(this.flag.x, this.flag.y, greenSize);

        const numSegments = this.randomInt(2, 3);
        const waypoints = [this.teeBox];
        
        for (let i = 1; i < numSegments; i++) {
            const t = i / numSegments;
            const baseX = this.lerp(this.teeBox.x, this.flag.x, t);
            const baseY = this.lerp(this.teeBox.y, this.flag.y, t);
            const perpAngle = Math.atan2(this.flag.y - this.teeBox.y, this.flag.x - this.teeBox.x) + Math.PI / 2;
            const offset = this.random(-80, 80);
            waypoints.push({
                x: baseX + Math.cos(perpAngle) * offset,
                y: baseY + Math.sin(perpAngle) * offset
            });
        }
        waypoints.push(this.flag);

        for (let i = 0; i < waypoints.length - 1; i++) {
            const width = this.random(50, 75) * (i === waypoints.length - 2 ? 0.85 : 1);
            const fairway = {
                cx: (waypoints[i].x + waypoints[i + 1].x) / 2,
                cy: (waypoints[i].y + waypoints[i + 1].y) / 2,
                points: this.generateFairwayPath(waypoints[i], waypoints[i + 1], width, 0.2),
                type: TerrainType.FAIRWAY
            };
            this.fairways.push(fairway);
        }

        if (Math.random() < 0.6) {
            const waterPos = this.random(0.35, 0.65);
            const pathX = this.lerp(this.teeBox.x, this.flag.x, waterPos);
            const pathY = this.lerp(this.teeBox.y, this.flag.y, waterPos);
            const perpAngle = Math.atan2(this.flag.y - this.teeBox.y, this.flag.x - this.teeBox.x) + Math.PI / 2;
            const offset = this.random(70, 120) * (Math.random() < 0.5 ? 1 : -1);
            
            const waterX = pathX + Math.cos(perpAngle) * offset;
            const waterY = pathY + Math.sin(perpAngle) * offset;
            const waterSize = this.random(45, 80);
            
            if (waterX > 60 && waterX < this.mapSize - 60 && 
                waterY > 60 && waterY < this.mapSize - 60) {
                this.waterFeatures.push(this.generateWaterFeature(waterX, waterY, waterSize));
            }
        }

        const numBunkers = this.randomInt(3, 6);
        for (let i = 0; i < numBunkers; i++) {
            let placed = false;
            let attempts = 0;
            
            while (!placed && attempts < 20) {
                attempts++;
                const t = this.random(0.2, 0.95);
                const pathX = this.lerp(this.teeBox.x, this.flag.x, t);
                const pathY = this.lerp(this.teeBox.y, this.flag.y, t);
                
                const angle = Math.atan2(this.flag.y - this.teeBox.y, this.flag.x - this.teeBox.x) + Math.PI / 2;
                const offset = this.random(30, 70) * (Math.random() < 0.5 ? 1 : -1);
                
                const bunkerX = pathX + Math.cos(angle) * offset;
                const bunkerY = pathY + Math.sin(angle) * offset;
                
                let valid = true;
                if (this.distanceBetween({ x: bunkerX, y: bunkerY }, this.flag) < 20) valid = false;
                if (this.distanceBetween({ x: bunkerX, y: bunkerY }, this.teeBox) < 35) valid = false;
                
                for (const water of this.waterFeatures) {
                    if (this.distanceBetween({ x: bunkerX, y: bunkerY }, { x: water.cx, y: water.cy }) < water.size + 20) {
                        valid = false;
                        break;
                    }
                }
                
                for (const pit of this.sandPits) {
                    if (this.distanceBetween({ x: bunkerX, y: bunkerY }, { x: pit.cx, y: pit.cy }) < pit.size + 15) {
                        valid = false;
                        break;
                    }
                }
                
                if (valid) {
                    const bunkerSize = this.random(18, 35);
                    this.sandPits.push(this.generateSandPit(bunkerX, bunkerY, bunkerSize));
                    placed = true;
                }
            }
        }

        const numTrees = this.randomInt(15, 30);
        for (let i = 0; i < numTrees; i++) {
            let placed = false;
            let attempts = 0;
            
            while (!placed && attempts < 30) {
                attempts++;
                const x = this.random(30, this.mapSize - 30);
                const y = this.random(30, this.mapSize - 30);
                
                let valid = true;
                
                if (this.distanceBetween({ x, y }, this.flag) < greenSize + 25) valid = false;
                if (this.distanceBetween({ x, y }, this.teeBox) < 50) valid = false;
                
                for (const fairway of this.fairways) {
                    if (this.pointInPolygon(x, y, fairway.points)) {
                        valid = false;
                        break;
                    }
                }
                
                for (const water of this.waterFeatures) {
                    if (this.distanceBetween({ x, y }, { x: water.cx, y: water.cy }) < water.size + 15) {
                        valid = false;
                        break;
                    }
                }
                
                for (const pit of this.sandPits) {
                    if (this.distanceBetween({ x, y }, { x: pit.cx, y: pit.cy }) < pit.size + 10) {
                        valid = false;
                        break;
                    }
                }
                
                for (const tree of this.trees) {
                    if (this.distanceBetween({ x, y }, tree) < 25) {
                        valid = false;
                        break;
                    }
                }
                
                if (valid) {
                    this.trees.push(this.generateTree(x, y));
                    placed = true;
                }
            }
        }
    }

    generateHole() {
        const isIsland = Math.random() < 0.35;
        
        if (isIsland) {
            this.generateIslandHole();
        } else {
            this.generateParklandHole();
        }

        const allPlayableAreas = [
            ...this.roughs.map(r => r.points),
            ...this.fairways.map(f => f.points)
        ];

        return {
            holeStyle: this.holeStyle,
            green: this.green,
            fairways: this.fairways,
            roughs: this.roughs,
            sandPits: this.sandPits,
            waterFeatures: this.waterFeatures,
            trees: this.trees,
            teeBox: this.teeBox,
            flag: this.flag
        };
    }

    /** Generates a 3-hole island course: 2 yellow-flag checkpoints, then 1 red-flag final. */
    generateIslandCourse() {
        const stages = [
            { flagType: 'yellow', label: 'Checkpoint 1' },
            { flagType: 'yellow', label: 'Checkpoint 2' },
            { flagType: 'red', label: 'Final' }
        ];
        const course = [];
        let prevFlag = null;
        for (let i = 0; i < stages.length; i++) {
            this.generateIslandHole();
            const hole = {
                holeStyle: this.holeStyle,
                green: this.green,
                fairways: this.fairways,
                roughs: this.roughs,
                sandPits: this.sandPits,
                waterFeatures: this.waterFeatures,
                trees: this.trees,
                teeBox: { ...this.teeBox },
                flag: { ...this.flag }
            };
            if (prevFlag) {
                hole.teeBox.x = prevFlag.x;
                hole.teeBox.y = prevFlag.y;
            }
            prevFlag = { ...hole.flag };
            course.push({ flagType: stages[i].flagType, label: stages[i].label, hole });
        }
        return course;
    }
}

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

function isInWater(x, y, hole) {
    if (hole.holeStyle === HoleStyle.ISLAND) {
        for (const rough of hole.roughs) {
            if (pointInPolygon(x, y, rough.points)) {
                return false;
            }
        }
        for (const fairway of hole.fairways) {
            if (pointInPolygon(x, y, fairway.points)) {
                return false;
            }
        }
        if (hole.green && pointInPolygon(x, y, hole.green.points)) {
            return false;
        }
        return true;
    } else {
        for (const water of hole.waterFeatures) {
            if (pointInPolygon(x, y, water.points)) {
                return true;
            }
        }
        return false;
    }
}

function isInSand(x, y, sandPits) {
    for (const pit of sandPits) {
        if (pointInPolygon(x, y, pit.points)) {
            return true;
        }
    }
    return false;
}

function isInRough(x, y, hole) {
    if (hole.green && pointInPolygon(x, y, hole.green.points)) {
        return false;
    }
    for (const fairway of hole.fairways) {
        if (pointInPolygon(x, y, fairway.points)) {
            return false;
        }
    }
    for (const rough of hole.roughs) {
        if (pointInPolygon(x, y, rough.points)) {
            return true;
        }
    }
    return false;
}

function isOutOfBounds(x, y, hole, mapSize) {
    if (hole.holeStyle === HoleStyle.ISLAND) {
        return false;
    }
    
    const baseRough = hole.roughs.find(r => r.isBase);
    if (baseRough && !pointInPolygon(x, y, baseRough.points)) {
        return true;
    }
    return false;
}
