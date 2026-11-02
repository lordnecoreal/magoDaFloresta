import { MotorJogo } from './motorjogo.js';
import { SistemaMapa } from './mapa.js';
import { SistemaAudio } from './audio.js';
import { SistemaLoja } from './loja.js';
import { SistemaInventario } from './inventario.js';
import { Interface } from './interface.js'; // <--- NOVO IMPORT

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const menuInicial = document.getElementById('menu-inicial');
  const hud = document.getElementById('hud');
  const controlesMobile = document.getElementById('controles-mobile');
  const btnGrimorio = document.getElementById('btn-grimorio');
  const modalInstrucoes = document.getElementById('modal-instrucoes');
  
  const btnIniciar = document.getElementById('btn-iniciar');
  const btnInstrucoes = document.getElementById('btn-instrucoes');
  const btnFecharInstrucoes = document.getElementById('btn-fechar-instrucoes');
  
  const rangeVolume = document.getElementById('range-volume');
  const valVolume = document.getElementById('val-volume');
  const selectVidas = document.getElementById('select-vidas');
  const valVidas = document.getElementById('val-vidas');

  // CRIA O EFEITO DE FADE (TELA PRETA) VIA JS
  const fadeOverlay = document.createElement('div');
  fadeOverlay.id = 'fade-overlay';
  fadeOverlay.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:#000;opacity:0;pointer-events:none;transition:opacity 1s ease;z-index:9999;';
  document.body.appendChild(fadeOverlay);

  let sistemaMapa = null;
  let audioGlobal = null;
  let estadoGlobal = { ouro: 80, inventario: null, jogador: null, pontos: 0 };

  const tocarMusicaSegura = (metodo) => {
    if (!audioGlobal) return;
    if (typeof audioGlobal[metodo] === 'function') audioGlobal[metodo]();
  };

  const pararMusicaSegura = () => {
    if (!audioGlobal) return;
    if (typeof audioGlobal.pararMusica === 'function') audioGlobal.pararMusica();
    if (typeof audioGlobal.pararMusicaFundo === 'function') audioGlobal.pararMusicaFundo();
  };

  const iniciarFase = (mundo, sub) => {
    Interface.limparFade();
    const config = {
      volume: parseInt(rangeVolume.value) / 100,
      vidas: parseInt(selectVidas.value)
    };

    menuInicial.style.display = 'none';
    hud.style.display = 'flex';
    
    if (btnGrimorio) btnGrimorio.style.display = 'flex';
    if ('ontouchstart' in window || window.innerWidth <= 800) {
      controlesMobile.style.display = 'flex';
    }

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    pararMusicaSegura();
    if (!audioGlobal) audioGlobal = new SistemaAudio(config.volume);

    const jogo = new MotorJogo(canvas, config, (m, f) => {
      // CALLBACK DISPARADO QUANDO O CALDEIRÃO É TOCADO
      Interface.iniciarFade(); // Escurece a tela via CSS
      
      setTimeout(() => {
        hud.style.display = 'none';
        controlesMobile.style.display = 'none';
        if (btnGrimorio) btnGrimorio.style.display = 'none';

        if (jogo) {
          estadoGlobal.ouro = jogo.ouro;
          estadoGlobal.inventario = jogo.inventario;
          estadoGlobal.jogador = jogo.jogador;
          estadoGlobal.pontos = jogo.pontos;
        }

        if (!sistemaMapa) {
          sistemaMapa = new SistemaMapa(
            (mundo, fase) => iniciarFase(mundo, fase),
            () => abrirLojaNoMapa(),
            canvas, ctx, audioGlobal
          );
        }

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        if (m && f) {
          sistemaMapa.desbloquearProximaFase(m, f);
          sistemaMapa.desenharMapa(ctx, canvas, window.innerWidth <= 800, true);
        } else {
          sistemaMapa.desenharMapa(ctx, canvas, window.innerWidth <= 800, false);
        }
        
        Interface.limparFade(); // Mostra o mapa suavemente
      }, 1000);
    }, estadoGlobal);
    
    jogo.iniciarFase(mundo, sub);
    jogo.iniciar();
  };

  const abrirLojaNoMapa = () => {
    const lojaFake = {
      ouro: estadoGlobal.ouro,
      inventario: estadoGlobal.inventario,
      jogador: estadoGlobal.jogador,
      audio: audioGlobal,
      atualizarHUD: () => { estadoGlobal.ouro = lojaFake.ouro; }
    };

    if (!lojaFake.jogador) {
      lojaFake.jogador = {
        hp: 100, maxHp: 100, 
        vidas: parseInt(selectVidas.value), maxVidas: parseInt(selectVidas.value), 
        mana: 100, maxMana: 100
      };
    }
    
    if (!lojaFake.inventario) {
      lojaFake.inventario = new SistemaInventario(4, () => {});
    }

    document.getElementById('loja-modal').style.display = 'block';
    SistemaLoja.atualizarVisual(lojaFake);

    const ligarBotao = (id, tipo) => {
      const el = document.getElementById(id);
      if (el) {
        el.onclick = () => SistemaLoja.comprar(tipo, lojaFake);
        el.ontouchstart = (e) => { e.preventDefault(); SistemaLoja.comprar(tipo, lojaFake); };
      }
    };
    ligarBotao('comprar-pocao', 'pocao');
    ligarBotao('comprar-coracao', 'coracao');
    ligarBotao('comprar-gelo', 'gelo');
    ligarBotao('comprar-veneno', 'veneno');
    ligarBotao('comprar-trovao', 'trovao');
    ligarBotao('comprar-hp', 'hp');
    ligarBotao('comprar-mana', 'mana');

    const btnFechar = document.getElementById('fechar-loja');
    if (btnFechar) {
      btnFechar.onclick = () => {
        document.getElementById('loja-modal').style.display = 'none';
        estadoGlobal.ouro = lojaFake.ouro;
        if (sistemaMapa) {
          sistemaMapa.lojaAberta = false;
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
          sistemaMapa.desenharMapa(ctx, canvas, window.innerWidth <= 800, false);
        }
      };
    }
  };

  const abrirMapa = () => {
    if (!audioGlobal) audioGlobal = new SistemaAudio(parseInt(rangeVolume.value) / 100);
    
    pararMusicaSegura();
    tocarMusicaSegura('tocarMusicaMapa');

    if (!sistemaMapa) {
      sistemaMapa = new SistemaMapa(
        (mundo, fase) => iniciarFase(mundo, fase),
        () => abrirLojaNoMapa(),
        canvas, ctx, audioGlobal
      );
    }
    hud.style.display = 'none';
    controlesMobile.style.display = 'none';
    if (btnGrimorio) btnGrimorio.style.display = 'none';

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    sistemaMapa.desenharMapa(ctx, canvas, window.innerWidth <= 800, false);
  };

  window.addEventListener('resize', () => {
    if (sistemaMapa && sistemaMapa.rodando) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      sistemaMapa.escalaMapa = Math.max(canvas.width / 1400, canvas.height / 500);
      sistemaMapa.offsetX = (canvas.width - 1400 * sistemaMapa.escalaMapa) / 2;
      sistemaMapa.offsetY = (canvas.height - 500 * sistemaMapa.escalaMapa) / 2;
    }
  });

  rangeVolume.oninput = (e) => valVolume.innerText = e.target.value;
  selectVidas.oninput = (e) => valVidas.innerText = e.target.value;

  if (btnInstrucoes && modalInstrucoes) {
    btnInstrucoes.onclick = () => { modalInstrucoes.style.display = 'flex'; };
    btnFecharInstrucoes.onclick = () => { modalInstrucoes.style.display = 'none'; };
  }

  btnIniciar.onclick = () => {
    menuInicial.style.display = 'none';
    abrirMapa();
  };
});