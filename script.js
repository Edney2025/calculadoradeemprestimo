document.addEventListener('DOMContentLoaded', function () {
    // --- DOM Elements ---
    const etapas = document.querySelectorAll('.etapa');
    const passos = document.querySelectorAll('.progress-step');
    const progressIndicator = document.querySelector('.progress-indicator');

    // Step 1 Elements
    const nomeInput = document.getElementById('nome-completo');
    const cpfInput = document.getElementById('cpf');
    const dataAtualInput = document.getElementById('data-atual');
    // diaPagamentoSelect removido

    // Step 2 Elements
    // faixaValorSelect removido para simplificar
    const valorEmprestimoInput = document.getElementById('valor-emprestimo'); // type="text" in HTML

    // Step 3 Elements (Renomeado)
    const prazoOptionsContainer = document.getElementById('prazo-options');

    // Step 4 Elements (Summary - Campos Atualizados)
    const resumoNome = document.getElementById('resumo-nome');
    const resumoCpf = document.getElementById('resumo-cpf');
    const resumoDataSolicitacao = document.getElementById('resumo-data-solicitacao');
    const resumoValorSolicitado = document.getElementById('resumo-valor-solicitado');
    const resumoDataVencimento = document.getElementById('resumo-data-vencimento');
    const resumoValorTotal = document.getElementById('resumo-valor-total');
    const resumoObservacao = document.getElementById('resumo-observacao');

    // Navigation Buttons (IDs Atualizados)
    const btnIrParaValor = document.getElementById('btn-ir-para-valor'); // Etapa 1 -> 2
    const btnVoltarParaDados = document.getElementById('btn-voltar-para-dados'); // Etapa 2 -> 1
    const btnIrParaPrazo = document.getElementById('btn-ir-para-prazo');   // Etapa 2 -> 3
    const btnVoltarParaValor = document.getElementById('btn-voltar-para-valor'); // Etapa 3 -> 2
    const btnIrParaResumo = document.getElementById('btn-ir-para-resumo');  // Etapa 3 -> 4
    const btnVoltarParaPrazo = document.getElementById('btn-voltar-para-prazo'); // Etapa 4 -> 3
    const btnFinalizar = document.getElementById('btn-finalizar');

    // --- State (Atualizado) ---
    let etapaAtual = 0;
    const formData = {
        nome: '',
        cpf: '',
        dataSolicitacao: new Date(), // Armazena a data atual no início
        valorEmprestimo: 0,        // Principal
        prazoDias: 0,              // Dias para pagar
        valorTotalPagar: 0,        // Principal + Juros
        dataVencimento: null,
    };

    // --- Helper Functions (formatCurrency, parseCurrency, formatDate, validateCPF mantidos) ---
    function formatCurrency(value) { /* ... mesmo código ... */ }
    function parseCurrency(value) { /* ... mesmo código ... */ }
    function formatDate(date) { /* ... mesmo código ... */ }
    function validateCPF(cpf) { /* ... mesmo código ... */ }
    cpfInput.addEventListener('input', (e) => { /* ... mesmo código ... */ });
    valorEmprestimoInput.addEventListener('blur', (e) => { /* ... mesmo código ... */ });
    valorEmprestimoInput.addEventListener('focus', (e) => { /* ... mesmo código ... */ });
    valorEmprestimoInput.addEventListener('input', () => clearError('valor-emprestimo'));

    // --- Interest Calculation (NOVA LÓGICA - Juros Totais Simples) ---
    /**
     * Calcula o percentual TOTAL de juros a ser aplicado.
     * Varia linearmente de 25% (1 dia) a 100% (30 dias).
     * @param {number} prazoDias - O prazo em dias selecionado.
     * @returns {number} O percentual total de juros (ex: 30.5 para 30.5%).
     */
    function calculateTotalInterestPercent(prazoDias) {
        const startInterest = 25.0;  // 25% para 1 dia
        const endInterest = 100.0; // 100% para 30 dias
        const startDays = 1.0;
        const endDays = 30.0;

        // Garante que fique nos limites
        if (prazoDias <= startDays) return startInterest;
        if (prazoDias >= endDays) return endInterest;

        // Interpolação Linear
        const interest = startInterest + (endInterest - startInterest) * (prazoDias - startDays) / (endDays - startDays);
        return interest;
    }

    // --- Error Handling (Funções clearError/showError ajustadas para novos IDs) ---
    function clearError(fieldId) {
        const correctedErrorId = `error-${fieldId}`; const errorElement = document.getElementById(correctedErrorId);
        const inputEl = document.getElementById(fieldId); const containerEl = document.getElementById(`${fieldId}-options`); // Usa ID do container (prazo-options)
        if (errorElement) errorElement.style.display = 'none';
        if (inputEl) inputEl.classList.remove('is-invalid'); if (containerEl) containerEl.classList.remove('is-invalid');
    }
    function showError(fieldId, message) {
        const correctedErrorId = `error-${fieldId}`; const errorElement = document.getElementById(correctedErrorId);
        const inputEl = document.getElementById(fieldId); const containerEl = document.getElementById(`${fieldId}-options`); // Usa ID do container (prazo-options)
        if (errorElement) { errorElement.textContent = message; errorElement.style.display = 'block'; }
        else { console.warn(`Error element with ID '${correctedErrorId}' not found for field '${fieldId}'`); }
        if (inputEl) inputEl.classList.add('is-invalid'); if (containerEl) containerEl.classList.add('is-invalid');
    }

    // --- Validation Functions (Atualizadas) ---
    function validateStep1() { // Valida Dados Pessoais
        let isValid = true; clearError('nome-completo'); clearError('cpf');
        if (!nomeInput.value.trim()) { showError('nome-completo', 'Nome completo é obrigatório.'); isValid = false; }
        if (!validateCPF(cpfInput.value)) { showError('cpf', 'CPF inválido ou não preenchido.'); isValid = false; }
        // Não valida mais dia de pagamento
        return isValid;
    }
    function validateStep2() { // Valida Valor
        let isValid = true; clearError('valor-emprestimo'); const valorPrincipal = parseCurrency(valorEmprestimoInput.value);
        if (isNaN(valorPrincipal) || valorPrincipal < 100) { showError('valor-emprestimo', `Valor inválido ou menor que ${formatCurrency(100)}.`); isValid = false; }
        else { formData.valorEmprestimo = valorPrincipal; } return isValid;
    }
    function validateStep3Prazo() { // Valida Prazo em Dias
        let isValid = true; clearError('prazo'); // Usa 'prazo' para o ID da mensagem de erro
        const checkedRadio = prazoOptionsContainer.querySelector('input[name="prazo"]:checked'); // Nome do radio é 'prazo'
        if (!checkedRadio) { showError('prazo', 'Por favor, selecione um prazo.'); isValid = false; }
        else { formData.prazoDias = parseInt(checkedRadio.value); } // Armazena o prazo selecionado
        return isValid;
    }

    // --- UI Update Functions ---
    function updateProgressBar(currentStepIndex) { /* ... mesmo código ... */ }
    function mostrarEtapa(index) { /* ... mesmo código ... */ }

    /**
     * Calcula a data de vencimento adicionando dias à data atual.
     * @param {number} prazoDias - Número de dias a adicionar.
     * @returns {Date | null} A data de vencimento calculada ou null.
     */
    function calcularDataVencimento(prazoDias) {
        if (isNaN(prazoDias) || prazoDias <= 0) return null;
        const dataVenc = new Date(formData.dataSolicitacao); // Usa a data da solicitação como base
        dataVenc.setDate(dataVenc.getDate() + prazoDias);
        return dataVenc;
    }

    // --- Generate Options (DIAS - Nova Função) ---
    /**
     * Gera as opções de prazo em dias (1 a 30) com o valor total a pagar.
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

            const optionDiv = document.createElement('div'); optionDiv.className = 'parcela-option'; // Reutiliza a classe CSS
            const radioInput = document.createElement('input'); radioInput.type = 'radio';
            radioInput.name = 'prazo'; // Nome do grupo de radio
            radioInput.value = dias; // Valor é o número de dias
            radioInput.id = `prazo-${dias}`;
            const label = document.createElement('label'); label.htmlFor = `prazo-${dias}`;

            // Mostra o prazo em dias e o VALOR TOTAL a ser pago
            label.innerHTML = `
                Pagar em ${dias} dia${dias > 1 ? 's' : ''}: <span>${formatCurrency(valorTotalArredondado)}</span>
            `;

            optionDiv.appendChild(radioInput); optionDiv.appendChild(label);
            prazoOptionsContainer.appendChild(optionDiv);
        }
        prazoOptionsContainer.appendChild(errorDiv); // Adiciona o placeholder de erro
    }

    // --- Calculate Summary Data (NOVA LÓGICA) ---
    function calcularResumo() {
        if (isNaN(formData.prazoDias) || formData.prazoDias <= 0 || isNaN(formData.valorEmprestimo)) { return false; }

        // Calcula juros e valor total
        const totalInterestPercent = calculateTotalInterestPercent(formData.prazoDias);
        const totalAmount = formData.valorEmprestimo * (1 + totalInterestPercent / 100.0);
        formData.valorTotalPagar = Math.round(totalAmount * 100) / 100; // Armazena arredondado

        // Calcula data de vencimento
        formData.dataVencimento = calcularDataVencimento(formData.prazoDias);

        return formData.dataVencimento !== null; // Retorna true se conseguiu calcular a data
    }


    // --- Populate Summary Fields (Campos Atualizados) ---
    function popularResumo() {
        resumoNome.textContent = formData.nome || '-';
        resumoCpf.textContent = formData.cpf || '-';
        resumoDataSolicitacao.textContent = formatDate(formData.dataSolicitacao) || '-'; // Mostra data da solicitação
        resumoValorSolicitado.textContent = formatCurrency(formData.valorEmprestimo) || '-'; // Principal
        resumoDataVencimento.textContent = formatDate(formData.dataVencimento) || '-'; // Data final
        resumoValorTotal.textContent = formatCurrency(formData.valorTotalPagar) || '-'; // Valor COM juros
        resumoObservacao.textContent = `Você tem até ${formData.prazoDias} dia${formData.prazoDias > 1 ? 's' : ''} para quitar este empréstimo.` || '-';
    }

    // --- WhatsApp Integration (Mensagem Atualizada) ---
    function generateWhatsAppLink() {
        const numeroTelefone = '5544998408460'; // SEU NÚMERO
        const currentHour = new Date().getHours(); let saudacao;
        if (currentHour >= 5 && currentHour < 12) { saudacao = "Bom dia"; } else if (currentHour >= 12 && currentHour < 18) { saudacao = "Boa tarde"; } else { saudacao = "Boa noite"; }

        // Dados formatados para a mensagem
        const nome = formData.nome || 'Cliente';
        const cpfFormatado = formData.cpf || 'Não informado';
        const valorSolicitadoFmt = formatCurrency(formData.valorEmprestimo) || 'Não informado';
        const dataSolicitacaoFmt = formatDate(formData.dataSolicitacao) || 'Não informada';
        const dataVencimentoFmt = formatDate(formData.dataVencimento) || 'Não informada';
        const valorTotalPagarFmt = formatCurrency(formData.valorTotalPagar) || 'Não informado';
        const prazoDiasNum = formData.prazoDias || 0;

        // Template da Mensagem (Pagamento Único)
        const mensagem = `✅ Resumo do Empréstimo
👤 Nome: ${nome}
🧾 CPF: ${cpfFormatado}
📅 Data da Solicitação: ${dataSolicitacaoFmt}
📥 Valor Solicitado: *${valorSolicitadoFmt}*
📆 Vencimento da Parcela ÚNICA: ${dataVencimentoFmt}
💰 Valor Total a Pagar: *${valorTotalPagarFmt}*

📌 Observação: Você tem até ${prazoDiasNum} dia${prazoDiasNum > 1 ? 's' : ''} para quitar este empréstimo.

${saudacao}! Confirma o envio destes dados para análise?`;

        const encodedMessage = encodeURIComponent(mensagem);
        return `https://wa.me/${numeroTelefone}?text=${encodedMessage}`;
    }

    // --- Event Listeners Setup (Atualizado para novos botões/validações) ---
    formData.dataSolicitacao = new Date(); // Define a data atual no início
    dataAtualInput.value = formatDate(formData.dataSolicitacao);
    // Listener diaPagamento removido

    // Clear errors on interaction
    nomeInput.addEventListener('input', () => clearError('nome-completo'));
    cpfInput.addEventListener('input', () => clearError('cpf'));
    // valorEmprestimoInput listener já existe
    prazoOptionsContainer.addEventListener('change', () => clearError('prazo')); // Listener para as opções de prazo

    // --- Navigation Logic (Atualizado para novos botões/validações) ---
    btnIrParaValor.addEventListener('click', () => { if (validateStep1()) { formData.nome = nomeInput.value.trim(); formData.cpf = cpfInput.value; mostrarEtapa(1); } });
    btnVoltarParaDados.addEventListener('click', () => mostrarEtapa(0));
    btnIrParaPrazo.addEventListener('click', () => { if (validateStep2()) { gerarOpcoesPrazo(formData.valorEmprestimo); mostrarEtapa(2); } }); // Chama gerarOpcoesPrazo
    btnVoltarParaValor.addEventListener('click', () => mostrarEtapa(1));
    btnIrParaResumo.addEventListener('click', () => { if (validateStep3Prazo()) { if (calcularResumo()) { popularResumo(); mostrarEtapa(3); } else { alert("Erro ao calcular resumo."); } } }); // Chama validateStep3Prazo
    btnVoltarParaPrazo.addEventListener('click', () => mostrarEtapa(2));
    btnFinalizar.addEventListener('click', () => { // Verifica os dados relevantes
        if (formData.nome && formData.cpf && formData.valorEmprestimo > 0 && formData.prazoDias > 0 && formData.valorTotalPagar > 0) { const link = generateWhatsAppLink(); window.open(link, '_blank'); alert('Você será redirecionado para o WhatsApp.'); }
        else { alert('Erro: Dados incompletos ou inválidos. Revise as etapas.'); } });

    // --- Initialization ---
    mostrarEtapa(0); // Mostra a primeira etapa

});