export function gerarFases() {
  const fases = {};
  const totalMundos = 5;

  const temasMundos = {
    1: { nome: "Floresta Mágica", corChao: '#166534', corFolhas: '#14532d', bg: '#090d16' },
    2: { nome: "Mata com Cachoeira", corChao: '#0369a1', corFolhas: '#0284c7', bg: '#06283d' },
    3: { nome: "Cemitério da Capela", corChao: '#27272a', corFolhas: '#475569', bg: '#1e1b4b' },
    4: { nome: "Interior da Capela", corChao: '#3f3f46', corFolhas: '#71717a', bg: '#18181b' },
    5: { nome: "Masmorra do Chefe Final", corChao: '#18181b', corFolhas: '#27272a', bg: '#090d16' }
  };

  for (let mundo = 1; mundo <= totalMundos; mundo++) {
    for (let sub = 1; sub <= 3; sub++) {
      const chave = `${mundo}-${sub}`;
      const ehChefao = (sub === 3);
      const tema = temasMundos[mundo];

      const larguraFase = ehChefao ? 2500 : 3200 + mundo * 200;
      const obstaculos = [
        { tipo: 'chao', x: 0, y: 380, largura: larguraFase, altura: 120, cor: tema.corChao }
      ];

      // Plataformas acessíveis (altura ideal para o pulo de 450)
      if (!ehChefao) {
        if (sub === 1) {
          obstaculos.push(
            { tipo: 'plataforma', x: 400, y: 290, largura: 110, height: 20 },
            { tipo: 'plataforma', x: 800, y: 240, largura: 120, height: 20 },
            { tipo: 'plataforma', x: 1300, y: 270, largura: 100, height: 20 }
          );
        } else {
          obstaculos.push(
            { tipo: 'plataforma', x: 500, y: 260, largura: 130, height: 20 },
            { tipo: 'plataforma', x: 1000, y: 220, largura: 110, height: 20 },
            { tipo: 'plataforma', x: 1500, y: 250, largura: 120, height: 20 }
          );
        }
        // Mercador aparece apenas nas fases 1 e 2 de cada mundo (NUNCA no chefe)
        obstaculos.push({ tipo: 'loja', x: 1100, y: 280, largura: 100, height: 100 });
      } else {
        obstaculos.push(
          { tipo: 'plataforma', x: 700, y: 270, largura: 140, height: 20 },
          { tipo: 'plataforma', x: 1400, y: 230, largura: 140, height: 20 }
        );
      }

      // Árvores ou Elementos de Cenário únicos por mundo
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
        moedas.push({ x: m, y: 310, largura: 18, height: 18, coletada: false });
      }

      // Inimigos e Chefes específicos
      const inimigos = [];
      if (!ehChefao) {
        inimigos.push(
          { id: 1, x: 700, y: 334, largura: 46, altura: 46, estado: 'vivo', direcao: -1, velocidade: 60 + mundo * 5, hp: 2 + mundo, tipo: mundo === 3 ? 'fantasma' : 'cogumelo', minX: 400, maxX: 1000 },
          { id: 2, x: 1600, y: 334, largura: 46, altura: 46, estado: 'vivo', direcao: 1, velocidade: 60 + mundo * 5, hp: 2 + mundo, tipo: mundo === 2 ? 'fantasma' : 'cogumelo', minX: 1200, maxX: 1900 }
        );
      } else {
        let nomeBoss = `Guardião do Mundo ${mundo}`;
        if (mundo === 1) nomeBoss = "Lorde Cogumelo da Floresta";
        if (mundo === 2) nomeBoss = "Monstro da Cachoeira";
        if (mundo === 3) nomeBoss = "Espectro da Capela";
        if (mundo === 4) nomeBoss = "Guardião Interno";
        if (mundo === 5) nomeBoss = "Imperatriz Sombria (Chefe Final)";

        inimigos.push({
          id: 99,
          x: larguraFase - 600,
          y: 260,
          largura: 120,
          altura: 120,
          estado: 'vivo',
          direcao: -1,
          velocidade: 45 + mundo * 10,
          hp: 15 + mundo * 8,
          ehBoss: true,
          nome: nomeBoss,
          tipo: mundo === 3 ? 'fantasma' : 'dragao',
          minX: larguraFase - 900,
          maxX: larguraFase - 300
        });
      }

      let nomeFase = `${tema.nome} - Parte ${sub}`;
      if (ehChefao) nomeFase = `Confronto: ${inimigos[0].nome}`;

      fases[chave] = {
        nome: nomeFase,
        mundo: mundo,
        larguraMapa: larguraFase,
        chefao: ehChefao,
        obstaculos,
        inimigos,
        moedas,
        portalX: larguraFase - 250
      };
    }
  }

  return fases;
}