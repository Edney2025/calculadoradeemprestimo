document.addEventListener('DOMContentLoaded', () => {
    let currentStep = 1;
    const totalSteps = 6;
    const form = document.getElementById('loan-form');
    const progressBarFill = document.getElementById('progress-bar-fill');


    // --- Máscaras ---
    const cpfInput = document.getElementById('cpf');
    const cepInput = document.getElementById('cep');
    const whatsappInput = document.getElementById('whatsapp');


     if (cpfInput) {
         cpfInput.addEventListener('input', (e) => {
            let v = e.target.value.replace(/\D/g,'');
             v=v.replace(/(\d{3})(\d)/,"$1.$2");
             v=v.replace(/(\d{3})(\d)/,"$1.$2");
             v=v.replace(/(\d{3})(\d{1,2})$/,"$1-$2");
             if (v.length > 14) v = v.substring(0, 14);
             e.target.value = v;
        });
    }


     if (cepInput) {
         cepInput.addEventListener('input', (e) => {
            let v = e.target.value.replace(/\D/g, '');
            v = v.replace(/^(\d{5})(\d)/, '$1-$2');
            if (v.length > 9) v = v.substring(0, 9);
            e.target.value = v;

         });

     }

     if (whatsappInput) {
            whatsappInput.addEventListener('input', (e) => {
                let v = e.target.value.replace(/\D/g,'');
                if (v.length <= 10) { // Fixo ou Celular antigo
                     v = v.replace(/(\d{2})(\d)/, '($1) $2');
                     v = v.replace(/(\d{4})(\d)/, '$1-$2');
                } else { // Celular com 9º dígito
                     v = v.replace(/(\d{2})(\d)/, '($1) $2');
                     v = v.replace(/(\d{5})(\d)/, '$1-$2');
                 }
                 if (v.length > 15) v = v.substring(0, 15); // Limita tamanho
                e.target.value = v;


             });
       }



    // --- Navegação entre Etapas ---
    window.nextStep = function () {
        if (validateStep(currentStep)) {
            goToStep(currentStep + 1);
        }
    }

    window.prevStep = function () {
        goToStep(currentStep - 1);
    }



 function goToStep(stepNumber) {
        if (stepNumber < 1 || stepNumber > totalSteps) return;

         const currentStepElement = document.querySelector(`.form-step[data-step="${currentStep}"]`);
        const nextStepElement = document.querySelector(`.form-step[data-step="${stepNumber}"]`);

         if(currentStepElement) currentStepElement.classList.remove('active');
         if(nextStepElement) nextStepElement.classList.add('active');

          currentStep = stepNumber;
        updateProgressBar();
 }


 function updateProgressBar() {
     const percentage = ((currentStep - 1) / (totalSteps - 1)) * 100;
       progressBarFill.style.width = `${percentage}%`;

 }




 function validateStep(step) {
 let isValid = true;
 const requiredInputs = document.querySelectorAll(`.form-step[data-step="${step}"] [required]`);
  requiredInputs.forEach(input => {

    input.style.borderColor = '';
    const errorSpan = input.nextElementSibling;

    if (errorSpan && errorSpan.classList.contains('error-text')) {
      errorSpan.remove();
    }


    let fieldValid = true;

    if (input.type === 'file') {
      if(input.id === 'cnh' || input.id === 'rg_frente' || input.id === 'rg_verso' || input.id === 'cpf_doc') {

                    } else if (!input.files || input.files.length === 0) {
                        fieldValid = false;
                    }

    } else if (input.type !== 'checkbox' && !input.value.trim()) {
      fieldValid = false;
    } else if (input.id === 'cpf' && input.value.replace(/\D/g,'').length !== 11) {
          fieldValid = false;
    }   else if (input.id === 'cep' && input.value.replace(/\D/g,'').length !== 8) {
             fieldValid = false;
         }

      if (!fieldValid) {

        isValid = false;
          input.style.borderColor = 'var(--accent-danger)';
           const errorMsg = document.createElement('span');
          errorMsg.className = 'error-text';
           errorMsg.textContent = input.id === 'cpf' ? 'CPF inválido.' : input.id === 'cep' ? "CEP inválido." :  'Campo obrigatório.';
          input.parentNode.insertBefore(errorMsg, input.nextSibling);

       }


  });

   if (step === 5) {
 const cnhInput = document.getElementById('cnh');
 const rgFrenteInput = document.getElementById('rg_frente');
 const rgVersoInput = document.getElementById('rg_verso');
  const hasCNH = cnhInput.files && cnhInput.files.length > 0;
 const hasRG = rgFrenteInput.files && rgFrenteInput.files.length > 0 && rgVersoInput.files && rgVersoInput.files.length > 0;
 if (!hasCNH && !hasRG) {
  isValid = false;
  alert('Por favor, envie a CNH OU as fotos do RG (frente e verso).');

 }

  }

     if(step === 6 &&  !isValid){
        alert("Por favor, preencha os campos obrigatórios");
     }

    return isValid;
}

 // --- Funções Auxiliares ---
window.mostrarCampoIndicado = function(valor) {
  document.getElementById('campo-indicador').style.display = valor === 'sim' ? 'block' : 'none';
}

    window.handleCNHUpload = function (input) {
       const rgCpfFields = document.getElementById('rg-cpf-fields');

        if (input.files && input.files.length > 0) {

           rgCpfFields.style.display = 'none';
           document.getElementById('rg_frente').value = '';
          document.getElementById('rg_verso').value = '';
           document.getElementById('cpf_doc').value = '';
           document.getElementById('rg-frente-preview').style.display = 'none';
             document.getElementById('rg-verso-preview').style.display = 'none';
            document.getElementById('cpf-doc-preview').style.display = 'none';

       } else {
           rgCpfFields.style.display = 'block';
        }

         previewImage('cnh', 'cnh-preview');

    }



    window.toggleSocialInput = function (social) {
       const checkbox = document.getElementById(`${social}-check`);
         const inputDiv = document.getElementById(`${social}-input`);

       if (inputDiv) {
         inputDiv.style.display = checkbox.checked ? "block" : "none";
      }

     }


    window.previewImage = function (inputId, previewId) {
         const input = document.getElementById(inputId);
       const preview = document.getElementById(previewId);

        if (input && preview && input.files && input.files[0]) {

            const reader = new FileReader();
            reader.onload = function (e) {
               preview.src = e.target.result;
               preview.style.display = 'block';
             }

           reader.readAsDataURL(input.files[0]);

         } else if (preview) {
           preview.src = "#";
           preview.style.display = 'none';

       }

     }




      // --- Lógica de Envio ---
form.addEventListener('submit', function(event) {
 event.preventDefault();

  // Validação final das redes sociais
 let socialCount = 0;
 const socialInputs = document.querySelectorAll('.social-input input[type="text"]');

socialInputs.forEach(input => {
 if (input.closest('.social-input').style.display === 'block' && input.value.trim() !== '') {
 socialCount++;
 }

 });

 const otherSocialChecked = document.querySelectorAll('#instagram-check:checked, #facebook-check:checked, #tiktok-check:checked, #linkedin-check:checked').length > 0;

 // Verifica se o WhatsApp foi preenchido e pelo menos uma outra rede social.
   const whatsappValue = document.getElementById('whatsapp').value.replace(/\D/g,'');
 if (whatsappValue.length < 10 || (!otherSocialChecked)) {

 document.getElementById('social-error').style.display = 'block';
 goToStep(6); // Volta para a etapa 6
  alert("Erro na Etapa 6: Verifique as Redes Sociais.");

 return; // Impede o envio
 } else {
     document.getElementById('social-error').style.display = 'none';
 }


 alert("Cadastro enviado com sucesso! (Simulação)");

 const formData = new FormData(form);
 for (let pair of formData.entries()) {
 console.log(pair[0]+ ', '+ pair[1]);
 }



});



  updateProgressBar();
  goToStep(1);
   mostrarCampoIndicado('nao');

 ['instagram', 'facebook', 'tiktok', 'linkedin'].forEach(social => {
  const inputDiv = document.getElementById(`${social}-input`);
   if(inputDiv) inputDiv.style.display = 'none';


 });



});