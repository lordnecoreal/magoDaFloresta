export class Interface {
  static atualizarHUD(jogador, ouro, pontos, mundo, sub) {
    const elVidas = document.getElementById('hud-vidas-texto');
    if (elVidas) elVidas.innerText = '❤️'.repeat(Math.max(0, jogador.vidas));
    
    const barraHp = document.getElementById('barra-hp');
    if (barraHp) barraHp.style.width = `${(jogador.hp / jogador.maxHp) * 100}%`;
    
    const barraMana = document.getElementById('barra-mana');
    if (barraMana) barraMana.style.width = `${(jogador.mana / jogador.maxMana) * 100}%`;

    const hudHp = document.getElementById('hud-hp');
    if (hudHp) hudHp.innerText = Math.floor(jogador.hp);
    const hudMaxHp = document.getElementById('hud-maxhp');
    if (hudMaxHp) hudMaxHp.innerText = jogador.maxHp;
    
    const hudMana = document.getElementById('hud-mana');
    if (hudMana) hudMana.innerText = Math.floor(jogador.mana);
    const hudMaxMana = document.getElementById('hud-maxmana');
    if (hudMaxMana) hudMaxMana.innerText = jogador.maxMana;

    const hudOuro = document.getElementById('hud-ouro');
    if (hudOuro) hudOuro.innerText = ouro;
    const hudPontos = document.getElementById('hud-pontos');
    if (hudPontos) hudPontos.innerText = String(pontos).padStart(6, '0');
    const hudFase = document.getElementById('hud-fase');
    if (hudFase) hudFase.innerText = `${mundo}-${sub}`;
  }

  static mostrarMensagemLoja(msg) {
    const msgEl = document.getElementById('loja-msg');
    if (msgEl) msgEl.innerText = msg;
  }

  static iniciarFade() {
    const fade = document.getElementById('fade-overlay');
    if (fade) fade.style.opacity = '1';
  }

  static limparFade() {
    const fade = document.getElementById('fade-overlay');
    if (fade) fade.style.opacity = '0';
  }
}