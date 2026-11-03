document.addEventListener('DOMContentLoaded', () => {
  const currentPage = document.body.dataset.page;

  // Ativar o botão correto na navegação
  const navButtons = document.querySelectorAll('.nav-btn, .sub-link');
  navButtons.forEach(btn => {
    if (btn.dataset.page === currentPage) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // LÓGICA DA BARRA DE PESQUISA DO TOP-NAV (Busca Geral e em Tabelas)
  const searchInput = document.querySelector('.search-bar input');
  if (searchInput) {
    // Adicionar um menu de sugestões/resultados à barra de pesquisa
    const searchBar = document.querySelector('.search-bar');
    let resultsDropdown = document.createElement('div');
    resultsDropdown.className = 'search-results-dropdown';
    searchBar.style.position = 'relative';
    searchBar.appendChild(resultsDropdown);

    // Mapeamento de rotas e palavras-chave do portal
    const pageRoutes = [
      { name: 'Página Inicial / Home', url: 'index.html', keywords: ['home', 'inicio', 'atividades', 'boletim', 'eventos', 'tarefas', 'comunicados'] },
      { name: 'Faltas e Frequência', url: 'faltas.html', keywords: ['faltas', 'frequencia', 'resumo de faltas', 'ausencias', 'presenca'] },
      { name: 'Quadro de Horários', url: 'horarios.html', keywords: ['horarios', 'quadro de horarios', 'aulas', 'semanal', 'disciplinas', 'd.s', 'ingles'] },
      { name: 'Notas e Boletim', url: 'notas.html', keywords: ['notas', 'boletim', 'trimestre', 'ensino medio', 'matematica', 'historia', 'ingles'] },
      { name: 'Contato e Secretaria', url: 'contato.html', keywords: ['contato', 'secretaria', 'fale conosco', 'suporte', 'duvidas', 'mensagens'] }
    ];

    searchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase().trim();
      resultsDropdown.innerHTML = '';

      // 1. Filtrar linhas da tabela (caso a página atual tenha tabelas)
      const tableRows = document.querySelectorAll('.data-table tbody tr');
      if (tableRows.length > 0) {
        tableRows.forEach(row => {
          const text = row.textContent.toLowerCase();
          row.style.display = text.includes(term) ? '' : 'none';
        });
      }

      // 2. Exibir sugestões de navegação direta no portal
      if (term.length > 0) {
        const matches = pageRoutes.filter(route => 
          route.name.toLowerCase().includes(term) || 
          route.keywords.some(kw => kw.includes(term))
        );

        if (matches.length > 0) {
          resultsDropdown.style.display = 'block';
          matches.forEach(match => {
            const item = document.createElement('a');
            item.href = match.url;
            item.className = 'search-result-item';
            item.innerHTML = `<i class="fas fa-link"></i> ${match.name}`;
            resultsDropdown.appendChild(item);
          });
        } else {
          resultsDropdown.style.display = 'block';
          resultsDropdown.innerHTML = '<div class="search-no-result">Nenhum resultado encontrado</div>';
        }
      } else {
        resultsDropdown.style.display = 'none';
      }
    });

    // Pressionar ENTER para redirecionar para a melhor opção encontrada
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const term = searchInput.value.toLowerCase().trim();
        if (!term) return;

        const match = pageRoutes.find(route => 
          route.name.toLowerCase().includes(term) || 
          route.keywords.some(kw => kw.includes(term))
        );

        if (match) {
          window.location.href = match.url;
        }
      }
    });

    // Fechar a lista quando clicar fora
    document.addEventListener('click', (e) => {
      if (!searchBar.contains(e.target)) {
        resultsDropdown.style.display = 'none';
      }
    });
  }

  // Botão Imprimir (Horários)
  const printBtn = document.getElementById('print-btn');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // Formulário de Contato
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const feedback = document.getElementById('form-feedback');
      feedback.textContent = 'Mensagem enviada com sucesso! Em breve entraremos em contato.';
      contactForm.reset();
    });
  }

  // Tecla Enter para adicionar tarefas
  const taskInput = document.getElementById('new-task-input');
  if (taskInput) {
    taskInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        addTask();
      }
    });
  }
});

// Funções globais da To-Do List (Card 1)
function toggleTask(checkbox) {
  const listItem = checkbox.closest('li');
  const pendingList = document.getElementById('todo-list-pending');
  const completedList = document.getElementById('todo-list-completed');

  if (checkbox.checked) {
    completedList.appendChild(listItem);
  } else {
    pendingList.appendChild(listItem);
  }
}

function addTask() {
  const input = document.getElementById('new-task-input');
  const taskName = input.value.trim();

  if (!taskName) return;

  const pendingList = document.getElementById('todo-list-pending');
  const li = document.createElement('li');

  li.innerHTML = `
    <label><input type="checkbox" onchange="toggleTask(this)"> ${taskName}</label>
    <i class="fas fa-trash delete-icon" onclick="deleteTask(this)"></i>
  `;

  pendingList.appendChild(li);
  input.value = '';
}

function deleteTask(element) {
  const listItem = element.closest('li');
  listItem.remove();
}
