export class SistemaAudio {
  constructor(volumeInicial = 0.8) {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.volumeMaster = volumeInicial;
    this.intervaloMusica = null;
  }

  setVolume(vol) {
    this.volumeMaster = Math.max(0, Math.min(1, vol));
  }

  tocarTom(freq, tipo, duracao, ganhoMax = 0.3) {
    if (this.volumeMaster <= 0) return;
    try {
      if (this.ctx.state === 'suspended') this.ctx.resume();

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = tipo;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(ganhoMax * this.volumeMaster * 1.5, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duracao);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duracao);
    } catch (e) {}
  }

  // --- MÉTODOS DE MÚSICA ---

  pararMusica() {
    if (this.intervaloMusica) {
      clearInterval(this.intervaloMusica);
      this.intervaloMusica = null;
    }
  }

  pararMusicaFundo() {
    this.pararMusica(); // Compatibilidade com o método antigo
  }

  iniciarMusicaFundo() {
    this.pararMusica();
    const notas = [261.63, 329.63, 392.00, 523.25, 392.00, 329.63];
    let index = 0;

    this.intervaloMusica = setInterval(() => {
      if (this.volumeMaster > 0) {
        this.tocarTom(notas[index], 'triangle', 0.4, 0.15);
        index = (index + 1) % notas.length;
      }
    }, 450);
  }

  // Música do Mapa (inspirada em Castlevania II - Message of Darkness)
  tocarMusicaMapa() {
    this.pararMusica();
    const notas = [220, 261.63, 293.66, 329.63, 293.66, 261.63, 220, 196];
    let index = 0;
    
    this.intervaloMusica = setInterval(() => {
      if (this.volumeMaster > 0) {
        this.tocarTom(notas[index], 'triangle', 0.4, 0.2);
        if (index % 2 === 0) this.tocarTom(notas[index] / 2, 'sine', 0.4, 0.15);
        index = (index + 1) % notas.length;
      }
    }, 500);
  }

  // Música das Fases (inspirada em Castlevania - tema do mundo 1)
  tocarMusicaFase() {
    this.pararMusica();
    const notas = [329.63, 349.23, 392.00, 440.00, 392.00, 349.23, 329.63, 293.66, 261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];
    let index = 0;
    
    this.intervaloMusica = setInterval(() => {
      if (this.volumeMaster > 0) {
        this.tocarTom(notas[index], 'square', 0.25, 0.15);
        if (index % 4 === 0) this.tocarTom(notas[index] / 4, 'sawtooth', 0.5, 0.1);
        index = (index + 1) % notas.length;
      }
    }, 250);
  }

  // Música do Boss (inspirada em Breath of Fire IV)
  tocarMusicaBoss() {
    this.pararMusica();
    const notas = [146.83, 146.83, 174.61, 196.00, 220.00, 196.00, 174.61, 146.83];
    let index = 0;
    
    this.intervaloMusica = setInterval(() => {
      if (this.volumeMaster > 0) {
        this.tocarTom(notas[index], 'sawtooth', 0.4, 0.2);
        if (index % 2 === 0) this.tocarTom(50, 'square', 0.1, 0.15);
        index = (index + 1) % notas.length;
      }
    }, 400);
  }

  // Música de Vitória (Fanfarra)
  tocarMusicaVitoria() {
    this.pararMusica();
    const notas = [523.25, 659.25, 783.99, 1046.50];
    let index = 0;
    
    this.intervaloMusica = setInterval(() => {
      if (this.volumeMaster > 0) {
        this.tocarTom(notas[index], 'square', 0.6, 0.25);
        index++;
        if (index >= notas.length) this.pararMusica();
      }
    }, 250);
  }

  // --- EFEITOS SONOROS ---

  pulo() {
    this.tocarTom(320, 'sine', 0.15, 0.3);
    setTimeout(() => this.tocarTom(520, 'sine', 0.1, 0.25), 50);
  }

  magia() {
    this.tocarTom(850, 'triangle', 0.2, 0.25);
    setTimeout(() => this.tocarTom(480, 'sawtooth', 0.15, 0.2), 60);
  }

  acertoInimigo() {
    this.tocarTom(180, 'square', 0.2, 0.35);
  }

  stomp() {
    this.tocarTom(240, 'triangle', 0.12, 0.35);
    setTimeout(() => this.tocarTom(120, 'sine', 0.15, 0.35), 40);
  }

  moeda() {
    this.tocarTom(987.77, 'sine', 0.08, 0.25);
    setTimeout(() => this.tocarTom(1318.51, 'sine', 0.15, 0.25), 80);
  }

  compra() {
    this.tocarTom(523.25, 'triangle', 0.1, 0.3);
    setTimeout(() => this.tocarTom(659.25, 'triangle', 0.1, 0.3), 80);
    setTimeout(() => this.tocarTom(783.99, 'triangle', 0.2, 0.3), 160);
  }

  danoMago() {
    this.tocarTom(120, 'sawtooth', 0.25, 0.4);
  }

  somDerrotaJogo() {
    this.tocarTom(200, 'sawtooth', 0.2, 0.3);
    setTimeout(() => this.tocarTom(150, 'sawtooth', 0.3, 0.3), 200);
    setTimeout(() => this.tocarTom(90, 'square', 0.6, 0.4), 400);
  }

  chefeDano() {
    this.tocarTom(180, 'square', 0.2, 0.35);
  }

  chefeDerrota() {
    this.tocarTom(250, 'sawtooth', 0.15, 0.4);
    setTimeout(() => this.tocarTom(130, 'sawtooth', 0.3, 0.4), 100);
    setTimeout(() => this.tocarTom(70, 'square', 0.6, 0.5), 250);
  }
}