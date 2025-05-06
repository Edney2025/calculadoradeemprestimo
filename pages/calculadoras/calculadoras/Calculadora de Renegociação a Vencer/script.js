document.addEventListener('DOMContentLoaded', function () {
    // --- DOM Elements ---
    const etapas = document.querySelectorAll('.etapa');
    const passos = document.querySelectorAll('.progress-step');
    const progressIndicator = document.querySelector('.progress-indicator');
    const nomeInput = document.getElementById('nome-completo');
    const cpfInput = document.getElementById('cpf');
    const saldoDevedorInput = document.getElementById('saldo-devedor');
    const novoDiaPagamentoSelect = document.getElementById('novo-dia-pagamento');
    const parcelasRenegOptionsContainer = document.getElementById('parcelas-reneg-options');
    const resumoRenegNome = document.getElementById('resumo-reneg-nome');
    const resumoRenegCpf = document.getElementById('resumo-reneg-cpf');
    const resumoRenegSaldo = document.getElementById('resumo-reneg-saldo');
    const resumoRenegQtdParcelas = document.getElementById('resumo-reneg-qtd-parcelas');
    const resumoRenegValorParcela = document.getElementById('resumo-reneg-valor-parcela');
    const resumoRenegDataPrimeira = document.getElementById('resumo-reneg-data-primeira');
    const resumoRenegDataUltima = document.getElementById('resumo-reneg-data-ultima');
    const btnIrParaParcelas = document.getElementById('btn-ir-para-parcelas');
    const btnVoltarParaDados = document.getElementById('btn-voltar-para-dados');
    const btnIrParaResumoReneg = document.getElementById('btn-ir-para-resumo-reneg');
    const btnVoltarParaParcelas = document.getElementById('btn-voltar-para-parcelas');
    const btnFinalizarReneg = document.getElementById('btn-finalizar-reneg');

    // --- State ---
    let etapaAtual = 0;
    const formData = {
        nome: '', cpf: '', saldoDevedor: 0, novoDiaPagamento: '',
        qtdParcelasReneg: 0, valorParcelaReneg: 0,
        dataPrimeiraParcelaReneg: null, dataUltimaParcelaReneg: null,
    };

    // --- Helper Functions ---
    function formatCurrency(v) { return isNaN(v)||v===null?'':v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}
    function parseCurrency(v) { if(!v||typeof v !== 'string')return NaN;const nS=v.replace(/R\$\s?/g,'').replace(/\./g,'').replace(/,/g,'.');return parseFloat(nS);}
    function formatDate(d) { return !d||!(d instanceof Date)?'-':d.toLocaleDateString('pt-BR');}
    function validateCPF(c){c=c.replace(/[^\d]+/g,'');if(c.length!==11||/^(\d)\1+$/.test(c))return false;let s=0,r;for(let i=1;i<=9;i++)s+=parseInt(c.substring(i-1,i))*(11-i);r=(s*10)%11;if(r===10||r===11)r=0;if(r!==parseInt(c.substring(9,10)))return false;s=0;for(let i=1;i<=10;i++)s+=parseInt(c.substring(i-1,i))*(12-i);r=(s*10)%11;if(r===10||r===11)r=0;if(r!==parseInt(c.substring(10,11)))return false;return true;}
    cpfInput.addEventListener('input',(e)=>{let v=e.target.value.replace(/\D/g,'').substring(0,11);v=v.replace(/(\d{3})(\d)/,'$1.$2');v=v.replace(/(\d{3})(\d)/,'$1.$2');v=v.replace(/(\d{3})(\d{1,2})$/,'$1-$2');e.target.value=v;});
    saldoDevedorInput.addEventListener('blur',(e)=>{let v=e.target.value;const nV=parseCurrency(v);e.target.value=!isNaN(nV)?formatCurrency(nV):'';clearError('saldo-devedor');});
    saldoDevedorInput.addEventListener('focus',(e)=>{let v=e.target.value;const nV=parseCurrency(v);if(!isNaN(nV)){e.target.value=nV.toFixed(2).replace('.',',');}});
    saldoDevedorInput.addEventListener('input',()=>clearError('saldo-devedor'));

    // --- Interest Rate & PMT ---
    const TAXA_FIXA_MENSAL_RENEG = 0.05; // 4% a.m.
    function calculateInstallmentPMT(p, i, n){if(i<=0)return p/n;const f=Math.pow(1+i,n);const pmt=p*(i*f)/(f-1);return Math.round(pmt*100)/100;}

    // --- Error Handling ---
    function clearError(fId){const id=`error-${fId}`;const e=document.getElementById(id);const i=document.getElementById(fId);const c=document.getElementById(`${fId}-options`)||document.getElementById(`parcelas-reneg-options`);if(e)e.style.display='none';if(i)i.classList.remove('is-invalid');if(c)c.classList.remove('is-invalid');}
    function showError(fId,msg){const id=`error-${fId}`;const e=document.getElementById(id);const i=document.getElementById(fId);const c=document.getElementById(`${fId}-options`)||document.getElementById(`parcelas-reneg-options`);if(e){e.textContent=msg;e.style.display='block';}else{console.warn(`Err el ${id} not found`);}if(i)i.classList.add('is-invalid');if(c)c.classList.add('is-invalid');}

    // --- Validation Functions ---
    function validateStep1DadosReneg(){let v=true;clearError('nome-completo');clearError('cpf');clearError('saldo-devedor');clearError('novo-dia-pagamento');if(!nomeInput.value.trim()){showError('nome-completo','Nome obrigatório.');v=false;}if(!validateCPF(cpfInput.value)){showError('cpf','CPF inválido.');v=false;}const s=parseCurrency(saldoDevedorInput.value);if(isNaN(s)||s<=0){showError('saldo-devedor','Saldo inválido.');v=false;}else{formData.saldoDevedor=s;}if(!novoDiaPagamentoSelect.value){showError('novo-dia-pagamento','Selecione o dia.');v=false;}return v;}
    function validateStep2ParcelasReneg(){let v=true;clearError('parcelas-reneg');const r=parcelasRenegOptionsContainer.querySelector('input[name="parcelas-reneg"]:checked');if(!r){showError('parcelas-reneg','Selecione.');v=false;}else{formData.qtdParcelasReneg=parseInt(r.value);}return v;}

    // --- UI Update Functions ---
    function updateProgressBar(idx){const tS=3;passos.forEach((p,i)=>{if(i<tS){p.classList.toggle('completed',i<idx);p.classList.toggle('active',i===idx);p.style.display='';}else{p.style.display='none';}});let pW=tS>1?(idx/(tS-1))*100:0;if(passos.length>tS&&idx>=tS-1){pW=100;}progressIndicator.style.width=`${pW}%`;}
    function mostrarEtapa(idx){etapas.forEach((e,i)=>e.classList.toggle('ativa',i===idx));etapaAtual=idx;updateProgressBar(idx);}
    function calcularDatasRenegociacao(novoDiaSel, qtdP){const hj=new Date();let ano=hj.getFullYear();let mes=hj.getMonth();const diaN=parseInt(novoDiaSel);if(isNaN(diaN))return{primeira:null,ultima:null};if(hj.getDate()>=diaN){mes++;if(mes>11){mes=0;ano++;}}let pD=new Date(ano,mes,diaN);if(pD.getMonth()!==mes){pD=new Date(ano,mes+1,0);}let uD=null;if(pD&&qtdP>0){uD=new Date(pD);uD.setMonth(uD.getMonth()+qtdP-1);}return{primeira:pD,ultima:uD};}

    // --- Generate Renegotiation Installment Options (with Date & Min Value) ---
    function gerarOpcoesParcelasReneg(saldoDevedorAtual) {
        parcelasRenegOptionsContainer.innerHTML = '';
        const errorDiv = document.createElement('div'); errorDiv.className='error-message'; errorDiv.id='error-parcelas-reneg'; errorDiv.style.display='none';

        const minParcelas = 3;
        const maxParcelas = 96; // ** ATUALIZADO **
        const stepParcelas = 3;
        const minParcelaValor = 85.00; // ** ATUALIZADO **
        let hasOptions = false;

        // Calcula a data da primeira parcela ANTES do loop
        const dataPrimeiraParcela = calcularDatasRenegociacao(formData.novoDiaPagamento, 1).primeira;
        const dataPrimeiraFormatada = dataPrimeiraParcela ? formatDate(dataPrimeiraParcela) : 'Inválida';

        for (let numP = minParcelas; numP <= maxParcelas; numP += stepParcelas) {
            const valorDaParcela = calculateInstallmentPMT(saldoDevedorAtual, TAXA_FIXA_MENSAL_RENEG, numP);

            // **NOVO: Pula se a parcela for menor que o mínimo**
            if (valorDaParcela < minParcelaValor) {
                continue; // Pula esta opção e vai para a próxima
            }

            hasOptions = true; // Marcar que pelo menos uma opção válida foi encontrada
            const optionDiv = document.createElement('div'); optionDiv.className='parcela-option';
            const radioInput = document.createElement('input'); radioInput.type='radio';
            radioInput.name='parcelas-reneg'; radioInput.value=numP; radioInput.id=`parcela-reneg-${numP}`;
            const label = document.createElement('label'); label.htmlFor=`parcela-reneg-${numP}`;

            // ** NOVO: Incluir data da primeira parcela no label **
            label.innerHTML = `
                ${numP}x de <span>${formatCurrency(valorDaParcela)}</span>
                <span class="data-primeira-parcela">(${dataPrimeiraFormatada})</span>
            `;

            optionDiv.appendChild(radioInput); optionDiv.appendChild(label);
            parcelasRenegOptionsContainer.appendChild(optionDiv);
        }
        parcelasRenegOptionsContainer.appendChild(errorDiv);
        if (!hasOptions) { showError('parcelas-reneg', `Nenhuma opção encontrada para ${formatCurrency(saldoDevedorAtual)} com parcela mínima de ${formatCurrency(minParcelaValor)}.`); }
    }

    // --- Calculate Renegotiation Summary Data ---
    function calcularResumoReneg(){if(isNaN(formData.qtdParcelasReneg)||formData.qtdParcelasReneg<=0||isNaN(formData.saldoDevedor)||!formData.novoDiaPagamento)return false;formData.valorParcelaReneg=calculateInstallmentPMT(formData.saldoDevedor,TAXA_FIXA_MENSAL_RENEG,formData.qtdParcelasReneg);const d=calcularDatasRenegociacao(formData.novoDiaPagamento,formData.qtdParcelasReneg);formData.dataPrimeiraParcelaReneg=d.primeira;formData.dataUltimaParcelaReneg=d.ultima;return formData.dataPrimeiraParcelaReneg!==null;}

    // --- Populate Renegotiation Summary ---
    function popularResumoReneg(){resumoRenegNome.textContent=formData.nome||'-';resumoRenegCpf.textContent=formData.cpf||'-';resumoRenegSaldo.textContent=formatCurrency(formData.saldoDevedor)||'-';resumoRenegQtdParcelas.textContent=formData.qtdParcelasReneg?`${formData.qtdParcelasReneg}x`:'-';resumoRenegValorParcela.textContent=formatCurrency(formData.valorParcelaReneg)||'-';resumoRenegDataPrimeira.textContent=formatDate(formData.dataPrimeiraParcelaReneg)||'-';resumoRenegDataUltima.textContent=formatDate(formData.dataUltimaParcelaReneg)||'-';}

    // --- WhatsApp Integration ---
    function generateWhatsAppLinkReneg(){const num='5544998408460';const h=new Date().getHours();let s;if(h>=5&&h<12)s="Bom dia";else if(h>=12&&h<18)s="Boa tarde";else s="Boa noite";const nome=formData.nome||'Cliente';const cpf=formData.cpf||'Não informado';const saldoFmt=formatCurrency(formData.saldoDevedor)||'Não informado';const qtdP=formData.qtdParcelasReneg;const vP=formatCurrency(formData.valorParcelaReneg)||'Não informado';const pTxt=qtdP?`*${qtdP} parcelas de ${vP}*`:'Não informado';const dP=formatDate(formData.dataPrimeiraParcelaReneg)||'Não informada';const dU=formatDate(formData.dataUltimaParcelaReneg)||'Não informada';const msg=`🤝 Proposta de Renegociação\n\n${s}!\n\nSou ${nome} (CPF: ${cpf}).\n\nGostaria de confirmar a proposta para renegociar meu saldo devedor atual de *${saldoFmt}* nas seguintes condições:\n\n💳 Novo Parcelamento: ${pTxt}\n🗓️ Vencimento 1ª Parcela: ${dP}\n🏁 Vencimento Última Parcela: ${dU}\n\nAguardo confirmação e próximos passos. Obrigado!`;const enc=encodeURIComponent(msg);return `https://wa.me/${num}?text=${enc}`;;}

    // --- Event Listeners Setup ---
    nomeInput.addEventListener('input',()=>clearError('nome-completo'));
    cpfInput.addEventListener('input',()=>clearError('cpf'));
    saldoDevedorInput.addEventListener('input',()=>clearError('saldo-devedor'));
    novoDiaPagamentoSelect.addEventListener('change',()=>clearError('novo-dia-pagamento'));
    parcelasRenegOptionsContainer.addEventListener('change',()=>clearError('parcelas-reneg'));

    // --- Navigation Logic ---
    btnIrParaParcelas.addEventListener('click',()=>{if(validateStep1DadosReneg()){formData.nome=nomeInput.value.trim();formData.cpf=cpfInput.value;formData.novoDiaPagamento=novoDiaPagamentoSelect.value;gerarOpcoesParcelasReneg(formData.saldoDevedor);mostrarEtapa(1);}});
    btnVoltarParaDados.addEventListener('click',()=>mostrarEtapa(0));
    btnIrParaResumoReneg.addEventListener('click',()=>{if(validateStep2ParcelasReneg()){if(calcularResumoReneg()){popularResumoReneg();mostrarEtapa(2);}}});
    btnVoltarParaParcelas.addEventListener('click',()=>mostrarEtapa(1));
    btnFinalizarReneg.addEventListener('click',()=>{if(formData.nome&&formData.cpf&&formData.saldoDevedor>0&&formData.qtdParcelasReneg>0&&formData.valorParcelaReneg>0){const l=generateWhatsAppLinkReneg();window.open(l,'_blank');alert('Redirecionando para WhatsApp...');}else{alert('Erro: Dados incompletos. Revise.');}});

    // --- Initialization ---
    mostrarEtapa(0);

});