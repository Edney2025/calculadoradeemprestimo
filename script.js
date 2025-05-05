document.addEventListener('DOMContentLoaded', function () {
    // --- DOM Elements ---
    const etapas = document.querySelectorAll('.etapa');
    const passos = document.querySelectorAll('.progress-step');
    const progressIndicator = document.querySelector('.progress-indicator');

    // Step 1 Elements
    const nomeInput = document.getElementById('nome-completo');
    const cpfInput = document.getElementById('cpf');
    const dataAtualInput = document.getElementById('data-atual');
    const diaPagamentoSelect = document.getElementById('dia-pagamento');
    const lembretePagamento = document.getElementById('lembrete-pagamento');

    // Step 2 Elements
    const faixaValorSelect = document.getElementById('faixa-valor');
    const valorEmprestimoInput = document.getElementById('valor-emprestimo'); // Should be type="text" in HTML

    // Step 3 Elements
    const parcelasOptionsContainer = document.getElementById('parcelas-options');

    // Step 4 Elements (Summary)
    const resumoNome = document.getElementById('resumo-nome');
    const resumoCpf = document.getElementById('resumo-cpf');
    const resumoValor = document.getElementById('resumo-valor');
    const resumoParcelas = document.getElementById('resumo-parcelas');
    const resumoValorParcela = document.getElementById('resumo-valor-parcela');
    const resumoDataPrimeira = document.getElementById('resumo-data-primeira');
    const resumoDataUltima = document.getElementById('resumo-data-ultima');

    // Navigation Buttons
    const btnIrParaEtapa2 = document.getElementById('btn-ir-para-etapa2');
    const btnVoltarParaEtapa1 = document.getElementById('btn-voltar-para-etapa1');
    const btnIrParaEtapa3 = document.getElementById('btn-ir-para-etapa3');
    const btnVoltarParaEtapa2 = document.getElementById('btn-voltar-para-etapa2');
    const btnIrParaEtapa4 = document.getElementById('btn-ir-para-etapa4');
    const btnVoltarParaEtapa3 = document.getElementById('btn-voltar-para-etapa3');
    const btnFinalizar = document.getElementById('btn-finalizar');

    // --- State ---
    let etapaAtual = 0;
    const formData = {
        nome: '', cpf: '', diaPagamento: '',
        valorEmprestimo: 0, // Stores RAW principal
        qtdParcelas: 0,
        valorParcela: 0,    // Stores calculated installment WITH interest
        dataPrimeiraParcela: null, dataUltimaParcela: null,
    };

    // --- Helper Functions ---
    function formatCurrency(value) {
        if (isNaN(value) || value === null) return '';
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }
    function parseCurrency(value) {
        if (!value || typeof value !== 'string') return NaN;
        const numberString = value.replace(/R\$\s?/g, '').replace(/\./g, '').replace(/,/g, '.');
        return parseFloat(numberString);
    }
    function formatDate(date) {
        if (!date || !(date instanceof Date)) return '-';
        return date.toLocaleDateString('pt-BR');
    }
    function validateCPF(cpf) {
        cpf = cpf.replace(/[^\d]+/g, ''); if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false; let sum = 0, r;
        for (let i = 1; i <= 9; i++) sum += parseInt(cpf.substring(i - 1, i)) * (11 - i); r = (sum * 10) % 11; if (r === 10 || r === 11) r = 0; if (r !== parseInt(cpf.substring(9, 10))) return false;
        sum = 0; for (let i = 1; i <= 10; i++) sum += parseInt(cpf.substring(i - 1, i)) * (12 - i); r = (sum * 10) % 11; if (r === 10 || r === 11) r = 0; if (r !== parseInt(cpf.substring(10, 11))) return false;
        return true;
    }
     cpfInput.addEventListener('input', (e) => { let v = e.target.value.replace(/\D/g, '').substring(0, 11); v = v.replace(/(\d{3})(\d)/, '$1.$2'); v = v.replace(/(\d{3})(\d)/, '$1.$2'); v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2'); e.target.value = v; });
     valorEmprestimoInput.addEventListener('blur', (e) => { let v = e.target.value; const nV = parseCurrency(v); e.target.value = !isNaN(nV) ? formatCurrency(nV) : ''; clearError('valor-emprestimo'); });
     valorEmprestimoInput.addEventListener('focus', (e) => { let v = e.target.value; const nV = parseCurrency(v); if (!isNaN(nV)) { e.target.value = nV.toFixed(2).replace('.', ','); } });
     valorEmprestimoInput.addEventListener('input', () => clearError('valor-emprestimo'));

    // --- Interest Rate Calculation (Based on MONTHLY rate: 20% down to 4  %) ---
    /**
     * Calculates the base MONTHLY interest rate (%) based on the number of installments.
     * Starts at 20% for 3 installments and goes down linearly to 4% for 48 installments.
     * @param {number} numParcelas - Number of installments.
     * @returns {number} The MONTHLY interest rate as a percentage (e.g., 15.5).
     */
    function calculateMonthlyRatePercent(numParcelas) {
        const startRate = 17.0; // 17% a.m. (start)
        const endRate = 9.0;    // 8% a.m. (end)
        const startInstallments = 3.0;
        const endInstallments = 48.0;

        if (numParcelas <= startInstallments) return startRate;
        if (numParcelas >= endInstallments) return endRate;

        const rate = startRate + (endRate - startRate) * (numParcelas - startInstallments) / (endInstallments - startInstallments);
        return rate;
    }

    /**
     * Gets the monthly interest rate as a decimal.
     * @param {number} numParcelas - Number of installments (used to calculate the base rate).
     * @returns {number} The MONTHLY interest rate as a decimal (e.g., 0.17 or 0.08).
     */
    function getMonthlyRateDecimal(numParcelas) {
        // Calculation is now simpler: Get the base monthly % rate and convert to decimal
        return calculateMonthlyRatePercent(numParcelas) / 100.0;
        // The division by 12 is REMOVED because the base rate is now monthly.
    }

    function calculateInstallmentPMT(principal, monthlyRateDecimal, numInstallments) {
        if (monthlyRateDecimal <= 0) return principal / numInstallments; // Handle zero/negative rate case
        const i = monthlyRateDecimal; const n = numInstallments; const p = principal;
        const factor = Math.pow(1 + i, n); const pmt = p * (i * factor) / (factor - 1);
        return Math.round(pmt * 100) / 100; // Round to 2 cents
    }

    // --- Error Handling ---
    function clearError(fieldId) {
        const correctedErrorId = `error-${fieldId}`; const errorElement = document.getElementById(correctedErrorId);
        const inputEl = document.getElementById(fieldId); const containerEl = document.getElementById(`${fieldId}-options`);
        if (errorElement) errorElement.style.display = 'none';
        if (inputEl) inputEl.classList.remove('is-invalid'); if (containerEl) containerEl.classList.remove('is-invalid');
    }
    function showError(fieldId, message) {
        const correctedErrorId = `error-${fieldId}`; const errorElement = document.getElementById(correctedErrorId);
        const inputEl = document.getElementById(fieldId); const containerEl = document.getElementById(`${fieldId}-options`);
        if (errorElement) { errorElement.textContent = message; errorElement.style.display = 'block'; }
        else { console.warn(`Error element with ID '${correctedErrorId}' not found for field '${fieldId}'`); }
        if (inputEl) inputEl.classList.add('is-invalid'); if (containerEl) containerEl.classList.add('is-invalid');
    }

    // --- Validation Functions ---
    function validateStep1() {
        let isValid = true; clearError('nome-completo'); clearError('cpf'); clearError('dia-pagamento');
        if (!nomeInput.value.trim()) { showError('nome-completo', 'Nome completo é obrigatório.'); isValid = false; }
        if (!validateCPF(cpfInput.value)) { showError('cpf', 'CPF inválido ou não preenchido.'); isValid = false; }
        if (!diaPagamentoSelect.value) { showError('dia-pagamento', 'Selecione o dia da primeira parcela.'); isValid = false; } return isValid;
    }
    function validateStep2() {
        let isValid = true; clearError('valor-emprestimo'); const valorPrincipal = parseCurrency(valorEmprestimoInput.value);
        if (isNaN(valorPrincipal) || valorPrincipal < 100) { showError('valor-emprestimo', `Valor inválido ou menor que ${formatCurrency(100)}.`); isValid = false; }
        else { formData.valorEmprestimo = valorPrincipal; } return isValid;
    }
    function validateStep3() {
        let isValid = true; clearError('parcelas'); const checkedRadio = parcelasOptionsContainer.querySelector('input[name="parcelas"]:checked');
        if (!checkedRadio) { showError('parcelas', 'Por favor, selecione uma opção de parcelamento.'); isValid = false; } return isValid;
    }

    // --- UI Update Functions ---
    function updateProgressBar(currentStepIndex) {
        const totalSteps = passos.length; passos.forEach((passo, index) => { passo.classList.toggle('completed', index < currentStepIndex); passo.classList.toggle('active', index === currentStepIndex); });
        let progressWidth = totalSteps > 1 ? (currentStepIndex / (totalSteps - 1)) * 100 : 0; progressIndicator.style.width = `${progressWidth}%`;
    }
    function mostrarEtapa(index) { etapas.forEach((etapa, i) => etapa.classList.toggle('ativa', i === index)); etapaAtual = index; updateProgressBar(index); }
    function calcularPrimeiraDataPagamento(diaSelecionado) {
        const hoje = new Date(); let ano = hoje.getFullYear(); let mes = hoje.getMonth(); const diaNum = parseInt(diaSelecionado);
        if (isNaN(diaNum)) return null; if (hoje.getDate() >= diaNum) { mes++; if (mes > 11) { mes = 0; ano++; } }
        const primeiraData = new Date(ano, mes, diaNum); if (primeiraData.getMonth() !== mes) { return new Date(ano, mes + 1, 0); } return primeiraData;
    }

    // --- Generate Installment Options (Using MONTHLY Interest) ---
    function gerarOpcoesParcelas(valorPrincipal) {
        parcelasOptionsContainer.innerHTML = ''; const errorDiv = document.createElement('div'); errorDiv.className = 'error-message'; errorDiv.id = 'error-parcelas'; errorDiv.style.display = 'none';
        const minInstallments = 3; const maxInstallments = 48; const stepInstallments = 3; const minInstallmentValue = 10.00; let hasOptions = false;
        for (let numParcelas = minInstallments; numParcelas <= maxInstallments; numParcelas += stepInstallments) {
            // Get the MONTHLY decimal rate directly now
            const monthlyRateDec = getMonthlyRateDecimal(numParcelas);
            const valorParcelaComJuros = calculateInstallmentPMT(valorPrincipal, monthlyRateDec, numParcelas);
            if (valorParcelaComJuros < minInstallmentValue) continue;
            hasOptions = true; const optionDiv = document.createElement('div'); optionDiv.className = 'parcela-option'; const radioInput = document.createElement('input'); radioInput.type = 'radio';
            radioInput.name = 'parcelas'; radioInput.value = numParcelas; radioInput.id = `parcela-${numParcelas}`; const label = document.createElement('label'); label.htmlFor = `parcela-${numParcelas}`;
            label.innerHTML = `${numParcelas}x de <span>${formatCurrency(valorParcelaComJuros)}</span>`;
            optionDiv.appendChild(radioInput); optionDiv.appendChild(label); parcelasOptionsContainer.appendChild(optionDiv);
        }
        parcelasOptionsContainer.appendChild(errorDiv);
        if (!hasOptions) { showError('parcelas', `Nenhuma opção de parcelamento encontrada para ${formatCurrency(valorPrincipal)} com parcela mínima de ${formatCurrency(minInstallmentValue)}.`); }
    }

    // --- Calculate Summary Data (Using MONTHLY Interest) ---
    function calcularResumo() {
        if (isNaN(formData.qtdParcelas) || formData.qtdParcelas <= 0 || isNaN(formData.valorEmprestimo) || !formData.diaPagamento) { return false; }
        // Get the MONTHLY decimal rate directly
        const monthlyRateDec = getMonthlyRateDecimal(formData.qtdParcelas);
        formData.valorParcela = calculateInstallmentPMT(formData.valorEmprestimo, monthlyRateDec, formData.qtdParcelas);
        formData.dataPrimeiraParcela = calcularPrimeiraDataPagamento(formData.diaPagamento);
        if (formData.dataPrimeiraParcela && formData.qtdParcelas > 0) { formData.dataUltimaParcela = new Date(formData.dataPrimeiraParcela); formData.dataUltimaParcela.setMonth(formData.dataUltimaParcela.getMonth() + formData.qtdParcelas - 1); }
        else { formData.dataUltimaParcela = null; } return true;
    }

    // --- Populate Summary Fields ---
    function popularResumo() {
        resumoNome.textContent = formData.nome || '-'; resumoCpf.textContent = formData.cpf || '-';
        resumoValor.textContent = formatCurrency(formData.valorEmprestimo) || '-'; resumoParcelas.textContent = formData.qtdParcelas ? `${formData.qtdParcelas}x` : '-';
        resumoValorParcela.textContent = formatCurrency(formData.valorParcela) || '-'; resumoDataPrimeira.textContent = formatDate(formData.dataPrimeiraParcela) || '-';
        resumoDataUltima.textContent = formatDate(formData.dataUltimaParcela) || '-';
    }

    // --- WhatsApp Integration (Using MONTHLY Interest results) ---
    function generateWhatsAppLink() {
        const numeroTelefone = '5544998408460'; // SEU NÚMERO AQUI
        const currentHour = new Date().getHours(); let saudacao;
        if (currentHour >= 5 && currentHour < 12) { saudacao = "Bom dia"; } else if (currentHour >= 12 && currentHour < 18) { saudacao = "Boa tarde"; } else { saudacao = "Boa noite"; }
        const nome = formData.nome || 'Cliente'; const cpfFormatado = formData.cpf || 'Não informado'; const valorSolicitadoFormatado = formatCurrency(formData.valorEmprestimo) || 'Não informado';
        const qtdParcelasNum = formData.qtdParcelas; const valorParcelaFormatado = formatCurrency(formData.valorParcela) || 'Não informado';
        const parcelamentoTexto = qtdParcelasNum ? `*${qtdParcelasNum} parcelas de ${valorParcelaFormatado}*` : 'Não informado';
        const dataPrimeiraFormatada = formatDate(formData.dataPrimeiraParcela) || 'Não informado'; const dataUltimaFormatada = formatDate(formData.dataUltimaParcela) || 'Não informado';
        const mensagem = `👋 ${saudacao}, ${nome}! Tudo certo por aí?\n\nSou ${nome}, CPF ${cpfFormatado}.\nAcabei de solicitar uma simulação no valor de *${valorSolicitadoFormatado}*,\nem ${parcelamentoTexto}.\n\n🗓️ Começo a pagar no dia ${dataPrimeiraFormatada}\n📌 Última parcela: ${dataUltimaFormatada}\n\nPode confirmar pra mim se está tudo certinho, por favor? ✅`;
        const encodedMessage = encodeURIComponent(mensagem); return `https://wa.me/${numeroTelefone}?text=${encodedMessage}`;
    }

    // --- Event Listeners Setup ---
    dataAtualInput.value = formatDate(new Date());
    diaPagamentoSelect.addEventListener('change', () => { clearError('dia-pagamento'); const dia = diaPagamentoSelect.value; if (dia) { const pD = calcularPrimeiraDataPagamento(dia); lembretePagamento.textContent = `Lembrete: Sua primeira parcela será aproximadamente em ${formatDate(pD)}.`; } else { lembretePagamento.textContent = ''; } });
    nomeInput.addEventListener('input', () => clearError('nome-completo')); cpfInput.addEventListener('input', () => clearError('cpf'));
    diaPagamentoSelect.addEventListener('change', () => clearError('dia-pagamento')); parcelasOptionsContainer.addEventListener('change', () => clearError('parcelas'));

    // --- Navigation Logic ---
    btnIrParaEtapa2.addEventListener('click', () => { if (validateStep1()) { formData.nome = nomeInput.value.trim(); formData.cpf = cpfInput.value; formData.diaPagamento = diaPagamentoSelect.value; mostrarEtapa(1); } });
    btnVoltarParaEtapa1.addEventListener('click', () => mostrarEtapa(0));
    btnIrParaEtapa3.addEventListener('click', () => { if (validateStep2()) { gerarOpcoesParcelas(formData.valorEmprestimo); mostrarEtapa(2); } });
    btnVoltarParaEtapa2.addEventListener('click', () => mostrarEtapa(1));
    btnIrParaEtapa4.addEventListener('click', () => { if (validateStep3()) { const sR = parcelasOptionsContainer.querySelector('input[name="parcelas"]:checked'); formData.qtdParcelas = parseInt(sR.value); if (calcularResumo()) { popularResumo(); mostrarEtapa(3); } else { alert("Não foi possível calcular o resumo."); } } });
    btnVoltarParaEtapa3.addEventListener('click', () => mostrarEtapa(2));
    btnFinalizar.addEventListener('click', () => { if (formData.nome && formData.cpf && formData.valorEmprestimo > 0 && formData.qtdParcelas > 0 && formData.valorParcela > 0) { const link = generateWhatsAppLink(); window.open(link, '_blank'); alert('Você será redirecionado para o WhatsApp.'); } else { alert('Erro: Dados incompletos ou inválidos. Revise as etapas.'); } });

    // --- Initialization ---
    mostrarEtapa(0); // Show step 1 on load

});