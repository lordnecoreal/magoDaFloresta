export class SistemaCenario {
  static desenhar(ctx, obstaculos, larguraMapa) {
    // Fundo do céu
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, larguraMapa, 500);
    
    // Fundo da floresta (roxo escuro)
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(0, 200, larguraMapa, 180);

    obstaculos.forEach(obs => {
      if (obs.tipo === 'arvore') {
        ctx.fillStyle = '#5c2c16';
        ctx.fillRect(obs.x + obs.largura / 2 - 12, obs.y + 60, 24, 160);
        ctx.fillStyle = obs.corFolhas || '#14532d';
        ctx.beginPath();
        ctx.arc(obs.x + obs.largura / 2, obs.y + 60, 55, 0, Math.PI * 2);
        ctx.arc(obs.x + obs.largura / 2 - 30, obs.y + 90, 40, 0, Math.PI * 2);
        ctx.arc(obs.x + obs.largura / 2 + 30, obs.y + 90, 40, 0, Math.PI * 2);
        ctx.fill();
      } else if (obs.tipo === 'chao') {
        ctx.fillStyle = '#166534';
        ctx.fillRect(obs.x, obs.y, obs.largura, obs.altura);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(obs.x, obs.y, obs.largura, 10);
      } else if (obs.tipo === 'plataforma') {
        // O FIX DO BUG INVISÍVEL: Desenhando a plataforma novamente
        ctx.fillStyle = '#854d0e'; // Cor de madeira/terra
        ctx.fillRect(obs.x, obs.y, obs.largura, obs.altura || 20);
        ctx.fillStyle = '#22c55e'; // Grama em cima
        ctx.fillRect(obs.x, obs.y, obs.largura, 6);
      } else if (obs.tipo === 'cano') {
        ctx.fillStyle = '#15803d';
        ctx.fillRect(obs.x, obs.y, obs.largura, obs.altura);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(obs.x - 4, obs.y, obs.largura + 8, 14);
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
    for(let i=0; i<gaiola.largura; i+=15) {
      ctx.beginPath();
      ctx.moveTo(gaiola.x + i, gaiola.y);
      ctx.lineTo(gaiola.x + i, gaiola.y + gaiola.altura);
      ctx.stroke();
    }
    
    // Gatinho
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(gaiola.x + gaiola.largura/2, gaiola.y + gaiola.altura - 20, 15, 0, Math.PI * 2);
    ctx.fill();
    
    // Orelhas
    ctx.beginPath();
    ctx.moveTo(gaiola.x + gaiola.largura/2 - 15, gaiola.y + gaiola.altura - 20);
    ctx.lineTo(gaiola.x + gaiola.largura/2 - 20, gaiola.y + gaiola.altura - 40);
    ctx.lineTo(gaiola.x + gaiola.largura/2 - 5, gaiola.y + gaiola.altura - 30);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(gaiola.x + gaiola.largura/2 + 15, gaiola.y + gaiola.altura - 20);
    ctx.lineTo(gaiola.x + gaiola.largura/2 + 20, gaiola.y + gaiola.altura - 40);
    ctx.lineTo(gaiola.x + gaiola.largura/2 + 5, gaiola.y + gaiola.altura - 30);
    ctx.fill();
  }
}