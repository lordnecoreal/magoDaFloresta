export class SistemaJogador {
  // 1. Cria o objeto do jogador com os dados iniciais
  static criar(vidasIniciais, magiaAtual, corAtual, tipoMagiaAtual) {
    return {
      x: 60,
      y: 280,
      largura: 36,
      altura: 52,
      vx: 0,
      vy: 0,
      hp: 100,
      maxHp: 100,
      mana: 100,
      maxMana: 100,
      vidas: vidasIniciais,
      maxVidas: vidasIniciais,
      noChao: false,
      direcao: 1,
      tipoMagia: tipoMagiaAtual || 'Chama Arcana (Z)',
      corProj: corAtual || '#ef4444',
      tipoProjetil: magiaAtual || 'fogo',
      projeteis: [],
      animacaoAtaque: 0 // Nova variável para animar o cajado
    };
  }

  // 2. Atualiza a física (movimento, pulo, gravidade, colisão)
  static atualizar(jogador, teclas, dt, obstaculos, audio) {
    // Movimento Horizontal
    if (teclas['ArrowRight'] || teclas['KeyD']) {
      jogador.vx = 220;
      jogador.direcao = 1;
    } else if (teclas['ArrowLeft'] || teclas['KeyA']) {
      jogador.vx = -220;
      jogador.direcao = -1;
    } else {
      jogador.vx = 0;
    }

    // Pulo
    if ((teclas['Space'] || teclas['KeyW']) && jogador.noChao) {
      jogador.vy = -480; // Pulo ajustado para alcançar plataformas
      jogador.noChao = false;
      if (audio) audio.pulo();
    }

    // Gravidade
    jogador.vy += 1100 * dt;
    jogador.x += jogador.vx * dt;
    const proxY = jogador.y + jogador.vy * dt;
    jogador.noChao = false;

    // Colisão com o chão/plataformas
    obstaculos.forEach(obs => {
      if (obs.tipo === 'arvore' || obs.tipo === 'loja' || obs.tipo === 'gaiola') return;
      
      if (
        jogador.x + jogador.largura > obs.x &&
        jogador.x < obs.x + obs.largura &&
        jogador.y + jogador.altura <= obs.y &&
        proxY + jogador.altura >= obs.y
      ) {
        jogador.y = obs.y - jogador.altura;
        jogador.vy = 0;
        jogador.noChao = true;
      }
    });

    if (!jogador.noChao) jogador.y = proxY;

    // Atualiza projéteis (apenas a posição)
    jogador.projeteis.forEach(p => p.x += p.vx * dt);

    // Reduz o tempo da animação de ataque
    if (jogador.animacaoAtaque > 0) {
      jogador.animacaoAtaque -= dt * 5; // A animação dura cerca de 0.2 segundos
      if (jogador.animacaoAtaque < 0) jogador.animacaoAtaque = 0;
    }
  }

  // 3. Desenha o mago na tela
  static desenhar(ctx, jogador, animacaoFrame, tempoInvulneravel) {
    if (!jogador) return;

    if (tempoInvulneravel > 0 && Math.floor(tempoInvulneravel * 10) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }

    const balocoPernas = Math.sin(animacaoFrame) * 4;

    // Corpo e capa
    ctx.fillStyle = '#7c3aed';
    ctx.fillRect(jogador.x + 4, jogador.y + 18, 28, 28);
    
    // Pernas
    ctx.fillStyle = '#3b0764';
    ctx.fillRect(jogador.x + 6, jogador.y + 46, 10, 6 + (jogador.vx !== 0 ? balocoPernas : 0));
    ctx.fillRect(jogador.x + 20, jogador.y + 46, 10, 6 - (jogador.vx !== 0 ? balocoPernas : 0));

    // Rosto
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(jogador.x + 8, jogador.y + 10, 20, 14);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(jogador.x + 10, jogador.y + 18, 16, 8);

    // Olho
    ctx.fillStyle = '#0f172a';
    const olhoX = jogador.direcao > 0 ? jogador.x + 20 : jogador.x + 10;
    ctx.fillRect(olhoX, jogador.y + 13, 3, 4);

    // Chapéu Reto (Não inclinado)
    ctx.fillStyle = '#6d28d9';
    ctx.beginPath();
    ctx.moveTo(jogador.x + 2, jogador.y + 10);
    ctx.lineTo(jogador.x + 34, jogador.y + 10);
    ctx.lineTo(jogador.x + 28, jogador.y - 16); // Ponta do chapéu
    ctx.lineTo(jogador.x + 8, jogador.y - 16);
    ctx.fill();

    // Mãos do Mago
    ctx.fillStyle = '#fef08a'; // Cor da pele
    // Mão esquerda (atrás)
    ctx.beginPath();
    ctx.arc(jogador.direcao > 0 ? jogador.x + 2 : jogador.x + 34, jogador.y + 28, 4, 0, Math.PI * 2);
    ctx.fill();
    // Mão direita (na frente, segurando o cajado)
    ctx.beginPath();
    ctx.arc(jogador.direcao > 0 ? jogador.x + 34 : jogador.x + 2, jogador.y + 28, 4, 0, Math.PI * 2);
    ctx.fill();

    // Cajado Dinâmico
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 4;
    ctx.beginPath();
    
    const cajadoBaseX = jogador.direcao > 0 ? jogador.x + 32 : jogador.x + 4;
    const cajadoBaseY = jogador.y + 40;

    // Se estiver atacando, o cajado se inclina para frente
    let pontaX = jogador.direcao > 0 ? jogador.x + 44 : jogador.x - 8;
    let pontaY = jogador.y + 5;

    if (jogador.animacaoAtaque > 0) {
      pontaX += jogador.direcao > 0 ? 10 : -10;
      pontaY -= 5;
    }

    ctx.moveTo(cajadoBaseX, cajadoBaseY);
    ctx.lineTo(pontaX, pontaY);
    ctx.stroke();
    
    // Orbe do Cajado
    ctx.fillStyle = jogador.corProj;
    ctx.beginPath();
    ctx.arc(pontaX, pontaY, 6, 0, Math.PI * 2);
    ctx.fill();

    // Projéteis
    jogador.projeteis.forEach(p => {
      ctx.fillStyle = p.cor;
      ctx.beginPath();
      ctx.arc(p.x + 9, p.y + 6, 8, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalAlpha = 1.0;
  }
}