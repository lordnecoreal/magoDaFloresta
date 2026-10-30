export function gerarFases() {
  const fases = {};
  const totalMundos = 5;

  for (let mundo = 1; mundo <= totalMundos; mundo++) {
    for (let sub = 1; sub <= 3; sub++) {
      const chave = `${mundo}-${sub}`;
      const ehChefao = (sub === 3);

      const obstaculos = [
        { tipo: 'chao', x: 0, y: 380, largura: ehChefao ? 2500 : 3800, altura: 120 }
      ];

      const corFolhas = ehChefao ? '#334155' : '#14532d';
      const numArvores = ehChefao ? 4 : 7;
      for (let a = 0; a < numArvores; a++) {
        obstaculos.push({
          tipo: 'arvore',
          x: 180 + a * 480,
          y: 160,
          largura: 110,
          altura: 220,
          corFolhas: corFolhas
        });
      }

      if (!ehChefao) {
        obstaculos.push(
          { tipo: 'cano', x: 500, y: 320, largura: 52, altura: 60, cor: 'verde' },
          { tipo: 'loja', x: 1200, y: 310, largura: 60, altura: 70 },
          { tipo: 'bloco', x: 350, y: 240, largura: 32, altura: 32, misterioso: true, item: 'livro_fogo' }
        );
      } else {
        obstaculos.push(
          { tipo: 'loja', x: 800, y: 310, largura: 60, altura: 70 }
        );
      }

      const moedas = [];
      for (let m = 250; m < 3000; m += 200) {
        moedas.push({ x: m, y: 320, largura: 18, altura: 18, coletada: false });
      }

      const inimigos = [];
      if (!ehChefao) {
        inimigos.push(
          { id: 1, x: 600, y: 334, largura: 46, altura: 46, estado: 'vivo', direcao: -1, velocidade: 70, hp: 2, tipo: 'cogumelo', minX: 450, maxX: 900 },
          { id: 2, x: 1400, y: 334, largura: 46, altura: 46, estado: 'vivo', direcao: 1, velocidade: 70, hp: 2, tipo: 'cogumelo', minX: 1250, maxX: 1700 }
        );
      } else {
        inimigos.push({
          id: 99,
          x: 1700,
          y: 260,
          largura: 120,
          altura: 120,
          estado: 'vivo',
          direcao: -1,
          velocidade: 50,
          hp: 15 + mundo * 5,
          ehBoss: true,
          tipo: 'dragao',
          minX: 1400,
          maxX: 2100
        });
      }

      fases[chave] = {
        nome: ehChefao ? `Guardião Dragão (Mundo ${mundo})` : `Trilha ${chave}`,
        larguraMapa: ehChefao ? 2500 : 3800,
        chefao: ehChefao,
        obstaculos,
        inimigos,
        moedas,
        bandeiraX: ehChefao ? 2100 : 3300,
        portalX: ehChefao ? 2300 : 3500
      };
    }
  }

  return fases;
}