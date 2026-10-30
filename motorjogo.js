import { gerarFases } from './fases.js';
import { SistemaInventario } from './inventario.js';
import { SistemaAudio } from './audio.js';

export class MotorJogo {
  constructor(canvas, configInicial = { volume: 0.5, vidas: 3 }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    this.audio = new SistemaAudio(configInicial.volume);
    this.vidasIniciais = configInicial.vidas;

    this.fases = gerarFases();
    this.mundoAtualIndex = 1;
    this.subFaseIndex = 1;

    this.pontos = 0;
    this.ouro = 80;
    this.tempoAnterior = 0;
    this.lojaAberta = false;
    this.animacaoFrame = 0;

    this.inventario = new SistemaInventario(8, (item) => {
      if (this.jogador) {
        this.jogador.tipoMagia = item.magia;
        this.jogador.corProj = item.corProj || '#ef4444';
      }
      const elMagia = document.getElementById('hud-magia');
      if (elMagia) elMagia.innerText = item.nome;
    });

    this.teclas = {};
    window.addEventListener('keydown', e => {
      this.teclas[e.code] = true;
      
      if ((e.code === 'KeyZ' || e.code === 'KeyJ') && this.jogador && !this.lojaAberta) {
        this.dispararMagia();
      }

      if (e.code === 'KeyX' || e.code === 'KeyK') {
        this.verificarLoja();
      }

      if (this.lojaAberta) {
        if (e.code === 'Digit1') this.comprarItem('pocao');
        if (e.code === 'Digit2') this.comprarItem('gelo');
        if (e.code === 'Digit3') this.comprarItem('veneno');
      }
    });

    window.addEventListener('keyup', e => this.teclas[e.code] = false);

    const btnFecharLoja = document.getElementById('fechar-loja');
    if (btnFecharLoja) {
      btnFecharLoja.onclick = () => {
        this.lojaAberta = false;
        document.getElementById('loja-modal').style.display = 'none';
      };
    }

    this.audio.iniciarMusicaFundo();
    this.carregarFase(`${this.mundoAtualIndex}-${this.subFaseIndex}`);
  }

  carregarFase(chave) {
    this.faseConfig = this.fases[chave];
    if (!this.faseConfig) return;

    this.larguraMapa = this.faseConfig.larguraMapa;
    this.cameraX = 0;

    this.jogador = {
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
      vidas: this.vidasIniciais,
      noChao: false,
      direcao: 1,
      tipoMagia: 'Chama Arcana (Z)',
      corProj: '#ef4444',
      projeteis: []
    };

    this.obstaculos = JSON.parse(JSON.stringify(this.faseConfig.obstaculos));
    this.inimigos = JSON.parse(JSON.stringify(this.faseConfig.inimigos));
    this.moedas = JSON.parse(JSON.stringify(this.faseConfig.moedas));
  }

  dispararMagia() {
    if (this.jogador.mana < 15) return;
    this.jogador.mana -= 15;
    this.audio.magia();

    this.jogador.projeteis.push({
      x: this.jogador.direcao > 0 ? this.jogador.x + this.jogador.largura : this.jogador.x - 20,
      y: this.jogador.y + 18,
      largura: 18,
      altura: 12,
      vx: this.jogador.direcao * 450,
      cor: this.jogador.corProj
    });
  }

  verificarLoja() {
    const loja = this.obstaculos.find(o => o.tipo === 'loja');
    if (loja && Math.abs(this.jogador.x - loja.x) < 100) {
      this.lojaAberta = !this.lojaAberta;
      document.getElementById('loja-modal').style.display = this.lojaAberta ? 'block' : 'none';
      document.getElementById('loja-ouro').innerText = this.ouro;
      document.getElementById('loja-msg').innerText = '';
    }
  }

