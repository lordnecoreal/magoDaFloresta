import { gerarFases } from './fases.js';
import { SistemaInventario } from './inventario.js';
import { SistemaAudio } from './audio.js';
import { SistemaInimigos } from './inimigos.js';
import { SistemaJogador } from './jogador.js';
import { SistemaCenario } from './cenario.js';
import { Interface } from './interface.js';

export class MotorJogo {
  constructor(canvas, configInicial = { volume: 0.5, vidas: 3 }, onFaseVencida = null, estadoGlobal) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onFaseVencida = onFaseVencida;
    this.estadoGlobal = estadoGlobal;
    
    this.audio = this.estadoGlobal.audio || new SistemaAudio(configInicial.volume);
    this.vidasIniciais = configInicial.vidas;
    this.maxVidasPermitidas = 10;

    this.fases = gerarFases();
    this.mundoAtualIndex = 1;
    this.subFaseIndex = 1;

    this.pontos = 0;
    this.ouro = 80;
    this.precoCoracao = 40;
    this.tempoAnterior = 0;
    this.lojaAberta = false; // Mantido caso você queira reativar no futuro, mas não será usado
    this.inventarioAberto = false;
    this.animacaoFrame = 0;
    this.tempoInvulneravel = 0;
    
    this.fimDeFase = false;
    this.jogoPausado = false;

    this.inventario = new SistemaInventario(4, (item) => {
      if (this.jogador) {
        this.jogador.tipoMagia = item.magia;
        this.jogador.corProj = item.corProj || '#ef4444';
        this.jogador.tipoProjetil = item.tipoProjetil || 'fogo';
        
        const hudMagia = document.getElementById('hud-magia');
        if (hudMagia) hudMagia.innerText = item.nome;
      }
    });

    this.teclas = {};
    window.addEventListener('keydown', e => {
      this.teclas[e.code] = true;
      
      if (this.lojaAberta) {
        // Atalhos de teclado para a loja (mantidos caso haja alguma UI oculta)
        if (e.code === 'Digit1') this.comprarItem('pocao');
        if (e.code === 'Digit2') this.comprarItem('coracao');
        if (e.code === 'Digit3') this.comprarItem('gelo');
        if (e.code === 'Digit4') this.comprarItem('veneno');
        if (e.code === 'Digit5') this.comprarItem('trovao');
        if (e.code === 'Digit6') this.comprarItem('hp');
        if (e.code === 'Digit7') this.comprarItem('mana');
        return;
      }

      if (e.code === 'KeyP' || e.code === 'Escape') {
        if (this.onFaseVencida) this.onFaseVencida();
      }

      if ((e.code === 'KeyZ' || e.code === 'KeyJ') && this.jogador && !this.jogoPausado) {
        this.dispararMagia();
      }

      if (e.code === 'KeyG') {
        this.toggleGrimorio();
      }
    });

    window.addEventListener('keyup', e => this.teclas[e.code] = false);

    const configurarBotaoTouch = (id, acaoInicio, acaoFim) => {
      const btn = document.getElementById(id);
      if (!btn) return;
      btn.addEventListener('touchstart', (e) => { e.preventDefault(); acaoInicio(); }, { passive: false });
      btn.addEventListener('touchend', (e) => { e.preventDefault(); if (acaoFim) acaoFim(); }, { passive: false });
      btn.addEventListener('mousedown', () => acaoInicio());
      btn.addEventListener('mouseup', () => { if (acaoFim) acaoFim(); });
    };

    configurarBotaoTouch('btn-esq', () => this.teclas['KeyA'] = true, () => this.teclas['KeyA'] = false);
    configurarBotaoTouch('btn-dir', () => this.teclas['KeyD'] = true, () => this.teclas['KeyD'] = false);
    configurarBotaoTouch('btn-pulo', () => this.teclas['Space'] = true, () => this.teclas['Space'] = false);
    
    const btnMagia = document.getElementById('btn-magia');
    if (btnMagia) {
      btnMagia.innerHTML = '✨';
      const acaoMagia = (e) => {
        e.preventDefault();
        if (!this.jogador || this.jogoPausado) return;
        this.dispararMagia();
      };
      btnMagia.addEventListener('touchstart', acaoMagia, { passive: false });
      btnMagia.addEventListener('click', acaoMagia);
    }

