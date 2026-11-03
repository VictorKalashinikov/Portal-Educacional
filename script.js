document.addEventListener('DOMContentLoaded', () => {
  const currentPage = document.body.dataset.page;

  const navButtons = document.querySelectorAll('.nav-btn, .sub-link');
  navButtons.forEach(btn => {
    if (btn.dataset.page === currentPage) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  const searchInput = document.querySelector('.search-bar input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase();
      const tableRows = document.querySelectorAll('.data-table tbody tr');
      tableRows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(term) ? '' : 'none';
      });
    });
  }

  const printBtn = document.getElementById('print-btn');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }

  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const feedback = document.getElementById('form-feedback');
      feedback.textContent = 'Mensagem enviada com sucesso! Em breve entraremos em contato.';
      contactForm.reset();
    });
  }

  // Permitir adicionar tarefa pressionando a tecla 'Enter'
  const taskInput = document.getElementById('new-task-input');
  if (taskInput) {
    taskInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        addTask();
      }
    });
  }
});

// Funções globais do To-Do List
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
