export class SistemaLoja {
  static atualizarVisual(jogo) {
    const lojaOuro = document.getElementById('loja-ouro');
    if (lojaOuro) lojaOuro.innerText = jogo.ouro;

    const btnCoracao = document.getElementById('comprar-coracao');
    if (btnCoracao) {
      btnCoracao.innerHTML = `<span>[2] Coração Extra (+1 Vida)</span> <span>🪙 40</span>`;
    }

    const btnGelo = document.getElementById('comprar-gelo');
    if (btnGelo) btnGelo.style.display = (jogo.inventario && jogo.inventario.possuiItem('livro_gelo')) ? 'none' : 'flex';
    
    const btnVeneno = document.getElementById('comprar-veneno');
    if (btnVeneno) btnVeneno.style.display = (jogo.inventario && jogo.inventario.possuiItem('livro_veneno')) ? 'none' : 'flex';
    
    const btnTrovao = document.getElementById('comprar-trovao');
    if (btnTrovao) btnTrovao.style.display = (jogo.inventario && jogo.inventario.possuiItem('livro_trovao')) ? 'none' : 'flex';

    if (jogo.atualizarHUD) jogo.atualizarHUD();
  }

  static comprar(tipo, jogo) {
    const msgEl = document.getElementById('loja-msg');
    
    if (tipo === 'pocao') {
      if (jogo.jogador.hp === jogo.jogador.maxHp && jogo.jogador.vidas === jogo.jogador.maxVidas) {
        msgEl.innerText = '⚠ Sua saúde e corações já estão cheios!'; return;
      }
      if (jogo.ouro >= 20) {
        jogo.ouro -= 20; 
        jogo.jogador.hp = jogo.jogador.maxHp; 
        jogo.jogador.vidas = jogo.jogador.maxVidas;
        jogo.audio.compra(); 
        msgEl.innerText = '✔ Poção usada! HP e Corações 100% restaurados.';
      } else { msgEl.innerText = '✖ Ouro insuficiente!'; }
    } 
    else if (tipo === 'coracao') {
      const maxVidasAtual = jogo.jogador.maxVidas || 3;
      if (maxVidasAtual >= 10) { msgEl.innerText = '⚠ Limite máximo de 10 Corações!'; return; }
      if (jogo.ouro >= 40) {
        jogo.ouro -= 40; 
        jogo.jogador.maxVidas += 1; 
        jogo.jogador.vidas += 1; 
        jogo.audio.compra(); 
        msgEl.innerText = `✔ Coração Extra adquirido! Total: ${jogo.jogador.maxVidas}/10`;
        if (jogo.atualizarHUD) jogo.atualizarHUD();
      } else { msgEl.innerText = '✖ Ouro insuficiente!'; }
    } 
    else if (tipo === 'hp') {
      if (jogo.ouro >= 50) {
        jogo.ouro -= 50;
        jogo.jogador.maxHp += 100;
        jogo.jogador.hp = jogo.jogador.maxHp;
        jogo.audio.compra();
        msgEl.innerText = '✔ Poção de Vida! +100 HP máximo.';
        if (jogo.atualizarHUD) jogo.atualizarHUD();
      } else { msgEl.innerText = '✖ Ouro insuficiente!'; }
    } 
    else if (tipo === 'mana') {
      if (jogo.ouro >= 50) {
        jogo.ouro -= 50;
        jogo.jogador.maxMana += 100;
        jogo.jogador.mana = jogo.jogador.maxMana;
        jogo.audio.compra();
        msgEl.innerText = '✔ Poção de Mana! +100 MP máximo.';
        if (jogo.atualizarHUD) jogo.atualizarHUD();
      } else { msgEl.innerText = '✖ Ouro insuficiente!'; }
    }
    else if (tipo === 'gelo') {
      if (jogo.inventario && jogo.inventario.possuiItem('livro_gelo')) { msgEl.innerText = '⚠ Você já possui a Lança de Gelo!'; return; }
      if (jogo.ouro >= 50) {
        jogo.ouro -= 50; 
        jogo.inventario.adicionarItem('livro_gelo'); 
        jogo.inventario.equipar('livro_gelo');
        jogo.audio.compra(); 
        msgEl.innerText = '✔ Lança de Gelo adquirida!';
      } else { msgEl.innerText = '✖ Ouro insuficiente!'; }
    } 
    else if (tipo === 'veneno') {
      if (jogo.inventario && jogo.inventario.possuiItem('livro_veneno')) { msgEl.innerText = '⚠ Você já possui a Chuva de Veneno!'; return; }
      if (jogo.ouro >= 60) {
        jogo.ouro -= 60; 
        jogo.inventario.adicionarItem('livro_veneno'); 
        jogo.inventario.equipar('livro_veneno');
        jogo.audio.compra(); 
        msgEl.innerText = '✔ Chuva de Veneno adquirida!';
      } else { msgEl.innerText = '✖ Ouro insuficiente!'; }
    } 
    else if (tipo === 'trovao') {
      if (jogo.inventario && jogo.inventario.possuiItem('livro_trovao')) { msgEl.innerText = '⚠ Você já possui o Raio Trovejante!'; return; }
      if (jogo.ouro >= 70) {
        jogo.ouro -= 70; 
        jogo.inventario.adicionarItem('livro_trovao'); 
        jogo.inventario.equipar('livro_trovao');
        jogo.audio.compra(); 
        msgEl.innerText = '✔ Raio Trovejante adquirido!';
      } else { msgEl.innerText = '✖ Ouro insuficiente!'; }
    }
    SistemaLoja.atualizarVisual(jogo);
  }
}