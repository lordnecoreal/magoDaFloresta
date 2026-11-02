export class SistemaCenario {
  static desenhar(ctx, obstaculos, larguraMapa) {
    // 1. FUNDO DO CÉU NOTURNO (Com gradiente)
    const gradCeu = ctx.createLinearGradient(0, 0, 0, 500);
    gradCeu.addColorStop(0, '#050811');
    gradCeu.addColorStop(0.5, '#1e1b4b');
    gradCeu.addColorStop(1, '#0f172a');
    ctx.fillStyle = gradCeu;
    ctx.fillRect(0, 0, larguraMapa, 500);

    // 2. ESTRELAS
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    for (let i = 0; i < 200; i++) {
      const x = (i * 97) % larguraMapa;
      const y = (i * 41) % 250;
      ctx.fillRect(x, y, 2, 2);
    }

    // 3. LUA (Pequena e alta)
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#e0f2fe';
    ctx.beginPath();
    ctx.arc(1150, 70, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // 4. SILHUETAS DE ÁRVORES AO FUNDO
    ctx.fillStyle = 'rgba(30, 27, 75, 0.6)';
    for (let i = 0; i < larguraMapa; i += 200) {
      ctx.beginPath();
      ctx.moveTo(i, 400);
      ctx.lineTo(i + 100, 150);
      ctx.lineTo(i + 200, 400);
      ctx.fill();
    }

    // 5. FUNDO DA FLORESTA
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(0, 250, larguraMapa, 130);

    // 6. OBSTÁCULOS
    obstaculos.forEach(obs => {
      if (obs.tipo === 'arvore') {
        // A segunda árvore (X próximo de 800) vira tronco baixo
        if (obs.x > 750 && obs.x < 850) {
          const alturaTronco = 60;
          const larguraTronco = 40;
          const xTronco = obs.x + obs.largura / 2 - larguraTronco / 2;
          const yTronco = obs.y + 60;

          ctx.fillStyle = '#5c2c16';
          ctx.fillRect(xTronco, yTronco, larguraTronco, alturaTronco);

          ctx.fillStyle = '#78350f';
          ctx.beginPath();
          ctx.ellipse(xTronco + larguraTronco / 2, yTronco, larguraTronco / 2, 10, 0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Árvores normais com copa verde
          ctx.fillStyle = '#5c2c16';
          ctx.fillRect(obs.x + obs.largura / 2 - 12, obs.y + 60, 24, 160);
          ctx.fillStyle = obs.corFolhas || '#14532d';
          ctx.beginPath();
          ctx.arc(obs.x + obs.largura / 2, obs.y + 60, 55, 0, Math.PI * 2);
          ctx.arc(obs.x + obs.largura / 2 - 30, obs.y + 90, 40, 0, Math.PI * 2);
          ctx.arc(obs.x + obs.largura / 2 + 30, obs.y + 90, 40, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (obs.tipo === 'chao') {
        ctx.fillStyle = '#166534';
        ctx.fillRect(obs.x, obs.y, obs.largura, 500 - obs.y);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(obs.x, obs.y, obs.largura, 10);
      } else if (obs.tipo === 'plataforma') {
        ctx.fillStyle = '#854d0e';
        ctx.fillRect(obs.x, obs.y, obs.largura, obs.altura || 20);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(obs.x, obs.y, obs.largura, 6);
      } else if (obs.tipo === 'loja') {
        const tw = 70, th = 60, tx = obs.x, ty = 380 - th;

        ctx.fillStyle = '#78350f';
        ctx.fillRect(tx + 5, ty + 15, 6, th - 15);
        ctx.fillRect(tx + tw - 11, ty + 15, 6, th - 15);

        ctx.fillStyle = '#d4b483';
        ctx.beginPath();
        ctx.moveTo(tx, ty + th);
        ctx.lineTo(tx + tw / 2, ty);
        ctx.lineTo(tx + tw, ty + th);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#c2a172';
        ctx.beginPath();
        ctx.moveTo(tx + tw / 2, ty);
        ctx.lineTo(tx + tw / 2 - 6, ty + th);
        ctx.lineTo(tx + tw / 2 + 6, ty + th);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#291605';
        ctx.beginPath();
        ctx.moveTo(tx + tw / 2 - 12, ty + th);
        ctx.lineTo(tx + tw / 2 - 8, ty + th / 2);
        ctx.lineTo(tx + tw / 2 + 8, ty + th / 2);
        ctx.lineTo(tx + tw / 2 + 12, ty + th);
        ctx.fill();

        ctx.fillStyle = '#fde047';
        ctx.font = 'bold 11px monospace';
        ctx.fillText('⛺ Aperte [X] ou ✨ para o Mercador', tx - 45, ty - 12);
      }
    });
  }

  static desenharGaiola(ctx, gaiola) {
    if (!gaiola) return;

    ctx.fillStyle = '#475569';
    ctx.fillRect(gaiola.x, gaiola.y, gaiola.largura, gaiola.altura);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    for (let i = 0; i < gaiola.largura; i += 15) {
      ctx.beginPath();
      ctx.moveTo(gaiola.x + i, gaiola.y);
      ctx.lineTo(gaiola.x + i, gaiola.y + gaiola.altura);
      ctx.stroke();
    }

    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(gaiola.x + gaiola.largura / 2, gaiola.y + gaiola.altura - 20, 15, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(gaiola.x + gaiola.largura / 2 - 15, gaiola.y + gaiola.altura - 20);
    ctx.lineTo(gaiola.x + gaiola.largura / 2 - 20, gaiola.y + gaiola.altura - 40);
    ctx.lineTo(gaiola.x + gaiola.largura / 2 - 5, gaiola.y + gaiola.altura - 30);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(gaiola.x + gaiola.largura / 2 + 15, gaiola.y + gaiola.altura - 20);
    ctx.lineTo(gaiola.x + gaiola.largura / 2 + 20, gaiola.y + gaiola.altura - 40);
    ctx.lineTo(gaiola.x + gaiola.largura / 2 + 5, gaiola.y + gaiola.altura - 30);
    ctx.fill();
  }
}