    const ligarBotaoLoja = (id, tipo) => {
      const el = document.getElementById(id);
      if (el) {
        el.onclick = () => this.comprarItem(tipo);
        el.ontouchstart = (e) => { e.preventDefault(); this.comprarItem(tipo); };
      }
    };
    ligarBotaoLoja('comprar-pocao', 'pocao');
    ligarBotaoLoja('comprar-coracao', 'coracao');
    ligarBotaoLoja('comprar-gelo', 'gelo');
    ligarBotaoLoja('comprar-veneno', 'veneno');
    ligarBotaoLoja('comprar-trovao', 'trovao');
    ligarBotaoLoja('comprar-hp', 'hp');
    ligarBotaoLoja('comprar-mana', 'mana');

    const controlesMobile = document.getElementById('controles-mobile');
    if ('ontouchstart' in window || window.innerWidth <= 800) {
      if (controlesMobile) controlesMobile.style.display = 'flex';
    }

    const btnFecharLoja = document.getElementById('fechar-loja');
    if (btnFecharLoja) {
      const fechar = () => {
        this.lojaAberta = false;
        document.getElementById('loja-modal').style.display = 'none';
      };
      btnFecharLoja.onclick = fechar;
      btnFecharLoja.ontouchstart = (e) => { e.preventDefault(); fechar(); };
    }

    const btnGrimorio = document.getElementById('btn-grimorio');
    if (btnGrimorio) {
      const toggle = (e) => { e.preventDefault(); this.toggleGrimorio(); };
      btnGrimorio.onclick = toggle;
      btnGrimorio.ontouchstart = toggle;
    }

