// ============================================
// COURSE DRAWING
// ============================================

function drawWater(ctx, mapSize) {
    const gradient = ctx.createLinearGradient(0, 0, mapSize, mapSize);
    gradient.addColorStop(0, '#1e40af');
    gradient.addColorStop(0.5, '#2563eb');
    gradient.addColorStop(1, '#1e40af');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, mapSize, mapSize);

    ctx.strokeStyle = 'rgba(147, 197, 253, 0.3)';
    ctx.lineWidth = 1;
    for (let i = 0; i < mapSize; i += 30) {
        ctx.beginPath();
        ctx.moveTo(0, i + Math.sin(Date.now() / 1000 + i) * 3);
        ctx.bezierCurveTo(
            mapSize / 3, i + Math.sin(Date.now() / 800 + i) * 5,
            mapSize * 2 / 3, i + Math.sin(Date.now() / 900 + i) * 4,
            mapSize, i + Math.sin(Date.now() / 1000 + i) * 3
        );
        ctx.stroke();
    }
}

function drawParklandBase(ctx, mapSize) {
    const gradient = ctx.createRadialGradient(
        mapSize / 2, mapSize / 2, 0,
        mapSize / 2, mapSize / 2, mapSize * 0.7
    );
    gradient.addColorStop(0, '#15803d');
    gradient.addColorStop(0.7, '#166534');
    gradient.addColorStop(1, '#14532d');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, mapSize, mapSize);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
    for (let i = 0; i < mapSize; i += 12) {
        for (let j = 0; j < mapSize; j += 12) {
            if ((i + j) % 24 === 0) {
                ctx.fillRect(i, j, 12, 12);
            }
        }
    }
}

function drawShapeFromPoints(ctx, points) {
    if (points.length < 3) return;
    
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
        const curr = points[i];
        const next = points[(i + 1) % points.length];
        
        const cpX = curr.x;
        const cpY = curr.y;
        const endX = (curr.x + next.x) / 2;
        const endY = (curr.y + next.y) / 2;
        
        ctx.quadraticCurveTo(cpX, cpY, endX, endY);
    }
    
    ctx.closePath();
}

function drawRough(ctx, rough) {
    if (rough.isBase) {
        ctx.fillStyle = '#166534';
        drawShapeFromPoints(ctx, rough.points);
        ctx.fill();
        
        ctx.fillStyle = '#15803d';
        ctx.globalAlpha = 0.4;
        const innerPoints = rough.points.map(p => ({
            x: rough.cx + (p.x - rough.cx) * 0.85,
            y: rough.cy + (p.y - rough.cy) * 0.85
        }));
        drawShapeFromPoints(ctx, innerPoints);
        ctx.fill();
        ctx.globalAlpha = 1;
        return;
    }
    
    ctx.fillStyle = '#16a34a';
    drawShapeFromPoints(ctx, rough.points);
    ctx.fill();
    
    ctx.fillStyle = '#22c55e';
    ctx.globalAlpha = 0.3;
    const innerPoints = rough.points.map(p => ({
        x: rough.cx + (p.x - rough.cx) * 0.7,
        y: rough.cy + (p.y - rough.cy) * 0.7
    }));
    drawShapeFromPoints(ctx, innerPoints);
    ctx.fill();
    ctx.globalAlpha = 1;
    
    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.4;
    for (let i = 0; i < rough.points.length; i += 3) {
        const p = rough.points[i];
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + (Math.random() - 0.5) * 4, p.y - Math.random() * 6);
        ctx.stroke();
    }
    ctx.globalAlpha = 1;
}

