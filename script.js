// 添加滚动效果
document.addEventListener('DOMContentLoaded', function() {
    const header = document.querySelector('header');
    
    // 滚动效果
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.style.backgroundColor = 'rgba(15, 18, 21, 0.95)';
        } else {
            header.style.backgroundColor = 'rgba(15, 18, 21, 0.9)';
        }
    });

    // Canvas设置
    const canvas = document.getElementById('dotCanvas');
    const ctx = canvas.getContext('2d');
    const dotSpacing = 30;
    const dotSize = 1;
    const width = 1500;
    const height = document.querySelector('.hero').offsetHeight;

    // 设置Canvas尺寸
    canvas.width = width;
    canvas.height = height;

    // 计算点阵
    const cols = Math.floor(width / dotSpacing);
    const rows = Math.floor(height / dotSpacing);
    const dots = [];

    // 创建点阵数据结构
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            dots.push({
                x: col * dotSpacing + (width - cols * dotSpacing) / 2,
                y: row * dotSpacing,
                color: '#383A3A',
                targetColor: '#383A3A',
                currentColor: '#383A3A',
                state: 'idle', // idle, fadeIn, stable, fadeOut
                progress: 0
            });
        }
    }

    // 颜色插值函数
    function interpolateColor(startColor, endColor, progress) {
        const start = {
            r: parseInt(startColor.slice(1, 3), 16),
            g: parseInt(startColor.slice(3, 5), 16),
            b: parseInt(startColor.slice(5, 7), 16)
        };
        const end = {
            r: parseInt(endColor.slice(1, 3), 16),
            g: parseInt(endColor.slice(3, 5), 16),
            b: parseInt(endColor.slice(5, 7), 16)
        };
        
        return '#' + [
            Math.round(start.r + (end.r - start.r) * progress),
            Math.round(start.g + (end.g - start.g) * progress),
            Math.round(start.b + (end.b - start.b) * progress)
        ].map(x => x.toString(16).padStart(2, '0')).join('');
    }

    // 动画函数
    function animate() {
        ctx.clearRect(0, 0, width, height);

        dots.forEach(dot => {
            // 更新点的状态
            if (dot.state === 'fadeIn') {
                dot.progress += 0.02;
                if (dot.progress >= 1) {
                    dot.progress = 1;
                    dot.state = 'stable';
                    dot.currentColor = dot.targetColor;
                }
                dot.color = interpolateColor('#383A3A', dot.targetColor, dot.progress);
            } else if (dot.state === 'fadeOut') {
                dot.progress -= 0.02;
                if (dot.progress <= 0) {
                    dot.progress = 0;
                    dot.state = 'idle';
                    dot.color = '#383A3A';
                }
                dot.color = interpolateColor(dot.currentColor, '#383A3A', 1 - dot.progress);
            }

            // 绘制点
            ctx.fillStyle = dot.color;
            ctx.beginPath();
            ctx.arc(dot.x, dot.y, dotSize, 0, Math.PI * 2);
            ctx.fill();
        });

        requestAnimationFrame(animate);
    }

    let animationInterval;
    let isPageVisible = true;

    // 处理页面可见性变化
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            isPageVisible = false;
            clearInterval(animationInterval);
            animationInterval = null;
        } else {
            isPageVisible = true;
            // 清理所有正在进行的动画
            dots.forEach(dot => {
                if (dot.state !== 'idle') {
                    dot.state = 'idle';
                    dot.color = '#383A3A';
                    dot.progress = 0;
                }
            });
            // 立即触发一次动画
            animateDots();
            // 重新启动定时器
            if (!animationInterval) {
                animationInterval = setInterval(animateDots, 1000);
            }
        }
    });

    // 随机改变点的颜色
    function animateDots() {
        // 如果页面不可见，不执行动画
        if (!isPageVisible) return;

        const colors = ['#178747', '#a8e16a', '#4fb7a1'];
        const numDotsToAnimate = Math.floor(Math.random() * 5) + 8;
        
        const availableDots = dots.filter(dot => dot.state === 'idle');
        
        for (let i = 0; i < numDotsToAnimate && i < availableDots.length; i++) {
            const randomIndex = Math.floor(Math.random() * availableDots.length);
            const dot = availableDots.splice(randomIndex, 1)[0];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            
            dot.targetColor = randomColor;
            dot.state = 'fadeIn';
            dot.progress = 0;

            // 在稳定状态后开始淡出
            setTimeout(() => {
                if (dot.state === 'stable') {
                    dot.state = 'fadeOut';
                    dot.progress = 1;
                }
            }, 1500); // 保持颜色1.5秒
        }
    }

    // 启动动画
    animate();
    animationInterval = setInterval(animateDots, 1000);

    // 处理窗口大小改变
    window.addEventListener('resize', () => {
        canvas.height = document.querySelector('.hero').offsetHeight;
    });
}); 