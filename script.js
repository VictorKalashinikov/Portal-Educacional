document.addEventListener('DOMContentLoaded', async () => {

  // =========================================================================
  // CONFIGURAÇÃO DO SUPABASE
  // Credenciais integradas do projeto
  // =========================================================================
  const SUPABASE_URL = 'https://sohowtrsgxmpgsinrjiv.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_rRplNye0QeN4tvrt5iA6GQ_7hz1bRX1';
  
  // Inicialização do cliente Supabase (usando a CDN oficial)
  let supabase = null;
  if (window.supabase) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  }

  // 1. CARREGAR PREFERÊNCIAS SALVAS DE ACESSIBILIDADE
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

  // 3. BARRA DE PESQUISA DO TOP-NAV
  const searchInput = document.querySelector('.search-bar input');
  if (searchInput) {
    const searchBar = document.querySelector('.search-bar');
    let resultsDropdown = document.createElement('div');
    resultsDropdown.className = 'search-results-dropdown';
    searchBar.style.position = 'relative';
    searchBar.appendChild(resultsDropdown);

    const pageRoutes = [
      { name: 'Página Inicial / Home', url: 'index.html', keywords: ['home', 'inicio', 'atividades', 'boletim', 'eventos', 'tarefas'] },
      { name: 'Faltas e Frequência', url: 'faltas.html', keywords: ['faltas', 'frequencia', 'resumo de faltas', 'ausencias'] },
      { name: 'Quadro de Horários', url: 'horarios.html', keywords: ['horarios', 'quadro de horarios', 'aulas', 'semanal'] },
      { name: 'Notas e Boletim', url: 'notas.html', keywords: ['notas', 'boletim', 'trimestre'] },
      { name: 'Acesso / Login e Cadastro', url: 'login.html', keywords: ['login', 'entrar', 'cadastro', 'senha', 'autenticacao'] },
      { name: 'Contato e Secretaria', url: 'contato.html', keywords: ['contato', 'secretaria', 'suporte'] },
      { name: 'Meu Perfil', url: 'perfil.html', keywords: ['perfil', 'usuario', 'matricula', 'foto', 'avatar'] },
      { name: 'Configurações', url: 'configuracoes.html', keywords: ['configuracoes', 'tema', 'modo escuro', 'fonte'] }
    ];

    searchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase().trim();
      resultsDropdown.innerHTML = '';

      const tableRows = document.querySelectorAll('.data-table tbody tr');
      if (tableRows.length > 0) {
        tableRows.forEach(row => {
          const text = row.textContent.toLowerCase();
          row.style.display = text.includes(term) ? '' : 'none';
        });
      }

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

    document.addEventListener('click', (e) => {
      if (!searchBar.contains(e.target)) {
        resultsDropdown.style.display = 'none';
      }
    });
  }

  // 4. MENU DROPDOWN DO PERFIL E LOGOUT
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

  async function realizarLogout() {
    const confirmLogout = confirm('Tem certeza que deseja sair do perfil?');
    if (confirmLogout) {
      if (supabase) {
        await supabase.auth.signOut();
      }
      sessionStorage.removeItem('portalSenai_sessao');
      window.location.href = 'index.html';
    }
  }

  const logoutBtn = document.getElementById('logout-btn');
  const profileLogoutBtn = document.getElementById('logout-btn-profile');

  if (logoutBtn) logoutBtn.addEventListener('click', (e) => { e.preventDefault(); realizarLogout(); });
  if (profileLogoutBtn) profileLogoutBtn.addEventListener('click', (e) => { e.preventDefault(); realizarLogout(); });

  // 5. ATUALIZAÇÃO DA SESSÃO E DADOS NO TOPO DE TODAS AS PÁGINAS
  async function verificarSessaoGlobal() {
    const topUserDisplay = document.getElementById('top-user-display');
    const topAvatar = document.querySelector('.top-right .user-avatar');

    if (supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const user = session.user;
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        
        const nomeExibir = profile?.nome_completo || user.user_metadata?.full_name || user.email.split('@')[0];
        if (topUserDisplay) topUserDisplay.textContent = nomeExibir;

        if (profile?.avatar_url && topAvatar) {
          const img = document.createElement('img');
          img.src = profile.avatar_url;
          img.className = 'user-avatar-img';
          topAvatar.replaceWith(img);
        }
        return { user, profile };
      }
    }
    return null;
  }

  const sessaoAtiva = await verificarSessaoGlobal();

  // 6. LÓGICA DA PÁGINA DE LOGIN E CADASTRO (login.html)
  const formLogin = document.getElementById('form-login');
  const formCadastro = document.getElementById('form-cadastro');
  const tabLogin = document.getElementById('tab-login');
  const tabCadastro = document.getElementById('tab-cadastro');
  const msgLogin = document.getElementById('msg-login');
  const msgCadastro = document.getElementById('msg-cadastro');

  if (formLogin && formCadastro) {
    function exibirFeedback(el, msg, tipo) {
      if (!el) return;
      el.textContent = msg;
      el.className = 'auth-feedback ' + tipo;
    }

    function alternarAbas(aba) {
      if (msgLogin) msgLogin.textContent = '';
      if (msgCadastro) msgCadastro.textContent = '';
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

    if (tabLogin) tabLogin.addEventListener('click', () => alternarAbas('login'));
    if (tabCadastro) tabCadastro.addEventListener('click', () => alternarAbas('cadastro'));

    // Alternar visualização da senha
    document.querySelectorAll('.btn-toggle-eye').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');
        const input = document.getElementById(targetId);
        const icon = btn.querySelector('i');
        if (input) {
          const mostrar = input.type === 'password';
          input.type = mostrar ? 'text' : 'password';
          if (icon) icon.className = mostrar ? 'fas fa-eye-slash' : 'fas fa-eye';
        }
      });
    });

    // Validação em Tempo Real dos Requisitos da Senha
    const cadSenhaInput = document.getElementById('cad-senha');
    if (cadSenhaInput) {
      cadSenhaInput.addEventListener('input', () => {
        const val = cadSenhaInput.value;
        const reqMinMax = document.getElementById('req-minmax');
        const reqUpper = document.getElementById('req-upper');
        const reqLower = document.getElementById('req-lower');
        const reqNumber = document.getElementById('req-number');
        const reqSpecial = document.getElementById('req-special');

        if (reqMinMax) reqMinMax.className = (val.length >= 8 && val.length <= 30) ? 'valid' : '';
        if (reqUpper) reqUpper.className = /[A-Z]/.test(val) ? 'valid' : '';
        if (reqLower) reqLower.className = /[a-z]/.test(val) ? 'valid' : '';
        if (reqNumber) reqNumber.className = /[0-9]/.test(val) ? 'valid' : '';
        if (reqSpecial) reqSpecial.className = /[!@#$%^&*(),.?":{}|<>_\-\\/+=~`\[\]]/.test(val) ? 'valid' : '';
      });
    }

    // Função para validar requisitos de senha antes de cadastrar
    function validarSenhaRequisitos(senha) {
      if (senha.length < 8 || senha.length > 30) {
        return 'A senha deve ter entre 8 e 30 caracteres.';
      }
      if (!/[A-Z]/.test(senha)) {
        return 'A senha deve conter pelo menos uma letra maiúscula.';
      }
      if (!/[a-z]/.test(senha)) {
        return 'A senha deve conter pelo menos uma letra minúscula.';
      }
      if (!/[0-9]/.test(senha)) {
        return 'A senha deve conter pelo menos um número.';
      }
      if (!/[!@#$%^&*(),.?":{}|<>_\-\\/+=~`\[\]]/.test(senha)) {
        return 'A senha deve conter pelo menos um caractere especial (ex: @, #, $, !).';
      }
      return null;
    }

    // Submissão do Formulário de Cadastro (Supabase Auth + Tabela Profiles)
    formCadastro.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nome = document.getElementById('cad-nome').value.trim();
      const email = document.getElementById('cad-email').value.trim();
      const senha = document.getElementById('cad-senha').value;
      const confirma = document.getElementById('cad-confirma').value;

      if (!nome || !email || !senha || !confirma) {
        exibirFeedback(msgCadastro, 'Preencha todos os campos.', 'erro');
        return;
      }

      // Validação das regras da senha
      const erroSenha = validarSenhaRequisitos(senha);
      if (erroSenha) {
        exibirFeedback(msgCadastro, erroSenha, 'erro');
        return;
      }

      if (senha !== confirma) {
        exibirFeedback(msgCadastro, 'As senhas não coincidem.', 'erro');
        return;
      }

      if (supabase) {
        exibirFeedback(msgCadastro, 'Criando conta no Supabase...', 'sucesso');
        const { data, error } = await supabase.auth.signUp({
          email: email,
          password: senha,
          options: { data: { full_name: nome } }
        });

        if (error) {
          exibirFeedback(msgCadastro, error.message, 'erro');
          return;
        }

        if (data.user) {
          // Inserir registro correspondente na tabela profiles
          await supabase.from('profiles').upsert({
            id: data.user.id,
            nome_completo: nome,
            email: email,
            updated_at: new Date()
          });

          exibirFeedback(msgCadastro, 'Cadastro realizado! Redirecionando...', 'sucesso');
          setTimeout(() => window.location.href = 'perfil.html', 1500);
        }
      } else {
        exibirFeedback(msgCadastro, 'Supabase não conectado. Configure as chaves no script.js', 'erro');
      }
    });

    // Submissão do Formulário de Login (Supabase Auth)
    formLogin.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-identificacao').value.trim();
      const senha = document.getElementById('login-senha').value;

      if (!email || !senha) {
        exibirFeedback(msgLogin, 'Preencha o e-mail e a senha.', 'erro');
        return;
      }

      if (supabase) {
        exibirFeedback(msgLogin, 'Autenticando...', 'sucesso');
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email,
          password: senha
        });

        if (error) {
          exibirFeedback(msgLogin, 'E-mail ou senha incorretos.', 'erro');
          return;
        }

        if (data.session) {
          exibirFeedback(msgLogin, 'Login realizado com sucesso!', 'sucesso');
          setTimeout(() => window.location.href = 'perfil.html', 1000);
        }
      } else {
        exibirFeedback(msgLogin, 'Supabase não conectado.', 'erro');
      }
    });
  }

  // 7. LÓGICA DA PÁGINA DE PERFIL E UPLOAD DE FOTO (perfil.html)
  if (currentPage === 'perfil') {
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    const avatarImg = document.getElementById('avatar-img');
    const avatarInput = document.getElementById('avatar-input');
    const uploadStatus = document.getElementById('upload-status');

    if (sessaoAtiva && sessaoAtiva.user) {
      const user = sessaoAtiva.user;
      const profile = sessaoAtiva.profile;

      if (profileName) profileName.textContent = profile?.nome_completo || user.user_metadata?.full_name || 'Aluno SENAI';
      if (profileEmail) profileEmail.textContent = user.email;
      if (profile?.avatar_url && avatarImg) {
        avatarImg.src = profile.avatar_url;
      }
    }

    // Upload de Imagem de Perfil para o Supabase Storage
    if (avatarInput && supabase) {
      avatarInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          alert('Você precisa estar logado para alterar a foto!');
          return;
        }

        const userId = session.user.id;
        const fileExt = file.name.split('.').pop();
        const filePath = `${userId}/avatar.${fileExt}`;

        if (uploadStatus) uploadStatus.textContent = 'Enviando foto...';

        // 1. Upload para o bucket 'avatars'
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, file, { upsert: true });

        if (uploadError) {
          if (uploadStatus) uploadStatus.textContent = 'Erro ao enviar foto.';
          alert('Erro no upload: ' + uploadError.message);
          return;
        }

        // 2. Obter URL pública
        const { data: publicUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        const publicUrl = publicUrlData.publicUrl + '?t=' + new Date().getTime();

        // 3. Atualizar tabela profiles
        await supabase.from('profiles').upsert({
          id: userId,
          avatar_url: publicUrl,
          updated_at: new Date()
        });

        if (avatarImg) avatarImg.src = publicUrl;
        if (uploadStatus) uploadStatus.textContent = 'Foto atualizada com sucesso!';
        setTimeout(() => { if (uploadStatus) uploadStatus.textContent = ''; }, 3000);
      });
    }
  }

  // 8. CONFIGURAÇÕES (Modo escuro / fonte)
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
    if (savedFontSize) fontSizeSelect.value = savedFontSize;
    fontSizeSelect.addEventListener('change', (e) => {
      const size = e.target.value;
      document.documentElement.classList.remove('font-large', 'font-xlarge');
      if (size !== 'normal') document.documentElement.classList.add(`font-${size}`);
      localStorage.setItem('fontSize', size);
    });
  }
});