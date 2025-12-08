const path = require('path');

// Carregar json-server do node_modules (instalado via package.json do Angular)
const jsonServer = require('json-server');

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults({
  static: path.join(__dirname, 'public')
});

server.use(middlewares);
server.use(jsonServer.bodyParser);

// Middleware para garantir que o header X-Total-Count seja exposto
server.use((req, res, next) => {
  res.header('Access-Control-Expose-Headers', 'X-Total-Count');
  next();
});

server.post('/auth/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Informe usuário e senha.' });
  }

  const db = router.db;
  const user = db.get('users').find({ username, password }).value();

  if (!user) {
    return res.status(401).json({ message: 'Credenciais inválidas.' });
  }

  const token = Buffer.from(`${user.username}:${Date.now()}`).toString('base64');

  return res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      name: user.name
    }
  });
});

/**
 * Endpoint de mock para popular a base com 20 clientes aleatórios.
 * Útil para desenvolvimento e testes dos filtros avançados.
 */
server.post('/mock/clientes/popular', (req, res) => {
  const db = router.db;

  const firstNames = ['Ana', 'Carlos', 'Juliana', 'Marcos', 'Fernanda', 'Rafael', 'Beatriz', 'Lucas', 'Mariana', 'Paulo'];
  const lastNames = ['Silva', 'Alves', 'Costa', 'Souza', 'Lima', 'Santos'];
  const cidades = ['Fortaleza', 'Sobral', 'Juazeiro do Norte', 'Caucaia', 'Maracanaú'];
  const estados = ['CE', 'PI', 'RN'];

  const gerarId = () =>
    `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;

  const gerarCpf = (index) => {
    const base = (111111111 + index * 123457).toString().padStart(11, '0');
    return base;
  };

  const gerarTelefone = (index) => {
    const sufixo = (8000000 + index * 37).toString().slice(-7);
    return `859${sufixo}`;
  };

  const tiposContato = ['Celular', 'Whatsapp', 'Residencial', 'Fixo'];
  const logradouros = ['Rua', 'Avenida', 'Praça', 'Travessa', 'Alameda', 'Estrada'];
  const nomesLogradouros = ['das Flores', 'do Comércio', 'Principal', 'Central', 'Nova', 'Velha', 'Brasil', 'Independência', 'Liberdade', 'República'];
  const bairros = ['Centro', 'Jardim América', 'Vila Nova', 'Bela Vista', 'São José', 'Industrial', 'Residencial', 'Comercial', 'Universitário', 'Praia'];

  const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const randomNum = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  const clientes = Array.from({ length: 20 }).map((_, index) => {
    const first = firstNames[index % firstNames.length];
    const last = lastNames[index % lastNames.length];
    const nome = `${first} ${last}`;

    // Selecionar cidade e estado aleatórios
    const cidade = randomItem(cidades);
    const estado = randomItem(estados);

    const cpf = gerarCpf(index);
    const emailSlug = `${first}.${last}`.toLowerCase().replace(/\s+/g, '');
    const email = `${emailSlug}${index}@exemplo.com`;
    
    // Gerar telefone aleatório
    const tipoContato = randomItem(tiposContato);
    const ddd = randomNum(11, 99);
    const telefone = tipoContato === 'Celular' || tipoContato === 'Whatsapp'
      ? `${ddd}9${randomNum(1000, 9999)}${randomNum(1000, 9999)}`
      : `${ddd}${randomNum(1000, 9999)}${randomNum(1000, 9999)}`;

    // Gerar CEP aleatório (formato brasileiro sem formatação)
    const cep = `${randomNum(10, 99)}${randomNum(100, 999)}${randomNum(100, 999)}`;

    // Gerar endereço aleatório completo
    const logradouro = `${randomItem(logradouros)} ${randomItem(nomesLogradouros)}`;
    const numero = randomNum(1, 9999).toString();
    const complemento = randomNum(0, 3) === 0 ? '' : randomNum(0, 1) === 0 ? `Apto ${randomNum(1, 500)}` : `Bloco ${randomNum(1, 10)}`;
    const bairro = randomItem(bairros);

    return {
      id: gerarId(),
      nome,
      cpf,
      email,
      telefone,
      tipoContato,
      dataNascimento: new Date(1980 + randomNum(0, 30), randomNum(0, 11), randomNum(1, 28)).toISOString(),
      pais: 'BR',
      endereco: {
        cep,
        logradouro,
        numero,
        complemento,
        bairro,
        cidade,
        estado
      },
      ativo: true // Todos os clientes mockados são ativos
    };
  });

  db.set('clientes', clientes).write();

  // Registra logs de criação desses clientes com usuário "sistema"
  const logsAtuais = db.get('logs').value() || [];
  let nextId = logsAtuais.length ? Math.max(...logsAtuais.map((l) => l.id || 0)) + 1 : 1;

  const agora = new Date().toISOString();
  const novosLogs = clientes.map((c) => ({
    id: nextId++,
    data: agora,
    acao: 'CRIACAO',
    mensagem: `Cliente ${c.nome} criado (mock)`,
    usuario: 'sistema'
  }));

  db.set('logs', [...logsAtuais, ...novosLogs]).write();

  return res.status(201).json(clientes);
});

/**
 * Endpoint para busca de clientes por cidade e/ou estado (Cidade - Estado).
 * Exemplo: /clientes/localizacao?q=fortaleza ou q=CE
 */
server.get('/clientes/localizacao', (req, res) => {
  const db = router.db;
  const q = (req.query.q || '').toString().toLowerCase();

  const clientes = db.get('clientes').value();

  if (!q) {
    return res.json(clientes);
  }

  const filtrados = clientes.filter((c) => {
    const cidade = (c.endereco?.cidade || '').toLowerCase();
    const estado = (c.endereco?.estado || '').toLowerCase();
    return cidade.includes(q) || estado.includes(q);
  });

  return res.json(filtrados);
});

/**
 * Endpoint para inativação em lote de clientes
 * Aceita uma lista de IDs e marca todos como inativos
 * O proxy remove o prefixo /api, então o endpoint deve ser /clientes/bulk-inactivate
 */
server.patch('/clientes/bulk-inactivate', (req, res) => {
  const db = router.db;
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: 'Lista de IDs é obrigatória' });
  }

  const clientes = db.get('clientes').value();
  const idsParaInativar = new Set(ids);
  const clientesInativados = [];

  clientes.forEach(cliente => {
    if (idsParaInativar.has(cliente.id)) {
      db.get('clientes').find({ id: cliente.id }).assign({ ativo: false }).write();
      clientesInativados.push(cliente);
    }
  });

  if (clientesInativados.length === 0) {
    return res.status(404).json({ message: 'Nenhum cliente encontrado para inativar' });
  }

  return res.status(200).json({
    message: `${clientesInativados.length} cliente(s) inativado(s) com sucesso`,
    inativados: clientesInativados.length
  });
});

/**
 * Endpoint para remoção em lote de clientes (remoção física)
 * Aceita uma lista de IDs e remove todos de uma vez
 * Usa POST porque DELETE não suporta body em alguns casos
 * O proxy remove o prefixo /api, então o endpoint deve ser /clientes/bulk-delete
 * Este endpoint deve ser usado SOMENTE para limpar a base de dados
 */
server.post('/clientes/bulk-delete', (req, res) => {
  const db = router.db;
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: 'Lista de IDs é obrigatória' });
  }

  const clientes = db.get('clientes').value();
  const idsParaRemover = new Set(ids);
  const clientesRemovidos = clientes.filter(c => idsParaRemover.has(c.id));

  if (clientesRemovidos.length === 0) {
    return res.status(404).json({ message: 'Nenhum cliente encontrado para remover' });
  }

  // Remover clientes
  clientesRemovidos.forEach(cliente => {
    db.get('clientes').remove({ id: cliente.id }).write();
  });

  // Remover logs relacionados
  const logs = db.get('logs').value() || [];
  const logsRemovidos = logs.filter(log => {
    const mensagem = log.mensagem || '';
    return clientesRemovidos.some(c => mensagem.includes(c.id) || mensagem.includes(c.nome));
  });

  logsRemovidos.forEach(log => {
    db.get('logs').remove({ id: log.id }).write();
  });

  return res.status(200).json({
    message: `${clientesRemovidos.length} cliente(s) removido(s) com sucesso`,
    removidos: clientesRemovidos.length
  });
});

/**
 * Endpoint para remoção em lote de logs
 * Aceita uma lista de IDs e remove todos de uma vez
 * Usa POST porque DELETE não suporta body em alguns casos
 * O proxy remove o prefixo /api, então o endpoint deve ser /logs/bulk-delete
 */
server.post('/logs/bulk-delete', (req, res) => {
  const db = router.db;
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: 'Lista de IDs é obrigatória' });
  }

  const logs = db.get('logs').value() || [];
  const idsParaRemover = new Set(ids.map(id => String(id)));
  const logsRemovidos = logs.filter(log => idsParaRemover.has(String(log.id)));

  logsRemovidos.forEach(log => {
    db.get('logs').remove({ id: log.id }).write();
  });

  return res.status(200).json({
    message: `${logsRemovidos.length} log(s) removido(s) com sucesso`,
    removidos: logsRemovidos.length
  });
});

server.use((req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '');
    const decoded = Buffer.from(token, 'base64').toString('ascii');
    const username = decoded.split(':')[0];
    const db = router.db;
    const user = db.get('users').find({ username }).value();

    if (user) {
      req.user = { id: user.id, username: user.username, name: user.name };
    }
  }

  next();
});

server.use(router);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`JSON Server is running on port ${PORT}`);
});

