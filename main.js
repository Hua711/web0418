document.addEventListener('DOMContentLoaded', function() {
    console.log('全畫面波浪動畫已載入！');
    
    // 建立 canvas 元素並插入 body
    let canvas = document.getElementById('waveCanvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'waveCanvas';
        document.body.appendChild(canvas);
    }

    const ctx = canvas.getContext('2d');
    
    // 設定基本參數，使用隨機值
    const verticalCenter = window.innerHeight * (0.3 + Math.random() * 0.4); // 隨機位置在畫面30%-70%之間
    const baseAmplitude = (97.5 + Math.random() * 39); // 增加 30%（從 75-105 增加到 97.5-136.5）
    
    // 波形參數 - 使用隨機值初始化
    const waveParams = {
        frequency: (0.0013 + Math.random() * 0.00195), // 增加 30%
        phase: Math.random() * Math.PI * 2, // 隨機相位
        speed: 0.01 + Math.random() * 0.02, // 隨機速度
        horizontalSpeed: 1 + Math.random() * 0.5, // 水平移動速度 (每幀移動的像素數)
        floatSpeed: 0.0008 + Math.random() * 0.0004, // 飄浮速度
        floatAmplitude: 30 + Math.random() * 20 // 飄浮幅度
    };
    
    // 用於創建自然變化的多個波
    const subWaves = [
        { 
            frequency: waveParams.frequency * (0.325 + Math.random() * 0.13), // 增加 30%
            amplitude: baseAmplitude * 0.195, // 增加 30%
            speed: waveParams.speed * 0.7,
            phase: Math.random() * Math.PI * 2
        },
        { 
            frequency: waveParams.frequency * (0.975 + Math.random() * 0.195), // 增加 30%
            amplitude: baseAmplitude * 0.0975, // 增加 30%
            speed: waveParams.speed * 1.3,
            phase: Math.random() * Math.PI * 2
        }
    ];
    
    // 時間變數
    let time = Math.random() * 100; // 隨機的起始時間
    let transformationTime = 0; // 形狀變換的時間控制
    let isTransforming = false; // 是否正在變換形狀
    const transformationDuration = 300; // 變換持續的幀數
    
    // 水平偏移量 - 用於實現右至左的移動
    let horizontalOffset = 0;
    
    // 儲存前一幀的波形，用於高比例平滑過渡
    let previousWavePoints = [];
    
    // 延伸參數 - 讓線條延伸到畫面外
    const extensionFactor = 0.3; // 每側延伸畫面寬度的30%

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        // 重設前一幀波形
        previousWavePoints = Array(Math.ceil(canvas.width * (1 + extensionFactor * 2))).fill(verticalCenter);
    }

    // 使用平滑曲線繪製波浪
    function drawSmoothWave(points) {
        if (points.length < 2) return;
        
        const startX = -canvas.width * extensionFactor;
        
        // 創建漸層
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop(0, '#FF6B6B');     // 粉紅色
        gradient.addColorStop(0.5, '#4ECDC4');   // 青色
        gradient.addColorStop(1, '#45B7D1');     // 藍色
        
        ctx.beginPath();
        ctx.moveTo(startX, points[0]);
        
        // 使用平滑的曲線連接點
        for (let i = 1; i < points.length; i++) {
            const x = startX + i;
            ctx.lineTo(x, points[i]);
        }
        
        ctx.strokeStyle = gradient;
        ctx.stroke();
    }
    
    // 自然平滑波形函數 - 加入水平偏移
    function generateWavePoint(x, time, offset) {
        // 添加水平偏移，實現右至左移動
        const adjustedX = x + offset;
        
        // 主波
        let value = Math.sin(adjustedX * waveParams.frequency + time * waveParams.speed + waveParams.phase) * baseAmplitude;
        
        // 添加子波，創造更自然的波形
        for (const wave of subWaves) {
            value += Math.sin(adjustedX * wave.frequency + time * wave.speed + wave.phase) * wave.amplitude;
        }
        
        return value;
    }

    // 生成愛心形狀的點
    function generateHeartPoint(x, width, height) {
        const scale = height / 16;
        const centerX = width / 2;
        const centerY = height / 2;
        
        // 將 x 映射到 -2 到 2 的範圍
        const t = (x - centerX) / (width / 4);
        
        // 愛心函數
        const y = -Math.sqrt(Math.cos(t) * Math.abs(Math.cos(t))) * Math.sin(t);
        return centerY + y * scale;
    }

    // 在 generateWavePoint 函數後添加混合函數
    function blendPoints(wave, heart, progress) {
        return wave * (1 - progress) + heart * progress;
    }

    function drawWave() {
        // 增加時間
        time += 0.01;
        
        // 每隔一段時間觸發形狀變換
        if (time % 10 < 0.01 && !isTransforming) {
            isTransforming = true;
            transformationTime = 0;
        }
        
        // 如果正在變換，更新變換進度
        if (isTransforming) {
            transformationTime++;
            if (transformationTime >= transformationDuration) {
                isTransforming = false;
            }
        }
        
        // 計算變換進度（使用正弦函數使變換更平滑）
        let transformProgress = 0;
        if (isTransforming) {
            // 使用正弦函數創建緩動效果
            const normalizedTime = transformationTime / transformationDuration;
            if (normalizedTime < 0.5) {
                // 0-0.5: 波浪變成愛心
                transformProgress = Math.sin(normalizedTime * Math.PI) * 0.5;
            } else {
                // 0.5-1: 愛心變回波浪
                transformProgress = Math.sin((1 - normalizedTime) * Math.PI) * 0.5;
            }
        }
        
        // 增加水平偏移量，實現從右到左的移動
        horizontalOffset += waveParams.horizontalSpeed;
        
        // 計算垂直位置的緩慢自然變化 - 使用新的飄浮參數
        const verticalShift = Math.sin(time * waveParams.floatSpeed) * waveParams.floatAmplitude;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 創建當前幀的波形點 - 計算範圍擴展到畫面外
        const totalWidth = Math.ceil(canvas.width * (1 + extensionFactor * 2));
        const currentWavePoints = [];
        
        for (let i = 0; i < totalWidth; i++) {
            // 計算實際x坐標（相對於延伸後的起點）
            const x = i;
            
            // 生成波形值，加入水平偏移
            const waveValue = generateWavePoint(x, time, horizontalOffset);
            const waveY = verticalCenter + waveValue + verticalShift;
            
            // 生成愛心值
            const heartY = generateHeartPoint(x, canvas.width, canvas.height);
            
            // 混合波浪和愛心
            let y = blendPoints(waveY, heartY, transformProgress);
            
            // 與前一幀進行平滑過渡
            if (previousWavePoints[i]) {
                // 將當前幀的值與前一幀的值混合
                y = previousWavePoints[i] * 0.85 + y * 0.15;
            }
            
            currentWavePoints[i] = y;
        }

        // 繪製波浪 (移除這行，因為我們已經在 drawSmoothWave 中設置了 strokeStyle)
        // ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.lineWidth = 1.5; // 增加線條寬度使顏色更明顯
        drawSmoothWave(currentWavePoints);
        
        // 保存當前波形作為下一幀的前一幀
        previousWavePoints = [...currentWavePoints];
        
        // 使用 requestAnimationFrame 以獲得更流暢的動畫
        requestAnimationFrame(drawWave);
    }

    window.addEventListener('resize', function() {
        resizeCanvas();
    });
    
    resizeCanvas();
    // 開始動畫循環
    requestAnimationFrame(drawWave);
});