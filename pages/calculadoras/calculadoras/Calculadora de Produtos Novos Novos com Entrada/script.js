document.addEventListener('DOMContentLoaded', () => {
    const etapas = document.querySelectorAll('.etapa');
    const passos = document.querySelectorAll('.progress-step');
    const prog = document.querySelector('.progress-indicator');
    const produtoInput = document.getElementById('produto-nome');
    const nomeInput = document.getElementById('nome-completo');
    const cpfInput = document.getElementById('cpf');
    const dataAtual = document.getElementById('data-atual');
    const diaSel = document.getElementById('novo-dia-pagamento');
    const valProd = document.getElementById('valor-produto');
    const valEnt = document.getElementById('valor-entrada');
    const list = document.getElementById('parcelas-options-produtos');
    const b1 = document.getElementById('btn-ir-para-parcelas');
    const b2 = document.getElementById('btn-ir-para-resumo');
    const bVol1 = document.getElementById('btn-voltar-para-dados');
    const bVol2 = document.getElementById('btn-voltar-para-parcelas');
    const bFin = document.getElementById('btn-finalizar');
  
    const res = {
      produto: document.getElementById('resumo-produto'),
      nome: document.getElementById('resumo-nome'),
      cpf: document.getElementById('resumo-cpf'),
      vp: document.getElementById('resumo-valor-produto'),
      ve: document.getElementById('resumo-entrada'),
      qt: document.getElementById('resumo-qtd-parcelas'),
      pv: document.getElementById('resumo-valor-parcela'),
      d1: document.getElementById('resumo-data-primeira'),
      d2: document.getElementById('resumo-data-ultima')
    };
  
    let fd = {};
  
    function fmt(v) {
      return isNaN(v) ? '' :
        v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }
  
    // Formata sem símbolo R$, com duas casas
    function fmtInput(v) {
      return isNaN(v) ? '' :
        v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
  
    function pnm(s) {
      return parseFloat(
        s.replace(/[^0-9,]/g, '')
         .replace(/,/g, '.')
      );
    }
  
    // Inicial
    dataAtual.value = new Date().toLocaleDateString('pt-BR');
  
    // Adiciona listeners de formatação
    [valProd, valEnt].forEach(input => {
      input.addEventListener('blur', e => {
        const n = pnm(e.target.value);
        e.target.value = !isNaN(n) ? fmtInput(n) : '';
      });
      input.addEventListener('focus', e => {
        const n = pnm(e.target.value);
        if (!isNaN(n)) e.target.value = fmtInput(n);
      });
    });
  
    function show(i) {
      etapas.forEach((e, idx) => e.classList.toggle('ativa', idx === i));
      passos.forEach((e, idx) => {
        e.classList.toggle('active', idx === i);
        e.classList.toggle('completed', idx < i);
      });
      prog.style.width = `${(i / (etapas.length - 1)) * 100}%`;
    }
  
    b1.onclick = () => {
      document.querySelectorAll('.error-message').forEach(e => e.style.display = 'none');
      let ok = true;
      const vp = pnm(valProd.value);
      const ve = pnm(valEnt.value);
      if (!produtoInput.value.trim()) { document.getElementById('error-produto-nome').style.display = 'block'; ok = false; }
      if (!nomeInput.value.trim()) { document.getElementById('error-nome-completo').style.display = 'block'; ok = false; }
      if (isNaN(vp) || vp <= 0) { document.getElementById('error-valor-produto').style.display = 'block'; ok = false; }
      if (isNaN(ve) || ve < 0 || ve > vp) { document.getElementById('error-valor-entrada').style.display = 'block'; ok = false; }
      if (!diaSel.value) { document.getElementById('error-novo-dia-pagamento').style.display = 'block'; ok = false; }
      if (!ok) return;
      fd = { produto: produtoInput.value.trim(), nome: nomeInput.value.trim(), cpf: cpfInput.value.trim(), dataAtual: dataAtual.value, diaPrimeira: +diaSel.value, valorProduto: vp, valorEntrada: ve };
      // Gera opções
      list.innerHTML = '';
      const taxa = 0.08;
      for (let i = 3; i <= 48; i += 3) {
        const f = Math.pow(1 + taxa, i);
        const pmt = ( (fd.valorProduto - fd.valorEntrada) * (taxa * f) ) / (f - 1);
        const div = document.createElement('div');
        div.className = 'parcela-option';
        div.innerHTML = `<input type="radio" id="p${i}" name="qtd-parcelas" value="${i}"><label for="p${i}">${i}x de <span>${fmt(pmt)}</span></label>`;
        list.appendChild(div);
      }
      show(1);
    };
  
    b2.onclick = () => {
      document.getElementById('error-parcelas-options').style.display = 'none';
      const sel = document.querySelector('input[name="qtd-parcelas"]:checked');
      if (!sel) { document.getElementById('error-parcelas-options').style.display = 'block'; return; }
      const n = +sel.value;
      const taxa = 0.08;
      const f = Math.pow(1 + taxa, n);
      const pmt = ( (fd.valorProduto - fd.valorEntrada) * (taxa * f) ) / (f - 1);
      const hoje = new Date();
      let ano = hoje.getFullYear(), mes = hoje.getMonth() + (hoje.getDate() >= fd.diaPrimeira ? 1 : 0);
      const d1 = new Date(ano, mes, fd.diaPrimeira);
      const du = new Date(d1); du.setMonth(du.getMonth() + n - 1);
      res.produto.textContent = fd.produto;
      res.nome.textContent = fd.nome;
      res.cpf.textContent = fd.cpf;
      res.vp.textContent = fmt(fd.valorProduto);
      res.ve.textContent = fmt(fd.valorEntrada);
      res.qt.textContent = n + 'x';
      res.pv.textContent = fmt(pmt);
      res.d1.textContent = d1.toLocaleDateString('pt-BR');
      res.d2.textContent = du.toLocaleDateString('pt-BR');
      show(2);
    };
  
    bVol1.onclick = () => show(0);
    bVol2.onclick = () => show(1);
  
    bFin.onclick = () => {
      const msg =
        `📦 Produto: ${fd.produto}
  ` +
        `👤 Nome: ${fd.nome}
  ` +
        `🧾 CPF: ${fd.cpf}
  ` +
        `💰 Valor Produto: ${fmt(fd.valorProduto)}
  ` +
        `💵 Entrada: ${fmt(fd.valorEntrada)}
  ` +
        `💳 Parcelas: ${res.qt.textContent}
  ` +
        `💸 Valor Parcela: ${res.pv.textContent}
  ` +
        `📆 1ª Parcela: ${res.d1.textContent}
  ` +
        `📅 Última Parcela: ${res.d2.textContent}`;
      window.open(`https://wa.me/5544998408460?text=${encodeURIComponent(msg)}`, '_blank');
    };
  
    show(0);
  });