  comprarItem(tipo) {
    const msgEl = document.getElementById('loja-msg');
    if (tipo === 'pocao') {
      if (this.ouro >= 20) {
        this.ouro -= 20;
        this.jogador.hp = Math.min(this.jogador.maxHp, this.jogador.hp + 50);
        this.audio.compra();
        msgEl.innerText = '✔ Poção comprada com sucesso!';
      } else {
        msgEl.innerText = '✖ Ouro insuficiente!';
      }
    } else if (tipo === 'gelo') {
      if (this.inventario.possuiItem && this.inventario.possuiItem('livro_gelo')) {
        msgEl.innerText = '⚠ Você já possui a Lança de Gelo no grimório!';
        return;
      }
      if (this.ouro >= 50) {
        this.ouro -= 50;
        this.inventario.adicionarItem('livro_gelo');
        this.audio.compra();
        msgEl.innerText = '✔ Lança de Gelo adquirida!';
      } else {
        msgEl.innerText = '✖ Ouro insuficiente!';
      }
    } else if (tipo === 'veneno') {
      if (this.inventario.possuiItem && this.inventario.possuiItem('livro_veneno')) {
        msgEl.innerText = '⚠ Você já possui a Chuva de Veneno no grimório!';
        return;
      }
      if (this.ouro >= 60) {
        this.ouro -= 60;
        this.inventario.adicionarItem('livro_veneno');
        this.audio.compra();
        msgEl.innerText = '✔ Chuva de Veneno adquirida!';
      } else {
        msgEl.innerText = '✖ Ouro insuficiente!';
      }
    }
    // Atualização imediata do ouro na modal da loja e no HUD
    document.getElementById('loja-ouro').innerText = this.ouro;
    document.getElementById('hud-ouro').innerText = this.ouro;
  }

  proximaFase() {
    this.subFaseIndex++;
    if (this.subFaseIndex > 3) {
      this.subFaseIndex = 1;
      this.mundoAtualIndex++;
    }

    if (this.mundoAtualIndex > 5) {
      this.audio.pararMusicaFundo();
      alert("🎉 PARABÉNS! VOCÊ RESGATOU SEU FELINO E SALVOU A FLORESTA!");
      location.reload();
      return;
    }

    this.carregarFase(`${this.mundoAtualIndex}-${this.subFaseIndex}`);
  }

