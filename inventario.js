export class SistemaInventario {
  constructor(capacidade = 8, onEquipar) {
    this.capacidade = capacidade;
    this.itens = [];
    this.itemEquipado = 'livro_fogo';
    this.onEquipar = onEquipar;
    
    this.adicionarItem('livro_fogo');
  }

  adicionarItem(tipoItem) {
    const mapa = {
      livro_fogo: { nome: 'Chama Arcana', cor: '#ef4444', magia: 'Chama Arcana (Z)', corProj: '#ef4444' },
      livro_gelo: { nome: 'Lança Gelo', cor: '#3b82f6', magia: 'Lança Gelo (Z)', corProj: '#38bdf8' },
      livro_veneno: { nome: 'Chuva Veneno', cor: '#a855f7', magia: 'Chuva Veneno (Z)', corProj: '#c084fc' },
      livro_cura: { nome: 'Aura Curativa', cor: '#22c55e', magia: 'Aura Curativa (Z)', corProj: '#4ade80' }
    };

    const info = mapa[tipoItem];
    if (!info) return;

    const existente = this.itens.find(i => i.tipo === tipoItem);
    if (existente) {
      existente.quantidade++;
    } else if (this.itens.length < this.capacidade) {
      this.itens.push({ tipo: tipoItem, ...info, quantidade: 1 });
    }

    this.renderizar();
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