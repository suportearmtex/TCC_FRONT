// src/i18n/translations/pt.ts - Portuguese translations with new additions

export const ptTranslations = {
  // Authentication
  login: 'Entrar',
  register: 'Cadastrar',
  forgotPassword: 'Esqueceu a Senha',
  email: 'Email',
  password: 'Senha',
  submit: 'Enviar',
  loading: 'Carregando...',
  
  // General UI
  name: 'Nome',
  dashboard: 'Painel',
  welcome: 'Bem-vindo',
  logout: 'Sair',
  darkMode: 'Modo Escuro',
  lightMode: 'Modo Claro',
  language: 'Idioma',
  changeLanguage: 'Mudar Idioma',
  settings: 'Configurações',
  options: 'Opções',
  close: 'Fechar',
  back: 'Voltar',
  add: 'Adicionar',
  done: 'Concluído',
  saving: 'Salvando...',
  
  // Employee Management
  employeeManagement: 'Gestão de Funcionários',
  addEmployee: 'Adicionar Funcionário',
  editEmployee: 'Editar Funcionário',
  deleteEmployee: 'Excluir Funcionário',
  searchEmployees: 'Buscar funcionários...',
  confirmDelete: 'Tem certeza que deseja excluir este item?',
  cancel: 'Cancelar',
  save: 'Salvar',
  department: 'Departamento',
  position: 'Cargo',
  hireDate: 'Data de Contratação',
  actions: 'Ações',
  selectDepartment: 'Selecione o departamento',
  sectorManagement: 'Gerenciamento de Setores',
  
  // Company Management
  companies: 'Empresas',
  addCompany: 'Adicionar Empresa',
  editCompany: 'Editar Empresa',
  searchCompanies: 'Buscar empresas...',
  taxId: 'CNPJ',
  phone: 'Telefone',
  adress: 'Endereço',
  zipCode: 'CEP',
  isActive: 'Ativo',
  createdAt: 'Criado Em',
  updatedAt: 'Atualizado Em',
  status: 'Status',
  active: 'Ativo',
  inactive: 'Inativo',
  contact: 'Contato',
  noCompaniesFound: 'Nenhuma empresa encontrada correspondente à sua busca',
  noCompaniesYet: 'Nenhuma empresa adicionada ainda',
  delete: 'Excluir',
  update: 'Atualizar',
  create: 'Criar',
  
  // Validation
  nameRequired: 'Nome é obrigatório',
  taxIdRequired: 'CNPJ é obrigatório',
  invalidTaxId: 'Formato de CNPJ inválido',
  emailRequired: 'Email é obrigatório',
  invalidEmail: 'Formato de email inválido',
  phoneRequired: 'Telefone é obrigatório',
  adressRequired: 'Endereço é obrigatório',
  zipCodeRequired: 'CEP é obrigatório',
  invalidZipCode: 'Formato de CEP inválido',
  titleRequired: 'Título é obrigatório',
  descriptionRequired: 'Descrição é obrigatória',
  
  // Document Management
  documents: 'Documentos',
  addDocument: 'Adicionar Documento',
  editDocument: 'Editar Documento',
  newDocument: 'Novo Documento',
  documentWorkspace: 'Workspace de Documentos',
  documentEditor: 'Editor de Documentos',
  documentManagement: 'Gerenciamento de Documentos',
  searchDocuments: 'Buscar documentos...',
  noDocumentsFound: 'Nenhum documento encontrado correspondente à sua busca',
  noDocumentsYet: 'Nenhum documento adicionado ainda',
  title: 'Título',
  format: 'Formato',
  folder: 'Pasta',
  content: 'Conteúdo',
  documentTitle: 'Título do Documento',
  lastEdit: 'Última Edição',
  today: 'Hoje',
  manageTags: 'Gerenciar Tags',
  addNewTag: 'Adicionar Nova Tag',
  enterNewTag: 'Digite uma nova tag',
  currentTags: 'Tags Atuais',
  noTagsAdded: 'Nenhuma tag adicionada',
  saveDocument: 'Salvar Documento',
  fileName: 'Nome do Arquivo',
  saveLocation: 'Local de Salvamento',
  change: 'Alterar',
  version: 'Versão',
  versions: 'Versões',
  newVersion: 'Nova Versão',
  replaceCurrentVersion: 'Substituir Versão Atual',
  share: 'Compartilhar',
  paragraph: 'Parágrafo',
  heading: 'Título',
  
  // Task Management
  tasks: 'Tarefas',
  taskDashboard: 'Painel de Tarefas',
  taskBoard: 'Quadro de Tarefas',
  addTask: 'Adicionar Tarefa',
  editTask: 'Editar Tarefa',
  newTask: 'Nova Tarefa',
  taskManagement: 'Gerenciamento de Tarefas',
  searchTasks: 'Buscar tarefas...',
  noTasksFound: 'Nenhuma tarefa encontrada correspondente à sua busca',
  noTasksYet: 'Nenhuma tarefa adicionada ainda',
  noTasksInStatus: 'Nenhuma tarefa neste status',
  description: 'Descrição',
  dueDate: 'Data de Vencimento',
  assignee: 'Responsável',
  viewDetails: 'Ver Detalhes',
  quickActions: 'Ações Rápidas',
  changeStatus: 'Alterar Status',
  changePriority: 'Alterar Prioridade',
  people: 'Pessoas',
  createdBy: 'Criado Por',
  group: 'Grupo',
  noGroup: 'Sem Grupo',
  unassigned: 'Não Atribuído',
  assignTask: 'Atribuir Tarefa',
  unassign: 'Remover Atribuição',
  deactivateTask: 'Desativar Tarefa',
  activateTask: 'Ativar Tarefa',
  deactivateTaskConfirmation: 'Tem certeza que deseja desativar esta tarefa: {{title}}?',
  activateTaskConfirmation: 'Tem certeza que deseja ativar esta tarefa: {{title}}?',
  currentlyAssignedTo: 'Atualmente atribuído a',
  searchUsers: 'Buscar usuários...',
  noUsers: 'Nenhum usuário disponível',
  noUsersFound: 'Nenhum usuário encontrado correspondente à sua busca',
  allPriorities: 'Todas as Prioridades',
  allAssignees: 'Todos os Responsáveis',
  myTasks: 'Minhas Tarefas',
  
  // Task Statuses
  todo: 'A Fazer',
  inProgress: 'Em Andamento',
  inReview: 'Em Revisão',
  done: 'Concluído',
  archived: 'Arquivado',
  pending: 'Pendente',
  noTodoTasks: 'Nenhuma tarefa pendente',
  noInProgressTasks: 'Nenhuma tarefa em andamento',
  noReviewTasks: 'Nenhuma tarefa em revisão',
  noCompletedTasks: 'Nenhuma tarefa concluída',
  
  // Task Priorities
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  urgent: 'Urgente',
  
  // Task Dashboard
  upcomingDeadlines: 'Prazos Próximos',
  noUpcomingDeadlines: 'Nenhum prazo próximo',
  taskStatistics: 'Estatísticas de Tarefas',
  totalTasks: 'Total de Tarefas',
  completed: 'Concluídas',
  allTasks: 'Todas as Tarefas',
  
  // Theme preferences
  darkModeEnabled: 'Modo escuro está ativado',
  darkModeDisabled: 'Modo escuro está desativado',
  toggleTheme: 'Alternar tema',
  
  // Dates and timestamps
  dates: 'Datas',
  
  // User roles
  administrator: 'Administrador',
  manager: 'Gerente',
  employee: 'Funcionário',
  unknown: 'Desconhecido',
  
  // User preferences
  preferredLanguage: 'Idioma Preferido',
  preferredTheme: 'Tema Preferido',
  english: 'Inglês',
  portuguese: 'Português',
  light: 'Claro',
  dark: 'Escuro',
  
  // Group management
  groups: 'Grupos',
  addGroup: 'Adicionar Grupo',
  editGroup: 'Editar Grupo',
  deleteGroup: 'Excluir Grupo',
  searchGroups: 'Buscar grupos...',
  noGroupsFound: 'Nenhum grupo encontrado correspondente à sua busca',
  noGroupsYet: 'Nenhum grupo adicionado ainda',
  users: 'Usuários',
  selectedUsers: 'Usuários Selecionados',
  addUsers: 'Adicionar Usuários',
  noUsersSelected: 'Nenhum usuário selecionado',
  usersInGroup: 'Usuários no Grupo',
  totalUsers: 'Total de Usuários',
  noUsersInGroup: 'Nenhum usuário neste grupo',
  
  // Error messages
  formatInfo: 'Informação de Formato',
  deleteGroupConfirmation: 'Tem certeza que deseja excluir este grupo?',
  confirmDeactivation: 'Confirmar Desativação',
  confirmActivation: 'Confirmar Ativação',
  deactivateCompanyConfirmation: 'Tem certeza que deseja desativar esta empresa?',
  activateCompanyConfirmation: 'Tem certeza que deseja ativar esta empresa?',
  deactivate: 'Desativar',
  activate: 'Ativar',
  
  // Specific task translations
  assign: 'Atribuir',
  
  // Other
  pageNotFound: 'Página Não Encontrada',
  pageNotFoundMessage: 'Desculpe, a página que você está procurando não existe.',
  goHome: 'Ir para Início',
  goBack: 'Voltar Atrás',
};