export function gerarFases() {
  const fases = {};
  const totalMundos = 4;
  const fasesPorMundo = 4;

  const temasMundos = {
    1: { nome: "Floresta Mágica", corChao: '#166534', corFolhas: '#14532d', bg: '#090d16' },
    2: { nome: "Mato da Cachoeira", corChao: '#064e3b', corFolhas: '#065f46', bg: '#022c22' },
    3: { nome: "Cemitério da Capela", corChao: '#27272a', corFolhas: '#475569', bg: '#1e1b4b' },
    4: { nome: "Masmorra da Capela", corChao: '#3f3f46', corFolhas: '#71717a', bg: '#18181b' }
  };

  for (let mundo = 1; mundo <= totalMundos; mundo++) {
    for (let sub = 1; sub <= fasesPorMundo; sub++) {
      const chave = `${mundo}-${sub}`;
      const ehChefao = (sub === 4);
      const tema = temasMundos[mundo];

      const larguraFase = ehChefao ? 2500 : 3200 + mundo * 200;
      
      // Apenas o chão
      const obstaculos = [
        { tipo: 'chao', x: 0, y: 380, largura: larguraFase, altura: 120, cor: tema.corChao }
      ];

      // Plataformas
      if (!ehChefao) {
        if (sub === 1) {
          obstaculos.push(
            { tipo: 'plataforma', x: 400, y: 250, largura: 110, altura: 20 },
            { tipo: 'plataforma', x: 800, y: 220, largura: 120, altura: 20 },
            { tipo: 'plataforma', x: 1300, y: 240, largura: 100, altura: 20 }
          );
        } else {
          obstaculos.push(
            { tipo: 'plataforma', x: 500, y: 230, largura: 130, altura: 20 },
            { tipo: 'plataforma', x: 1000, y: 200, largura: 110, altura: 20 },
            { tipo: 'plataforma', x: 1500, y: 220, largura: 120, altura: 20 }
          );
        }
        // A Tenda foi REMOVIDA daqui. Ela agora só existe no mapa.js.
        
      } else {
        obstaculos.push(
          { tipo: 'plataforma', x: 700, y: 250, largura: 140, altura: 20 },
          { tipo: 'plataforma', x: 1400, y: 220, largura: 140, altura: 20 }
        );
      }

      // Árvores (apenas decoração, não colidem)
      const numElementos = ehChefao ? 3 : 5;
      for (let a = 0; a < numElementos; a++) {
        obstaculos.push({
          tipo: 'arvore',
          x: 250 + a * 550 + (sub * 30),
          y: 160,
          largura: 110,
          altura: 220,
          corFolhas: tema.corFolhas,
          estiloMundo: mundo
        });
      }

      // Moedas
      const moedas = [];
      for (let m = 200; m < larguraFase - 200; m += 180) {
        moedas.push({ x: m, y: 310, largura: 18, altura: 18, coletada: false });
      }

      const inimigos = [];
      
      // Inimigos normais
      if (!ehChefao) {
        if (mundo === 1) {
          inimigos.push(
            { id: 1, x: 700, y: 334, largura: 46, altura: 46, estado: 'vivo', direcao: -1, velocidade: 60, hp: 100, maxHp: 100, tipo: 'cogumelo', minX: 400, maxX: 1000, fraqueza: 'fogo' },
            { id: 2, x: 1600, y: 334, largura: 46, altura: 46, estado: 'vivo', direcao: 1, velocidade: 60, hp: 100, maxHp: 100, tipo: 'cogumelo', minX: 1200, maxX: 1900, fraqueza: 'fogo' }
          );
        } else if (mundo === 2) {
          inimigos.push(
            { id: 1, x: 700, y: 334, largura: 46, altura: 46, estado: 'vivo', direcao: -1, velocidade: 70, hp: 150, maxHp: 150, tipo: 'sapo', minX: 400, maxX: 1000, fraqueza: 'trovao' },
            { id: 2, x: 1600, y: 334, largura: 46, altura: 46, estado: 'vivo', direcao: 1, velocidade: 70, hp: 150, maxHp: 150, tipo: 'sapo', minX: 1200, maxX: 1900, fraqueza: 'trovao' }
          );
        } else if (mundo === 3) {
          inimigos.push(
            { id: 1, x: 700, y: 334, largura: 46, altura: 46, estado: 'vivo', direcao: -1, velocidade: 80, hp: 200, maxHp: 200, tipo: 'fantasma', minX: 400, maxX: 1000, fraqueza: 'veneno' },
            { id: 2, x: 1600, y: 334, largura: 46, altura: 46, estado: 'vivo', direcao: 1, velocidade: 80, hp: 200, maxHp: 200, tipo: 'fantasma', minX: 1200, maxX: 1900, fraqueza: 'veneno' }
          );
        } else if (mundo === 4) {
          inimigos.push(
            { id: 1, x: 700, y: 334, largura: 46, altura: 46, estado: 'vivo', direcao: -1, velocidade: 90, hp: 250, maxHp: 250, tipo: 'esqueleto', minX: 400, maxX: 1000, fraqueza: 'fogo' },
            { id: 2, x: 1600, y: 334, largura: 46, altura: 46, estado: 'vivo', direcao: 1, velocidade: 90, hp: 250, maxHp: 250, tipo: 'esqueleto', minX: 1200, maxX: 1900, fraqueza: 'fogo' }
          );
        }
      } 
      // Chefes
      else {
        let boss = {};
        if (mundo === 1) { boss = { nome: "Goblin Lorde", hp: 500, tipo: 'goblin', fraqueza: 'gelo', cor: '#65a30d' }; }
        else if (mundo === 2) { boss = { nome: "Sapo Ancião", hp: 800, tipo: 'sapo_boss', fraqueza: 'trovao', cor: '#22c55e' }; }
        else if (mundo === 3) { boss = { nome: "Cavaleiro Espectral", hp: 1200, tipo: 'cavaleiro', fraqueza: 'fogo', cor: '#a855f7' }; }
        else if (mundo === 4) { boss = { nome: "Imperatriz Sombria", hp: 2000, tipo: 'imperatriz', fraqueza: 'trovao', cor: '#991b1b' }; }

        inimigos.push({
          id: 99, x: larguraFase - 600, y: 260, largura: 120, altura: 120,
          estado: 'vivo', direcao: -1, velocidade: 45 + mundo * 10,
          hp: boss.hp, maxHp: boss.hp, ehBoss: true, nome: boss.nome, tipo: boss.tipo, fraqueza: boss.fraqueza, cor: boss.cor,
          minX: larguraFase - 900, maxX: larguraFase - 300
        });

        if (mundo === 4 && sub === 4) {
           obstaculos.push({ tipo: 'gaiola', x: larguraFase - 300, y: 280, largura: 60, altura: 100 });
           inimigos.push({
             id: 100, x: larguraFase - 290, y: 330, largura: 40, altura: 40,
             estado: 'vivo', direcao: 1, velocidade: 0, hp: 1, maxHp: 1, tipo: 'gatinho', minX: 0, maxX: 0
           });
        }
      }

      let nomeFase = `${tema.nome} - Parte ${sub}`;
      if (ehChefao) nomeFase = `Confronto: ${inimigos[0].nome}`;

      fases[chave] = {
        nome: nomeFase, mundo: mundo, larguraMapa: larguraFase, chefao: ehChefao,
        obstaculos, inimigos, moedas, portalX: larguraFase - 250
      };
    }
  }

  return fases;
}