  atualizar(dt) {
    if (!this.jogador || this.lojaAberta) return;

    this.animacaoFrame += dt * 10;

    if (this.jogador.mana < this.jogador.maxMana) {
      this.jogador.mana = Math.min(this.jogador.maxMana, this.jogador.mana + 15 * dt);
    }

    if (this.teclas['ArrowRight'] || this.teclas['KeyD']) {
      this.jogador.vx = 220;
      this.jogador.direcao = 1;
    } else if (this.teclas['ArrowLeft'] || this.teclas['KeyA']) {
      this.jogador.vx = -220;
      this.jogador.direcao = -1;
    } else {
      this.jogador.vx = 0;
    }

    if ((this.teclas['Space'] || this.teclas['KeyW']) && this.jogador.noChao) {
      this.jogador.vy = -450;
      this.jogador.noChao = false;
      this.audio.pulo();
    }

    this.jogador.vy += 1100 * dt;
    this.jogador.x += this.jogador.vx * dt;
    const proxY = this.jogador.y + this.jogador.vy * dt;

    this.jogador.noChao = false;

    this.obstaculos.forEach(obs => {
      if (obs.tipo === 'arvore') return;

      if (
        this.jogador.x + this.jogador.largura > obs.x &&
        this.jogador.x < obs.x + obs.largura &&
        this.jogador.y + this.jogador.altura <= obs.y &&
        proxY + this.jogador.altura >= obs.y
      ) {
        this.jogador.y = obs.y - this.jogador.altura;
        this.jogador.vy = 0;
        this.jogador.noChao = true;
      }
    });

    if (!this.jogador.noChao) this.jogador.y = proxY;

    this.jogador.projeteis.forEach(p => p.x += p.vx * dt);
    this.jogador.projeteis = this.jogador.projeteis.filter(p => p.x > this.cameraX && p.x < this.cameraX + 800);

    this.inimigos.forEach(ini => {
      if (ini.estado === 'morto') return;

      ini.x += ini.direcao * ini.velocidade * dt;
      if (ini.x < ini.minX || ini.x > ini.maxX) {
        ini.direcao *= -1;
      }

      this.jogador.projeteis.forEach((p, index) => {
        if (
          p.x < ini.x + ini.largura &&
          p.x + p.largura > ini.x &&
          p.y < ini.y + ini.altura &&
          p.y + p.altura > ini.y
        ) {
          ini.hp -= 1;
          this.jogador.projeteis.splice(index, 1);
          this.audio.acertoInimigo();
          if (ini.hp <= 0) {
            ini.estado = 'morto';
            this.pontos += 200;
          }
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
          if (ini.hp <= 0) ini.estado = 'morto';
        } else {
          this.jogador.hp -= 20 * dt;
          if (this.jogador.hp <= 0) {
            this.jogador.vidas--;
            if (this.jogador.vidas <= 0) {
              this.audio.pararMusicaFundo();
              alert("💀 Game Over! O felino continuará aprisionado...");
              location.reload();
            } else {
              this.jogador.hp = this.jogador.maxHp;
              this.jogador.x = 60;
              this.jogador.y = 280;
            }
          }
        }
      }
    });

    // Coleta de moedas garantida (Margem de colisão expandida)
    this.moedas.forEach(m => {
      const margem = 24; // Permite pegar a moeda facilmente encostando nela
      if (!m.coletada &&
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

    if (this.jogador.x >= this.faseConfig.portalX) {
      this.proximaFase();
    }

    this.cameraX = Math.max(0, Math.min(this.jogador.x - 200, this.larguraMapa - 800));

    document.getElementById('hud-hp').innerText = Math.round(this.jogador.hp);
    document.getElementById('hud-maxhp').innerText = this.jogador.maxHp;
    document.getElementById('hud-mana').innerText = Math.round(this.jogador.mana);
    document.getElementById('hud-fase').innerText = `${this.mundoAtualIndex}-${this.subFaseIndex}`;
    document.getElementById('hud-pontos').innerText = String(this.pontos).padStart(6, '0');
    document.getElementById('hud-ouro').innerText = this.ouro;
    document.getElementById('hud-vidas-texto').innerText = '❤️'.repeat(Math.max(0, this.jogador.vidas));
  }

  renderizar() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.save();
    this.ctx.translate(-Math.floor(this.cameraX), 0);

    this.ctx.fillStyle = '#090d16';
    this.ctx.fillRect(0, 0, this.larguraMapa, 500);

    this.ctx.fillStyle = '#1e1b4b';
    this.ctx.fillRect(0, 200, this.larguraMapa, 180);

    this.obstaculos.forEach(obs => {
      if (obs.tipo === 'arvore') {
        this.ctx.fillStyle = '#5c2c16';
        this.ctx.fillRect(obs.x + obs.largura / 2 - 12, obs.y + 60, 24, 160);
        this.ctx.fillStyle = obs.corFolhas || '#14532d';
        this.ctx.beginPath();
        this.ctx.arc(obs.x + obs.largura / 2, obs.y + 60, 55, 0, Math.PI * 2);
        this.ctx.arc(obs.x + obs.largura / 2 - 30, obs.y + 90, 40, 0, Math.PI * 2);
        this.ctx.arc(obs.x + obs.largura / 2 + 30, obs.y + 90, 40, 0, Math.PI * 2);
        this.ctx.fill();
      } else if (obs.tipo === 'chao') {
        this.ctx.fillStyle = '#166534';
        this.ctx.fillRect(obs.x, obs.y, obs.largura, obs.altura);
        this.ctx.fillStyle = '#22c55e';
        this.ctx.fillRect(obs.x, obs.y, obs.largura, 10);
      } else if (obs.tipo === 'cano') {
        this.ctx.fillStyle = '#15803d';
        this.ctx.fillRect(obs.x, obs.y, obs.largura, obs.altura);
        this.ctx.fillStyle = '#22c55e';
        this.ctx.fillRect(obs.x - 4, obs.y, obs.largura + 8, 14);
      } else if (obs.tipo === 'loja') {
        const altLoja = obs.altura || 100;
        const largLoja = obs.largura || 110;
        
        // Estrutura/Parede de madeira da casa
        this.ctx.fillStyle = '#78350f';
        this.ctx.fillRect(obs.x, obs.y + 30, largLoja, altLoja - 30);
        
        // Porta da casa
        this.ctx.fillStyle = '#451a03';
        this.ctx.fillRect(obs.x + largLoja / 2 - 12, obs.y + 50, 24, altLoja - 50);

        // Telhado Vermelho
        this.ctx.fillStyle = '#991b1b';
        this.ctx.beginPath();
        this.ctx.moveTo(obs.x - 10, obs.y + 30);
        this.ctx.lineTo(obs.x + largLoja / 2, obs.y - 10);
        this.ctx.lineTo(obs.x + largLoja + 10, obs.y + 30);
        this.ctx.fill();

        // Texto do Mercador/Loja
        this.ctx.fillStyle = '#fde047';
        this.ctx.font = 'bold 11px monospace';
        this.ctx.fillText('🛒 LOJA (X)', obs.x, obs.y - 18);
      }
    });

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
      if (ini.estado === 'morto') return;
      if (ini.tipo === 'cogumelo') {
        this.ctx.fillStyle = '#f5f5f4';
        this.ctx.fillRect(ini.x + 10, ini.y + 20, 26, 26);
        this.ctx.fillStyle = '#dc2626';
        this.ctx.beginPath();
        this.ctx.arc(ini.x + 23, ini.y + 20, 23, Math.PI, 0, false);
        this.ctx.fill();
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(ini.x + 15, ini.y + 22, 4, 6);
        this.ctx.fillRect(ini.x + 27, ini.y + 22, 4, 6);
      } else {
        this.ctx.fillStyle = '#15803d';
        this.ctx.fillRect(ini.x, ini.y, ini.largura, ini.altura);
        this.ctx.fillStyle = '#fde047';
        this.ctx.fillRect(ini.x + 20, ini.y + 30, 15, 10);
      }
    });

    if (this.jogador) {
      const balocoPernas = Math.sin(this.animacaoFrame) * 4;

      this.ctx.fillStyle = '#7c3aed';
      this.ctx.fillRect(this.jogador.x + 4, this.jogador.y + 18, 28, 28);
      
      this.ctx.fillStyle = '#3b0764';
      this.ctx.fillRect(this.jogador.x + 6, this.jogador.y + 46, 10, 6 + (this.jogador.vx !== 0 ? balocoPernas : 0));
      this.ctx.fillRect(this.jogador.x + 20, this.jogador.y + 46, 10, 6 - (this.jogador.vx !== 0 ? balocoPernas : 0));

      this.ctx.fillStyle = '#fef08a';
      this.ctx.fillRect(this.jogador.x + 8, this.jogador.y + 10, 20, 14);
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillRect(this.jogador.x + 10, this.jogador.y + 18, 16, 8);

      this.ctx.fillStyle = '#0f172a';
      const olhoX = this.jogador.direcao > 0 ? this.jogador.x + 20 : this.jogador.x + 10;
      this.ctx.fillRect(olhoX, this.jogador.y + 13, 3, 4);

      this.ctx.fillStyle = '#6d28d9';
      this.ctx.beginPath();
      this.ctx.moveTo(this.jogador.x + 2, this.jogador.y + 10);
      this.ctx.lineTo(this.jogador.x + 34, this.jogador.y + 10);
      this.ctx.lineTo(this.jogador.x + (this.jogador.direcao > 0 ? 38 : -4), this.jogador.y - 12);
      this.ctx.fill();

      this.ctx.strokeStyle = '#78350f';
      this.ctx.lineWidth = 4;
      this.ctx.beginPath();
      const cajadoX = this.jogador.direcao > 0 ? this.jogador.x + 34 : this.jogador.x - 2;
      this.ctx.moveTo(cajadoX, this.jogador.y + 45);
      this.ctx.lineTo(cajadoX, this.jogador.y + 5);
      this.ctx.stroke();
      this.ctx.fillStyle = this.jogador.corProj;
      this.ctx.beginPath();
      this.ctx.arc(cajadoX, this.jogador.y + 2, 6, 0, Math.PI * 2);
      this.ctx.fill();

      this.jogador.projeteis.forEach(p => {
        this.ctx.fillStyle = p.cor;
        this.ctx.beginPath();
        this.ctx.arc(p.x + 9, p.y + 6, 8, 0, Math.PI * 2);
        this.ctx.fill();
      });
    }

    if (this.faseConfig) {
      this.ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
      this.ctx.fillRect(this.faseConfig.portalX, 260, 50, 120);
      this.ctx.fillStyle = '#38bdf8';
      this.ctx.fillRect(this.faseConfig.portalX + 10, 270, 30, 100);
    }

    this.ctx.restore();
  }

  loop(tempoAtual) {
    const dt = Math.min((tempoAtual - (this.tempoAnterior || tempoAtual)) / 1000, 0.1);
    this.tempoAnterior = tempoAtual;

    this.atualizar(dt);
    this.renderizar();

    requestAnimationFrame(t => this.loop(t));
  }

  iniciar() {
    requestAnimationFrame(t => this.loop(t));
  }
}