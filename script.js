document.addEventListener('DOMContentLoaded', () => {

  // IDENTIFICA A PÁGINA ATUAL
  const currentPage = document.body.dataset.page;

  // DESTACA O LINK ATIVO
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
    const searchBar = document.querySelector('.search-bar');
    let resultsDropdown = document.createElement('div');
    resultsDropdown.className = 'search-results-dropdown';
    searchBar.style.position = 'relative';
    searchBar.appendChild(resultsDropdown);

    const pageRoutes = [
      { name: 'Página Inicial / Home', url: 'index.html', keywords: ['home', 'inicio', 'atividades', 'boletim', 'eventos', 'tarefas', 'comunicados'] },
      { name: 'Faltas e Frequência', url: 'faltas.html', keywords: ['faltas', 'frequencia', 'resumo de faltas', 'ausencias', 'presenca'] },
      { name: 'Quadro de Horários', url: 'horarios.html', keywords: ['horarios', 'quadro de horarios', 'aulas', 'semanal', 'disciplinas', 'd.s', 'ingles'] },
      { name: 'Notas e Boletim', url: 'notas.html', keywords: ['notas', 'boletim', 'trimestre', 'ensino medio', 'matematica', 'historia', 'ingles'] },
      { name: 'Acesso / Login e Cadastro', url: 'login.html', keywords: ['login', 'entrar', 'cadastro', 'senha', 'autenticacao', 'conta'] },
      { name: 'Contato e Secretaria', url: 'contato.html', keywords: ['contato', 'secretaria', 'fale conosco', 'suporte', 'duvidas', 'mensagens'] }
    ];

    searchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase().trim();
      resultsDropdown.innerHTML = '';

      // Filtrar linhas da tabela (se houver tabela na página)
      const tableRows = document.querySelectorAll('.data-table tbody tr');
      if (tableRows.length > 0) {
        tableRows.forEach(row => {
          const text = row.textContent.toLowerCase();
          row.style.display = text.includes(term) ? '' : 'none';
        });
      }

      // Sugestões de navegação
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

    document.addEventListener('click', (e) => {
      if (!searchBar.contains(e.target)) {
        resultsDropdown.style.display = 'none';
      }
    });
  }

  // IMPRESSÃO
  const printBtn = document.getElementById('print-btn');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // FORMULÁRIO DE CONTATO
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const feedback = document.getElementById('form-feedback');
      if (feedback) {
        feedback.textContent = 'Mensagem enviada com sucesso! Em breve entraremos em contato.';
      }
      contactForm.reset();
    });
  }

  // TO-DO LIST (Página Inicial)
  const taskInput = document.getElementById('new-task-input');
  if (taskInput) {
    taskInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        addTask();
      }
    });
  }

  // =========================================
  // FUNÇÕES DE LOGIN E CADASTRO (LOCAL STORAGE)
  // =========================================

  function obterUsuarios() {
    try {
      return JSON.parse(localStorage.getItem('portalSenai_usuarios')) || [];
    } catch (e) {
      return [];
    }
  }

  function salvarUsuarios(lista) {
    localStorage.setItem('portalSenai_usuarios', JSON.stringify(lista));
  }

  function obterSessao() {
    try {
      return JSON.parse(sessionStorage.getItem('portalSenai_sessao'));
    } catch (e) {
      return null;
    }
  }

  // ATUALIZA O NOME DO USUÁRIO NO TOPO DA PÁGINA
  const topUserDisplay = document.getElementById('top-user-display');
  const sessaoAtiva = obterSessao();
  if (sessaoAtiva && topUserDisplay) {
    topUserDisplay.textContent = sessaoAtiva.nome;
  }

  // ELEMENTOS DO LOGIN E CADASTRO
  const tabLogin = document.getElementById('tab-login');
  const tabCadastro = document.getElementById('tab-cadastro');
  const formLogin = document.getElementById('form-login');
  const formCadastro = document.getElementById('form-cadastro');
  const loggedPanel = document.getElementById('logged-panel');
  const msgLogin = document.getElementById('msg-login');
  const msgCadastro = document.getElementById('msg-cadastro');
  const btnLogout = document.getElementById('btn-logout');

  if (tabLogin && tabCadastro && formLogin && formCadastro) {

    function exibirFeedback(elemento, texto, tipo) {
      if (!elemento) return;
      elemento.textContent = texto;
      elemento.className = 'auth-feedback ' + tipo;
    }

    function limparFeedbacks() {
      if (msgLogin) msgLogin.textContent = '';
      if (msgCadastro) msgCadastro.textContent = '';
    }

    function alternarAbas(aba) {
      limparFeedbacks();
      if (aba === 'login') {
        tabLogin.classList.add('active');
        tabCadastro.classList.remove('active');
        formLogin.classList.remove('is-hidden');
        formCadastro.classList.add('is-hidden');
      } else {
        tabCadastro.classList.add('active');
        tabLogin.classList.remove('active');
        formCadastro.classList.remove('is-hidden');
        formLogin.classList.add('is-hidden');
      }
    }

    tabLogin.addEventListener('click', () => alternarAbas('login'));
    tabCadastro.addEventListener('click', () => alternarAbas('cadastro'));

    // MOSTRAR/OCULTAR SENHA
    document.querySelectorAll('.btn-toggle-eye').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');
        const input = document.getElementById(targetId);
        const icon = btn.querySelector('i');

        if (input) {
          const mostrar = input.type === 'password';
          input.type = mostrar ? 'text' : 'password';
          if (icon) {
            icon.className = mostrar ? 'fas fa-eye-slash' : 'fas fa-eye';
          }
        }
      });
    });

    // CADASTRO
    formCadastro.addEventListener('submit', (e) => {
      e.preventDefault();
      const nome = document.getElementById('cad-nome').value.trim();
      const usuario = document.getElementById('cad-usuario').value.trim();
      const email = document.getElementById('cad-email').value.trim();
      const senha = document.getElementById('cad-senha').value;
      const confirma = document.getElementById('cad-confirma').value;

      if (!nome || !usuario || !email || !senha || !confirma) {
        exibirFeedback(msgCadastro, 'Preencha todos os campos.', 'erro');
        return;
      }

      const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formatoEmail.test(email)) {
        exibirFeedback(msgCadastro, 'Digite um e-mail válido.', 'erro');
        return;
      }

      if (senha.length < 6) {
        exibirFeedback(msgCadastro, 'A senha precisa ter pelo menos 6 caracteres.', 'erro');
        return;
      }

      if (senha !== confirma) {
        exibirFeedback(msgCadastro, 'As senhas digitadas não coincidem.', 'erro');
        return;
      }

      const usuarios = obterUsuarios();
      const duplicado = usuarios.some(u =>
        u.usuario.toLowerCase() === usuario.toLowerCase() ||
        u.email.toLowerCase() === email.toLowerCase()
      );

      if (duplicado) {
        exibirFeedback(msgCadastro, 'Este usuário ou e-mail já está cadastrado.', 'erro');
        return;
      }

      const novoUsuario = {
        nome: nome,
        usuario: usuario,
        email: email,
        senha: senha,
        tentativasFalhas: 0,
        bloqueadoAte: null
      };

      usuarios.push(novoUsuario);
      salvarUsuarios(usuarios);

      exibirFeedback(msgCadastro, 'Cadastro realizado com sucesso!', 'sucesso');
      formCadastro.reset();

      document.getElementById('login-identificacao').value = usuario;
      setTimeout(() => alternarAbas('login'), 1200);
    });

    // LOGIN
    formLogin.addEventListener('submit', (e) => {
      e.preventDefault();
      const identificacao = document.getElementById('login-identificacao').value.trim().toLowerCase();
      const senha = document.getElementById('login-senha').value;
      const usuarios = obterUsuarios();

      const index = usuarios.findIndex(u =>
        u.usuario.toLowerCase() === identificacao ||
        u.email.toLowerCase() === identificacao
      );

      if (index === -1) {
        exibirFeedback(msgLogin, 'Usuário, e-mail ou senha incorretos.', 'erro');
        return;
      }

      const conta = usuarios[index];
      const agora = Date.now();

      if (conta.bloqueadoAte && conta.bloqueadoAte > agora) {
        const minutosRestantes = Math.ceil((conta.bloqueadoAte - agora) / (1000 * 60));
        exibirFeedback(msgLogin, `Conta bloqueada. Tente novamente em ${minutosRestantes} minuto(s).`, 'erro');
        return;
      }

      if (conta.senha !== senha) {
        conta.tentativasFalhas = (conta.tentativasFalhas || 0) + 1;
        if (conta.tentativasFalhas >= 5) {
          conta.bloqueadoAte = agora + (60 * 60 * 1000);
          conta.tentativasFalhas = 0;
          salvarUsuarios(usuarios);
          exibirFeedback(msgLogin, 'Você errou a senha 5 vezes. A conta foi bloqueada por 1 hora.', 'erro');
        } else {
          salvarUsuarios(usuarios);
          const restantes = 5 - conta.tentativasFalhas;
          exibirFeedback(msgLogin, `Senha incorreta. Restam ${restantes} tentativa(s).`, 'erro');
        }
        return;
      }

      conta.tentativasFalhas = 0;
      conta.bloqueadoAte = null;
      salvarUsuarios(usuarios);

      const sessao = { nome: conta.nome, usuario: conta.usuario };
      sessionStorage.setItem('portalSenai_sessao', JSON.stringify(sessao));

      if (topUserDisplay) {
        topUserDisplay.textContent = conta.nome;
      }

      verificarSessaoEAtualizarTela();
      formLogin.reset();
    });

    // LOGOUT
    if (btnLogout) {
      btnLogout.addEventListener('click', () => {
        sessionStorage.removeItem('portalSenai_sessao');
        if (topUserDisplay) {
          topUserDisplay.textContent = 'Helena';
        }
        verificarSessaoEAtualizarTela();
      });
    }

    function verificarSessaoEAtualizarTela() {
      const sessao = obterSessao();
      if (sessao) {
        formLogin.classList.add('is-hidden');
        formCadastro.classList.add('is-hidden');
        tabLogin.classList.add('is-hidden');
        tabCadastro.classList.add('is-hidden');

        if (loggedPanel) {
          loggedPanel.classList.remove('is-hidden');
        }

        const titulo = document.getElementById('logged-title');
        const descricao = document.getElementById('logged-desc');
        if (titulo) titulo.textContent = `Bem-vindo(a), ${sessao.nome}!`;
        if (descricao) descricao.textContent = `Conectado como @${sessao.usuario}`;

      } else {
        tabLogin.classList.remove('is-hidden');
        tabCadastro.classList.remove('is-hidden');
        if (loggedPanel) {
          loggedPanel.classList.add('is-hidden');
        }
        alternarAbas('login');
      }
    }

    verificarSessaoEAtualizarTela();
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
  if (!input) return;
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
