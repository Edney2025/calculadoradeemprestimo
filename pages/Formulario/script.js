<!-- FORMULÁRIO MULTIETAPAS INTEGRADO AO STYLE-HOME.CSS -->
<div class="container-formulario">
  <!-- ETAPA 1 - DADOS PESSOAIS -->
  <form id="formEtapas">
    <div class="etapa etapa-ativa" id="etapa1">
      <h2>Dados do Cliente</h2>
      <label for="nome">Nome Completo *</label>
      <input type="text" id="nome" name="nome" required>

      <label for="cpf">CPF *</label>
      <input type="text" id="cpf" name="cpf" required>

      <label for="rg">RG</label>
      <input type="text" id="rg" name="rg">

      <label for="nascimento">Data de Nascimento *</label>
      <input type="date" id="nascimento" name="nascimento" required>

      <label for="telefone">Telefone *</label>
      <input type="text" id="telefone" name="telefone" required>

      <label for="email">E-mail</label>
      <input type="email" id="email" name="email">

      <button type="button" class="btn-avancar" onclick="proximaEtapa(1)">→ Endereço</button>
    </div>

    <!-- ETAPA 2 - ENDEREÇO -->
    <div class="etapa" id="etapa2">
      <h2>Endereço</h2>
      <label for="cep">CEP *</label>
      <input type="text" id="cep" name="cep" required>

      <label for="rua">Rua *</label>
      <input type="text" id="rua" name="rua" required>

      <label for="numero">Número *</label>
      <input type="text" id="numero" name="numero" required>

      <label for="bairro">Bairro *</label>
      <input type="text" id="bairro" name="bairro" required>

      <label for="cidade">Cidade *</label>
      <select id="cidade" name="cidade" required></select>

      <label for="estado">Estado *</label>
      <select id="estado" name="estado" required></select>

      <div class="botoes">
        <button type="button" onclick="voltarEtapa(1)">← Dados do Cliente</button>
        <button type="button" class="btn-avancar" onclick="proximaEtapa(2)">→ Emprego</button>
      </div>
    </div>

    <!-- ETAPA 3 - EMPREGO -->
    <div class="etapa" id="etapa3">
      <h2>Emprego</h2>
      <label for="profissao">Profissão *</label>
      <select id="profissao" name="profissao" required></select>
      <input type="text" id="profissaoOutros" name="profissaoOutros" placeholder="Se outro, digite aqui..." style="display:none">

      <label for="salario">Faixa Salarial *</label>
      <select id="salario" name="salario" required>
        <option value="">Selecione</option>
        <option>Até R$1.000</option>
        <option>De R$1.000 a R$2.000</option>
        <option>De R$2.000 a R$3.000</option>
        <option>De R$3.000 a R$5.000</option>
        <option>Acima de R$5.000</option>
        <option>Outros</option>
      </select>

      <label for="tempoResidencia">Tempo de Residência *</label>
      <select id="tempoResidencia" name="tempoResidencia" required>
        <option value="">Selecione</option>
        <option>Menos de 6 meses</option>
        <option>6 meses a 1 ano</option>
        <option>1 a 2 anos</option>
        <option>2 a 5 anos</option>
        <option>Mais de 5 anos</option>
        <option>Outros</option>
      </select>

      <div class="botoes">
        <button type="button" onclick="voltarEtapa(2)">← Endereço</button>
        <button type="button" class="btn-avancar" onclick="proximaEtapa(3)">→ Indicação</button>
      </div>
    </div>

    <!-- ETAPA 4 - INDICAÇÃO -->
    <div class="etapa" id="etapa4">
      <h2>Indicação</h2>
      <label>Foi indicado por alguém?</label>
      <select id="indicado" name="indicado" onchange="verificarIndicacao()">
        <option value="nao">Não</option>
        <option value="sim">Sim</option>
      </select>

      <div id="campoAvalista" style="display: none">
        <label for="avalista">Nome do Avalista</label>
        <input type="text" id="avalista" name="avalista">
      </div>

      <div id="campoComoSoube" style="display: block">
        <label for="comoSoube">Como ficou sabendo da empresa?</label>
        <input type="text" id="comoSoube" name="comoSoube">
      </div>

      <div class="botoes">
        <button type="button" onclick="voltarEtapa(3)">← Emprego</button>
        <button type="button" class="btn-avancar" onclick="proximaEtapa(4)">→ Finalizar</button>
      </div>
    </div>

    <!-- ETAPA 5 - FINALIZAÇÃO -->
    <div class="etapa" id="etapa5">
      <h2>Finalizar Cadastro</h2>
      <p>Revise seus dados e clique em "Enviar" para concluir.</p>
      <div class="botoes">
        <button type="button" onclick="voltarEtapa(4)">← Indicação</button>
        <button type="submit" class="btn-enviar">Enviar</button>
      </div>
    </div>
  </form>
</div>

<!-- ESTILO CSS ADAPTADO AO STYLE-HOME.CSS -->
<style>
  .container-formulario {
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
    background-color: var(--bg-dark-secondary);
    color: var(--text-light-primary);
    border-radius: var(--border-radius-medium);
    box-shadow: 0 0 10px var(--shadow-color-medium);
  }
  .etapa {
    display: none;
    flex-direction: column;
    gap: 1rem;
  }
  .etapa-ativa {
    display: flex;
  }
  label {
    font-weight: 600;
    margin-bottom: 0.3rem;
  }
  input, select {
    background-color: var(--input-bg);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius-small);
    padding: 0.5rem;
    color: var(--text-light-primary);
    font-size: 1rem;
    width: 100%;
  }
  .botoes {
    display: flex;
    justify-content: space-between;
    margin-top: 1.5rem;
  }
  .btn-avancar, .btn-enviar {
    background-color: var(--accent-primary);
    color: white;
    padding: 0.7rem 1.2rem;
    border: none;
    border-radius: var(--border-radius-medium);
    cursor: pointer;
    transition: background var(--transition-speed-fast);
  }
  .btn-avancar:hover, .btn-enviar:hover {
    background-color: var(--accent-secondary);
  }
</style>

<!-- JAVASCRIPT FUNCIONAL -->
<script>
  const etapas = document.querySelectorAll('.etapa');

  function proximaEtapa(n) {
    etapas[n - 1].classList.remove('etapa-ativa');
    etapas[n].classList.add('etapa-ativa');
  }

  function voltarEtapa(n) {
    etapas[n].classList.remove('etapa-ativa');
    etapas[n - 1].classList.add('etapa-ativa');
  }

  function verificarIndicacao() {
    const select = document.getElementById('indicado');
    const campoAvalista = document.getElementById('campoAvalista');
    const campoComoSoube = document.getElementById('campoComoSoube');

    if (select.value === 'sim') {
      campoAvalista.style.display = 'block';
      campoComoSoube.style.display = 'none';
    } else {
      campoAvalista.style.display = 'none';
      campoComoSoube.style.display = 'block';
    }
  }
</script>
