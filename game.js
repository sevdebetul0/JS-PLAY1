document.addEventListener('DOMContentLoaded', () => {
  // Canvas ayarları
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 800;
  canvas.height = 600;
  let worldWidth = 2400;
  
  // Başlat butonu ve ekranı
  const startBtn = document.getElementById('start-button');
  const startScreen = document.getElementById('start-screen');

  let currentLevel = 0;

  const levels = [
    {
      platforms: (() => {
        const platforms = [];
        // Zemin platformları 
        for (let x = 0; x <= 780; x += 40) {
          platforms.push({ x: x, y: 500 });
        }
        // Üst platformlar 
        for (let x = 200; x <= 280; x += 40) {
          platforms.push({ x: x, y: 400 });
        }
        // Muhafız kontrol platformu 
        for (let x = 300; x <= 500; x += 40) {
          platforms.push({ x: x, y: 300 });
        }
        return platforms;
      })(),
      //anahtarların konumu
      diamonds: [
        { x: 210, y: 360, collected: false },
        { x: 250, y: 360, collected: false },
        { x: 560, y: 260, collected: false }
      ],
      door: { x: 700, y: 382, width: 80, height: 120 },
      requiredDiamonds: 3,
      guardConfig: {
        x: 400,
        y: 220,
        patrolLeft: 280,
        patrolRight: 540,
        speed: 1.5
      },
      hasInvisibility: true, // Görünmezlik pelerini var
      spikes: [] // Diken yok
    },
    
    {
      platforms: (() => {
        const platforms = [];
        // İkinci seviye platformları
        
        // Zemin platformları
        for (let x = 0; x <= 780; x += 40) {
          platforms.push({ x: x, y: 500 });
        }
        
        // Sol taraftaki yüksek platform
        for (let x = 80; x <= 160; x += 40) {
          platforms.push({ x: x, y: 350 });
        }
        
        // Orta kısımdaki merdiven platformları
        platforms.push({ x: 240, y: 450 });
        platforms.push({ x: 280, y: 400 });
        platforms.push({ x: 320, y: 350 });
        platforms.push({ x: 360, y: 300 });
        
        // Sağ taraftaki yüksek platform
        for (let x = 500; x <= 640; x += 40) {
          platforms.push({ x: x, y: 200 });
        }
        
        // Çıkış kapısı için platform
        for (let x = 680; x <= 760; x += 40) {
          platforms.push({ x: x, y: 400 });
        }
        
        return platforms;
      })(),
      diamonds: [ 
        //anahtarların konumları
        { x: 120, y: 310, collected: false },
        { x: 540, y: 160, collected: false },
        { x: 580, y: 160, collected: false },
        { x: 320, y: 310, collected: false }
      ],
      door: { x: 700, y: 280, width: 80, height: 120 },
      requiredDiamonds: 4,
      guardConfig: {
        x: 200,
        y: 420,
        patrolLeft: 200,
        patrolRight: 450,
        speed: 2
      },
      hasInvisibility: true, // Görünmezlik var
      spikes: [] // İkinci seviyede diken yok
    },

    // Üçüncü seviye platformları
    {
      platforms: (() => {
        const platforms = [];
        
        // Başlangıç zemini 
        for (let x = 0; x <= 120; x += 40) {
          platforms.push({ x: x, y: 500 });
        }
        
        // Dikenli yol sonrası güvenli alan
        for (let x = 280; x <= 360; x += 40) {
          platforms.push({ x: x, y: 500 });
        }
        
        // Yüksek atlama platformları 
        platforms.push({ x: 200, y: 420 });
        
        
        // Orta bölüm muhafız alanı
        for (let x = 400; x <= 520; x += 40) {
          platforms.push({ x: x, y: 460 });
        }
        
        // Üst seviye platformlar 
        platforms.push({ x: 150, y: 320 });
        platforms.push({ x: 310, y: 300 });
        platforms.push({ x: 470, y: 280 });
        
        // Dar geçiş platformları
        platforms.push({ x: 380, y: 200 });
        platforms.push({ x: 420, y: 160 });
        platforms.push({ x: 460, y: 120 });
        
        // Çıkış öncesi engeller
        for (let x = 560; x <= 640; x += 40) {
          platforms.push({ x: x, y: 400 });
        }
        
        // Çıkış zemini
        for (let x = 680; x <= 780; x += 40) {
          platforms.push({ x: x, y: 500 });
        }
        
        return platforms;
      })(),
      diamonds: [
        //anahtar konumları
        { x: 210, y: 380, collected: false }, // Dikenli yol üstünde
        { x: 320, y: 260, collected: false }, // Üst platformda
        { x: 480, y: 240, collected: false }, // Zor erişim alanında
        { x: 430, y: 120, collected: false }, // En üst platformda
        { x: 590, y: 360, collected: false }  // Son bölümde
      ],
      door: { x: 720, y: 380, width: 80, height: 120 },
      requiredDiamonds: 5,
      guardConfig: [
        {
          x: 450,
          y: 380,
          patrolLeft: 400,
          patrolRight: 520,
          speed: 2.5
        },
        {
          x: 580,
          y: 320,
          patrolLeft: 560,
          patrolRight: 640,
          speed: 1.8
        }
      ],
      hasInvisibility: true, // Görünmezlik var
      spikes: [
        // Dikenli yol - zemin seviyesinde
        { x: 160, y: 500 },
        { x: 200, y: 500 },
        { x: 240, y: 500 },
        
        // Platform altındaki dikenler
        { x: 400, y: 500 },
        { x: 440, y: 500 },
        { x: 480, y: 500 },
        { x: 520, y: 500 },
        
        // Dar geçişteki dikenler
        { x: 380, y: 240 },
        { x: 420, y: 200 },
        { x: 460, y: 160 }
      ]
    }
  ];

  // --- Oyuncu tanımı ---
  const player = {
    x: 100,
    y: 460,
    width: 40,
    height: 60,
    speed: 4,
    direction: 'right',
    isJumping: false,
    isCrouching: false,
    velocityY: 0,
    currentImage: null,
    currentSprite: 'idle',
    isMoving: false,
    isSticking: false,
    stickSide: null,
    // Görünmezlik özellikleri
    isInvisible: false,
    invisibilityDuration: 5000, // 5 saniye
    invisibilityTimer: 0,
    invisibilityCooldown: 3000, // 3 saniye cooldown
    invisibilityCooldownTimer: 0
  };

  let guards = []; // Çok muhafız desteği için dizi

  // --- Sprite yükleme ---
  const playerSprites = {
    idle: new Image(),
    right: new Image(),
    left: new Image(),
    jumpRight: new Image(),
    jumpLeft: new Image(),
    fallRight: new Image(),
    fallLeft: new Image(),
    // Görünmez spritelar
    invisibleIdle: new Image(),
    invisibleRight: new Image(),
    invisibleLeft: new Image(),
    invisibleJumpRight: new Image(),
    invisibleJumpLeft: new Image(),
    invisibleFallRight: new Image(),
    invisibleFallLeft: new Image()
  };

  const spritesLoaded = {
    idle: false,
    right: false,
    left: false,
    jumpRight: false,
    jumpLeft: false,
    fallRight: false,
    fallLeft: false,
    invisibleIdle: false,
    invisibleRight: false,
    invisibleLeft: false,
    invisibleJumpRight: false,
    invisibleJumpLeft: false,
    invisibleFallRight: false,
    invisibleFallLeft: false
  };

  const spriteUrls = {
    idle: './assets/witch.png',
    right: './assets/witch_sag.png',
    left: './assets/witch_sol.png',
    jumpRight: './assets/witch_sag_yukari.png',
    jumpLeft: './assets/witch_sol_yukari.png',
    fallRight: './assets/witch_sag_asagi.png',
    fallLeft: './assets/witch_sol_asagi.png',
   
    invisibleIdle: './assets/w_invisible.png',
    invisibleRight: './assets/w_invisible_sag.png',
    invisibleLeft: './assets/w_invisible_sol.png',
    invisibleJumpRight: './assets/w_invisible_sag_yukari.png',
    invisibleJumpLeft: './assets/w_invisible_sol_yukari.png',
    invisibleFallRight: './assets/w_invisible_sag_asagi.png',
    invisibleFallLeft: './assets/w_invisible_sol_asagi.png'
  };

  const diamondImage = new Image();
  diamondImage.src = './assets/elmas.png';

  const doorImage = new Image();
  doorImage.src = './assets/kapı.png';

  // Genel arka plan müziği
  const bgMusic = new Audio('./assets/arkaplan.mp3');
  bgMusic.loop = true; 

  //anahtar toplanma sesi
  const diamondSound = new Audio('./assets/elmas.mp3');

  // Yeni level sesi 
  const doorSound = new Audio('./assets/level.mp3');

  const guardSprites = {
    right: new Image(),
    left: new Image(),
  };

  guardSprites.right.src = './assets/guard_right.png';
  guardSprites.left.src = './assets/guard_left.png';

  // Diken sprite
  const spikeImage = new Image();
  spikeImage.src = './assets/diken.png';
  let spikeLoaded = false;
  spikeImage.onload = () => spikeLoaded = true;

  function drawDiamonds() {
    diamonds.forEach(d => {
      if (!d.collected) {
        ctx.drawImage(diamondImage, d.x, d.y, 30, 30);
      }
    });
  }

  function drawDoor() {
    if (doorImage.complete) {
      ctx.drawImage(doorImage, door.x, door.y, door.width, door.height);
    } else {
      ctx.fillStyle = 'brown';
      ctx.fillRect(door.x, door.y, door.width, door.height);
    }
  }

  function collectDiamond() { 
  diamondSound.currentTime = 0; 
  diamondSound.play();
}

function openDoor() {
  doorSound.currentTime = 0;
  doorSound.play();
  // seviye geçişi veya animasyon
}


  function drawGuards() {
    guards.forEach(guard => {
      let currentGuardImage = guard.direction === 1 ? guardSprites.right : guardSprites.left;

      if (currentGuardImage && currentGuardImage.complete && currentGuardImage.naturalHeight !== 0) {
        ctx.drawImage(currentGuardImage, guard.x, guard.y, guard.width, guard.height);
      } else {
        ctx.fillStyle = "red";
        ctx.fillRect(guard.x, guard.y, guard.width, guard.height);
      }

      // Görüş alanını çiz
      ctx.fillStyle = "rgba(219, 210, 81, 0.2)";
      const viewX = guard.direction === 1 ? guard.x + guard.width : guard.x - guard.viewDistance;
      ctx.fillRect(viewX, guard.y, guard.viewDistance, guard.height);
    });
  }

  function drawSpikes() {
    if (!spikes || spikes.length === 0) return;
    
    spikes.forEach(spike => {
      if (spikeLoaded) {
        ctx.drawImage(spikeImage, spike.x, spike.y, 40, 40);
      } else {
       
        ctx.fillStyle = '#8B0000';
        ctx.fillRect(spike.x, spike.y, 40, 40);
        
       
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.moveTo(spike.x + 5, spike.y + 35);
        ctx.lineTo(spike.x + 20, spike.y + 5);
        ctx.lineTo(spike.x + 35, spike.y + 35);
        ctx.closePath();
        ctx.fill();
      }
    });
  }

  Object.keys(playerSprites).forEach(key => {
    playerSprites[key].onload = () => {
      spritesLoaded[key] = true;
      console.log(`${key} sprite başarıyla yüklendi`);
    };
    playerSprites[key].onerror = () => {
      console.error(`${key} sprite yüklenemedi: ${spriteUrls[key]}`);
      spritesLoaded[key] = false;
    };
    playerSprites[key].src = spriteUrls[key];
  });

  setTimeout(() => {
    player.currentImage = playerSprites.idle;
    updatePlayerImage();
  }, 100);

  const tileSize = 40;
  let platforms = [];

  // tugla resmi
  const brickImage = new Image();
  brickImage.src = './assets/tugla.png';
  let brickLoaded = false;
  brickImage.onload = () => brickLoaded = true;

  // arkaplan resmi
  const bg = new Image();
  bg.src = './assets/a.png';
  let bgLoaded = false;
  bg.onload = () => bgLoaded = true;

  // Tuş durumları
  const keys = {
    left: false,
    right: false,
    down: false
  };

  // --- Görünmezlik fonksiyonları ---
  function activateInvisibility() {
    if ((currentLevel === 0 ||currentLevel === 1 || currentLevel === 2) && levels[currentLevel].hasInvisibility && 
        !player.isInvisible && player.invisibilityCooldownTimer <= 0) {
      player.isInvisible = true;
      player.invisibilityTimer = player.invisibilityDuration;
      console.log("Görünmezlik aktif!");
    }
  }

  function updateInvisibility() {
    // Görünmezlik süresi güncelle
    if (player.isInvisible && player.invisibilityTimer > 0) {
      player.invisibilityTimer -= 16; 
      if (player.invisibilityTimer <= 0) {
        player.isInvisible = false;
        player.invisibilityCooldownTimer = player.invisibilityCooldown;
        console.log("Görünmezlik sona erdi!");
      }
    }

    // Cooldown süresini güncelle
    if (player.invisibilityCooldownTimer > 0) {
      player.invisibilityCooldownTimer -= 16;
    }
  }

  // --- Yardımcı fonksiyonlar ---
  function rectIntersect(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
  }

  function drawPlaceholder() {
    let color = 'green';
    if (player.isInvisible) {
      color = 'rgba(0, 255, 0, 0.3)'; // Yarı saydam yeşil
    } else if (player.isJumping && player.velocityY < 0) {
      color = player.direction === 'right' ? 'blue' : 'purple';
    } else if (player.isJumping && player.velocityY > 0) {
      color = player.direction === 'right' ? 'red' : 'pink';
    } else if (player.isMoving) {
      color = player.direction === 'right' ? 'orange' : 'yellow';
    }
    
    ctx.fillStyle = color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    ctx.fillStyle = 'white';
    if (player.direction === 'right') {
      ctx.fillRect(player.x + 30, player.y + 15, 8, 10);
    } else {
      ctx.fillRect(player.x + 2, player.y + 15, 8, 10);
    }
  }

  function updateGuards() {
    guards.forEach(guard => {
      guard.x += guard.speed * guard.direction;

      if (guard.x < guard.patrolLeft) {
        guard.x = guard.patrolLeft;
        guard.direction = 1;
      }
      if (guard.x + guard.width > guard.patrolRight) {
        guard.x = guard.patrolRight - guard.width;
        guard.direction = -1;
      }

      const viewBox = {
        x: guard.direction === 1 ? guard.x + guard.width : guard.x - guard.viewDistance,
        y: guard.y,
        width: guard.viewDistance,
        height: guard.height
      };

      // Sadece görünür durumdayken yakalanma kontrolü 
      if (!player.isInvisible && rectIntersect(player, viewBox)) {
        alert("Muhafız seni yakaladı! ");
       setTimeout(() => {
    window.location.reload();
  }, 100);
      }
    });
  }

  function checkSpikeCollision() {
    if (!spikes || spikes.length === 0) return;
    
    spikes.forEach(spike => {
      const spikeRect = { x: spike.x, y: spike.y, width: 40, height: 40 };
      if (rectIntersect(player, spikeRect)) {
        alert("Dikenlere çarptın! Oyun yeniden başlıyor...");
        window.location.reload();
      }
    });
  }

  function drawPlatforms() {
    if (!brickLoaded) {
      platforms.forEach(p => {
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(p.x, p.y, tileSize, tileSize);
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 1;
        ctx.strokeRect(p.x, p.y, tileSize, tileSize);
      });
      return;
    }
    platforms.forEach(p => {
      ctx.drawImage(brickImage, 0, 0, 32, 32, p.x, p.y, tileSize, tileSize);
    });
  }

  function updatePlayerImage() {
    let targetSprite = 'idle';

    // Görünmezlik durumuna göre sprite seç
    const invisiblePrefix = player.isInvisible ? 'invisible' : '';
    
    if (player.isJumping) {
      if (player.velocityY < 0) {
        targetSprite = player.direction === 'right' ? 
          (invisiblePrefix ? 'invisibleJumpRight' : 'jumpRight') : 
          (invisiblePrefix ? 'invisibleJumpLeft' : 'jumpLeft');
      } else if (player.velocityY > 0) {
        targetSprite = player.direction === 'right' ? 
          (invisiblePrefix ? 'invisibleFallRight' : 'fallRight') : 
          (invisiblePrefix ? 'invisibleFallLeft' : 'fallLeft');
      }
    } else if (player.isMoving) {
      targetSprite = player.direction === 'right' ? 
        (invisiblePrefix ? 'invisibleRight' : 'right') : 
        (invisiblePrefix ? 'invisibleLeft' : 'left');
    } else {
      targetSprite = invisiblePrefix ? 'invisibleIdle' : 'idle';
    }

    player.currentImage = playerSprites[targetSprite];
    player.currentSprite = targetSprite;
  }

  function checkPlatformCollision(futureX, futureY) {
    const futureRect = {
      x: futureX,
      y: futureY,
      width: player.width,
      height: player.height
    };

    return platforms.some(p => {
      const plat = { x: p.x, y: p.y, width: tileSize, height: tileSize };
      return rectIntersect(futureRect, plat);
    });
  }

  function applyGravity() {
    if (player.isSticking) {
      player.velocityY = Math.min(player.velocityY + 0.1, 2);
    } else {
      player.velocityY += 0.6;
    }

    const newY = player.y + player.velocityY;

    if (!checkPlatformCollision(player.x, newY)) {
      player.y = newY;
      player.isJumping = true;
    } else {
      if (player.velocityY > 0) {
        const collisionPlatform = platforms.find(p => {
          const plat = { x: p.x, y: p.y, width: tileSize, height: tileSize };
          const futureRect = { x: player.x, y: newY, width: player.width, height: player.height };
          return rectIntersect(futureRect, plat);
        });

        if (collisionPlatform) {
          player.y = collisionPlatform.y - player.height;
          player.velocityY = 0;
          player.isJumping = false;
        }
      }
    }

    const leftWallX = player.x - 1;
    const rightWallX = player.x + player.width + 1;

    const touchingLeftWall = checkPlatformCollision(leftWallX, player.y);
    const touchingRightWall = checkPlatformCollision(rightWallX, player.y);

    if (player.isJumping && (touchingLeftWall || touchingRightWall)) {
      player.isSticking = true;
      player.stickSide = touchingLeftWall ? 'left' : 'right';
      player.velocityY = Math.min(player.velocityY, 1);
    } else if (!touchingLeftWall && !touchingRightWall) {
      player.isSticking = false;
      player.stickSide = null;
    }
  }

  function handleMovement() {
    player.isMoving = false;

    let nextX = player.x;
    if (keys.right) {
      nextX += player.speed;
      player.direction = 'right';
      player.isMoving = true;
    }
    if (keys.left) {
      nextX -= player.speed;
      player.direction = 'left';
      player.isMoving = true;
    }

    if (!checkPlatformCollision(nextX, player.y)) {
      player.x = nextX;
    }

    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
  }

  function drawPlayer() {
    if (player.currentImage && player.currentImage.complete) {
      try {
        ctx.drawImage(player.currentImage, player.x, player.y, player.width, player.height);
      } catch (error) {
        console.log(`Sprite çizim hatası: ${error}`);
        drawPlaceholder();
      }
    } else {
      drawPlaceholder();
    }
  }

  // --- Girdi dinleyicileri ---
  document.addEventListener('keydown', e => {
    switch(e.code) {
      case 'Space':
        e.preventDefault();
        if (player.isSticking) {
          player.velocityY = -12;

          if (player.stickSide === 'left') {
            player.x += 10;
            player.direction = 'right';
          } else if (player.stickSide === 'right') {
            player.x -= 10;
            player.direction = 'left';
          }

          player.isSticking = false;
          player.stickSide = null;
        } else if (!player.isJumping) {
          player.velocityY = -12;
          player.isJumping = true;
        }
        break;
      case 'ArrowRight':
        e.preventDefault();
        keys.right = true;
        player.direction = 'right';
        break;
      case 'ArrowLeft':
        e.preventDefault();
        keys.left = true;
        player.direction = 'left';
        break;
      case 'ArrowDown':
        e.preventDefault();
        keys.down = true;
        player.isCrouching = true;
        break;
      case 'KeyS':
        e.preventDefault();
        activateInvisibility();
        break;
    }
  });

  document.addEventListener('keyup', e => {
    switch(e.code) {
      case 'ArrowRight':
        keys.right = false;
        break;
      case 'ArrowLeft':
        keys.left = false;
        break;
      case 'ArrowDown':
        keys.down = false;
        player.isCrouching = false;
        break;
    }

    document.addEventListener('keydown', () => {
  if (!bgMusicPlayedOnce) {
    bgMusic.play();
    bgMusicPlayedOnce = true;
  }
});

  });

  // --- Level yönetimi ---
  let diamonds = [];
  let door = null;
  let spikes = []; 

  function loadLevel(levelIndex) {
    const level = levels[levelIndex];
    
    // Platformları yükle
    platforms.length = 0;
    platforms.push(...level.platforms);
    
    // Anahtarları yükle
    diamonds = level.diamonds.map(d => ({ ...d }));
    
    // Kapıyı yükle
    door = level.door;

    // Dikenleri yükle
    spikes = level.spikes ? level.spikes.map(s => ({ ...s })) : [];

    // Oyuncu pozisyonunu sıfırla
    player.x = 100;
    player.y = 460;
    player.velocityY = 0;
    player.isJumping = false;

    player.isMoving = false;
    player.isCrouching = false;
    player.isSticking = false;
    player.stickSide = null;
    player.direction = 'right'; 

    keys.left = false;
    keys.right = false;
    keys.down = false;
    updatePlayerImage();
    
    // Görünmezlik durumunu sıfırla
    player.isInvisible = false;
    player.invisibilityTimer = 0;
    player.invisibilityCooldownTimer = 0;

    // Muhafızları ayarla
    guards = [];
    const guardConfig = level.guardConfig;
    
    if (Array.isArray(guardConfig)) {
      // Çoklu muhafız sistemi (3. seviye)
      guardConfig.forEach(config => {
        guards.push({
          x: config.x,
          y: config.y,
          width: 70,
          height: 80,
          speed: config.speed,
          direction: 1,
          patrolLeft: config.patrolLeft,
          patrolRight: config.patrolRight,
          viewDistance: 120
        });
      });
    } else {
      // Tek muhafız sistemi (1. ve 2. seviye)
      guards.push({
        x: guardConfig.x,
        y: guardConfig.y,
        width: 70,
        height: 80,
        speed: guardConfig.speed,
        direction: 1,
        patrolLeft: guardConfig.patrolLeft,
        patrolRight: guardConfig.patrolRight,
        viewDistance: 120
      });
    }

    console.log(`Level ${levelIndex + 1} yüklendi! Muhafız sayısı: ${guards.length}, Diken sayısı: ${spikes.length}`);
  }

  function checkDiamondCollection() {
    diamonds.forEach(d => {
      if (!d.collected &&
          rectIntersect(player, { x: d.x, y: d.y, width: 30, height: 30 })) {
        d.collected = true;
        console.log("Anahtar toplandı!");
         collectDiamond();
      }
    });
  }

  function checkLevelCompletion() {
    const collected = diamonds.filter(d => d.collected).length;
    const required = levels[currentLevel].requiredDiamonds;
    
    // Seviye tamamlanma kontrolü
    if (collected >= required && rectIntersect(player, door)) {
      currentLevel++;
      if (currentLevel < levels.length) {
        alert(`Level ${currentLevel} tamamlandı! Sonraki levele geçiliyor...`);
        loadLevel(currentLevel);
        openDoor();
      } else {
        alert("🎉 Tebrikler! Tüm seviyeleri tamamladınız! 🎉");
        currentLevel = 0;
        loadLevel(currentLevel);
      }
    }
  }

  function drawUI() {
    // Level bilgisini göster
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    const collected = diamonds.filter(d => d.collected).length;
    const required = levels[currentLevel].requiredDiamonds;
    ctx.fillText(`Level: ${currentLevel + 1} | Anahtar: ${collected}/${required}`, 10, 30);

    // İkinci ve üçüncü seviyede görünmezlik bilgisini göster
    if ((currentLevel === 0 || currentLevel === 1 || currentLevel === 2) && levels[currentLevel].hasInvisibility) {
      ctx.fillStyle = 'cyan';
      ctx.font = '16px Arial';
      
      if (player.isInvisible) {
        const remainingTime = Math.ceil(player.invisibilityTimer / 1000);
        ctx.fillText(`Görünmezlik: ${remainingTime}s`, 10, 60);
      } else if (player.invisibilityCooldownTimer > 0) {
        const cooldownTime = Math.ceil(player.invisibilityCooldownTimer / 1000);
        ctx.fillText(`Görünmezlik Cooldown: ${cooldownTime}s`, 10, 60);
      } else {
        ctx.fillText(`Görünmezlik Hazır! (S tuşu)`, 10, 60);
      }
    }
  }

  // --- Oyun döngüsü ---
  function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (bgLoaded) ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

    handleMovement();
    applyGravity();
    updateInvisibility(); // Görünmezlik güncellemesi
    updatePlayerImage();

    drawPlatforms();
    drawSpikes(); // Dikenleri çiz
    drawDiamonds();    
    drawDoor();        
    drawPlayer();
    drawGuards(); // Çoklu muhafız çizimi
    updateGuards(); // Çoklu muhafız güncellemesi

    checkDiamondCollection(); 
    checkSpikeCollision(); // Diken çarpışma kontrolü
    checkLevelCompletion();
    drawUI(); 
    bgMusic.play();
    requestAnimationFrame(gameLoop);
  }

  // --- Başlat butonu ---
  startBtn.addEventListener('click', () => {
    startScreen.style.display = 'none';
    loadLevel(currentLevel);
    gameLoop();
  });
});