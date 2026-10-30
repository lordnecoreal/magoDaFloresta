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

  iniciarMusicaFundo() {
    if (this.intervaloMusica) return;
    
    const notas = [261.63, 329.63, 392.00, 523.25, 392.00, 329.63];
    let index = 0;

    this.intervaloMusica = setInterval(() => {
      if (this.volumeMaster > 0) {
        this.tocarTom(notas[index], 'triangle', 0.4, 0.15);
        index = (index + 1) % notas.length;
      }
    }, 450);
  }

  pararMusicaFundo() {
    if (this.intervaloMusica) {
      clearInterval(this.intervaloMusica);
      this.intervaloMusica = null;
    }
  }

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