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

function drawGrassPatch(ctx, patch) {
    ctx.fillStyle = '#064e3b';
    drawShapeFromPoints(ctx, patch.points);
    ctx.fill();
    
    ctx.fillStyle = '#065f46';
    ctx.globalAlpha = 0.6;
    const innerPoints = patch.points.map(p => ({
        x: patch.cx + (p.x - patch.cx) * 0.7,
        y: patch.cy + (p.y - patch.cy) * 0.7
    }));
    drawShapeFromPoints(ctx, innerPoints);
    ctx.fill();
    ctx.globalAlpha = 1;
    
    ctx.strokeStyle = '#052e16';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    drawShapeFromPoints(ctx, patch.points);
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawSandPit(ctx, pit) {
    ctx.fillStyle = '#c2a44e';
    drawShapeFromPoints(ctx, pit.points);
    ctx.fill();
    
    ctx.fillStyle = '#d4b85a';
    const innerPoints = pit.points.map(p => ({
        x: pit.cx + (p.x - pit.cx) * 0.6,
        y: pit.cy + (p.y - pit.cy) * 0.6
    }));
    drawShapeFromPoints(ctx, innerPoints);
    ctx.fill();
    
    ctx.fillStyle = '#e8d282';
    ctx.globalAlpha = 0.6;
    const highlightPoints = pit.points.map(p => ({
        x: pit.cx + (p.x - pit.cx) * 0.3 - 3,
        y: pit.cy + (p.y - pit.cy) * 0.3 - 3
    }));
    drawShapeFromPoints(ctx, highlightPoints);
    ctx.fill();
    ctx.globalAlpha = 1;
}

function drawIsland(ctx, island) {
    ctx.fillStyle = '#166534';
    drawShapeFromPoints(ctx, island.points);
    ctx.fill();

    ctx.fillStyle = '#22c55e';
    const innerPoints = island.points.map(p => ({
        x: island.cx + (p.x - island.cx) * 0.85,
        y: island.cy + (p.y - island.cy) * 0.85
    }));
    drawShapeFromPoints(ctx, innerPoints);
    ctx.fill();

    ctx.fillStyle = '#4ade80';
    ctx.globalAlpha = 0.7;
    const highlightPoints = island.points.map(p => ({
        x: island.cx + (p.x - island.cx) * 0.5 - 5,
        y: island.cy + (p.y - island.cy) * 0.5 - 5
    }));
    drawShapeFromPoints(ctx, highlightPoints);
    ctx.fill();
    ctx.globalAlpha = 1;
}

function drawTeeBox(ctx, teeBox) {
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

function drawFlag(ctx, flag, holeRadius, celebration) {
    ctx.fillStyle = '#1f2937';
    ctx.beginPath();
    ctx.arc(flag.x, flag.y, holeRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.arc(flag.x, flag.y, holeRadius - 3, 0, Math.PI * 2);
    ctx.fill();

    const poleColor = celebration.isActive ? '#fbbf24' : '#f5f5f5';
    ctx.strokeStyle = poleColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(flag.x, flag.y);
    ctx.lineTo(flag.x, flag.y - 35);
    ctx.stroke();

    const flagColor = celebration.isActive ? celebration.currentFlagColor : '#ef4444';
    ctx.fillStyle = flagColor;
    ctx.beginPath();
    ctx.moveTo(flag.x, flag.y - 35);
    ctx.lineTo(flag.x + 20, flag.y - 28);
    ctx.lineTo(flag.x, flag.y - 21);
    ctx.closePath();
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
