document.addEventListener('DOMContentLoaded', () => {
    const inpNome = document.getElementById('produto-nome');
    const inpValor = document.getElementById('produto-valor');
    const btnAdd   = document.getElementById('btn-add');
    const listEL  = document.getElementById('produto-list');
    const totalEL = document.getElementById('total-geral');
  
    let produtos = [];
  
    // Converte "1.250,00" → número 1250.00
    function parseVal(str) {
      return parseFloat(str.replace(/\./g,'').replace(/,/g,'.')) || 0;
    }
    // Converte número → "1.250,00"
    function formatBR(v) {
      return v.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }
  
    // Adiciona produto à lista
    btnAdd.addEventListener('click', () => {
      const nome = inpNome.value.trim();
      const val  = parseVal(inpValor.value);
      if (!nome || val <= 0) {
        return alert('Preencha nome e valor corretamente.');
      }
      produtos.push({ nome, val });
      renderizaLista();
      inpNome.value = '';
      inpValor.value = '';
      inpNome.focus();
    });
  
    // Atualiza a lista no DOM
    function renderizaLista() {
      listEL.innerHTML = produtos.map((p, i) =>
        `<li>
           <span>${p.nome} — R$ ${formatBR(p.val)}</span>
           <button data-index="${i}">✖</button>
         </li>`
      ).join('');
      // configura botão de remover
      listEL.querySelectorAll('button').forEach(btn => {
        btn.onclick = () => {
          produtos.splice(+btn.dataset.index, 1);
          renderizaLista();
        };
      });
      atualizaTotal();
    }
  
    // Soma e exibe total
    function atualizaTotal() {
      const soma = produtos.reduce((acc, p) => acc + p.val, 0);
      totalEL.textContent = `R$ ${formatBR(soma)}`;
    }
  
    // Formatação do campo de valor
    inpValor.addEventListener('blur', e => {
      const n = parseVal(e.target.value);
      e.target.value = n ? formatBR(n) : '';
    });
    inpValor.addEventListener('focus', e => {
      const n = parseVal(e.target.value);
      if (n) e.target.value = formatBR(n);
    });
  });
  