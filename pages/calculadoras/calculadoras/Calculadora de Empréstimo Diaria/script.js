document.addEventListener('DOMContentLoaded', function () {
    // --- DOM Elements ---
    const etapas = document.querySelectorAll('.etapa');
    const passos = document.querySelectorAll('.progress-step');
    const progressIndicator = document.querySelector('.progress-indicator');
    const nomeInput = document.getElementById('nome-completo');
    const cpfInput = document.getElementById('cpf');
    const dataAtualInput = document.getElementById('data-atual');
    const valorEmprestimoInput = document.getElementById('valor-emprestimo');
    const prazoOptionsContainer = document.getElementById('prazo-options');
    const resumoNome = document.getElementById('resumo-nome');
    const resumoCpf = document.getElementById('resumo-cpf');
    const resumoDataSolicitacao = document.getElementById('resumo-data-solicitacao');
    const resumoValorSolicitado = document.getElementById('resumo-valor-solicitado');
    const resumoDataVencimento = document.getElementById('resumo-data-vencimento');
    const resumoValorTotal = document.getElementById('resumo-valor-total');
    const resumoObservacao = document.getElementById('resumo-observacao');
    const btnIrParaValor = document.getElementById('btn-ir-para-valor');
    const btnVoltarParaDados = document.getElementById('btn-voltar-para-dados');
    const btnIrParaPrazo = document.getElementById('btn-ir-para-prazo');
    const btnVoltarParaValor = document.getElementById('btn-voltar-para-valor');
    const btnIrParaResumo = document.getElementById('btn-ir-para-resumo');
    const btnVoltarParaPrazo = document.getElementById('btn-voltar-para-prazo');
    const btnFinalizar = document.getElementById('btn-finalizar');

    // --- State ---
    let etapaAtual = 0;
    const formData = {
        nome: '', cpf: '',
        dataSolicitacao: new Date(),
        valorEmprestimo: 0, prazoDias: 0, valorTotalPagar: 0,
        dataVencimento: null,
    };

    // --- Helper Functions ---
    function formatCurrency(value) { if (isNaN(value) || value === null) return ''; return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }
    function parseCurrency(value) { if (!value || typeof value !== 'string') return NaN; const nS = value.replace(/R\$\s?/g, '').replace(/\./g, '').replace(/,/g, '.'); return parseFloat(nS); }
    function formatDate(date) { if (!date || !(date instanceof Date)) return '-'; return date.toLocaleDateString('pt-BR'); }
    function validateCPF(cpf) { /* ...código validação CPF sem alterações... */
        cpf = cpf.replace(/[^\d]+/g, ''); if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false; let s=0,r; for(let i=1;i<=9;i++)s+=parseInt(cpf.substring(i-1,i))*(11-i); r=(s*10)%11; if(r===10||r===11)r=0; if(r!==parseInt(cpf.substring(9,10)))return false;
        s=0; for(let i=1;i<=10;i++)s+=parseInt(cpf.substring(i-1,i))*(12-i); r=(s*10)%11; if(r===10||r===11)r=0; if(r!==parseInt(cpf.substring(10,11)))return false; return true;
    }
     cpfInput.addEventListener('input', (e) => { /* ...código máscara CPF sem alterações... */
        let v = e.target.value.replace(/\D/g, '').substring(0, 11); v = v.replace(/(\d{3})(\d)/, '$1.$2'); v = v.replace(/(\d{3})(\d)/, '$1.$2'); v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2'); e.target.value = v;
     });
     valorEmprestimoInput.addEventListener('blur', (e) => { let v = e.target.value; const nV = parseCurrency(v); e.target.value = !isNaN(nV) ? formatCurrency(nV) : ''; clearError('valor-emprestimo'); });
     valorEmprestimoInput.addEventListener('focus', (e) => { let v = e.target.value; const nV = parseCurrency(v); if (!isNaN(nV)) { e.target.value = nV.toFixed(2).replace('.', ','); } });
     valorEmprestimoInput.addEventListener('input', () => clearError('valor-emprestimo'));

    // --- Interest Calculation ---
    function calculateTotalInterestPercent(prazoDias) { const startInterest=25.0, endInterest=100.0, startDays=1.0, endDays=30.0; if (prazoDias<=startDays) return startInterest; if (prazoDias>=endDays) return endInterest; return startInterest+(endInterest-startInterest)*(prazoDias-startDays)/(endDays-startDays); }
    // PMT function not needed

    // --- Error Handling ---
    function clearError(fieldId) { const id=`error-${fieldId}`; const e=document.getElementById(id); const i=document.getElementById(fieldId); const c=document.getElementById(`${fieldId}-options`); if(e)e.style.display='none'; if(i)i.classList.remove('is-invalid'); if(c)c.classList.remove('is-invalid'); }
    function showError(fieldId, message) { const id=`error-${fieldId}`; const e=document.getElementById(id); const i=document.getElementById(fieldId); const c=document.getElementById(`${fieldId}-options`); if(e){e.textContent=message;e.style.display='block';}else{console.warn(`Err el not found: ${id}`);} if(i)i.classList.add('is-invalid'); if(c)c.classList.add('is-invalid'); }

    // --- Validation Functions ---
    function validateStep1() { let v=true; clearError('nome-completo'); clearError('cpf'); if (!nomeInput.value.trim()) { showError('nome-completo','Nome obrigatório.');v=false; } if (!validateCPF(cpfInput.value)) { showError('cpf','CPF inválido.');v=false; } return v; }
    function validateStep2() { let v=true; clearError('valor-emprestimo'); const p=parseCurrency(valorEmprestimoInput.value); if (isNaN(p)||p<100) { showError('valor-emprestimo',`Mínimo ${formatCurrency(100)}.`);v=false; } else { formData.valorEmprestimo=p; } return v; }
    function validateStep3Prazo() { let v=true; clearError('prazo'); const r=prazoOptionsContainer.querySelector('input[name="prazo"]:checked'); if (!r) { showError('prazo','Selecione um prazo.');v=false; } else { formData.prazoDias=parseInt(r.value); } return v; }

    // --- UI Update Functions ---
    function updateProgressBar(idx) { passos.forEach((p, i)=>{ p.classList.toggle('completed',i<idx);p.classList.toggle('active',i===idx);});const t=passos.length;progressIndicator.style.width=`${t>1?(idx/(t-1))*100:0}%`; }
    function mostrarEtapa(idx) { etapas.forEach((e, i)=>e.classList.toggle('ativa',i===idx)); etapaAtual=idx; updateProgressBar(idx); }
    function calcularDataVencimento(prazoDias) { if (isNaN(prazoDias)||prazoDias<=0) return null; const d = new Date(formData.dataSolicitacao); d.setDate(d.getDate()+prazoDias); return d; }

    // --- Generate Options (Dias - com data de vencimento) ---
    /**
     * Gera as opções de prazo em dias (1 a 30) mostrando data e valor total.
     * @param {number} valorPrincipal - O valor do empréstimo solicitado.
     */
    function gerarOpcoesPrazo(valorPrincipal) {
        prazoOptionsContainer.innerHTML = ''; // Limpa opções antigas
        const errorDiv = document.createElement('div'); errorDiv.className = 'error-message'; errorDiv.id = 'error-prazo'; errorDiv.style.display = 'none';

        const minDays = 1; const maxDays = 30;

        for (let dias = minDays; dias <= maxDays; dias++) {
            const totalInterestPercent = calculateTotalInterestPercent(dias);
            const valorTotalComJuros = valorPrincipal * (1 + totalInterestPercent / 100.0);
            const valorTotalArredondado = Math.round(valorTotalComJuros * 100) / 100;

            // Calcula a data de vencimento para este prazo
            const dataVenc = calcularDataVencimento(dias);
            const dataVencFormatada = dataVenc ? formatDate(dataVenc) : 'Data inválida'; // Formata a data

            const optionDiv = document.createElement('div'); optionDiv.className = 'parcela-option'; // Reusa classe CSS
            const radioInput = document.createElement('input'); radioInput.type = 'radio';
            radioInput.name = 'prazo'; radioInput.value = dias; radioInput.id = `prazo-${dias}`;
            const label = document.createElement('label'); label.htmlFor = `prazo-${dias}`;

            // ***** INÍCIO DA ALTERAÇÃO NO LABEL *****
            // Mostra: "Pagar em X dias (DD/MM/YYYY): R$ YYY,YY"
            label.innerHTML = `
                Pagar em ${dias} dia${dias > 1 ? 's' : ''} <span class="data-vencimento">(${dataVencFormatada})</span>: <span>${formatCurrency(valorTotalArredondado)}</span>
            `;
            // ***** FIM DA ALTERAÇÃO NO LABEL *****

            optionDiv.appendChild(radioInput); optionDiv.appendChild(label);
            prazoOptionsContainer.appendChild(optionDiv);
        }
        prazoOptionsContainer.appendChild(errorDiv); // Adiciona o placeholder de erro
        // A validação se há opções é menos crítica aqui, pois sempre haverá de 1 a 30.
    }


    // --- Calculate Summary Data ---
    function calcularResumo() { if (isNaN(formData.prazoDias)||formData.prazoDias<=0||isNaN(formData.valorEmprestimo))return false; const p=calculateTotalInterestPercent(formData.prazoDias); const tA=formData.valorEmprestimo*(1+p/100.0); formData.valorTotalPagar=Math.round(tA*100)/100; formData.dataVencimento=calcularDataVencimento(formData.prazoDias); return formData.dataVencimento!==null; }

    // --- Populate Summary Fields ---
    function popularResumo() { resumoNome.textContent=formData.nome||'-'; resumoCpf.textContent=formData.cpf||'-'; resumoDataSolicitacao.textContent=formatDate(formData.dataSolicitacao)||'-'; resumoValorSolicitado.textContent=formatCurrency(formData.valorEmprestimo)||'-'; resumoDataVencimento.textContent=formatDate(formData.dataVencimento)||'-'; resumoValorTotal.textContent=formatCurrency(formData.valorTotalPagar)||'-'; resumoObservacao.textContent=`Você tem até ${formData.prazoDias} dia${formData.prazoDias>1?'s':''} para quitar este empréstimo.`||'-'; }

    // --- WhatsApp Integration ---
    function generateWhatsAppLink() { const num='5544998408460'; const h=new Date().getHours(); let s; if(h>=5&&h<12)s="Bom dia";else if(h>=12&&h<18)s="Boa tarde";else s="Boa noite"; const nome=formData.nome||'Cliente'; const cpf=formData.cpf||'Não informado'; const vS=formatCurrency(formData.valorEmprestimo)||'Não informado'; const dS=formatDate(formData.dataSolicitacao)||'Não informada'; const dV=formatDate(formData.dataVencimento)||'Não informada'; const vT=formatCurrency(formData.valorTotalPagar)||'Não informado'; const pD=formData.prazoDias||0; const msg=`✅ Resumo do Empréstimo\n👤 Nome: ${nome}\n🧾 CPF: ${cpf}\n📅 Data da Solicitação: ${dS}\n📥 Valor Solicitado: *${vS}*\n📆 Vencimento da Parcela ÚNICA: ${dV}\n💰 Valor Total a Pagar: *${vT}*\n\n📌 Observação: Você tem até ${pD} dia${pD>1?'s':''} para quitar este empréstimo.\n\n${s}! Confirma o envio destes dados para análise?`; const enc=encodeURIComponent(msg); return `https://wa.me/${num}?text=${enc}`; }

    // --- Event Listeners Setup ---
    formData.dataSolicitacao = new Date(); if (dataAtualInput) { dataAtualInput.value = formatDate(formData.dataSolicitacao); } else { console.error("El ID 'data-atual' not found!"); }
    nomeInput.addEventListener('input', () => clearError('nome-completo')); cpfInput.addEventListener('input', () => clearError('cpf'));
    prazoOptionsContainer.addEventListener('change', () => clearError('prazo'));

    // --- Navigation Logic ---
    btnIrParaValor.addEventListener('click',()=>{if(validateStep1()){formData.nome=nomeInput.value.trim();formData.cpf=cpfInput.value;mostrarEtapa(1);}});
    btnVoltarParaDados.addEventListener('click',()=>mostrarEtapa(0));
    btnIrParaPrazo.addEventListener('click',()=>{if(validateStep2()){gerarOpcoesPrazo(formData.valorEmprestimo);mostrarEtapa(2);}});
    btnVoltarParaValor.addEventListener('click',()=>mostrarEtapa(1));
    btnIrParaResumo.addEventListener('click',()=>{if(validateStep3Prazo()){if(calcularResumo()){popularResumo();mostrarEtapa(3);}else{alert("Erro ao calcular resumo.");}}});
    btnVoltarParaPrazo.addEventListener('click',()=>mostrarEtapa(2));
    btnFinalizar.addEventListener('click',()=>{if(formData.nome&&formData.cpf&&formData.valorEmprestimo>0&&formData.prazoDias>0&&formData.valorTotalPagar>0){const l=generateWhatsAppLink();window.open(l,'_blank');alert('Você será redirecionado.');}else{alert('Erro: Dados incompletos. Revise.');}});

    // --- Initialization ---
    mostrarEtapa(0);

});