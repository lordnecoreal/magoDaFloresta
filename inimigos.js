export class SistemaInimigos {
  static desenhar(ctx, ini) {
    if (ini.estado === 'morto') return;

    // DESENHO DO GATINHO (Fase Final)
    if (ini.tipo === 'gatinho') {
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath(); ctx.arc(ini.x + 20, ini.y + 20, 15, 0, Math.PI * 2); ctx.fill();
      // Orelhas
      ctx.beginPath(); ctx.moveTo(ini.x + 10, ini.y + 10); ctx.lineTo(ini.x + 5, ini.y - 5); ctx.lineTo(ini.x + 20, ini.y + 5); ctx.fill();
      ctx.beginPath(); ctx.moveTo(ini.x + 30, ini.y + 10); ctx.lineTo(ini.x + 35, ini.y - 5); ctx.lineTo(ini.x + 20, ini.y + 5); ctx.fill();
      // Olhos
      ctx.fillStyle = '#000'; ctx.fillRect(ini.x + 14, ini.y + 16, 3, 3); ctx.fillRect(ini.x + 23, ini.y + 16, 3, 3);
      return;
    }

    // DESENHO DOS INIMIGOS NORMAIS
    if (!ini.ehBoss) {
      ctx.fillStyle = '#f5f5f4'; 
      ctx.fillRect(ini.x + 10, ini.y + 20, 26, 26);
      
      if (ini.tipo === 'cogumelo') {
        ctx.fillStyle = '#dc2626'; ctx.beginPath();
        ctx.arc(ini.x + 23, ini.y + 20, 23, Math.PI, 0, false); ctx.fill();
      } else if (ini.tipo === 'sapo') {
        ctx.fillStyle = '#22c55e'; ctx.beginPath();
        ctx.ellipse(ini.x + 23, ini.y + 25, 20, 15, 0, 0, Math.PI * 2); ctx.fill();
      } else if (ini.tipo === 'fantasma') {
        ctx.fillStyle = '#a855f7'; ctx.beginPath();
        ctx.arc(ini.x + 23, ini.y + 15, 20, Math.PI, 0, false); 
        ctx.lineTo(ini.x + 43, ini.y + 40); ctx.lineTo(ini.x + 3, ini.y + 40); ctx.fill();
      } else if (ini.tipo === 'esqueleto') {
        ctx.fillStyle = '#e2e8f0'; ctx.beginPath();
        ctx.arc(ini.x + 23, ini.y + 15, 18, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = '#000'; 
      ctx.fillRect(ini.x + 15, ini.y + 22, 4, 6); 
      ctx.fillRect(ini.x + 27, ini.y + 22, 4, 6);
    } 
    // DESENHO DOS CHEFES ÚNICOS
    else {
      const bx = ini.x, by = ini.y;
      
      if (ini.tipo === 'goblin') {
        ctx.fillStyle = '#65a30d'; ctx.fillRect(bx + 20, by + 40, 80, 70);
        ctx.fillStyle = '#4d7c0f'; ctx.fillRect(bx + 30, by + 10, 60, 45);
        ctx.beginPath(); ctx.moveTo(bx + 30, by + 20); ctx.lineTo(bx, by + 10); ctx.lineTo(bx + 30, by + 40); ctx.fill();
        ctx.beginPath(); ctx.moveTo(bx + 90, by + 20); ctx.lineTo(bx + 120, by + 10); ctx.lineTo(bx + 90, by + 40); ctx.fill();
      } else if (ini.tipo === 'sapo_boss') {
        ctx.fillStyle = '#166534'; ctx.fillRect(bx + 10, by + 40, 100, 70);
        ctx.fillStyle = '#22c55e'; ctx.beginPath(); ctx.ellipse(bx + 60, by + 30, 45, 35, 0, 0, Math.PI * 2); ctx.fill();
      } else if (ini.tipo === 'cavaleiro') {
        ctx.fillStyle = '#64748b'; ctx.fillRect(bx + 20, by + 30, 80, 80);
        ctx.fillStyle = '#a855f7'; ctx.fillRect(bx + 10, by + 30, 100, 80);
        ctx.fillStyle = '#475569'; ctx.fillRect(bx + 30, by + 10, 60, 40);
      } else if (ini.tipo === 'imperatriz') {
        ctx.fillStyle = '#991b1b'; ctx.fillRect(bx + 20, by + 40, 80, 70);
        ctx.fillStyle = '#7f1d1d'; ctx.fillRect(bx + 30, by + 10, 60, 45);
        ctx.fillStyle = '#450a0a'; ctx.beginPath();
        ctx.moveTo(bx + 60, by + 20); ctx.lineTo(bx - 30, by - 20); ctx.lineTo(bx - 10, by + 40); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(bx + 60, by + 20); ctx.lineTo(bx + 150, by - 20); ctx.lineTo(bx + 130, by + 40); ctx.fill();
        ctx.fillStyle = '#fde047'; ctx.beginPath();
        ctx.moveTo(bx + 35, by + 10); ctx.lineTo(bx + 20, by - 20); ctx.lineTo(bx + 45, by + 5); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(bx + 85, by + 10); ctx.lineTo(bx + 100, by - 20); ctx.lineTo(bx + 75, by + 5); ctx.fill();
      }
      
      ctx.fillStyle = '#fff'; 
      ctx.fillRect(bx + 40, by + 20, 12, 8); ctx.fillRect(bx + 68, by + 20, 12, 8);
      ctx.fillStyle = '#000'; 
      ctx.fillRect(bx + 46, by + 22, 4, 4); ctx.fillRect(bx + 74, by + 22, 4, 4);
    }

    // DESENHO DE STATUS (Gelo, Fogo, Veneno, Trovão)
    if (ini.congelado > 0) {
      ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.fillRect(ini.x - 5, ini.y - 10, (ini.largura || 46) + 10, (ini.altura || 46) + 20);
      ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2;
      ctx.strokeRect(ini.x - 5, ini.y - 10, (ini.largura || 46) + 10, (ini.altura || 46) + 20);
    }

    if (ini.queimando > 0) {
      const bx = ini.x + (ini.largura || 46) / 2; const by = ini.y - 30; 
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.roundRect(bx - 15, by - 15, 30, 25, 5); ctx.fill();
      ctx.beginPath(); ctx.moveTo(bx - 5, by + 10); ctx.lineTo(bx, by + 18); ctx.lineTo(bx + 5, by + 10); ctx.fill();
      ctx.fillStyle = '#000'; ctx.font = '16px sans-serif'; ctx.fillText('🔥', bx - 8, by + 3);
    }

    if (ini.envenenado > 0) {
      const bx = ini.x + (ini.largura || 46) / 2;
      const by = ini.y - (ini.queimando > 0 ? 60 : 30); 
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.roundRect(bx - 15, by - 15, 30, 25, 5); ctx.fill();
      ctx.beginPath(); ctx.moveTo(bx - 5, by + 10); ctx.lineTo(bx, by + 18); ctx.lineTo(bx + 5, by + 10); ctx.fill();
      ctx.fillStyle = '#000'; ctx.font = '16px sans-serif'; ctx.fillText('💀', bx - 8, by + 3);
    }

    if (ini.eletrocutado > 0) {
      ctx.strokeStyle = 'rgba(253, 224, 71, 0.8)'; ctx.lineWidth = 2;
      for(let i=0; i<3; i++) {
        ctx.beginPath();
        ctx.moveTo(ini.x + Math.random() * (ini.largura||46), ini.y + Math.random() * (ini.altura||46));
        ctx.lineTo(ini.x + Math.random() * (ini.largura||46), ini.y + Math.random() * (ini.altura||46));
        ctx.stroke();
      }
    }

    // Barra de Vida
    if (ini.hp < ini.maxHp && ini.tipo !== 'gatinho') {
      const larguraBarra = ini.largura || 40;
      const porcentagemHp = Math.max(0, ini.hp / ini.maxHp);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(ini.x, ini.y - 10, larguraBarra, 5);
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(ini.x, ini.y - 10, larguraBarra * porcentagemHp, 5);
    }
  }

  static receberDano(ini, projetil, audio) {
    let dano = 0;
    if (projetil.tipo === 'fogo') dano = 15;
    else if (projetil.tipo === 'gelo') dano = 25;
    else if (projetil.tipo === 'veneno') dano = 30;
    else if (projetil.tipo === 'trovao') dano = 60; 
    
    if (ini.fraqueza === projetil.tipo) dano += 10;

    ini.hp -= dano;

    // Efeitos (Chance de aplicar status)
    if (projetil.tipo === 'fogo' && Math.random() < 0.3) ini.queimando = 7;
    if (projetil.tipo === 'gelo' && Math.random() < 0.3) ini.congelado = 7;
    if (projetil.tipo === 'veneno' && Math.random() < 0.3) ini.envenenado = 7;
    if (projetil.tipo === 'trovao' && Math.random() < 0.4) ini.eletrocutado = 5; // Lentidão

    if (ini.hp <= 0) {
      ini.estado = 'morto';
      if (audio) { if (ini.ehBoss) audio.chefeDerrota(); else audio.acertoInimigo(); }
      return true;
    } else {
      if (audio) { if (ini.ehBoss) audio.chefeDano(); else audio.acertoInimigo(); }
      return false;
    }
  }

  static atualizarStatus(ini, dt, audio) {
    if (ini.queimando && ini.queimando > 0) {
      ini.queimando -= dt;
      ini.hp -= 2 * dt;
      if (ini.queimando <= 0) ini.queimando = 0;
    }
    if (ini.envenenado && ini.envenenado > 0) {
      ini.envenenado -= dt;
      ini.hp -= 3 * dt;
      if (ini.envenenado <= 0) ini.envenenado = 0;
    }
    
    // Se o dano por status matar o inimigo, ele morre aqui
    if (ini.hp <= 0 && ini.estado !== 'morto') {
       ini.estado = 'morto';
       if (audio) { if (ini.ehBoss) audio.chefeDerrota(); else audio.acertoInimigo(); }
       return false; 
    }

    if (ini.congelado && ini.congelado > 0) {
      ini.congelado -= dt;
      if (ini.congelado < 0) ini.congelado = 0;
      return false; // Congelado = parado
    }
    
    if (ini.eletrocutado && ini.eletrocutado > 0) {
      ini.eletrocutado -= dt;
      if (ini.eletrocutado < 0) ini.eletrocutado = 0;
      ini.velocidadeBase = ini.velocidadeBase || ini.velocidade;
      ini.velocidade = ini.velocidadeBase * 0.5; // Lentidão de 50%
      return true;
    } else {
      if (ini.velocidadeBase) ini.velocidade = ini.velocidadeBase; // Volta ao normal
    }
    
    return true;
  }
}