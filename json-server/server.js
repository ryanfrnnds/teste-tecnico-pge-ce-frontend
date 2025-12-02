const jsonServer = require('json-server');
const path = require('path');

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

  const clientes = Array.from({ length: 20 }).map((_, index) => {
    const first = firstNames[index % firstNames.length];
    const last = lastNames[index % lastNames.length];
    const nome = `${first} ${last}`;

    const cidade = cidades[index % cidades.length];
    const estado = estados[index % estados.length];

    const cpf = gerarCpf(index);
    const emailSlug = `${first}.${last}`.toLowerCase().replace(/\s+/g, '');
    const email = `${emailSlug}${index}@exemplo.com`;
    const telefone = gerarTelefone(index);

    return {
      id: gerarId(),
      nome,
      cpf,
      email,
      telefone,
      tipoContato: index % 2 === 0 ? 'Celular' : 'Whatsapp',
      dataNascimento: new Date(1980 + (index % 30), index % 12, 1 + (index % 28)).toISOString(),
      pais: 'BR',
      endereco: {
        cep: `60${(10000 + index).toString().padStart(5, '0')}`,
        logradouro: `Rua ${last}`,
        numero: `${100 + index}`,
        complemento: '',
        bairro: 'Bairro Central',
        cidade,
        estado
      },
      ativo: index % 3 !== 0 // alguns inativos para testar o filtro de status
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