    this.audio.iniciarMusicaFundo();
  }

  iniciarFase(mundo, sub) {
    this.mundoAtualIndex = mundo;
    this.subFaseIndex = sub;
    this.fimDeFase = false;
    this.jogoPausado = false;
    this.carregarFase(`${mundo}-${sub}`);
  }

  iniciar() {
    this.loop(performance.now());
  }

  toggleGrimorio() {
    if (this.jogoPausado) return;
    this.inventarioAberto = !this.inventarioAberto;
    const invContainer = document.getElementById('inventario-container');
    const btnGrimorio = document.getElementById('btn-grimorio');
    
    if (invContainer) {
      invContainer.style.display = this.inventarioAberto ? 'block' : 'none';
    }
    if (btnGrimorio) {
      btnGrimorio.innerText = this.inventarioAberto ? '📖' : '📕';
    }
  }

  carregarFase(chave) {
    this.faseConfig = this.fases[chave];
    if (!this.faseConfig) return;

    this.larguraMapa = this.faseConfig.larguraMapa;
    this.cameraX = 0;

    const vidasAtuais = this.jogador ? this.jogador.vidas : this.vidasIniciais;
    const maxVidasAtuais = this.jogador ? this.jogador.maxVidas : this.vidasIniciais;
    const magiaAtual = this.jogador ? this.jogador.tipoProjetil : 'fogo';
    const corAtual = this.jogador ? this.jogador.corProj : '#ef4444';
    const tipoMagiaAtual = this.jogador ? this.jogador.tipoMagia : 'Chama Arcana (Z)';
    
    const hpAtual = this.jogador ? this.jogador.hp : 100;
    const maxHpAtual = this.jogador ? this.jogador.maxHp : 100;
    const manaAtual = this.jogador ? this.jogador.mana : 100;
    const maxManaAtual = this.jogador ? this.jogador.maxMana : 100;

    this.jogador = SistemaJogador.criar(vidasAtuais, magiaAtual, corAtual, tipoMagiaAtual);
    this.jogador.maxVidas = maxVidasAtuais;
    this.jogador.hp = hpAtual;
    this.jogador.maxHp = maxHpAtual;
    this.jogador.mana = manaAtual;
    this.jogador.maxMana = maxManaAtual;

    this.obstaculos = JSON.parse(JSON.stringify(this.faseConfig.obstaculos));
    this.inimigos = JSON.parse(JSON.stringify(this.faseConfig.inimigos));
    this.moedas = JSON.parse(JSON.stringify(this.faseConfig.moedas));

    // O filtro da loja foi removido daqui pois o fases.js já não a gera mais.

    this.inimigos.forEach(ini => {
      if (!ini.maxHp) ini.maxHp = ini.hp;
      ini.queimando = 0; ini.congelado = 0; ini.envenenado = 0; ini.eletrocutado = 0;
      ini.velocidadeBase = ini.velocidade;
    });

    this.obstaculosColisao = [];
    for (let i = 0; i < this.obstaculos.length; i++) {
      const obs = this.obstaculos[i];
      if (obs.tipo === 'chao' || obs.tipo === 'plataforma' || obs.tipo === 'cano') {
        this.obstaculosColisao.push(obs);
      }
    }
  }

  dispararMagia() {
    if (this.jogador.mana < 15 || this.jogoPausado) return;
    this.jogador.mana -= 15;
    this.audio.magia();
    this.jogador.animacaoAtaque = 1;

    this.jogador.projeteis.push({
      x: this.jogador.direcao > 0 ? this.jogador.x + this.jogador.largura : this.jogador.x - 20,
      y: this.jogador.y + 18, largura: 18, altura: 12,
      vx: this.jogador.direcao * 450, cor: this.jogador.corProj, tipo: this.jogador.tipoProjetil
    });
  }

  atualizarLojaVisual() {
    const lojaOuro = document.getElementById('loja-ouro');
    if (lojaOuro) lojaOuro.innerText = this.ouro;
    
    const btnCoracao = document.getElementById('comprar-coracao');
    if (btnCoracao) {
       btnCoracao.innerHTML = `<span>[2] Coração Extra (+1 Vida)</span> <span>🪙 ${this.precoCoracao}</span>`;
    }

    const btnGelo = document.getElementById('comprar-gelo');
    if (btnGelo) btnGelo.style.display = (this.inventario.possuiItem && this.inventario.possuiItem('livro_gelo')) ? 'none' : 'flex';
    
    const btnVeneno = document.getElementById('comprar-veneno');
    if (btnVeneno) btnVeneno.style.display = (this.inventario.possuiItem && this.inventario.possuiItem('livro_veneno')) ? 'none' : 'flex';
    
    const btnTrovao = document.getElementById('comprar-trovao');
    if (btnTrovao) btnTrovao.style.display = (this.inventario.possuiItem && this.inventario.possuiItem('livro_trovao')) ? 'none' : 'flex';

    this.atualizarHUD();
  }

  atualizarHUD() {
    Interface.atualizarHUD(
      this.jogador, 
      this.ouro, 
      this.pontos, 
      this.mundoAtualIndex, 
      this.subFaseIndex
    );
  }

  comprarItem(tipo) {
    if (tipo === 'pocao') {
      if (this.jogador.hp === this.jogador.maxHp && this.jogador.vidas === this.jogador.maxVidas) {
        Interface.mostrarMensagemLoja('⚠ Sua saúde e corações já estão cheios!'); return;
      }
      if (this.ouro >= 20) {
        this.ouro -= 20; this.jogador.hp = this.jogador.maxHp; this.jogador.vidas = this.jogador.maxVidas;
        this.audio.compra(); Interface.mostrarMensagemLoja('✔ Poção usada! HP e Corações 100% restaurados.');
      } else { Interface.mostrarMensagemLoja('✖ Ouro insuficiente!'); }
    } 
    else if (tipo === 'coracao') {
      const maxVidasAtual = this.jogador.maxVidas || 3;
      if (maxVidasAtual >= this.maxVidasPermitidas) { Interface.mostrarMensagemLoja('⚠ Você já possui o limite máximo de 10 Corações!'); return; }
      if (this.ouro >= this.precoCoracao) {
        this.ouro -= this.precoCoracao; 
        this.jogador.maxVidas += 1; 
        this.jogador.vidas += 1; 
        this.audio.compra(); Interface.mostrarMensagemLoja(`✔ Coração Extra adquirido! Total: ${this.jogador.maxVidas}/10`);
        this.atualizarHUD();
      } else { Interface.mostrarMensagemLoja(`✖ Ouro insuficiente! Precisa de ${this.precoCoracao}.`); }
    } 
    else if (tipo === 'hp') {
      if (this.ouro >= 50) {
        this.ouro -= 50;
        this.jogador.maxHp += 100;
        this.jogador.hp = this.jogador.maxHp;
        this.audio.compra();
        Interface.mostrarMensagemLoja('✔ Poção de Vida! +100 HP máximo.');
        this.atualizarHUD();
      } else { Interface.mostrarMensagemLoja('✖ Ouro insuficiente!'); }
    } 
    else if (tipo === 'mana') {
      if (this.ouro >= 50) {
        this.ouro -= 50;
        this.jogador.maxMana += 100;
        this.jogador.mana = this.jogador.maxMana;
        this.audio.compra();
        Interface.mostrarMensagemLoja('✔ Poção de Mana! +100 MP máximo.');
        this.atualizarHUD();
      } else { Interface.mostrarMensagemLoja('✖ Ouro insuficiente!'); }
    }
    else if (tipo === 'gelo') {
      if (this.inventario.possuiItem && this.inventario.possuiItem('livro_gelo')) { Interface.mostrarMensagemLoja('⚠ Você já possui a Lança de Gelo!'); return; }
      if (this.ouro >= 50) {
        this.ouro -= 50; this.inventario.adicionarItem('livro_gelo'); this.inventario.equipar('livro_gelo');
        this.audio.compra(); Interface.mostrarMensagemLoja('✔ Lança de Gelo adquirida!');
      } else { Interface.mostrarMensagemLoja('✖ Ouro insuficiente!'); }
    } 
    else if (tipo === 'veneno') {
      if (this.inventario.possuiItem && this.inventario.possuiItem('livro_veneno')) { Interface.mostrarMensagemLoja('⚠ Você já possui a Chuva de Veneno!'); return; }
      if (this.ouro >= 60) {
        this.ouro -= 60; this.inventario.adicionarItem('livro_veneno'); this.inventario.equipar('livro_veneno');
        this.audio.compra(); Interface.mostrarMensagemLoja('✔ Chuva de Veneno adquirida!');
      } else { Interface.mostrarMensagemLoja('✖ Ouro insuficiente!'); }
    } 
    else if (tipo === 'trovao') {
      if (this.inventario.possuiItem && this.inventario.possuiItem('livro_trovao')) { Interface.mostrarMensagemLoja('⚠ Você já possui o Raio Trovejante!'); return; }
      if (this.ouro >= 70) {
        this.ouro -= 70; this.inventario.adicionarItem('livro_trovao'); this.inventario.equipar('livro_trovao');
        this.audio.compra(); Interface.mostrarMensagemLoja('✔ Raio Trovejante adquirido!');
      } else { Interface.mostrarMensagemLoja('✖ Ouro insuficiente!'); }
    }
    this.atualizarLojaVisual();
  }

  atualizar(dt) {
    if (!this.jogador || this.lojaAberta) return;
    if (this.jogoPausado) return;

    const chefaoVivo = this.faseConfig.chefao && this.inimigos.some(i => i.ehBoss && i.estado !== 'morto');
    if (!chefaoVivo) {
      const caldeiraoX = this.faseConfig.portalX;
      const distancia = Math.abs(this.jogador.x - caldeiraoX);

      if (distancia < 100) {
        this.jogoPausado = true;
        this.fimDeFase = true;

        this.audio.pararMusicaFundo();
        if (this.audio.somVitoria) this.audio.somVitoria();

        if (this.onFaseVencida) {
          this.onFaseVencida(this.mundoAtualIndex, this.subFaseIndex);
        }
        return;
      }
    }

    this.animacaoFrame += dt * 10;
    if (this.tempoInvulneravel > 0) this.tempoInvulneravel -= dt;
    if (this.jogador.mana < this.jogador.maxMana) {
      this.jogador.mana = Math.min(this.jogador.maxMana, this.jogador.mana + 15 * dt);
    }

    const j = this.jogador;

    if (this.teclas['ArrowRight'] || this.teclas['KeyD']) {
      j.vx = 220; j.direcao = 1;
    } else if (this.teclas['ArrowLeft'] || this.teclas['KeyA']) {
      j.vx = -220; j.direcao = -1;
    } else {
      j.vx = 0;
    }

    if ((this.teclas['Space'] || this.teclas['KeyW']) && j.noChao) {
      j.vy = -450;
      j.noChao = false;
      this.audio.pulo();
    }

    j.vy += 1100 * dt;
    j.x += j.vx * dt;
    const proxY = j.y + j.vy * dt;
    j.noChao = false;

    this.obstaculosColisao.forEach(obs => {
      if (
        j.x + j.largura > obs.x &&
        j.x < obs.x + obs.largura &&
        j.y + j.altura <= obs.y &&
        proxY + j.altura >= obs.y
      ) {
        j.y = obs.y - j.altura;
        j.vy = 0;
        j.noChao = true;
      }
    });

    if (!j.noChao) j.y = proxY;

    if (j.x < 20) j.x = 20;
    if (j.x + j.largura > this.larguraMapa - 20) {
      j.x = this.larguraMapa - 20 - j.largura;
    }

    if (j.y < 20) { j.y = 20; j.vy = 0; }

    j.projeteis.forEach(p => p.x += p.vx * dt);
    j.projeteis = j.projeteis.filter(
      p => p.x > this.cameraX && p.x < this.cameraX + 800
    );

    if (j.animacaoAtaque > 0) {
      j.animacaoAtaque -= dt * 5;
      if (j.animacaoAtaque < 0) j.animacaoAtaque = 0;
    }

    this.inimigos.forEach(ini => {
      if (ini.estado === 'morto') return;
      if (!ini.maxHp) ini.maxHp = ini.hp;

      const podeMover = SistemaInimigos.atualizarStatus(ini, dt, this.audio);

      if (podeMover) {
        ini.x += ini.direcao * ini.velocidade * dt;
        if (ini.x < ini.minX || ini.x > ini.maxX) ini.direcao *= -1;
      }

      this.jogador.projeteis.forEach((p, index) => {
        if (
          p.x < ini.x + ini.largura &&
          p.x + p.largura > ini.x &&
          p.y < ini.y + ini.altura &&
          p.y + p.altura > ini.y
        ) {
          SistemaInimigos.receberDano(ini, p, this.audio);
          if (ini.estado === 'morto') this.pontos += ini.ehBoss ? 500 : 200;
          this.jogador.projeteis.splice(index, 1);
        }
      });

      if (
        this.jogador.x < ini.x + ini.largura &&
        this.jogador.x + this.jogador.largura > ini.x &&
        this.jogador.y < ini.y + ini.altura &&
        this.jogador.y + this.jogador.altura > ini.y
      ) {
        if (this.jogador.vy > 0 && this.jogador.y + this.jogador.altura - this.jogador.vy * dt <= ini.y + 18) {
          ini.hp -= 2;
          this.jogador.vy = -350;
          this.audio.stomp();
          this.pontos += 150;
          if (ini.hp <= 0) {
            ini.estado = 'morto';
            if (ini.ehBoss) this.audio.chefeDerrota();
          }
        } else if (this.tempoInvulneravel <= 0) {
          const danoInimigo = ini.ehBoss ? 40 : 20;
          this.jogador.hp -= danoInimigo;

          this.audio.danoMago();
          this.tempoInvulneravel = 1.0;

          const direcaoRepulsa = this.jogador.x < ini.x ? -1 : 1;
          this.jogador.x += direcaoRepulsa * 45;
          this.jogador.vy = -200;

          if (this.jogador.hp <= 0) {
            this.jogador.vidas--;
            if (this.jogador.maxVidas > this.jogador.vidas) {
              this.jogador.maxVidas = this.jogador.vidas;
            }

            if (this.jogador.vidas > 0) {
              this.jogador.hp = this.jogador.maxHp;
            } else {
              this.audio.pararMusicaFundo();
              this.audio.somDerrotaJogo();
              alert("💀 Fim de Jogo! Você perdeu todos os corações.");
              if (this.onFaseVencida) this.onFaseVencida();
              else location.reload();
            }
          }
        }
      }
    });

    this.moedas.forEach(m => {
      const margem = 24;
      if (
        !m.coletada &&
        this.jogador.x < m.x + (m.largura || 18) + margem &&
        this.jogador.x + this.jogador.largura > m.x - margem &&
        this.jogador.y < m.y + (m.altura || 18) + margem &&
        this.jogador.y + this.jogador.altura > m.y - margem
      ) {
        m.coletada = true;
        this.ouro += 5;
        this.pontos += 50;
        this.audio.moeda();
      }
    });

    this.cameraX = Math.max(
      0,
      Math.min(this.jogador.x - 200, this.larguraMapa - 800)
    );
    this.atualizarHUD();
  }

  renderizar() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = '#0a0f1c';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const escala = Math.min(this.canvas.width / 800, this.canvas.height / 500);
    this.ctx.save();
    this.ctx.translate(
      (this.canvas.width - 800 * escala) / 2,
      (this.canvas.height - 500 * escala) / 2
    );
    this.ctx.scale(escala, escala);

    this.ctx.beginPath();
    this.ctx.rect(0, 0, 800, 500);
    this.ctx.clip();

    this.ctx.save();
    this.ctx.translate(-Math.floor(this.cameraX), 0);

    SistemaCenario.desenhar(this.ctx, this.obstaculos, this.larguraMapa);

    this.moedas.forEach(m => {
      if (!m.coletada) {
        this.ctx.fillStyle = '#fde047';
        this.ctx.beginPath();
        this.ctx.arc(m.x + 9, m.y + 9, 8, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = '#fef08a';
        this.ctx.beginPath();
        this.ctx.arc(m.x + 9, m.y + 9, 4, 0, Math.PI * 2);
        this.ctx.fill();
      }
    });

    this.inimigos.forEach(ini => {
      SistemaInimigos.desenhar(this.ctx, ini);
    });

    const gaiola = this.obstaculos.find(o => o.tipo === 'gaiola');
    SistemaCenario.desenharGaiola(this.ctx, gaiola);

    SistemaJogador.desenhar(
      this.ctx,
      this.jogador,
      this.animacaoFrame,
      this.tempoInvulneravel
    );

    const chefaoVivo = this.faseConfig.chefao && this.inimigos.some(
      i => i.ehBoss && i.estado !== 'morto'
    );
    if (!chefaoVivo && this.faseConfig) {
      this.desenharCaldeirao(this.faseConfig.portalX, 340);
    }

    this.ctx.restore();
    this.ctx.restore();
  }

  desenharCaldeirao(x, y) {
    const ctx = this.ctx;

    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';

    if (this.fimDeFase) {
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.moveTo(x - 35, y + 55);
      ctx.lineTo(x, y + 35 + Math.sin(this.animacaoFrame * 3) * 5);
      ctx.lineTo(x + 35, y + 55);
      ctx.fill();

      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.moveTo(x - 20, y + 55);
      ctx.lineTo(x, y + 45 + Math.cos(this.animacaoFrame * 3) * 5);
      ctx.lineTo(x + 20, y + 55);
      ctx.fill();
    }

    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.ellipse(x, y + 10, 40, 35, 0, 0, Math.PI, false);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(x, y - 15, 40, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = this.fimDeFase ? '#22c55e' : '#475569';
    if (this.fimDeFase) {
      ctx.shadowColor = '#4ade80';
      ctx.shadowBlur = 25;
    }
    ctx.beginPath();
    ctx.ellipse(x, y - 15, 35, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x - 30, y + 40, 8, 15);
    ctx.fillRect(x + 22, y + 40, 8, 15);
  }

  loop(tempoAtual) {
    const dt = Math.min(
      (tempoAtual - (this.tempoAnterior || tempoAtual)) / 1000,
      0.1
    );
    this.tempoAnterior = tempoAtual;

    this.atualizar(dt);
    this.renderizar();

    requestAnimationFrame(t => this.loop(t));
  }
}