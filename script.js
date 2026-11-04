document.addEventListener('DOMContentLoaded', () => {

  // 1. CARREGAR PREFERÊNCIAS SALVAS DE ACESSIBILIDADE (Modo Escuro e Fonte)
  const savedTheme = localStorage.getItem('theme');
  const savedFontSize = localStorage.getItem('fontSize');

  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
  }

  if (savedFontSize && savedFontSize !== 'normal') {
    document.documentElement.classList.add(`font-${savedFontSize}`);
  }

  // 2. IDENTIFICAR A PÁGINA ATUAL E DESTACAR LINK DA NAVEGAÇÃO
  const currentPage = document.body.dataset.page;
  const navButtons = document.querySelectorAll('.nav-btn, .sub-link');
  navButtons.forEach(btn => {
    if (btn.dataset.page === currentPage) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // 3. BARRA DE PESQUISA DO TOP-NAV (Busca Geral e Filtragem em Tabelas)
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
      { name: 'Contato e Secretaria', url: 'contato.html', keywords: ['contato', 'secretaria', 'fale conosco', 'suporte', 'duvidas', 'mensagens'] },
      { name: 'Meu Perfil', url: 'perfil.html', keywords: ['perfil', 'usuario', 'matricula', 'dados', 'aluno'] },
      { name: 'Configurações', url: 'configuracoes.html', keywords: ['configuracoes', 'tema', 'modo escuro', 'fonte', 'acessibilidade', 'notificacoes'] }
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

  // 4. BOTÃO DE IMPRESSÃO
  const printBtn = document.getElementById('print-btn');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // 5. MENU DROPDOWN DO PERFIL NO TOP-NAV
  const userProfileBtn = document.getElementById('user-profile-btn');
  const userDropdownMenu = document.getElementById('user-dropdown-menu');

  if (userProfileBtn && userDropdownMenu) {
    userProfileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      userDropdownMenu.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
      if (!userDropdownMenu.contains(e.target) && !userProfileBtn.contains(e.target)) {
        userDropdownMenu.classList.remove('show');
      }
    });
  }

  // 6. BOTÃO DE SAIR (LOGOUT DROPDOWN E PÁGINA DE PERFIL)
  const logoutBtn = document.getElementById('logout-btn');
  const profileLogoutBtn = document.getElementById('logout-btn-profile');

  function realizarLogout() {
    const confirmLogout = confirm('Tem certeza que deseja sair do perfil?');
    if (confirmLogout) {
      sessionStorage.removeItem('portalSenai_sessao');
      window.location.href = 'index.html';
    }
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      realizarLogout();
    });
  }

  if (profileLogoutBtn) {
    profileLogoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      realizarLogout();
    });
  }

  // 7. FUNCIONALIDADES DA PÁGINA DE CONFIGURAÇÕES (MODO ESCURO E TAMANHO DA FONTE)
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.checked = document.body.classList.contains('dark-mode');

    themeToggle.addEventListener('change', () => {
      if (themeToggle.checked) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
      } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
      }
    });
  }

  const fontSizeSelect = document.getElementById('font-size-select');
  if (fontSizeSelect) {
    if (savedFontSize) {
      fontSizeSelect.value = savedFontSize;
    }

    fontSizeSelect.addEventListener('change', (e) => {
      const size = e.target.value;
      document.documentElement.classList.remove('font-large', 'font-xlarge');
      
      if (size !== 'normal') {
        document.documentElement.classList.add(`font-${size}`);
      }
      localStorage.setItem('fontSize', size);
    });
  }

  // 8. FORMULÁRIO DE CONTATO
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

  // 9. FUNÇÕES DE LOGIN E CADASTRO (LOCAL STORAGE)
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

  // Atualizar nome do usuário ativo no topo da página
  const topUserDisplay = document.getElementById('top-user-display');
  const sessaoAtiva = obterSessao();
  if (sessaoAtiva && topUserDisplay) {
    topUserDisplay.textContent = sessaoAtiva.nome;
  }

  // Elementos do Login e Cadastro
  const tabLogin = document.getElementById('tab-login');
  const tabCadastro = document.getElementById('tab-cadastro');
  const formLogin = document.getElementById('form-login');
  const formCadastro = document.getElementById('form-cadastro');
  const loggedPanel = document.getElementById('logged-panel');
  const msgLogin = document.getElementById('msg-login');
  const msgCadastro = document.getElementById('msg-cadastro');
  const btnLogoutPanel = document.getElementById('btn-logout');

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

    // Mostrar/Ocultar Senha
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

    // Cadastro de Usuário
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

    // Login de Usuário
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

    if (btnLogoutPanel) {
      btnLogoutPanel.addEventListener('click', () => {
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

// Funções globais da To-Do List (Página Inicial)
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