function drawFairway(ctx, fairway) {
    ctx.fillStyle = '#4ade80';
    drawShapeFromPoints(ctx, fairway.points);
    ctx.fill();
    
    ctx.fillStyle = '#86efac';
    ctx.globalAlpha = 0.35;
    const innerPoints = fairway.points.map(p => ({
        x: fairway.cx + (p.x - fairway.cx) * 0.6,
        y: fairway.cy + (p.y - fairway.cy) * 0.6
    }));
    drawShapeFromPoints(ctx, innerPoints);
    ctx.fill();
    ctx.globalAlpha = 1;
    
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.2;
    drawShapeFromPoints(ctx, fairway.points);
    ctx.stroke();
    ctx.globalAlpha = 1;
}

function drawGreen(ctx, green) {
    ctx.fillStyle = '#86efac';
    drawShapeFromPoints(ctx, green.points);
    ctx.fill();
    
    ctx.fillStyle = '#bbf7d0';
    ctx.globalAlpha = 0.5;
    const innerPoints = green.points.map(p => ({
        x: green.cx + (p.x - green.cx) * 0.5,
        y: green.cy + (p.y - green.cy) * 0.5
    }));
    drawShapeFromPoints(ctx, innerPoints);
    ctx.fill();
    ctx.globalAlpha = 1;
    
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 2;
    drawShapeFromPoints(ctx, green.points);
    ctx.stroke();
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    const fringePoints = green.points.map(p => ({
        x: green.cx + (p.x - green.cx) * 1.08,
        y: green.cy + (p.y - green.cy) * 1.08
    }));
    drawShapeFromPoints(ctx, fringePoints);
    ctx.stroke();
}

function drawSandPit(ctx, pit) {
    ctx.fillStyle = '#d4a84b';
    drawShapeFromPoints(ctx, pit.points);
    ctx.fill();
    
    ctx.fillStyle = '#e8c87a';
    const midPoints = pit.points.map(p => ({
        x: pit.cx + (p.x - pit.cx) * 0.65,
        y: pit.cy + (p.y - pit.cy) * 0.65
    }));
    drawShapeFromPoints(ctx, midPoints);
    ctx.fill();
    
    ctx.fillStyle = '#f5e6b8';
    ctx.globalAlpha = 0.7;
    const highlightPoints = pit.points.map(p => ({
        x: pit.cx + (p.x - pit.cx) * 0.3 - 2,
        y: pit.cy + (p.y - pit.cy) * 0.3 - 2
    }));
    drawShapeFromPoints(ctx, highlightPoints);
    ctx.fill();
    ctx.globalAlpha = 1;
    
    ctx.strokeStyle = '#b8860b';
    ctx.lineWidth = 1.5;
    drawShapeFromPoints(ctx, pit.points);
    ctx.stroke();
}

function drawWaterFeature(ctx, water) {
    ctx.fillStyle = '#1e40af';
    drawShapeFromPoints(ctx, water.points);
    ctx.fill();
    
    ctx.fillStyle = '#2563eb';
    const midPoints = water.points.map(p => ({
        x: water.cx + (p.x - water.cx) * 0.7,
        y: water.cy + (p.y - water.cy) * 0.7
    }));
    drawShapeFromPoints(ctx, midPoints);
    ctx.fill();
    
    ctx.fillStyle = '#3b82f6';
    ctx.globalAlpha = 0.5;
    const highlightPoints = water.points.map(p => ({
        x: water.cx + (p.x - water.cx) * 0.35 - 3,
        y: water.cy + (p.y - water.cy) * 0.35 - 3
    }));
    drawShapeFromPoints(ctx, highlightPoints);
    ctx.fill();
    ctx.globalAlpha = 1;
    
    ctx.strokeStyle = '#1e3a8a';
    ctx.lineWidth = 2;
    drawShapeFromPoints(ctx, water.points);
    ctx.stroke();
    
    ctx.strokeStyle = 'rgba(147, 197, 253, 0.4)';
    ctx.lineWidth = 1;
    const time = Date.now() / 1000;
    for (let i = 0; i < 3; i++) {
        const scale = 0.3 + i * 0.25 + Math.sin(time + i) * 0.05;
        const wavePoints = water.points.map(p => ({
            x: water.cx + (p.x - water.cx) * scale,
            y: water.cy + (p.y - water.cy) * scale
        }));
        drawShapeFromPoints(ctx, wavePoints);
        ctx.stroke();
    }
}

