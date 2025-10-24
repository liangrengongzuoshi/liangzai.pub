// 2048 游戏配置文件

const GAME_CONFIG = {
    // 道具配置
    powerUps: {
        // 竖向辣椒 - 炸掉一列
        verticalPepper: {
            name: '辣椒卡',
            type: 'vertical_pepper',
            probability: 0.10, // 5%
            icon: '🌶',
            symbol: '↕',
            color: '#ff4757',
            description: '炸掉整列数字'
        },
        // 横向辣椒 - 炸掉一行
        horizontalPepper: {
            name: '辣椒卡',
            type: 'horizontal_pepper',
            probability: 0.10, // 5%
            icon: '🌶',
            symbol: '↔',
            color: '#ff6348',
            description: '炸掉整行数字'
        },
        // 炸弹 - 炸掉相邻
        bomb: {
            name: '炸弹卡',
            type: 'bomb',
            probability: 0.10, // 5%
            icon: '💣',
            symbol: '',
            color: '#2f3542',
            description: '炸掉相邻数字'
        },
        // 复制卡 - 碰到的数字翻倍
        doubleCard: {
            name: '复制卡',
            type: 'double',
            probability: 0.15, // 10%
            icon: '✨',
            symbol: '×2',
            color: '#5f27cd',
            description: '碰到的数字翻倍'
        },
        // 减半卡 - 碰到的数字减半
        halfCard: {
            name: '减半卡',
            type: 'half',
            probability: 0.15, // 10%
            icon: '❄️',
            symbol: '÷2',
            color: '#0abde3',
            description: '碰到的数字减半'
        },
        // 冰冻卡 - 冰冻碰到的数字n次变化
        freezeCard: {
            name: '冰冻卡',
            type: 'freeze',
            probability: 0.10, // 10%
            icon: '🧊',
            symbol: 'ICE',
            color: '#74b9ff',
            description: '冰冻数字n次变化'
        },
        // 消失卡 - 让碰到的数字消失
        vanishCard: {
            name: '消失卡',
            type: 'vanish',
            probability: 0.15, // 20%
            icon: '👻',
            symbol: 'POP',
            color: '#a29bfe',
            description: '让数字消失'
        },
        // 随机卡 - 让碰到的数字变成随机值
        randomCard: {
            name: '随机卡',
            type: 'random',
            probability: 0.10, // 5%
            icon: '🎲',
            symbol: '???',
            color: '#fd79a8',
            description: '变成随机值(2-2048)'
        },
        // 石化卡 - 固定碰到的数字3次移动
        petrifyCard: {
            name: '石化卡',
            type: 'petrify',
            probability: 0.10, // 10%
            icon: '🗿',
            symbol: 'LOCK',
            color: '#636e72',
            description: '固定数字3次移动'
        }
    },
    
    // 普通数字2的概率（剩余概率）
    normalTileProbability: 0.10, // 10% (调整以适应新道具)
    
    // 获取随机道具或普通方块
    getRandomTile() {
        const rand = Math.random();
        let cumulativeProbability = 0;
        
        // 检查是否生成道具
        for (const key in this.powerUps) {
            const powerUp = this.powerUps[key];
            cumulativeProbability += powerUp.probability;
            
            if (rand < cumulativeProbability) {
                return {
                    type: 'powerup',
                    powerUpType: powerUp.type,
                    value: powerUp.type,
                    config: powerUp
                };
            }
        }
        
        // 生成普通数字（90%为2，10%为4）
        return {
            type: 'normal',
            value: Math.random() < 0.9 ? 2 : 4
        };
    }
};

// 导出配置（兼容不同的模块系统）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GAME_CONFIG;
}

