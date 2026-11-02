export class SistemaMapa {
  constructor(onSelecionarFase, onAbrirLoja, canvas, ctx, audio) {
    this.onSelecionarFase = onSelecionarFase;
    this.onAbrirLoja = onAbrirLoja;
    this.canvas = canvas;
    this.ctx = ctx;
    this.audio = audio;
    
    this.mundoAtual = parseInt(localStorage.getItem('magoDaFloresta_mundo')) || 1;
    this.maxMundos = 4;
    
    this.temasMapa = {
      1: { nome: "Floresta Mágica", corCeu: ['#1e1b4b', '#4c1d95'], corChao: ['#166534', '#14532d', '#000000'], corMontanha: '#312e81', corArvore: '#065f46', temLua: true, temEstrelas: true },
      2: { nome: "Mato da Cachoeira", corCeu: ['#052e16', '#166534'], corChao: ['#064e3b', '#022c22', '#000000'], corMontanha: '#064e3b', corArvore: '#15803d', temLua: false, temEstrelas: false },
      3: { nome: "Cemitério da Capela", corCeu: ['#171717', '#450a0a'], corChao: ['#27272a', '#18181b', '#000000'], corMontanha: '#3f3f46', corArvore: '#475569', temLua: true, temEstrelas: true },
      4: { nome: "Masmorra da Capela", corCeu: ['#000000', '#1e1b4b'], corChao: ['#3f3f46', '#18181b', '#000000'], corMontanha: '#27272a', corArvore: '#27272a', temLua: false, temEstrelas: false }
    };
    
    this.jogadorMapa = { x: 100, y: 300, largura: 30, altura: 40, vx: 0, vy: 0, noChao: true, direcao: 1 };
    this.teclas = {};
    this.chao = { y: 380, altura: 120 };
    
    const progressoSalvo = JSON.parse(localStorage.getItem('magoDaFloresta_progresso')) || {};
    this.gerarPlacas(progressoSalvo);

    this.loja = { x: 1100, y: 300, largura: 80, altura: 80 };
    this.portalAvancar = { x: 1300, y: 260, largura: 60, altura: 120, ativo: false };
    
    // NOVO: Portal para voltar de mundo
    this.portalVoltar = { x: 50, y: 260, largura: 60, altura: 120, ativo: true };
    
    this.animacaoVitoria = 0;
    this.comemorando = false;
    this.pulosRestantes = 0;
    
    this.escalaMapa = 1;
    this.offsetX = 0;
    this.offsetY = 0;
    this.lojaAberta = false;

    this.atualizarPortal();
    this.configurarControles();
  }

  gerarPlacas(progresso) {
    const m = this.mundoAtual;
    this.placas = [
      { mundo: m, fase: 1, x: 250, y: 340, desbloqueada: true, vencida: progresso[`${m}-1`] || false },
      { mundo: m, fase: 2, x: 450, y: 340, desbloqueada: progresso[`${m}-1`] || false, vencida: progresso[`${m}-2`] || false },
      { mundo: m, fase: 3, x: 650, y: 340, desbloqueada: progresso[`${m}-2`] || false, vencida: progresso[`${m}-3`] || false },
      { mundo: m, fase: 4, x: 850, y: 340, desbloqueada: progresso[`${m}-3`] || false, vencida: progresso[`${m}-4`] || false }
    ];
  }

  atualizarPortal() {
    const todasVencidas = this.placas.every(p => p.vencida);
    this.portalAvancar.ativo = todasVencidas && this.mundoAtual < this.maxMundos;
  }

  configurarControles() {
    window.addEventListener('keydown', e => {
      this.teclas[e.code] = true;
      if (e.code === 'Enter' && !this.comemorando && !this.lojaAberta) this.interagir();
    });
    
    window.addEventListener('keyup', e => this.teclas[e.code] = false);

    this.canvas.addEventListener('pointerdown', (e) => {
      if (!this.rodando || this.comemorando || this.lojaAberta) return;
      
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left) / this.escalaMapa - this.offsetX;
      const mouseY = (e.clientY - rect.top) / this.escalaMapa - this.offsetY;

      this.placas.forEach(placa => {
        if (mouseX >= placa.x - 20 && mouseX <= placa.x + 20 && mouseY >= placa.y - 40 && mouseY <= placa.y) {
          const dist = Math.abs(this.jogadorMapa.x - placa.x);
          if (dist < 60 && placa.desbloqueada) {
            this.rodando = false;
            this.onSelecionarFase(placa.mundo, placa.fase);
          }
        }
      });

      if (mouseX >= this.loja.x && mouseX <= this.loja.x + this.loja.largura && mouseY >= this.loja.y && mouseY <= this.loja.y + this.loja.altura) {
        const dist = Math.abs(this.jogadorMapa.x - (this.loja.x + this.loja.largura / 2));
        if (dist < 80) this.abrirLoja();
      }

      // Clique no Portal Avançar
      if (this.portalAvancar.ativo && mouseX >= this.portalAvancar.x && mouseX <= this.portalAvancar.x + this.portalAvancar.largura && mouseY >= this.portalAvancar.y && mouseY <= this.portalAvancar.y + this.portalAvancar.altura) {
        const dist = Math.abs(this.jogadorMapa.x - (this.portalAvancar.x + this.portalAvancar.largura / 2));
        if (dist < 80) this.irParaProximoMundo();
      }

      // Clique no Portal Voltar
      if (mouseX >= this.portalVoltar.x && mouseX <= this.portalVoltar.x + this.portalVoltar.largura && mouseY >= this.portalVoltar.y && mouseY <= this.portalVoltar.y + this.portalVoltar.altura) {
        const dist = Math.abs(this.jogadorMapa.x - (this.portalVoltar.x + this.portalVoltar.largura / 2));
        if (dist < 80) this.abrirMenuMundos();
      }
    });
  }

  interagir() {
    const jog = this.jogadorMapa;
    let interagiu = false;

    this.placas.forEach(placa => {
      const dist = Math.abs(jog.x - placa.x);
      if (dist < 50 && placa.desbloqueada) {
        this.rodando = false;
        this.onSelecionarFase(placa.mundo, placa.fase);
        interagiu = true;
      }
    });

    if (!interagiu) {
      const distLoja = Math.abs(jog.x - (this.loja.x + this.loja.largura / 2));
      if (distLoja < 80) { this.abrirLoja(); interagiu = true; }
    }

    if (!interagiu && this.portalAvancar.ativo) {
      const distPortal = Math.abs(jog.x - (this.portalAvancar.x + this.portalAvancar.largura / 2));
      if (distPortal < 80) { this.irParaProximoMundo(); interagiu = true; }
    }

    // Interagir com o Portal de Voltar
    if (!interagiu) {
      const distPortalVoltar = Math.abs(jog.x - (this.portalVoltar.x + this.portalVoltar.largura / 2));
      if (distPortalVoltar < 80) { this.abrirMenuMundos(); interagiu = true; }
    }
  }

  abrirMenuMundos() {
    const input = prompt("Digite o número do mundo que deseja viajar (1 a 4):\n(Nota: Mundos bloqueados não podem ser acessados)");
    if (!input) return;
    
    const mundoDestino = parseInt(input);
    if (isNaN(mundoDestino) || mundoDestino < 1 || mundoDestino > this.maxMundos) {
      alert("Mundo inválido!");
      return;
    }

    // Verifica se o jogador já chegou nesse mundo alguma vez
    const mundoMaximoSalvo = parseInt(localStorage.getItem('magoDaFloresta_mundo')) || 1;
    if (mundoDestino > mundoMaximoSalvo) {
      alert("Você ainda não desbloqueou este mundo! Continue avançando.");
      return;
    }

    this.mundoAtual = mundoDestino;
    localStorage.setItem('magoDaFloresta_mundo', this.mundoAtual);
    
    const progressoSalvo = JSON.parse(localStorage.getItem('magoDaFloresta_progresso')) || {};
    this.gerarPlacas(progressoSalvo);
    
    this.jogadorMapa.x = 150; // Joga ele um pouco pra frente do portal
    this.jogadorMapa.y = this.chao.y - this.jogadorMapa.altura;
    
    this.atualizarPortal();
    if (this.audio) this.audio.tocarMusicaVitoria();
  }

  abrirLoja() {
    this.lojaAberta = true;
    this.rodando = false;
    this.onAbrirLoja();
  }

  irParaProximoMundo() {
    if (this.audio) this.audio.tocarMusicaVitoria();
    
    this.mundoAtual++;
    if (this.mundoAtual > this.maxMundos) this.mundoAtual = this.maxMundos;
    
    localStorage.setItem('magoDaFloresta_mundo', this.mundoAtual);
    
    const progressoSalvo = JSON.parse(localStorage.getItem('magoDaFloresta_progresso')) || {};
    this.gerarPlacas(progressoSalvo);
    
    this.jogadorMapa.x = 100;
    this.jogadorMapa.y = this.chao.y - this.jogadorMapa.altura;
    
    this.atualizarPortal();
    
    alert(`🎉 BEM-VINDO AO MUNDO ${this.mundoAtual}!\n\n${this.temasMapa[this.mundoAtual].nome}`);
  }

  desenharMapa(ctx, canvas, isMobile, vitoria = false) {
    this.ctx = ctx;
    this.canvas = canvas;
    this.rodando = true;
    this.tempoAnterior = performance.now();
    
    if (this.audio) {
      if (typeof this.audio.tocarMusicaMapa === 'function') this.audio.tocarMusicaMapa();
      else if (typeof this.audio.iniciarMusicaFundo === 'function') this.audio.iniciarMusicaFundo();
    }

    if (vitoria) { 
      this.comemorando = true; 
      this.animacaoVitoria = 0; 
      this.pulosRestantes = 5;
      this.jogadorMapa.y = this.chao.y - this.jogadorMapa.altura;
    } else {
      this.comemorando = false;
      this.pulosRestantes = 0;
    }

    this.atualizarPortal();

    const loop = (tempoAtual) => {
      if (!this.rodando) return;
      const dt = Math.min((tempoAtual - this.tempoAnterior) / 1000, 0.1);
      this.tempoAnterior = tempoAtual;

      this.atualizarMapa(dt);
      this.renderizarMapa();

      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  pararMapa() { this.rodando = false; }

  atualizarMapa(dt) {
    const jog = this.jogadorMapa;
    this.animacaoVitoria += dt * 10;

    if (this.comemorando) {
      if (this.pulosRestantes > 0) {
        if (jog.y >= this.chao.y - jog.altura) {
          jog.vy = -350;
          this.pulosRestantes--;
        }
        jog.vy += 1200 * dt;
        jog.y += jog.vy * dt;
        if (jog.y > this.chao.y - jog.altura) {
          jog.y = this.chao.y - jog.altura;
          jog.vy = 0;
        }
      } else {
        this.comemorando = false;
      }
      return;
    }

    if (this.teclas['ArrowRight'] || this.teclas['KeyD']) { jog.vx = 300; jog.direcao = 1; } 
    else if (this.teclas['ArrowLeft'] || this.teclas['KeyA']) { jog.vx = -300; jog.direcao = -1; } 
    else { jog.vx = 0; }

    jog.x += jog.vx * dt;
    jog.vy += 1200 * dt;
    jog.y += jog.vy * dt;

    if (jog.y > this.chao.y - jog.altura) {
      jog.y = this.chao.y - jog.altura;
      jog.vy = 0;
    }

    if (jog.x < 0) jog.x = 0;
    if (jog.x > 1400 - jog.largura) jog.x = 1400 - jog.largura;
  }

  desenharPortal(ctx, p, cor1, cor2, texto) {
    // Desenha a moldura de pedra/madeira
    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.moveTo(p.x, p.y + p.altura);
    ctx.lineTo(p.x, p.y + 20);
    ctx.quadraticCurveTo(p.x + p.largura / 2, p.y - 20, p.x + p.largura, p.y + 20);
    ctx.lineTo(p.x + p.largura, p.y + p.altura);
    ctx.lineTo(p.x + p.largura - 10, p.y + p.altura);
    ctx.lineTo(p.x + p.largura - 10, p.y + 20);
    ctx.quadraticCurveTo(p.x + p.largura / 2, p.y - 10, p.x + 10, p.y + 20);
    ctx.lineTo(p.x + 10, p.y + p.altura);
    ctx.fill();

    // Desenha o vórtice mágico interno
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(p.x + 10, p.y + p.altura);
    ctx.lineTo(p.x + 10, p.y + 20);
    ctx.quadraticCurveTo(p.x + p.largura / 2, p.y - 10, p.x + p.largura - 10, p.y + 20);
    ctx.lineTo(p.x + p.largura - 10, p.y + p.altura);
    ctx.clip();

    ctx.fillStyle = cor1;
    ctx.fillRect(p.x, p.y, p.largura, p.altura);
    
    // Espiral do portal
    ctx.strokeStyle = cor2;
    ctx.lineWidth = 3;
    ctx.beginPath();
    const cx = p.x + p.largura / 2;
    const cy = p.y + p.altura / 2;
    for (let i = 0; i < Math.PI * 6; i += 0.1) {
      const r = (i / (Math.PI * 6)) * 40;
      const x = cx + Math.cos(i + this.animacaoVitoria) * r;
      const y = cy + Math.sin(i + this.animacaoVitoria) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();

    // Texto do portal
    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 12px "Courier New"';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 5;
    ctx.fillText(texto, p.x + p.largura / 2, p.y - 15);
    ctx.shadowBlur = 0;
  }

  renderizarMapa() {
    const ctx = this.ctx;
    const canvas = this.canvas;
    const tema = this.temasMapa[this.mundoAtual];
    const larguraTela = canvas.width;
    const alturaTela = canvas.height;

    ctx.fillStyle = tema.corCeu[0];
    ctx.fillRect(0, 0, larguraTela, alturaTela);

    const escalaX = larguraTela / 1400;
    const escalaY = alturaTela / 500;
    const escala = Math.max(escalaX, escalaY);

    this.escalaMapa = escala;

    let cameraX = (this.jogadorMapa.x + 15) * escala - (larguraTela / 2);
    const larguraMapaEscalada = 1400 * escala;

    if (larguraMapaEscalada < larguraTela) {
      cameraX = (larguraTela - larguraMapaEscalada) / 2;
    } else {
      cameraX = Math.max(0, Math.min(cameraX, larguraMapaEscalada - larguraTela));
    }

    this.offsetX = -cameraX;
    this.offsetY = (alturaTela - 500 * escala) / 2;

    ctx.save();
    ctx.translate(this.offsetX, this.offsetY);
    ctx.scale(escala, escala);

    const gradCeu = ctx.createLinearGradient(0, 0, 0, 400);
    gradCeu.addColorStop(0, tema.corCeu[0]); 
    gradCeu.addColorStop(1, tema.corCeu[1]);
    ctx.fillStyle = gradCeu; 
    ctx.fillRect(0, 0, 1400, 500);

    if (tema.temEstrelas) {
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      for (let i = 0; i < 50; i++) { ctx.fillRect((i * 73) % 1400, (i * 37) % 350, 2, 2); }
    }

    if (tema.temLua) {
      ctx.shadowColor = '#fde047'; ctx.shadowBlur = 50;
      ctx.fillStyle = '#fef08a'; ctx.beginPath(); ctx.arc(1200, 100, 40, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
    }

    ctx.fillStyle = tema.corMontanha; 
    ctx.beginPath(); ctx.moveTo(0, 400); ctx.lineTo(200, 200); ctx.lineTo(400, 400); ctx.fill();
    ctx.beginPath(); ctx.moveTo(300, 400); ctx.lineTo(600, 250); ctx.lineTo(900, 400); ctx.fill();
    ctx.beginPath(); ctx.moveTo(800, 400); ctx.lineTo(1100, 150); ctx.lineTo(1400, 400); ctx.fill();

    const desenharArvore = (x, y, raio) => {
      ctx.fillStyle = '#451a03'; ctx.fillRect(x - 10, y, 20, 100);
      ctx.fillStyle = tema.corArvore; ctx.shadowColor = '#000'; ctx.shadowBlur = 15;
      ctx.beginPath(); ctx.arc(x, y, raio, 0, Math.PI * 2); ctx.arc(x - raio/2, y + raio/2, raio*0.7, 0, Math.PI * 2); ctx.arc(x + raio/2, y + raio/2, raio*0.7, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
    };
    
    if (this.mundoAtual === 3 || this.mundoAtual === 4) {
      ctx.fillStyle = '#475569';
      for (let x = 200; x < 1400; x += 300) {
        ctx.fillRect(x, 250, 20, 130);
        ctx.fillRect(x - 20, 280, 60, 20);
      }
    } else {
      desenharArvore(300, 250, 60); desenharArvore(800, 280, 80); desenharArvore(1000, 320, 50);
    }

    const gradChao = ctx.createLinearGradient(0, 380, 0, 500);
    gradChao.addColorStop(0, tema.corChao[0]); 
    gradChao.addColorStop(0.2, tema.corChao[1]); 
    gradChao.addColorStop(1, tema.corChao[2]);
    ctx.fillStyle = gradChao; ctx.fillRect(0, 380, 1400, 120);

    ctx.fillStyle = '#22c55e';
    for (let x = 0; x < 1400; x += 20) {
      ctx.beginPath(); ctx.moveTo(x, 380); ctx.lineTo(x + 5, 370); ctx.lineTo(x + 10, 380); ctx.fill();
    }

    // Desenha os Portais
    this.desenharPortal(ctx, this.portalVoltar, '#1e293b', '#38bdf8', '⬅ Voltar Mundo');
    if (this.portalAvancar.ativo) {
      this.desenharPortal(ctx, this.portalAvancar, '#4c1d95', '#a855f7', 'Avançar ➡');
    }

    // Placas
    this.placas.forEach((p) => {
      ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(p.x + 12, p.y - 5, 10, 45);
      ctx.fillStyle = '#78350f'; ctx.fillRect(p.x + 10, p.y - 10, 10, 50);
      
      if (p.vencida) {
        ctx.fillStyle = '#8b5cf6'; ctx.strokeStyle = '#fde047'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.roundRect(p.x - 15, p.y - 40, 60, 30, 5); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = '#fde047'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(p.x + 5, p.y - 15); ctx.lineTo(p.x + 20, p.y - 35); ctx.stroke();
        ctx.fillStyle = '#fef08a'; ctx.beginPath(); ctx.arc(p.x + 20, p.y - 35, 6, 0, Math.PI * 2); ctx.fill();
      } else if (p.desbloqueada) {
        const gradPlaca = ctx.createLinearGradient(0, p.y - 40, 0, p.y - 10);
        gradPlaca.addColorStop(0, '#fde047'); gradPlaca.addColorStop(1, '#d97706');
        ctx.fillStyle = gradPlaca; ctx.strokeStyle = '#78350f'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.roundRect(p.x - 15, p.y - 40, 60, 30, 5); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#000'; ctx.font = 'bold 16px "Courier New"'; ctx.textAlign = 'center';
        ctx.fillText(`${p.mundo}-${p.fase}`, p.x + 15, p.y - 18);
      } else {
        ctx.fillStyle = '#475569'; ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.roundRect(p.x - 15, p.y - 40, 60, 30, 5); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#94a3b8'; ctx.font = 'bold 16px "Courier New"'; ctx.textAlign = 'center';
        ctx.fillText('🔒', p.x + 15, p.y - 18);
      }
    });

    // Loja
    const l = this.loja;
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.beginPath(); ctx.ellipse(l.x + 40, l.y + 80, 50, 10, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#991b1b'; ctx.beginPath(); ctx.moveTo(l.x - 20, l.y); ctx.lineTo(l.x + l.largura / 2, l.y - 50); ctx.lineTo(l.x + l.largura + 20, l.y); ctx.fill();
    ctx.strokeStyle = '#450a0a'; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = '#d4b483'; ctx.fillRect(l.x, l.y, l.largura, l.altura);
    ctx.strokeStyle = '#78350f'; ctx.lineWidth = 3; ctx.strokeRect(l.x, l.y, l.largura, l.altura);
    ctx.fillStyle = '#451a03'; ctx.beginPath(); ctx.roundRect(l.x + l.largura / 2 - 15, l.y + 40, 30, 40, 10); ctx.fill();
    ctx.fillStyle = '#fde047'; ctx.font = 'bold 14px "Courier New"'; ctx.textAlign = 'center'; ctx.fillText('⛺ Loja', l.x + 40, l.y - 60);

    // Jogador
    const jog = this.jogadorMapa;
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.beginPath(); ctx.ellipse(jog.x + 15, this.chao.y, 15, 5, 0, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = '#7c3aed'; ctx.fillRect(jog.x + 4, jog.y + 15, 22, 25);
    ctx.fillStyle = '#fef08a'; ctx.fillRect(jog.x + 6, jog.y + 5, 18, 15);
    ctx.fillStyle = '#6d28d9'; ctx.beginPath(); ctx.moveTo(jog.x, jog.y + 5); ctx.lineTo(jog.x + 30, jog.y + 5); ctx.lineTo(jog.x + 15, jog.y - 15); ctx.fill();
    ctx.strokeStyle = '#4c1d95'; ctx.stroke();

    // CORREÇÃO DO TEXTO: Totalmente estático em relação ao chão
    if (this.comemorando) {
      ctx.fillStyle = '#fde047'; 
      ctx.font = 'bold 24px "Courier New"'; 
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000'; 
      ctx.shadowBlur = 5;
      
      const posicaoTextoY = this.chao.y - 130; // Distância fixa do chão
      
      // Texto fixo
      ctx.fillText('VITÓRIA!', jog.x + 15, posicaoTextoY);
      
      // Texto "Pressione ENTER" flutuando de forma independente
      ctx.font = 'bold 14px "Courier New"';
      ctx.fillStyle = '#fff';
      const flutuacao = Math.sin(this.animacaoVitoria) * 3;
      ctx.fillText('Pressione ENTER', jog.x + 15, posicaoTextoY + 25 + flutuacao);
      
      ctx.shadowBlur = 0;
    }

    // Nome do mundo
    ctx.fillStyle = '#fde047'; ctx.font = 'bold 20px "Courier New"'; ctx.textAlign = 'center';
    ctx.shadowColor = '#000'; ctx.shadowBlur = 5;
    ctx.fillText(tema.nome, 700, 50);
    ctx.shadowBlur = 0;

    // Dica
    let dica = '';
    this.placas.forEach(p => {
      if (Math.abs(jog.x - p.x) < 50) dica = p.desbloqueada ? 'Pressione ENTER' : 'Fase Bloqueada';
    });
    if (Math.abs(jog.x - (this.loja.x + this.loja.largura / 2)) < 80) dica = 'Pressione ENTER';
    if (this.portalAvancar.ativo && Math.abs(jog.x - (this.portalAvancar.x + this.portalAvancar.largura / 2)) < 80) dica = 'Pressione ENTER';
    if (Math.abs(jog.x - (this.portalVoltar.x + this.portalVoltar.largura / 2)) < 80) dica = 'Pressione ENTER';

    if (dica) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(jog.x - 45, jog.y - 40, 120, 20);
      ctx.fillStyle = '#fde047';
      ctx.font = '12px "Courier New"';
      ctx.textAlign = 'center';
      ctx.fillText(dica, jog.x + 15, jog.y - 26);
    }

    ctx.restore();
  }

  desbloquearProximaFase(mundo, fase) {
    const atual = this.placas.find(p => p.mundo === mundo && p.fase === fase);
    if (atual) atual.vencida = true;

    const proxima = this.placas.find(p => p.mundo === mundo && p.fase === fase + 1);
    if (proxima) proxima.desbloqueada = true;

    const progresso = JSON.parse(localStorage.getItem('magoDaFloresta_progresso')) || {};
    this.placas.forEach(p => {
      if (p.vencida) progresso[`${p.mundo}-${p.fase}`] = true;
    });
    localStorage.setItem('magoDaFloresta_progresso', JSON.stringify(progresso));

    this.atualizarPortal();
  }
}