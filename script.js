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
    const valorEmprestimoInput = document.getElementById('valor-emprestimo'); // Agora type="text" no HTML

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
        nome: '',
        cpf: '',
        diaPagamento: '',
        valorEmprestimo: 0, // Armazena o valor NUMÉRICO puro
        qtdParcelas: 0,
        valorParcela: 0,
        dataPrimeiraParcela: null,
        dataUltimaParcela: null,
    };

    // --- Helper Functions ---

    // Format number to BRL currency string
    function formatCurrency(value) {
        if (isNaN(value)) return ''; // Retorna vazio se não for número
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    // Parse a BRL currency string (like "R$ 1.500,00") back to a number
    function parseCurrency(value) {
        if (!value || typeof value !== 'string') return NaN;
        // Remove R$, espaços, pontos de milhar e substitui vírgula decimal por ponto
        const numberString = value.replace(/R\$\s?/g, '').replace(/\./g, '').replace(/,/g, '.');
        return parseFloat(numberString);
    }

    // Format date (DD/MM/YYYY)
    function formatDate(date) {
        if (!date || !(date instanceof Date)) return '-';
        return date.toLocaleDateString('pt-BR');
    }

     // Basic CPF Validation
    function validateCPF(cpf) {
        cpf = cpf.replace(/[^\d]+/g, '');
        if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
        let sum = 0, remainder;
        for (let i = 1; i <= 9; i++) sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
        remainder = (sum * 10) % 11;
        if ((remainder === 10) || (remainder === 11)) remainder = 0;
        if (remainder !== parseInt(cpf.substring(9, 10))) return false;
        sum = 0;
        for (let i = 1; i <= 10; i++) sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
        remainder = (sum * 10) % 11;
        if ((remainder === 10) || (remainder === 11)) remainder = 0;
        if (remainder !== parseInt(cpf.substring(10, 11))) return false;
        return true;
    }

     // Add CPF Masking
     cpfInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '').substring(0, 11);
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        e.target.value = value;
     });

    // --- Valor Emprestimo Input Formatting ---
    valorEmprestimoInput.addEventListener('input', (e) => {
        // Permite apenas dígitos e vírgula/ponto (para digitação inicial)
        let value = e.target.value.replace(/\D/g, ''); // Remove tudo que não for dígito

        // Formata enquanto digita (opcional, pode ser complexo, vamos focar no blur)
        // Deixaremos a formatação principal para o 'blur'
    });

    valorEmprestimoInput.addEventListener('blur', (e) => {
        // Formata ao sair do campo
        let value = e.target.value;
        const numericValue = parseCurrency(value); // Tenta parsear o que foi digitado

        if (!isNaN(numericValue)) {
            e.target.value = formatCurrency(numericValue); // Mostra formatado
        } else {
             e.target.value = ''; // Limpa se for inválido
        }
    });

     valorEmprestimoInput.addEventListener('focus', (e) => {
        // Ao focar, remove formatação para facilitar edição
        let value = e.target.value;
        const numericValue = parseCurrency(value);

        if (!isNaN(numericValue)) {
             // Mostra apenas o número com separador decimal (ponto)
             e.target.value = numericValue.toFixed(2).replace('.', ',');
        }
        // Se for inválido ou vazio, mantém como está (provavelmente vazio)
     });

    // --- Error Handling ---
    function clearError(fieldId) {
        const errorElement = document.getElementById(`error-${fieldId}`);
        const inputElementOrContainer = document.getElementById(fieldId) || document.getElementById(`${fieldId}-options`);
        if (errorElement) errorElement.style.display = 'none';
        if (inputElementOrContainer) inputElementOrContainer.classList.remove('is-invalid');
    }

    function showError(fieldId, message) {
        const errorElement = document.getElementById(`error-${fieldId}`);
        const inputElementOrContainer = document.getElementById(fieldId) || document.getElementById(`${fieldId}-options`);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
         if (inputElementOrContainer) {
             inputElementOrContainer.classList.add('is-invalid');
         }
    }

    // --- Validation Functions ---
    function validateStep1() {
        let isValid = true;
        clearError('nome-completo'); clearError('cpf'); clearError('dia-pagamento');

        if (!nomeInput.value.trim()) { showError('nome-completo', 'Nome completo é obrigatório.'); isValid = false; }
        if (!validateCPF(cpfInput.value)) { showError('cpf', 'CPF inválido ou não preenchido.'); isValid = false; }
        if (!diaPagamentoSelect.value) { showError('dia-pagamento', 'Selecione o dia da primeira parcela.'); isValid = false; }
        return isValid;
    }

    function validateStep2() {
         let isValid = true;
         clearError('valor-emprestimo');
         // PARSEIA o valor do input (que pode estar formatado) para número
         const valor = parseCurrency(valorEmprestimoInput.value);

         if (isNaN(valor) || valor < 100) { // Valida o NÚMERO parseado
            showError('valor-emprestimo', `Valor inválido ou menor que ${formatCurrency(100)}.`);
            isValid = false;
         } else {
            formData.valorEmprestimo = valor; // Armazena o valor NUMÉRICO parseado
         }
         return isValid;
    }

    function validateStep3() {
         let isValid = true;
         clearError('parcelas');
         const checkedRadio = parcelasOptionsContainer.querySelector('input[name="parcelas"]:checked');
         if (!checkedRadio) { showError('parcelas', 'Por favor, selecione uma opção de parcelamento.'); isValid = false; }
         return isValid;
    }

     // Update progress bar visualization
    function updateProgressBar(currentStepIndex) {
         const totalSteps = passos.length;
         passos.forEach((passo, index) => {
            passo.classList.toggle('completed', index < currentStepIndex);
            passo.classList.toggle('active', index === currentStepIndex);
         });
         let progressWidth = totalSteps > 1 ? (currentStepIndex / (totalSteps - 1)) * 100 : 0;
         progressIndicator.style.width = `${progressWidth}%`;
    }


    // Show the target step and hide others
    function mostrarEtapa(index) {
        etapas.forEach((etapa, i) => etapa.classList.toggle('ativa', i === index));
        etapaAtual = index;
        updateProgressBar(index);
    }

     // Calculate first payment date
    function calcularPrimeiraDataPagamento(diaSelecionado) {
        const hoje = new Date();
        let ano = hoje.getFullYear();
        let mes = hoje.getMonth();
        if (hoje.getDate() >= diaSelecionado) {
            mes++;
            if (mes > 11) { mes = 0; ano++; }
        }
        const primeiraData = new Date(ano, mes, diaSelecionado);
        // Verifica se o dia é válido para o mês (ex: não cria 30 de Fev)
        if (primeiraData.getMonth() !== mes) {
             // Se inválido (raro com as opções fixas), retorna o último dia do mês anterior pretendido
            return new Date(ano, mes, 0);
        }
        return primeiraData;
    }


    // *** ATUALIZADO: Generate installment options from 3x to 48x (steps of 3) ***
    function gerarOpcoesParcelas(valorTotal) {
        parcelasOptionsContainer.innerHTML = ''; // Limpa opções antigas
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.id = 'error-parcelas';
        errorDiv.style.display = 'none';

        const minParcela = 3;
        const maxParcela = 48;
        const stepParcela = 3;
        const valorMinimoParcela = 10.00; // Ex: Parcela mínima de R$10

        let hasOptions = false; // Flag para verificar se alguma opção foi gerada

        for (let numParcelas = minParcela; numParcelas <= maxParcela; numParcelas += stepParcela) {
            const valorParcela = valorTotal / numParcelas;

            // Pula esta opção se o valor da parcela for menor que o mínimo permitido
            if (valorParcela < valorMinimoParcela) {
                // Se já estamos gerando parcelas muito pequenas, podemos parar
                 // break; // Descomente se quiser parar assim que a parcela for muito pequena
                 continue; // Continua para ver se há opções válidas, mas pula esta
            }

            hasOptions = true; // Marcamos que pelo menos uma opção válida foi encontrada

            const optionDiv = document.createElement('div');
            optionDiv.className = 'parcela-option';

            const radioInput = document.createElement('input');
            radioInput.type = 'radio';
            radioInput.name = 'parcelas';
            radioInput.value = numParcelas;
            radioInput.id = `parcela-${numParcelas}`;

            const label = document.createElement('label');
            label.htmlFor = `parcela-${numParcelas}`;
            // Formata o valor da parcela AQUI antes de exibir
            label.innerHTML = `
                ${numParcelas}x de <span>${formatCurrency(valorParcela)}</span>
            `;

            optionDiv.appendChild(radioInput);
            optionDiv.appendChild(label);
            parcelasOptionsContainer.appendChild(optionDiv);
        }

        // Adiciona a div de erro ao final
        parcelasOptionsContainer.appendChild(errorDiv);

         // Se NENHUMA opção foi gerada (ex: valor do empréstimo muito baixo)
         if (!hasOptions) {
            showError('parcelas', `Nenhuma opção de parcelamento disponível para ${formatCurrency(valorTotal)} com parcela mínima de ${formatCurrency(valorMinimoParcela)}.`);
         }
    }

    // Calculate summary data
    function calcularResumo() {
        // Usa o valor NUMÉRICO já parseado e armazenado em formData.valorEmprestimo
        formData.valorParcela = formData.valorEmprestimo / formData.qtdParcelas;
        formData.dataPrimeiraParcela = calcularPrimeiraDataPagamento(formData.diaPagamento);
        if (formData.dataPrimeiraParcela && formData.qtdParcelas > 0) {
            formData.dataUltimaParcela = new Date(formData.dataPrimeiraParcela);
            formData.dataUltimaParcela.setMonth(formData.dataUltimaParcela.getMonth() + formData.qtdParcelas - 1);
        } else {
            formData.dataUltimaParcela = null;
        }
        return true;
    }


    // Populate Step 4 summary fields
    function popularResumo() {
        resumoNome.textContent = formData.nome || '-';
        resumoCpf.textContent = formData.cpf || '-';
        resumoValor.textContent = formatCurrency(formData.valorEmprestimo) || '-'; // Usa o valor numérico formatado
        resumoParcelas.textContent = formData.qtdParcelas ? `${formData.qtdParcelas}x` : '-';
        resumoValorParcela.textContent = formatCurrency(formData.valorParcela) || '-'; // Formata o valor calculado da parcela
        resumoDataPrimeira.textContent = formatDate(formData.dataPrimeiraParcela) || '-';
        resumoDataUltima.textContent = formatDate(formData.dataUltimaParcela) || '-';
    }

     // Generate WhatsApp message link
     function generateWhatsAppLink() {
         // !!!! >>> IMPORTANTE: SUBSTITUA PELO SEU NÚMERO AQUI <<< !!!!
         const numeroTelefone = '5511999999999'; // Exemplo: 55 (Brasil) + 11 (DDD SP) + 999999999 (Número)
         // Certifique-se que não tem '+' ou '00' no início, apenas números.

         // Usa os valores FORMATADOS para a mensagem ficar bonita
         const mensagem = `Olá! Gostaria de solicitar um empréstimo com os seguintes dados:
*Nome:* ${formData.nome}
*CPF:* ${formData.cpf}
*Valor Solicitado:* ${formatCurrency(formData.valorEmprestimo)}
*Parcelas:* ${formData.qtdParcelas}x de ${formatCurrency(formData.valorParcela)}
*Primeiro Vencimento:* ${formatDate(formData.dataPrimeiraParcela)}

Aguardo contato. Obrigado!`;

         const encodedMessage = encodeURIComponent(mensagem);
         return `https://wa.me/${numeroTelefone}?text=${encodedMessage}`;
     }


    // --- Event Listeners ---

    // Set current date on load
    dataAtualInput.value = formatDate(new Date());

    // Update payment reminder when day changes
    diaPagamentoSelect.addEventListener('change', () => {
         clearError('dia-pagamento');
         const dia = diaPagamentoSelect.value;
         if (dia) {
            const primeiraData = calcularPrimeiraDataPagamento(dia);
            lembretePagamento.textContent = `Lembrete: Sua primeira parcela será por volta de ${formatDate(primeiraData)}.`;
         } else { lembretePagamento.textContent = ''; }
    });

     // Add listeners to clear errors on input/change
     nomeInput.addEventListener('input', () => clearError('nome-completo'));
     cpfInput.addEventListener('input', () => clearError('cpf'));
     valorEmprestimoInput.addEventListener('input', () => clearError('valor-emprestimo')); // Clear error while typing
     diaPagamentoSelect.addEventListener('change', () => clearError('dia-pagamento'));
     parcelasOptionsContainer.addEventListener('change', () => clearError('parcelas'));


    // --- Navigation Logic ---
    btnIrParaEtapa2.addEventListener('click', () => {
        if (validateStep1()) {
            formData.nome = nomeInput.value.trim();
            formData.cpf = cpfInput.value;
            formData.diaPagamento = diaPagamentoSelect.value;
            mostrarEtapa(1);
        }
    });

    btnVoltarParaEtapa1.addEventListener('click', () => mostrarEtapa(0));

    btnIrParaEtapa3.addEventListener('click', () => {
        if (validateStep2()) { // validateStep2 agora armazena o valor parseado em formData.valorEmprestimo
            gerarOpcoesParcelas(formData.valorEmprestimo); // Usa o valor NUMÉRICO
            mostrarEtapa(2);
        }
    });

    btnVoltarParaEtapa2.addEventListener('click', () => mostrarEtapa(1));

    btnIrParaEtapa4.addEventListener('click', () => {
        if (validateStep3()) {
            const selectedRadio = parcelasOptionsContainer.querySelector('input[name="parcelas"]:checked');
            formData.qtdParcelas = parseInt(selectedRadio.value);
            if (calcularResumo()) {
                popularResumo();
                mostrarEtapa(3);
            } else {
                 alert("Ocorreu um erro ao calcular os detalhes do empréstimo.");
            }
        }
    });

    btnVoltarParaEtapa3.addEventListener('click', () => mostrarEtapa(2));

    btnFinalizar.addEventListener('click', () => {
        // Validação final simples
        if (formData.nome && formData.cpf && formData.valorEmprestimo > 0 && formData.qtdParcelas > 0) {
            const link = generateWhatsAppLink();
            window.open(link, '_blank');
            alert('Você será redirecionado para o WhatsApp para enviar sua solicitação.');
            // Opcional: resetar form ou redirecionar
        } else {
            alert('Erro: Dados incompletos. Por favor, volte e preencha todas as etapas corretamente.');
        }
    });

    // --- Initialization ---
    mostrarEtapa(0); // Show the initial step (Step 1)

});