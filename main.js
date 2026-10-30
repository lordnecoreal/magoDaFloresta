import { MotorJogo } from './motorjogo.js';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');
  const menu = document.getElementById('menu-inicial');
  const hud = document.getElementById('hud');
  const inventario = document.getElementById('inventario-container');
  
  const btnIniciar = document.getElementById('btn-iniciar');
  const rangeVolume = document.getElementById('range-volume');
  const valVolume = document.getElementById('val-volume');
  const selectVidas = document.getElementById('select-vidas');
  const valVidas = document.getElementById('val-vidas');

  rangeVolume.oninput = (e) => valVolume.innerText = e.target.value;
  selectVidas.oninput = (e) => valVidas.innerText = e.target.value;

  btnIniciar.onclick = () => {
    const config = {
      volume: parseInt(rangeVolume.value) / 100,
      vidas: parseInt(selectVidas.value)
    };

    menu.style.display = 'none';
    hud.style.display = 'flex';
    inventario.style.display = 'block';

    const jogo = new MotorJogo(canvas, config);
    jogo.iniciar();
  };
});