import { MotorJogo } from './motorjogo.js';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');
  const menu = document.getElementById('menu-inicial');
  const hud = document.getElementById('hud');
  const controlesMobile = document.getElementById('controles-mobile');
  const btnGrimorio = document.getElementById('btn-grimorio');
  
  const btnIniciar = document.getElementById('btn-iniciar');
  const btnInstrucoes = document.getElementById('btn-instrucoes');
  const modalInstrucoes = document.getElementById('modal-instrucoes');
  const btnFecharInstrucoes = document.getElementById('btn-fechar-instrucoes');
  
  const rangeVolume = document.getElementById('range-volume');
  const valVolume = document.getElementById('val-volume');
  const selectVidas = document.getElementById('select-vidas');
  const valVidas = document.getElementById('val-vidas');

  rangeVolume.oninput = (e) => valVolume.innerText = e.target.value;
  selectVidas.oninput = (e) => valVidas.innerText = e.target.value;

  // Lógica da Janela de Instruções
  if (btnInstrucoes && modalInstrucoes) {
    btnInstrucoes.onclick = () => { modalInstrucoes.style.display = 'flex'; };
  }
  if (btnFecharInstrucoes && modalInstrucoes) {
    btnFecharInstrucoes.onclick = () => { modalInstrucoes.style.display = 'none'; };
  }

  // Inicia o Jogo
  btnIniciar.onclick = () => {
    const config = {
      volume: parseInt(rangeVolume.value) / 100,
      vidas: parseInt(selectVidas.value)
    };

    menu.style.display = 'none';
    hud.style.display = 'flex';
    
    if (btnGrimorio) {
      btnGrimorio.style.display = 'flex';
    }

    if ('ontouchstart' in window || window.innerWidth <= 800) {
      controlesMobile.style.display = 'flex';
    }

    // Mantém o canvas no tamanho exato da tela do celular para não cortar
    const isMobile = 'ontouchstart' in window || window.innerWidth <= 800;
    if (isMobile) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    } else {
      canvas.width = 800;
      canvas.height = 500;
    }

    const jogo = new MotorJogo(canvas, config);
    jogo.iniciar();
  };
});