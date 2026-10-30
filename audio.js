export class SistemaAudio {
  constructor(volumeInicial = 0.5) {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.volumeMaster = volumeInicial;
    this.intervaloMusica = null;
  }

  setVolume(vol) {
    this.volumeMaster = Math.max(0, Math.min(1, vol));
  }

  tocarTom(freq, tipo, duracao, ganhoMax = 0.1) {
    if (this.volumeMaster <= 0) return;
    try {
      if (this.ctx.state === 'suspended') this.ctx.resume();

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = tipo;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(ganhoMax * this.volumeMaster, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duracao);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duracao);
    } catch (e) {}
  }

  iniciarMusicaFundo() {
    if (this.intervaloMusica) return;
    
    // Melodia de fundo em loop inspirado em RPGs clássicos
    const notas = [261.63, 329.63, 392.00, 523.25, 392.00, 329.63];
    let index = 0;

    this.intervaloMusica = setInterval(() => {
      if (this.volumeMaster > 0) {
        this.tocarTom(notas[index], 'triangle', 0.4, 0.08);
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
    this.tocarTom(300, 'sine', 0.15, 0.15);
    setTimeout(() => this.tocarTom(500, 'sine', 0.1, 0.1), 50);
  }

  magia() {
    this.tocarTom(800, 'triangle', 0.2, 0.12);
    setTimeout(() => this.tocarTom(450, 'sawtooth', 0.15, 0.1), 60);
  }

  acertoInimigo() {
    this.tocarTom(160, 'square', 0.2, 0.2);
  }

  stomp() {
    this.tocarTom(220, 'triangle', 0.12, 0.2);
    setTimeout(() => this.tocarTom(110, 'sine', 0.15, 0.2), 40);
  }

  moeda() {
    this.tocarTom(987.77, 'sine', 0.08, 0.1);
    setTimeout(() => this.tocarTom(1318.51, 'sine', 0.15, 0.1), 80);
  }

  compra() {
    this.tocarTom(523.25, 'triangle', 0.1, 0.15);
    setTimeout(() => this.tocarTom(659.25, 'triangle', 0.1, 0.15), 80);
    setTimeout(() => this.tocarTom(783.99, 'triangle', 0.2, 0.15), 160);
  }
}