function drawTree(ctx, tree) {
    const { x, y, size, type } = tree;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(x + 3, y + 3, size * 0.8, size * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    
    if (type === 0) {
        ctx.fillStyle = '#14532d';
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#166534';
        ctx.beginPath();
        ctx.arc(x - size * 0.2, y - size * 0.2, size * 0.7, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#22c55e';
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(x - size * 0.35, y - size * 0.35, size * 0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    } else if (type === 1) {
        ctx.fillStyle = '#14532d';
        ctx.beginPath();
        ctx.moveTo(x, y - size * 1.2);
        ctx.lineTo(x + size * 0.9, y + size * 0.5);
        ctx.lineTo(x - size * 0.9, y + size * 0.5);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = '#166534';
        ctx.beginPath();
        ctx.moveTo(x, y - size * 0.8);
        ctx.lineTo(x + size * 0.6, y + size * 0.3);
        ctx.lineTo(x - size * 0.6, y + size * 0.3);
        ctx.closePath();
        ctx.fill();
    } else {
        ctx.fillStyle = '#14532d';
        ctx.beginPath();
        ctx.arc(x - size * 0.3, y, size * 0.7, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + size * 0.3, y - size * 0.2, size * 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, y - size * 0.5, size * 0.65, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#166534';
        ctx.beginPath();
        ctx.arc(x, y - size * 0.3, size * 0.5, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.strokeStyle = '#0f3d1f';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
}

function drawTeeBox(ctx, teeBox) {
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(teeBox.x - 15, teeBox.y - 8, 30, 16);
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 2;
    ctx.strokeRect(teeBox.x - 15, teeBox.y - 8, 30, 16);
    
    ctx.fillStyle = '#f5f5f5';
    ctx.beginPath();
    ctx.arc(teeBox.x - 6, teeBox.y, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(teeBox.x + 6, teeBox.y, 2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#92400e';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('TEE', teeBox.x, teeBox.y);
}

function drawFlag(ctx, flag, holeRadius, celebration, flagType = 'red') {
    ctx.fillStyle = '#1f2937';
    ctx.beginPath();
    ctx.arc(flag.x, flag.y, holeRadius + 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.arc(flag.x, flag.y, holeRadius - 2, 0, Math.PI * 2);
    ctx.fill();

    const poleHeight = 55;
    const poleColor = celebration.isActive ? '#fbbf24' : '#f5f5f5';
    ctx.strokeStyle = poleColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(flag.x, flag.y);
    ctx.lineTo(flag.x, flag.y - poleHeight);
    ctx.stroke();
    
    ctx.strokeStyle = '#d4d4d4';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(flag.x + 1, flag.y);
    ctx.lineTo(flag.x + 1, flag.y - poleHeight);
    ctx.stroke();

    const defaultFlagColor = flagType === 'yellow' ? '#eab308' : '#dc2626';
    const flagColor = celebration.isActive ? celebration.currentFlagColor : defaultFlagColor;
    const flagWidth = 32;
    const flagHeight = 22;
    
    ctx.fillStyle = flagColor;
    ctx.beginPath();
    ctx.moveTo(flag.x, flag.y - poleHeight);
    ctx.lineTo(flag.x + flagWidth, flag.y - poleHeight + flagHeight / 2);
    ctx.lineTo(flag.x, flag.y - poleHeight + flagHeight);
    ctx.closePath();
    ctx.fill();
    
    ctx.strokeStyle = '#991b1b';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.moveTo(flag.x, flag.y - poleHeight);
    ctx.lineTo(flag.x + flagWidth * 0.6, flag.y - poleHeight + flagHeight * 0.3);
    ctx.lineTo(flag.x + flagWidth * 0.3, flag.y - poleHeight + flagHeight * 0.5);
    ctx.lineTo(flag.x, flag.y - poleHeight + flagHeight * 0.4);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(flag.x, flag.y - poleHeight, 4, 0, Math.PI * 2);
    ctx.fill();
}

function drawAimingLine(ctx, gameState) {
    if (gameState.gameWon || gameState.isAnimating) return;

    const shot = calculateShot(gameState.strokeCards);
    if (!shot.isValid) return;

    const baseAngle = Math.atan2(gameState.flag.y - gameState.ball.y, gameState.flag.x - gameState.ball.x);
    const finalAngle = baseAngle + gameState.aimAngle;
    
    const dirX = Math.cos(finalAngle);
    const dirY = Math.sin(finalAngle);
    
    const perpX = -dirY;
    const perpY = dirX;
    
    let lateralOffset = 0;
    const SHAPE_OFFSET = 40;
    if (shot.shape === ShapeDirection.CUT) {
        lateralOffset = SHAPE_OFFSET;
    } else if (shot.shape === ShapeDirection.FADE) {
        lateralOffset = -SHAPE_OFFSET;
    }

    let travelDist = shot.finalDistance * gameState.mapSize;
    if (shot.hasLongRun) travelDist *= (1 + LONG_RUN_BONUS);

    const endX = gameState.ball.x + dirX * travelDist + perpX * lateralOffset;
    const endY = gameState.ball.y + dirY * travelDist + perpY * lateralOffset;

    if (shot.shape !== ShapeDirection.NONE) {
        ctx.setLineDash([8, 4]);
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.9)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(gameState.ball.x, gameState.ball.y);
        const cpX = gameState.ball.x + dirX * travelDist * 0.5 + perpX * lateralOffset * 0.3;
        const cpY = gameState.ball.y + dirY * travelDist * 0.5 + perpY * lateralOffset * 0.3;
        ctx.quadraticCurveTo(cpX, cpY, endX, endY);
        ctx.stroke();
        ctx.setLineDash([]);
    } else {
        ctx.setLineDash([8, 4]);
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.9)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(gameState.ball.x, gameState.ball.y);
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
    ctx.moveTo(gameState.ball.x, gameState.ball.y);
    ctx.lineTo(gameState.flag.x, gameState.flag.y);
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawBall(ctx, ball, ballRadius, scale = 1.0) {
    const scaledRadius = ballRadius * scale;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(ball.x + 2, ball.y + 2, scaledRadius * 0.9, scaledRadius * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#f5f5f5';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, scaledRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.arc(ball.x - 2 * scale, ball.y - 2 * scale, 3 * scale, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#d4d4d4';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, scaledRadius, 0, Math.PI * 2);
    ctx.stroke();
}

function drawCourse(ctx, hole, mapSize) {
    if (hole.holeStyle === HoleStyle.ISLAND) {
        drawWater(ctx, mapSize);
        
        for (const rough of hole.roughs) {
            drawRough(ctx, rough);
        }
        for (const fairway of hole.fairways) {
            drawFairway(ctx, fairway);
        }
    } else {
        drawParklandBase(ctx, mapSize);
        
        const baseRough = hole.roughs.find(r => r.isBase);
        if (baseRough) {
            drawRough(ctx, baseRough);
        }
        
        for (const rough of hole.roughs) {
            if (!rough.isBase) {
                drawRough(ctx, rough);
            }
        }
        
        for (const fairway of hole.fairways) {
            drawFairway(ctx, fairway);
        }
        
        for (const water of hole.waterFeatures) {
            drawWaterFeature(ctx, water);
        }
    }
    
    for (const pit of hole.sandPits) {
        drawSandPit(ctx, pit);
    }
    
    if (hole.green) {
        drawGreen(ctx, hole.green);
    }
    
    for (const tree of hole.trees) {
        drawTree(ctx, tree);
    }
}
