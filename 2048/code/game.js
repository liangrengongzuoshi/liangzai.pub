// 2048 游戏逻辑
class Game2048 {
    constructor() {
        this.gridSize = 4;
        this.grid = [];
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('bestScore')) || 0;
        this.gameWon = false;
        this.currentDirection = null;
        this.animating = false;
        this.frozenTiles = {}; // 存储冰冻方块的信息 {x_y: remainingMoves}
        this.petrifiedTiles = {}; // 存储石化方块的信息 {x_y: remainingMoves}
        this.powerUpActivating = false; // 道具正在激活中
        this.powerUpEffectDuration = 1500; // 道具效果默认时长
        this.powerUpSpeedUp = false; // 是否加速道具效果
        this.pendingDirection = null; // 道具激活期间记录的待处理方向
        
        this.initGame();
        this.setupEventListeners();
        this.initPowerUpDropdown();
        this.initGridSizeDropdown();
        this.updateDisplay();
    }
    
    // 初始化游戏
    initGame() {
        // 初始化空网格
        this.grid = [];
        for (let i = 0; i < this.gridSize; i++) {
            this.grid[i] = [];
            for (let j = 0; j < this.gridSize; j++) {
                this.grid[i][j] = 0;
            }
        }
        
        // 重新生成背景格子
        this.generateGridCells();
        
        // 添加两个初始方块
        this.addRandomTile();
        this.addRandomTile();
        
        // 重置游戏状态
        this.score = 0;
        this.gameWon = false;
        this.frozenTiles = {};
        this.petrifiedTiles = {};
        this.powerUpActivating = false;
        this.powerUpSpeedUp = false;
        this.pendingDirection = null;
        
        this.updateDisplay();
        this.hideGameMessage();
        this.updateFreezeIndicator();
        this.updatePetrifyIndicator();
    }
    
    // 设置事件监听器
    setupEventListeners() {
        // 键盘事件
        document.addEventListener('keydown', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
                this.handleKeyPress(e.key);
            }
        });
        
        // 重试按钮
        document.querySelector('.retry-button').addEventListener('click', () => {
            this.initGame();
        });
        
        // 继续游戏按钮
        document.querySelector('.continue-button').addEventListener('click', () => {
            this.hideGameMessage();
        });
    }
    
    // 处理键盘按键
    handleKeyPress(key) {
        // 如果道具正在激活，记录方向并触发加速
        if (this.powerUpActivating) {
            this.powerUpSpeedUp = true;
            
            // 记录最后按下的方向键
            let direction = '';
            switch(key) {
                case 'ArrowUp':
                    direction = 'up';
                    break;
                case 'ArrowDown':
                    direction = 'down';
                    break;
                case 'ArrowLeft':
                    direction = 'left';
                    break;
                case 'ArrowRight':
                    direction = 'right';
                    break;
            }
            if (direction) {
                this.pendingDirection = direction;
            }
            return;
        }
        
        if (this.isGameOver() || this.animating) {
            return;
        }
        
        let direction = '';
        switch(key) {
            case 'ArrowUp':
                direction = 'up';
                break;
            case 'ArrowDown':
                direction = 'down';
                break;
            case 'ArrowLeft':
                direction = 'left';
                break;
            case 'ArrowRight':
                direction = 'right';
                break;
            default:
                return;
        }
        
        this.executeMove(direction);
    }
    
    // 执行移动操作（独立出来供多处调用）
    executeMove(direction) {
        this.currentDirection = direction;
        const oldGrid = JSON.stringify(this.grid);
        const moved = this.move(direction);
        
        // 如果移动成功，添加新方块
        if (moved && oldGrid !== JSON.stringify(this.grid)) {
            this.animating = true;
            
            // 减少冰冻计数和石化计数
            this.decreaseFrozenCount();
            this.decreasePetrifiedCount();
            
            setTimeout(() => {
                const newCell = this.addRandomTile();
                this.currentDirection = null;
                this.updateDisplay([], [], newCell);
                this.animating = false;
                
                // 检查游戏状态
                if (this.hasWon() && !this.gameWon) {
                    this.gameWon = true;
                    this.showGameMessage('你赢了！');
                } else if (this.isGameOver()) {
                    this.showGameMessage('游戏结束');
                }
            }, 250);
        }
    }
    
    // 移动方块
    move(direction) {
        let moved = false;
        const vectors = {
            'up': { x: -1, y: 0 },
            'down': { x: 1, y: 0 },
            'left': { x: 0, y: -1 },
            'right': { x: 0, y: 1 }
        };
        
        const vector = vectors[direction];
        const traversals = this.buildTraversals(vector);
        const mergedCells = [];
        const movedCells = [];
        const powerUpsToActivate = [];
        
        // 移动和合并方块
        traversals.x.forEach(x => {
            traversals.y.forEach(y => {
                const cell = { x: x, y: y };
                const tile = this.grid[x][y];
                
                if (!this.isEmpty(tile)) {
                    // 石化的方块不能移动
                    if (this.isPetrified(x, y)) {
                        return;
                    }
                    
                    const positions = this.findFarthestPosition(cell, vector);
                    const next = positions.next;
                    const farthest = positions.farthest;
                    
                    // 如果是道具
                    if (this.isPowerUp(tile)) {
                        // 道具只能移动，不能合并
                        if (x !== farthest.x || y !== farthest.y) {
                            this.grid[farthest.x][farthest.y] = tile;
                            this.grid[x][y] = 0;
                            movedCells.push(farthest);
                            
                            // 记录需要激活的道具
                            powerUpsToActivate.push({
                                position: farthest,
                                powerUp: tile,
                                direction: direction
                            });
                            
                            moved = true;
                        }
                    } else {
                        // 普通数字方块
                        // 检查是否可以合并（冰冻和石化的方块不能合并）
                        if (this.withinBounds(next) &&
                            !this.isEmpty(this.grid[next.x][next.y]) &&
                            !this.isPowerUp(this.grid[next.x][next.y]) &&
                            this.grid[next.x][next.y] === tile &&
                            !this.cellMerged(mergedCells, next) &&
                            !this.isFrozen(x, y) &&
                            !this.isFrozen(next.x, next.y) &&
                            !this.isPetrified(x, y) &&
                            !this.isPetrified(next.x, next.y)) {
                            
                            // 合并方块
                            this.grid[next.x][next.y] = tile * 2;
                            this.grid[x][y] = 0;
                            
                            // 更新冰冻和石化状态键
                            const oldKey = `${x}_${y}`;
                            const newKey = `${next.x}_${next.y}`;
                            delete this.frozenTiles[oldKey];
                            delete this.frozenTiles[newKey];
                            delete this.petrifiedTiles[oldKey];
                            delete this.petrifiedTiles[newKey];
                            
                            this.score += tile * 2;
                            mergedCells.push(next);
                            moved = true;
                            
                        } else {
                            // 移动方块
                            if (x !== farthest.x || y !== farthest.y) {
                                this.grid[farthest.x][farthest.y] = tile;
                                this.grid[x][y] = 0;
                                
                                // 更新冰冻和石化状态键（石化方块移动时保持石化）
                                const oldKey = `${x}_${y}`;
                                const newKey = `${farthest.x}_${farthest.y}`;
                                if (this.frozenTiles[oldKey]) {
                                    this.frozenTiles[newKey] = this.frozenTiles[oldKey];
                                    delete this.frozenTiles[oldKey];
                                }
                                if (this.petrifiedTiles[oldKey]) {
                                    this.petrifiedTiles[newKey] = this.petrifiedTiles[oldKey];
                                    delete this.petrifiedTiles[oldKey];
                                }
                                
                                movedCells.push(farthest);
                                moved = true;
                            }
                        }
                    }
                }
            });
        });
        
        if (moved) {
            this.updateDisplay(mergedCells, movedCells);
            
            // 激活道具效果（先停顿再激活）
            if (powerUpsToActivate.length > 0) {
                setTimeout(() => {
                    this.pauseAndActivatePowerUps(powerUpsToActivate);
                }, 300);
            }
            
            // 更新最高分
            if (this.score > this.bestScore) {
                this.bestScore = this.score;
                localStorage.setItem('bestScore', this.bestScore);
            }
        }
        
        return moved;
    }
    
    // 构建遍历顺序
    buildTraversals(vector) {
        const traversals = { x: [], y: [] };
        
        for (let pos = 0; pos < this.gridSize; pos++) {
            traversals.x.push(pos);
            traversals.y.push(pos);
        }
        
        // 根据方向调整遍历顺序
        if (vector.x === 1) traversals.x = traversals.x.reverse();
        if (vector.y === 1) traversals.y = traversals.y.reverse();
        
        return traversals;
    }
    
    // 找到最远可移动位置
    findFarthestPosition(cell, vector) {
        let previous;
        
        do {
            previous = cell;
            cell = { x: previous.x + vector.x, y: previous.y + vector.y };
        } while (this.withinBounds(cell) && this.isEmpty(this.grid[cell.x][cell.y]));
        
        return {
            farthest: previous,
            next: cell
        };
    }
    
    // 检查位置是否在网格内
    withinBounds(cell) {
        return cell.x >= 0 && cell.x < this.gridSize &&
               cell.y >= 0 && cell.y < this.gridSize;
    }
    
    // 检查单元格是否已合并
    cellMerged(mergedCells, cell) {
        return mergedCells.some(c => c.x === cell.x && c.y === cell.y);
    }
    
    // 道具停顿后激活
    pauseAndActivatePowerUps(powerUpsToActivate) {
        // 标记道具正在激活
        this.powerUpActivating = true;
        this.powerUpSpeedUp = false;
        
        // 先显示停顿效果
        powerUpsToActivate.forEach(({ position }) => {
            const { x, y } = position;
            const tiles = document.querySelectorAll('.tile-powerup');
            const gap = 10;
            tiles.forEach(tile => {
                const left = parseInt(tile.style.left);
                const top = parseInt(tile.style.top);
                const cellSize = parseFloat(tile.style.width);
                
                const tileX = Math.round(top / (cellSize + gap));
                const tileY = Math.round(left / (cellSize + gap));
                
                if (tileX === x && tileY === y) {
                    tile.classList.add('pausing');
                }
            });
        });
        
        // 停顿后激活（可加速）
        const pauseDelay = 400; // 从800ms缩短到400ms
        setTimeout(() => {
            this.activatePowerUps(powerUpsToActivate);
        }, pauseDelay);
    }
    
    // 激活道具效果
    activatePowerUps(powerUpsToActivate) {
        powerUpsToActivate.forEach(({ position, powerUp, direction }) => {
            const { x, y } = position;
            const powerUpType = powerUp.powerUpType;
            
            // 道具消失动画
            this.animatePowerUpDisappear(x, y);
            
            // 延迟后执行效果和爆炸
            setTimeout(() => {
                // 创建爆炸效果
                this.createExplosion(x, y, powerUp.config.color);
                
                // 根据道具类型执行不同效果
                switch(powerUpType) {
                    case 'vertical_pepper':
                        this.activateVerticalPepperWithAnimation(x, y);
                        break;
                    case 'horizontal_pepper':
                        this.activateHorizontalPepperWithAnimation(x, y);
                        break;
                    case 'bomb':
                        this.activateBombWithAnimation(x, y);
                        break;
                    case 'double':
                        this.activateDoubleWithAnimation(x, y, direction);
                        break;
                    case 'half':
                        this.activateHalfWithAnimation(x, y, direction);
                        break;
                    case 'freeze':
                        this.activateFreezeWithAnimation(x, y, direction);
                        break;
                    case 'vanish':
                        this.activateVanishWithAnimation(x, y, direction);
                        break;
                    case 'random':
                        this.activateRandomWithAnimation(x, y, direction);
                        break;
                    case 'petrify':
                        this.activatePetrifyWithAnimation(x, y, direction);
                        break;
                }
            }, 200);
        });
        
        // 等待所有动画完成后更新显示
        // 使用定时检查来支持加速
        const checkInterval = 50; // 每50ms检查一次
        let elapsed = 0;
        const normalDuration = this.powerUpEffectDuration; // 1500ms
        const speedUpDuration = 500; // 加速后500ms
        
        const checkTimer = setInterval(() => {
            elapsed += checkInterval;
            
            // 如果按键加速或时间到了，结束效果
            const targetDuration = this.powerUpSpeedUp ? speedUpDuration : normalDuration;
            
            if (elapsed >= targetDuration) {
                clearInterval(checkTimer);
                
                this.updateDisplay();
                
                // 检查画布是否全空
                this.checkAndHandleEmptyBoard();
                
                // 解除道具激活锁定
                this.powerUpActivating = false;
                this.powerUpSpeedUp = false;
                
                // 如果有待处理的方向，立即执行移动
                if (this.pendingDirection) {
                    const directionToExecute = this.pendingDirection;
                    this.pendingDirection = null;
                    
                    // 使用短延迟确保界面更新完成后再执行移动
                    setTimeout(() => {
                        this.executeMove(directionToExecute);
                    }, 50);
                }
            }
        }, checkInterval);
    }
    
    // 道具消失动画
    animatePowerUpDisappear(x, y) {
        const tiles = document.querySelectorAll('.tile-powerup');
        const gap = 10;
        tiles.forEach(tile => {
            const left = parseInt(tile.style.left);
            const top = parseInt(tile.style.top);
            const cellSize = parseFloat(tile.style.width);
            
            const tileX = Math.round(top / (cellSize + gap));
            const tileY = Math.round(left / (cellSize + gap));
            
            if (tileX === x && tileY === y) {
                tile.classList.remove('pausing');
                tile.classList.add('activating');
            }
        });
    }
    
    // 竖向辣椒效果：炸掉一列（带动画）
    activateVerticalPepperWithAnimation(x, y) {
        // 清除道具本身
        this.grid[x][y] = 0;
        
        // 收集要炸掉的方块（冰冻和石化的方块不能被炸）
        const tilesToExplode = [];
        for (let i = 0; i < this.gridSize; i++) {
            if (i !== x && !this.isEmpty(this.grid[i][y]) && !this.isPowerUp(this.grid[i][y]) && !this.isFrozen(i, y) && !this.isPetrified(i, y)) {
                tilesToExplode.push({ x: i, y: y, value: this.grid[i][y] });
            }
        }
        
        // 逐个爆炸
        tilesToExplode.forEach((tile, index) => {
            setTimeout(() => {
                this.explodeTile(tile.x, tile.y, '#ff4757');
                this.score += Math.floor(tile.value / 2);
                this.grid[tile.x][tile.y] = 0;
                
                // 清除该位置的冰冻状态
                const key = `${tile.x}_${tile.y}`;
                delete this.frozenTiles[key];
                
                // 更新分数显示
                document.getElementById('score').textContent = this.score;
                if (this.score > this.bestScore) {
                    this.bestScore = this.score;
                    localStorage.setItem('bestScore', this.bestScore);
                    document.getElementById('best-score').textContent = this.bestScore;
                }
            }, index * 150);
        });
    }
    
    // 横向辣椒效果：炸掉一行（带动画）
    activateHorizontalPepperWithAnimation(x, y) {
        // 清除道具本身
        this.grid[x][y] = 0;
        
        // 收集要炸掉的方块（冰冻和石化的方块不能被炸）
        const tilesToExplode = [];
        for (let j = 0; j < this.gridSize; j++) {
            if (j !== y && !this.isEmpty(this.grid[x][j]) && !this.isPowerUp(this.grid[x][j]) && !this.isFrozen(x, j) && !this.isPetrified(x, j)) {
                tilesToExplode.push({ x: x, y: j, value: this.grid[x][j] });
            }
        }
        
        // 逐个爆炸
        tilesToExplode.forEach((tile, index) => {
            setTimeout(() => {
                this.explodeTile(tile.x, tile.y, '#ff6348');
                this.score += Math.floor(tile.value / 2);
                this.grid[tile.x][tile.y] = 0;
                
                // 清除该位置的冰冻状态
                const key = `${tile.x}_${tile.y}`;
                delete this.frozenTiles[key];
                
                // 更新分数显示
                document.getElementById('score').textContent = this.score;
                if (this.score > this.bestScore) {
                    this.bestScore = this.score;
                    localStorage.setItem('bestScore', this.bestScore);
                    document.getElementById('best-score').textContent = this.bestScore;
                }
            }, index * 150);
        });
    }
    
    // 炸弹效果：炸掉相邻的方块（带动画）
    activateBombWithAnimation(x, y) {
        // 清除道具本身
        this.grid[x][y] = 0;
        
        // 炸掉相邻8个方向的方块
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];
        
        const tilesToExplode = [];
        directions.forEach(([dx, dy]) => {
            const nx = x + dx;
            const ny = y + dy;
            
            if (this.withinBounds({x: nx, y: ny}) && 
                !this.isEmpty(this.grid[nx][ny]) && 
                !this.isPowerUp(this.grid[nx][ny]) &&
                !this.isFrozen(nx, ny) &&
                !this.isPetrified(nx, ny)) {
                tilesToExplode.push({ x: nx, y: ny, value: this.grid[nx][ny] });
            }
        });
        
        // 逐个爆炸（从中心向外）
        tilesToExplode.forEach((tile, index) => {
            setTimeout(() => {
                this.explodeTile(tile.x, tile.y, '#2f3542');
                this.score += Math.floor(tile.value / 2);
                this.grid[tile.x][tile.y] = 0;
                
                // 清除该位置的冰冻状态
                const key = `${tile.x}_${tile.y}`;
                delete this.frozenTiles[key];
                
                // 更新分数显示
                document.getElementById('score').textContent = this.score;
                if (this.score > this.bestScore) {
                    this.bestScore = this.score;
                    localStorage.setItem('bestScore', this.bestScore);
                    document.getElementById('best-score').textContent = this.bestScore;
                }
            }, index * 100);
        });
    }
    
    // 单个方块爆炸效果
    explodeTile(x, y, color) {
        const tiles = document.querySelectorAll('.tile');
        const gap = 10;
        const cellSize = tiles[0] ? parseFloat(tiles[0].style.width) : 100;
        
        tiles.forEach(tile => {
            const left = parseInt(tile.style.left);
            const top = parseInt(tile.style.top);
            
            const tileX = Math.round(top / (cellSize + gap));
            const tileY = Math.round(left / (cellSize + gap));
            
            if (tileX === x && tileY === y) {
                tile.classList.add('exploding');
                
                // 创建小型爆炸效果
                this.createMiniExplosion(x, y, color);
            }
        });
    }
    
    // 复制卡效果：移动方向上碰到的数字翻倍（带动画）
    activateDoubleWithAnimation(x, y, direction) {
        // 清除道具本身
        this.grid[x][y] = 0;
        
        const vectors = {
            'up': { x: -1, y: 0 },
            'down': { x: 1, y: 0 },
            'left': { x: 0, y: -1 },
            'right': { x: 0, y: 1 }
        };
        
        const vector = vectors[direction];
        let current = { x: x + vector.x, y: y + vector.y };
        
        // 找到方向上第一个数字方块并翻倍（冰冻和石化的方块不能被改变）
        while (this.withinBounds(current)) {
            if (!this.isEmpty(this.grid[current.x][current.y])) {
                if (!this.isPowerUp(this.grid[current.x][current.y]) && !this.isFrozen(current.x, current.y) && !this.isPetrified(current.x, current.y)) {
                    const oldValue = this.grid[current.x][current.y];
                    
                    // 先显示动画
                    setTimeout(() => {
                        this.animateTileEffect(current.x, current.y, 'doubling');
                        
                        // 然后修改数值
                        setTimeout(() => {
                            this.grid[current.x][current.y] = oldValue * 2;
                            this.score += oldValue;
                            
                            // 更新显示
                            this.updateDisplay();
                            
                            // 更新分数
                            document.getElementById('score').textContent = this.score;
                            if (this.score > this.bestScore) {
                                this.bestScore = this.score;
                                localStorage.setItem('bestScore', this.bestScore);
                                document.getElementById('best-score').textContent = this.bestScore;
                            }
                        }, 400);
                    }, 100);
                }
                break;
            }
            current = { x: current.x + vector.x, y: current.y + vector.y };
        }
    }
    
    // 减半卡效果：移动方向上碰到的数字减半（带动画）
    activateHalfWithAnimation(x, y, direction) {
        // 清除道具本身
        this.grid[x][y] = 0;
        
        const vectors = {
            'up': { x: -1, y: 0 },
            'down': { x: 1, y: 0 },
            'left': { x: 0, y: -1 },
            'right': { x: 0, y: 1 }
        };
        
        const vector = vectors[direction];
        let current = { x: x + vector.x, y: y + vector.y };
        
        // 找到方向上第一个数字方块并减半（冰冻和石化的方块不能被改变）
        while (this.withinBounds(current)) {
            if (!this.isEmpty(this.grid[current.x][current.y])) {
                if (!this.isPowerUp(this.grid[current.x][current.y]) && !this.isFrozen(current.x, current.y) && !this.isPetrified(current.x, current.y)) {
                    const oldValue = this.grid[current.x][current.y];
                    
                    // 先显示动画
                    setTimeout(() => {
                        this.animateTileEffect(current.x, current.y, 'halving');
                        
                        // 然后修改数值
                        setTimeout(() => {
                            this.grid[current.x][current.y] = Math.floor(oldValue / 2);
                            
                            // 如果减半后变成0或小于2，清除方块
                            if (this.grid[current.x][current.y] === 0 || this.grid[current.x][current.y] < 2) {
                                this.grid[current.x][current.y] = 0;
                            }
                            
                            // 更新显示
                            this.updateDisplay();
                        }, 400);
                    }, 100);
                }
                break;
            }
            current = { x: current.x + vector.x, y: current.y + vector.y };
        }
    }
    
    // 给方块添加动画效果
    animateTileEffect(x, y, effectClass) {
        const tiles = document.querySelectorAll('.tile');
        const gap = 10;
        const cellSize = tiles[0] ? parseFloat(tiles[0].style.width) : 100;
        
        tiles.forEach(tile => {
            const left = parseInt(tile.style.left);
            const top = parseInt(tile.style.top);
            
            const tileX = Math.round(top / (cellSize + gap));
            const tileY = Math.round(left / (cellSize + gap));
            
            if (tileX === x && tileY === y) {
                tile.classList.add(effectClass);
                
                // 动画结束后移除class
                setTimeout(() => {
                    tile.classList.remove(effectClass);
                }, 800);
            }
        });
    }
    
    // 冰冻卡效果：冰冻碰到的数字2次移动（带动画）
    activateFreezeWithAnimation(x, y, direction) {
        // 清除道具本身
        this.grid[x][y] = 0;
        
        const vectors = {
            'up': { x: -1, y: 0 },
            'down': { x: 1, y: 0 },
            'left': { x: 0, y: -1 },
            'right': { x: 0, y: 1 }
        };
        
        const vector = vectors[direction];
        let current = { x: x + vector.x, y: y + vector.y };
        
        // 找到方向上第一个数字方块并冰冻（石化的方块不能被作用）
        while (this.withinBounds(current)) {
            if (!this.isEmpty(this.grid[current.x][current.y])) {
                if (!this.isPowerUp(this.grid[current.x][current.y]) && !this.isPetrified(current.x, current.y)) {
                    // 先显示冰冻动画
                    setTimeout(() => {
                        this.animateTileEffect(current.x, current.y, 'freezing');
                        
                        // 然后设置冰冻状态
                        setTimeout(() => {
                            this.freezeTile(current.x, current.y, 5);
                            
                            // 更新显示以显示冰冻样式
                            this.updateDisplay();
                        }, 400);
                    }, 100);
                }
                break;
            }
            current = { x: current.x + vector.x, y: current.y + vector.y };
        }
    }
    
    // 消失卡效果：让碰到的数字消失（带动画）
    activateVanishWithAnimation(x, y, direction) {
        // 清除道具本身
        this.grid[x][y] = 0;
        
        const vectors = {
            'up': { x: -1, y: 0 },
            'down': { x: 1, y: 0 },
            'left': { x: 0, y: -1 },
            'right': { x: 0, y: 1 }
        };
        
        const vector = vectors[direction];
        let current = { x: x + vector.x, y: y + vector.y };
        
        // 找到方向上第一个数字方块并让其消失（冰冻和石化的方块不能被作用）
        while (this.withinBounds(current)) {
            if (!this.isEmpty(this.grid[current.x][current.y])) {
                if (!this.isPowerUp(this.grid[current.x][current.y]) && !this.isFrozen(current.x, current.y) && !this.isPetrified(current.x, current.y)) {
                    // 先显示消失动画
                    setTimeout(() => {
                        this.animateTileEffect(current.x, current.y, 'vanishing');
                        
                        // 然后清除方块
                        setTimeout(() => {
                            this.grid[current.x][current.y] = 0;
                            
                            // 清除冰冻状态
                            const key = `${current.x}_${current.y}`;
                            delete this.frozenTiles[key];
                            
                            // 更新显示
                            this.updateDisplay();
                        }, 400);
                    }, 100);
                }
                break;
            }
            current = { x: current.x + vector.x, y: current.y + vector.y };
        }
    }
    
    // 随机卡效果：让碰到的数字变成随机值（带动画）
    activateRandomWithAnimation(x, y, direction) {
        // 清除道具本身
        this.grid[x][y] = 0;
        
        const vectors = {
            'up': { x: -1, y: 0 },
            'down': { x: 1, y: 0 },
            'left': { x: 0, y: -1 },
            'right': { x: 0, y: 1 }
        };
        
        const vector = vectors[direction];
        let current = { x: x + vector.x, y: y + vector.y };
        
        // 找到方向上第一个数字方块并变成随机值（冰冻和石化的方块不能被作用）
        while (this.withinBounds(current)) {
            if (!this.isEmpty(this.grid[current.x][current.y])) {
                if (!this.isPowerUp(this.grid[current.x][current.y]) && !this.isFrozen(current.x, current.y) && !this.isPetrified(current.x, current.y)) {
                    // 先显示随机动画
                    setTimeout(() => {
                        this.animateTileEffect(current.x, current.y, 'randomizing');
                        
                        // 然后修改数值为随机值
                        setTimeout(() => {
                            // 生成随机值：2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048
                            const possibleValues = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048];
                            const randomValue = possibleValues[Math.floor(Math.random() * possibleValues.length)];
                            
                            this.grid[current.x][current.y] = randomValue;
                            
                            // 更新显示
                            this.updateDisplay();
                        }, 400);
                    }, 100);
                }
                break;
            }
            current = { x: current.x + vector.x, y: current.y + vector.y };
        }
    }
    
    // 石化卡效果：固定碰到的数字3次移动（带动画）
    activatePetrifyWithAnimation(x, y, direction) {
        // 清除道具本身
        this.grid[x][y] = 0;
        
        const vectors = {
            'up': { x: -1, y: 0 },
            'down': { x: 1, y: 0 },
            'left': { x: 0, y: -1 },
            'right': { x: 0, y: 1 }
        };
        
        const vector = vectors[direction];
        let current = { x: x + vector.x, y: y + vector.y };
        
        // 找到方向上第一个数字方块并石化
        while (this.withinBounds(current)) {
            if (!this.isEmpty(this.grid[current.x][current.y])) {
                if (!this.isPowerUp(this.grid[current.x][current.y])) {
                    // 先显示石化动画
                    setTimeout(() => {
                        this.animateTileEffect(current.x, current.y, 'petrifying');
                        
                        // 然后设置石化状态
                        setTimeout(() => {
                            this.petrifyTile(current.x, current.y, 3);
                            
                            // 更新显示以显示石化样式
                            this.updateDisplay();
                        }, 400);
                    }, 100);
                }
                break;
            }
            current = { x: current.x + vector.x, y: current.y + vector.y };
        }
    }

    // 创建爆炸效果
    createExplosion(x, y, color) {
        const tileContainer = document.getElementById('tile-container');
        const gap = 10;
        const cellSize = (tileContainer.offsetWidth - (this.gridSize - 1) * gap) / this.gridSize;
        
        // 创建闪光效果
        const flash = document.createElement('div');
        flash.className = 'explosion-flash';
        flash.style.width = `${cellSize}px`;
        flash.style.height = `${cellSize}px`;
        flash.style.left = `${y * (cellSize + gap)}px`;
        flash.style.top = `${x * (cellSize + gap)}px`;
        tileContainer.appendChild(flash);
        
        // 创建粒子效果 - 更多粒子，更疯狂
        const particleCount = 30;
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'explosion-particle';
            particle.style.background = color;
            particle.style.left = `${y * (cellSize + gap) + cellSize / 2}px`;
            particle.style.top = `${x * (cellSize + gap) + cellSize / 2}px`;
            
            // 随机方向和距离
            const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
            const distance = 60 + Math.random() * 80;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;
            
            particle.style.setProperty('--tx', `${tx}px`);
            particle.style.setProperty('--ty', `${ty}px`);
            
            tileContainer.appendChild(particle);
            
            // 移除粒子
            setTimeout(() => {
                particle.remove();
            }, 600);
        }
        
        // 移除闪光
        setTimeout(() => {
            flash.remove();
        }, 400);
    }
    
    // 创建小型爆炸效果（用于逐个爆炸）
    createMiniExplosion(x, y, color) {
        const tileContainer = document.getElementById('tile-container');
        const gap = 10;
        const cellSize = (tileContainer.offsetWidth - (this.gridSize - 1) * gap) / this.gridSize;
        
        // 创建小闪光
        const flash = document.createElement('div');
        flash.className = 'explosion-flash';
        flash.style.width = `${cellSize}px`;
        flash.style.height = `${cellSize}px`;
        flash.style.left = `${y * (cellSize + gap)}px`;
        flash.style.top = `${x * (cellSize + gap)}px`;
        tileContainer.appendChild(flash);
        
        // 创建少量粒子
        const particleCount = 12;
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'explosion-particle';
            particle.style.background = color;
            particle.style.left = `${y * (cellSize + gap) + cellSize / 2}px`;
            particle.style.top = `${x * (cellSize + gap) + cellSize / 2}px`;
            
            const angle = (Math.PI * 2 * i) / particleCount;
            const distance = 30 + Math.random() * 40;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;
            
            particle.style.setProperty('--tx', `${tx}px`);
            particle.style.setProperty('--ty', `${ty}px`);
            
            tileContainer.appendChild(particle);
            
            setTimeout(() => {
                particle.remove();
            }, 600);
        }
        
        setTimeout(() => {
            flash.remove();
        }, 400);
    }
    
    // 检查当前是否已有道具
    hasPowerUpOnBoard() {
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.isPowerUp(this.grid[i][j])) {
                    return true;
                }
            }
        }
        return false;
    }
    
    // 添加随机方块（可能是普通数字或道具）
    addRandomTile() {
        const emptyCells = [];
        
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.grid[i][j] === 0) {
                    emptyCells.push({ x: i, y: j });
                }
            }
        }
        
        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            const tileData = GAME_CONFIG.getRandomTile();
            
            // 如果生成的是道具，但场上已有道具，则生成普通数字
            if (tileData.type === 'powerup' && this.hasPowerUpOnBoard()) {
                // 改为生成普通数字
                this.grid[randomCell.x][randomCell.y] = Math.random() < 0.9 ? 2 : 4;
            } else if (tileData.type === 'powerup') {
                // 存储道具信息
                this.grid[randomCell.x][randomCell.y] = {
                    type: 'powerup',
                    powerUpType: tileData.powerUpType,
                    config: tileData.config
                };
            } else {
                // 存储普通数字
                this.grid[randomCell.x][randomCell.y] = tileData.value;
            }
            
            return randomCell;
        }
        return null;
    }
    
    // 辅助方法：判断是否是道具
    isPowerUp(cell) {
        return cell && typeof cell === 'object' && cell.type === 'powerup';
    }
    
    // 辅助方法：获取方块的值（道具返回'powerup'，数字返回数字）
    getTileValue(cell) {
        if (cell === 0) return 0;
        if (this.isPowerUp(cell)) return 'powerup';
        return cell;
    }
    
    // 辅助方法：判断方块是否为空
    isEmpty(cell) {
        return cell === 0;
    }
    
    // 检查画布是否全空（没有任何普通数字）
    isBoardEmpty() {
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                const cell = this.grid[i][j];
                // 如果有普通数字，说明不是全空
                if (!this.isEmpty(cell) && !this.isPowerUp(cell)) {
                    return false;
                }
            }
        }
        return true;
    }
    
    // 检查并处理画布全空情况
    checkAndHandleEmptyBoard() {
        if (this.isBoardEmpty()) {
            console.log('画布全空，自动添加新方块');
            // 添加两个新方块
            this.addRandomTile();
            this.addRandomTile();
            this.updateDisplay();
        }
    }
    
    // 辅助方法：检查方块是否被冰冻
    isFrozen(x, y) {
        const key = `${x}_${y}`;
        return this.frozenTiles[key] && this.frozenTiles[key] > 0;
    }
    
    // 辅助方法：冰冻方块
    freezeTile(x, y, moves = 5) {
        const key = `${x}_${y}`;
        this.frozenTiles[key] = moves;
        this.updateFreezeIndicator();
    }
    
    // 辅助方法：减少冰冻计数
    decreaseFrozenCount() {
        const keys = Object.keys(this.frozenTiles);
        keys.forEach(key => {
            if (this.frozenTiles[key] > 0) {
                this.frozenTiles[key]--;
                if (this.frozenTiles[key] === 0) {
                    delete this.frozenTiles[key];
                }
            }
        });
        this.updateFreezeIndicator();
    }
    
    // 辅助方法：判断是否石化
    isPetrified(x, y) {
        const key = `${x}_${y}`;
        return this.petrifiedTiles[key] && this.petrifiedTiles[key] > 0;
    }
    
    // 辅助方法：石化方块
    petrifyTile(x, y, moves = 3) {
        const key = `${x}_${y}`;
        this.petrifiedTiles[key] = moves;
        this.updatePetrifyIndicator();
    }
    
    // 辅助方法：减少石化计数
    decreasePetrifiedCount() {
        const keys = Object.keys(this.petrifiedTiles);
        keys.forEach(key => {
            if (this.petrifiedTiles[key] > 0) {
                this.petrifiedTiles[key]--;
                if (this.petrifiedTiles[key] === 0) {
                    delete this.petrifiedTiles[key];
                }
            }
        });
        this.updatePetrifyIndicator();
    }
    
    // 更新石化指示器
    updatePetrifyIndicator() {
        const indicator = document.getElementById('petrify-indicator');
        const countElement = document.getElementById('petrify-count');
        
        // 找到剩余次数最多的石化方块
        let maxPetrified = 0;
        Object.values(this.petrifiedTiles).forEach(count => {
            if (count > maxPetrified) {
                maxPetrified = count;
            }
        });
        
        if (maxPetrified > 0) {
            indicator.style.display = 'flex';
            countElement.textContent = maxPetrified;
        } else {
            indicator.style.display = 'none';
        }
    }
    
    // 更新冰冻指示器
    updateFreezeIndicator() {
        const indicator = document.getElementById('freeze-indicator');
        const countElement = document.getElementById('freeze-count');
        
        // 找到剩余次数最多的冰冻方块
        let maxFrozen = 0;
        Object.values(this.frozenTiles).forEach(count => {
            if (count > maxFrozen) {
                maxFrozen = count;
            }
        });
        
        if (maxFrozen > 0) {
            indicator.style.display = 'flex';
            countElement.textContent = maxFrozen;
        } else {
            indicator.style.display = 'none';
        }
    }
    
    // 检查是否还有可移动的方块
    movesAvailable() {
        // 检查是否有空格
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.isEmpty(this.grid[i][j])) {
                    return true;
                }
            }
        }
        
        // 检查相邻方块是否可以合并
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                const current = this.grid[i][j];
                
                // 道具不能合并，但可以移动
                if (this.isPowerUp(current)) {
                    return true;
                }
                
                if ((i < this.gridSize - 1 && current === this.grid[i + 1][j]) ||
                    (j < this.gridSize - 1 && current === this.grid[i][j + 1])) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    // 检查是否获胜
    hasWon() {
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                const cell = this.grid[i][j];
                if (!this.isPowerUp(cell) && cell === 2048) {
                    return true;
                }
            }
        }
        return false;
    }
    
    // 检查游戏是否结束
    isGameOver() {
        return !this.movesAvailable();
    }
    
    // 更新显示
    updateDisplay(mergedCells = [], movedCells = [], newCell = null) {
        const tileContainer = document.getElementById('tile-container');
        tileContainer.innerHTML = '';
        
        const gap = 10; // CSS中定义的gap大小
        const cellSize = (tileContainer.offsetWidth - (this.gridSize - 1) * gap) / this.gridSize;
        
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                const cellData = this.grid[i][j];
                
                if (!this.isEmpty(cellData)) {
                    const tile = document.createElement('div');
                    
                    // 检查是否是道具
                    if (this.isPowerUp(cellData)) {
                        tile.className = `tile tile-powerup ${cellData.powerUpType}`;
                        
                        // 创建图标和符号元素
                        const iconElement = document.createElement('div');
                        iconElement.className = 'powerup-icon';
                        iconElement.textContent = cellData.config.icon;
                        tile.appendChild(iconElement);
                        
                        if (cellData.config.symbol) {
                            const symbolElement = document.createElement('div');
                            symbolElement.className = 'powerup-symbol';
                            symbolElement.textContent = cellData.config.symbol;
                            tile.appendChild(symbolElement);
                        }
                    } else {
                        // 普通数字方块
                        tile.className = `tile tile-${cellData}`;
                        tile.textContent = cellData;
                    }
                    
                    // 检查是否是新添加的方块
                    const isNew = newCell && newCell.x === i && newCell.y === j;
                    if (isNew) {
                        tile.classList.add('new');
                    }
                    
                    // 检查是否被冰冻
                    const isFrozenTile = this.isFrozen(i, j);
                    if (isFrozenTile) {
                        tile.classList.add('frozen');
                    }
                    
                    // 检查是否被石化
                    const isPetrifiedTile = this.isPetrified(i, j);
                    if (isPetrifiedTile) {
                        tile.classList.add('petrified');
                    }
                    
                    // 检查是否是合并的方块
                    const isMerged = mergedCells.some(c => c.x === i && c.y === j);
                    if (isMerged) {
                        tile.classList.add('merged');
                    } else if (!isNew && this.currentDirection && !this.isPowerUp(cellData)) {
                        // 如果不是合并也不是新方块，添加移动动画（道具有自己的动画）
                        const isMoved = movedCells.some(c => c.x === i && c.y === j);
                        if (isMoved) {
                            tile.classList.add(`move-${this.currentDirection}`);
                        }
                    }
                    
                    tile.style.width = `${cellSize}px`;
                    tile.style.height = `${cellSize}px`;
                    tile.style.left = `${j * (cellSize + gap)}px`;
                    tile.style.top = `${i * (cellSize + gap)}px`;
                    tile.style.lineHeight = `${cellSize}px`;
                    
                    // 根据画布大小动态调整字体大小
                    if (!this.isPowerUp(cellData)) {
                        const fontSize = Math.max(14, Math.min(35, cellSize * 0.5));
                        tile.style.fontSize = `${fontSize}px`;
                    } else {
                        // 道具图标字体大小
                        const iconSize = Math.max(20, Math.min(32, cellSize * 0.45));
                        const symbolSize = Math.max(12, Math.min(18, cellSize * 0.25));
                        const iconElement = tile.querySelector('.powerup-icon');
                        const symbolElement = tile.querySelector('.powerup-symbol');
                        if (iconElement) iconElement.style.fontSize = `${iconSize}px`;
                        if (symbolElement) symbolElement.style.fontSize = `${symbolSize}px`;
                    }
                    
                    tileContainer.appendChild(tile);
                }
            }
        }
        
        // 更新分数
        document.getElementById('score').textContent = this.score;
        document.getElementById('best-score').textContent = this.bestScore;
        
        // 添加分数增加动画
        if (mergedCells.length > 0) {
            const scoreElement = document.getElementById('score');
            scoreElement.classList.add('increased');
            setTimeout(() => {
                scoreElement.classList.remove('increased');
            }, 300);
        }
    }
    
    // 显示游戏消息
    showGameMessage(message) {
        const gameMessage = document.getElementById('game-message');
        const continueButton = gameMessage.querySelector('.continue-button');
        const retryButton = gameMessage.querySelector('.retry-button');
        
        gameMessage.querySelector('p').textContent = message;
        
        if (message === '游戏结束') {
            gameMessage.classList.add('game-over');
            continueButton.style.display = 'none';
            retryButton.style.display = 'inline-block';
        } else if (message === '你赢了！') {
            gameMessage.classList.add('game-won');
            continueButton.style.display = 'inline-block';
            retryButton.style.display = 'inline-block';
        }
    }
    
    // 隐藏游戏消息
    hideGameMessage() {
        const gameMessage = document.getElementById('game-message');
        gameMessage.className = 'game-message';
    }
    
    // 初始化道具下拉框
    initPowerUpDropdown() {
        const dropdownBtn = document.getElementById('powerup-dropdown-btn');
        const dropdownMenu = document.getElementById('powerup-dropdown-menu');
        
        // 生成道具列表
        this.generatePowerUpList();
        
        // 点击按钮切换下拉框
        dropdownBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isActive = dropdownBtn.classList.contains('active');
            
            if (isActive) {
                this.closePowerUpDropdown();
            } else {
                this.openPowerUpDropdown();
            }
        });
        
        // 点击文档其他地方关闭下拉框
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.powerup-dropdown')) {
                this.closePowerUpDropdown();
            }
        });
        
        // 阻止菜单内部点击事件冒泡
        dropdownMenu.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
    
    // 生成道具列表
    generatePowerUpList() {
        const menu = document.getElementById('powerup-dropdown-menu');
        menu.innerHTML = '';
        
        // 遍历配置文件中的所有道具
        for (const key in GAME_CONFIG.powerUps) {
            const powerUp = GAME_CONFIG.powerUps[key];
            
            // 创建道具项
            const item = document.createElement('div');
            item.className = 'powerup-item';
            
            // 道具图标
            const icon = document.createElement('div');
            icon.className = 'powerup-item-icon';
            icon.textContent = powerUp.icon + (powerUp.symbol ? ' ' + powerUp.symbol : '');
            
            // 道具内容
            const content = document.createElement('div');
            content.className = 'powerup-item-content';
            
            const name = document.createElement('div');
            name.className = 'powerup-item-name';
            name.textContent = powerUp.name;
            
            const description = document.createElement('div');
            description.className = 'powerup-item-description';
            description.textContent = powerUp.description;
            
            content.appendChild(name);
            content.appendChild(description);
            
            // 道具概率
            const probability = document.createElement('div');
            probability.className = 'powerup-item-probability';
            probability.textContent = Math.round(powerUp.probability * 100) + '%';
            
            // 组装
            item.appendChild(icon);
            item.appendChild(content);
            item.appendChild(probability);
            
            menu.appendChild(item);
        }
    }
    
    // 打开下拉框
    openPowerUpDropdown() {
        const dropdownBtn = document.getElementById('powerup-dropdown-btn');
        const dropdownMenu = document.getElementById('powerup-dropdown-menu');
        
        dropdownBtn.classList.add('active');
        dropdownMenu.style.display = 'block';
    }
    
    // 关闭下拉框
    closePowerUpDropdown() {
        const dropdownBtn = document.getElementById('powerup-dropdown-btn');
        const dropdownMenu = document.getElementById('powerup-dropdown-menu');
        
        dropdownBtn.classList.remove('active');
        dropdownMenu.style.display = 'none';
    }
    
    // 初始化画布大小下拉框
    initGridSizeDropdown() {
        const dropdownBtn = document.getElementById('grid-size-dropdown-btn');
        const dropdownMenu = document.getElementById('grid-size-dropdown-menu');
        const gridSizeItems = document.querySelectorAll('.grid-size-item');
        
        // 设置默认选中状态
        this.updateGridSizeSelection();
        
        // 点击按钮切换下拉框
        dropdownBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isActive = dropdownBtn.classList.contains('active');
            
            if (isActive) {
                this.closeGridSizeDropdown();
            } else {
                this.openGridSizeDropdown();
            }
        });
        
        // 点击文档其他地方关闭下拉框
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.grid-size-dropdown')) {
                this.closeGridSizeDropdown();
            }
        });
        
        // 阻止菜单内部点击事件冒泡
        dropdownMenu.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        // 为每个画布大小项添加点击事件
        gridSizeItems.forEach(item => {
            item.addEventListener('click', () => {
                const size = parseInt(item.getAttribute('data-size'));
                this.changeGridSize(size);
                this.closeGridSizeDropdown();
            });
        });
    }
    
    // 更新画布大小选中状态
    updateGridSizeSelection() {
        const gridSizeItems = document.querySelectorAll('.grid-size-item');
        gridSizeItems.forEach(item => {
            const size = parseInt(item.getAttribute('data-size'));
            if (size === this.gridSize) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
    
    // 改变画布大小
    changeGridSize(newSize) {
        if (newSize === this.gridSize) return;
        
        this.gridSize = newSize;
        this.updateBoardSize();
        this.initGame();
        this.updateGridSizeSelection();
    }
    
    // 更新画布显示大小
    updateBoardSize() {
        const gameBoard = document.getElementById('game-board');
        gameBoard.style.setProperty('--grid-size', this.gridSize);
    }
    
    // 生成背景格子
    generateGridCells() {
        const gridContainer = document.querySelector('.grid-container');
        gridContainer.innerHTML = '';
        
        const totalCells = this.gridSize * this.gridSize;
        for (let i = 0; i < totalCells; i++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            gridContainer.appendChild(cell);
        }
    }
    
    // 打开画布大小下拉框
    openGridSizeDropdown() {
        const dropdownBtn = document.getElementById('grid-size-dropdown-btn');
        const dropdownMenu = document.getElementById('grid-size-dropdown-menu');
        
        dropdownBtn.classList.add('active');
        dropdownMenu.style.display = 'block';
    }
    
    // 关闭画布大小下拉框
    closeGridSizeDropdown() {
        const dropdownBtn = document.getElementById('grid-size-dropdown-btn');
        const dropdownMenu = document.getElementById('grid-size-dropdown-menu');
        
        dropdownBtn.classList.remove('active');
        dropdownMenu.style.display = 'none';
    }
}

// 启动游戏
let game;
window.addEventListener('DOMContentLoaded', () => {
    game = new Game2048();
});


