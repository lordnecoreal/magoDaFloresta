export class SistemaInventario {
  constructor(capacidade = 8, onEquipar) {
    this.capacidade = capacidade;
    this.itens = [];
    this.itemEquipado = 'livro_fogo';
    this.onEquipar = onEquipar;
    
    this.adicionarItem('livro_fogo');
  }

  possuiItem(tipoItem) {
    return this.itens.some(i => i.tipo === tipoItem);
  }

  adicionarItem(tipoItem) {
    const mapa = {
      livro_fogo: { nome: 'Chama Arcana', cor: '#ef4444', magia: 'Chama Arcana (Z)', corProj: '#ef4444', tipoProjetil: 'fogo' },
      livro_gelo: { nome: 'Lança Gelo', cor: '#3b82f6', magia: 'Lança Gelo (Z)', corProj: '#38bdf8', tipoProjetil: 'gelo' },
      livro_veneno: { nome: 'Chuva Veneno', cor: '#a855f7', magia: 'Chuva Veneno (Z)', corProj: '#c084fc', tipoProjetil: 'veneno' },
      livro_trovao: { nome: 'Raio Trovejante', cor: '#fde047', magia: 'Raio Trovejante (Z)', corProj: '#fde047', tipoProjetil: 'trovao' }, // <--- NOVO
      livro_cura: { nome: 'Aura Curativa', cor: '#22c55e', magia: 'Aura Curativa (Z)', corProj: '#4ade80', tipoProjetil: 'cura' }
    };
  

    const info = mapa[tipoItem];
    if (!info) return false;

    const existente = this.itens.find(i => i.tipo === tipoItem);
    if (existente) {
      existente.quantidade++;
    } else if (this.itens.length < this.capacidade) {
      this.itens.push({ tipo: tipoItem, ...info, quantidade: 1 });
    }

    this.renderizar();
    return true;
  }

  equipar(tipoItem) {
    const item = this.itens.find(i => i.tipo === tipoItem);
    if (!item) return;

    this.itemEquipado = tipoItem;
    if (this.onEquipar) this.onEquipar(item);
    this.renderizar();
  }

  renderizar() {
    const grid = document.getElementById('inventario-grid');
    if (!grid) return;
    grid.innerHTML = '';

    for (let i = 0; i < this.capacidade; i++) {
      const slot = document.createElement('div');
      slot.className = 'slot';

      const item = this.itens[i];
      if (item) {
        if (item.tipo === this.itemEquipado) slot.classList.add('ativo');

        const icone = document.createElement('div');
        icone.className = 'item-icone';
        icone.style.backgroundColor = item.cor;

        const qtd = document.createElement('span');
        qtd.className = 'qtd';
        qtd.innerText = item.quantidade > 1 ? item.quantidade : '';

        slot.appendChild(icone);
        slot.appendChild(qtd);
        slot.onclick = () => this.equipar(item.tipo);
      }

      grid.appendChild(slot);
    }
  }
}