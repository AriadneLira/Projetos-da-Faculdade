
(function greet() {
  const el = document.getElementById('saudacao');
  if (!el) return;
  const h = new Date().getHours();
  let msg = 'Boas compras!';
  if (h < 12) msg = 'Bom dia! Veja as ofertas de hoje.';
  else if (h < 18) msg = 'Boa tarde! Produtos selecionados para seu pet.';
  else msg = 'Boa noite! Agende banho e tosa com facilidade.';
  el.textContent = msg;
})();

function cpfMask(value) {
  return value.replace(/\D/g, '').slice(0,11);
}
const cpf = document.getElementById('cpf');
if (cpf) {
  cpf.addEventListener('input', e => {
    e.target.value = cpfMask(e.target.value);
  });
}

const tabela = {
  banho:     { pequeno: 49.9,  medio: 69.9,  grande: 89.9 },
  tosa:      { pequeno: 59.9,  medio: 79.9,  grande: 99.9 },
  banho_tosa:{ pequeno: 49.9+59.9-10, medio: 69.9+79.9-15, grande: 89.9+99.9-20 } 
};
const taxaTele = 19.9;


function atualizarTotal() {
  const resumo = document.getElementById('resumoPreco');
  const totalEl = document.getElementById('total');
  if (!resumo || !totalEl) return;

  const servico = document.querySelector('input[name="servico"]:checked')?.value;
  const metodo = document.querySelector('input[name="metodo"]:checked')?.value;
  const porte = document.getElementById('porte')?.value;

  if (!servico || !porte) {
    totalEl.textContent = 'R$ 0,00';
    resumo.textContent = 'Selecione serviço e porte para calcular.';
    return;
  }

  let total = tabela[servico][porte];
  let detalhes = `Serviço: ${servico.replace('_',' + ')} | Porte: ${porte}`;

  if (metodo === 'tele-busca') {
    total += taxaTele; 
    detalhes += ' | + Tele-busca';
  } else if (metodo === 'local') {
    detalhes += ' | Entrega no local';
  }

  totalEl.textContent = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  resumo.textContent = detalhes;
}
['change','input'].forEach(evt => {
  document.addEventListener(evt, atualizarTotal, true);
});

const form = document.getElementById('formAgendamento');
if (form) {
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    e.stopPropagation();

    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      document.getElementById('liveRegion').textContent = 'Há erros no formulário. Verifique os campos destacados.';
      return;
    }

   const data = new FormData(form);
    const payload = Object.fromEntries(data.entries());

    const porte = payload.porte;
    const servico = payload.servico;
    let total = tabela[servico][porte];
    if (payload.metodo === 'tele-busca') total += taxaTele;

    payload.total = total;

    const agendamentos = JSON.parse(localStorage.getItem('agendamentos') || '[]');
    agendamentos.push(payload);
    localStorage.setItem('agendamentos', JSON.stringify(agendamentos));

    document.getElementById('liveRegion').textContent = 'Agendamento enviado com sucesso.';

    const resumo = `
      <strong>Cliente:</strong> ${payload.nome} • CPF ${payload.cpf}<br>
      <strong>Pet:</strong> ${payload.nomePet} (${payload.raca}, ${payload.idade} ano(s), porte ${payload.porte})<br>
      <strong>Serviço:</strong> ${servico.replace('_',' + ')} • <strong>Método:</strong> ${payload.metodo}<br>
      <strong>Data/Hora:</strong> ${payload.data} às ${payload.hora}<br>
      <strong>Total:</strong> ${total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
    `;
    document.getElementById('resumoFinal').innerHTML = resumo;

    const modal = new bootstrap.Modal(document.getElementById('modalOk'));
    modal.show();

     form.reset();
    form.classList.remove('was-validated');
    atualizarTotal();
  }, false);
}
