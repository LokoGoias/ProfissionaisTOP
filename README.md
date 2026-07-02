# ProfissionaisTOP - Marketplace de Serviços Profissionais

Uma plataforma moderna e segura que conecta clientes com profissionais qualificados em diversas categorias.

## 🎯 Funcionalidades Principais

- 👤 **Autenticação:** Registro e login de usuários (clientes e profissionais)
- 🔍 **Busca:** Encontrar profissionais e vagas por categoria, localidade e palavra-chave
- 💼 **Vagas:** Publicar, visualizar e responder a solicitações de serviços
- 👷 **Perfil Profissional:** Gerenciar especialidade, bio, avaliações e histórico
- 💬 **Chat:** Comunicação direta entre clientes e profissionais
- ⭐ **Avaliações:** Sistema de ratings para profissionais
- 💰 **Sistema de Créditos:** Comprar créditos para publicar vagas e desbloquear contatos
- 🔒 **Painel Administrativo:** Gerenciamento de usuários, vagas, profissionais e avaliações

## 🛠️ Stack Técnico

- **Frontend:** HTML5 + CSS3 (responsivo) + JavaScript vanilla (ES6+)
- **Armazenamento:** localStorage (dados persistidos no navegador)
- **Segurança:** Senhas com encoding Base64 (⚠️ apenas para demo — usar bcrypt em produção)

## 📦 Categorias Disponíveis

1. 🔧 Reformas e Reparos
2. 🏠 Serviços Domésticos
3. 💻 Design e Tecnologia
4. 🎉 Eventos
5. 💇 Moda e Beleza
6. 🧘 Saúde e Bem-Estar
7. 📚 Educação
8. 🚛 Transporte e Mudança
9. 📷 Fotografia e Vídeo
10. 🍽️ Culinária e Buffet
11. 🐾 Animais de Estimação
12. 🔐 Segurança

## 🚀 Como Usar

### Iniciar
1. Abra o arquivo `index.html` em seu navegador
2. A plataforma carregará com dados de demonstração

### Contas de Teste

**Profissional:**
- Email: `joao@email.com`
- Senha: `123456`

**Cliente:**
- Email: `cliente@email.com`
- Senha: `123456`

**Admin:**
- Email: `phoenix.represent.servic@gmail.com`
- Senha: `Phoenix2026@`
- 2FA: `123456`

### Fluxo Principal

1. **Registre-se** ou **faça login**
2. **Para Clientes:**
   - Navegue até "Profissionais" para buscar serviços
   - Publique uma vaga em "Solicitar"
   - Avalie profissionais após o serviço
3. **Para Profissionais:**
   - Complete seu perfil com bio, especialidade e telefone
   - Responda a vagas com propostas
   - Receba avaliações de clientes
   - Gerencie seus créditos

## 💳 Sistema de Créditos

- **Novos Profissionais:** 20 créditos
- **Novos Clientes:** 5 créditos
- **Custo por Ação:**
  - Publicar vaga: 10 créditos
  - Desbloquear contato completo de profissional: 1 crédito

**Pacotes de Compra:**
- Pacote Básico: 10 créditos = R$ 10,00
- Pacote Profissional: 50 créditos = R$ 45,00
- Pacote Premium: 100 créditos = R$ 80,00

## 🔐 Painel Administrativo

Acesse clicando no 🔒 no rodapé.

**Funções:**
- 📊 Visão geral (estatísticas)
- 👥 Gerenciar usuários
- 🔧 Gerenciar profissionais
- 📝 Gerenciar vagas
- ⭐ Visualizar avaliações
- ✏️ Editar página inicial (hero title e subtitle)

## 📱 Recursos Responsivos

- ✅ Desktop (1200px+)
- ✅ Tablet (900px - 1199px)
- ✅ Mobile (até 600px)

## 🎨 Design

- **Paleta:** Azul (#1565C0) com destaque em verde (#00B894) e ouro (#F9CA24)
- **UI Components:** Cards, modais, abas, badges, estrelas interativas, notificações
- **Tipografia:** Segoe UI, system-ui (fallback)

## ⚙️ Configuração de Dados

Todos os dados são salvos em `localStorage` com a chave `profissionaistop-state-v1`.

**Dados Persistidos:**
- Usuários (com perfis de profissionais)
- Vagas publicadas
- Avaliações
- Chats/Mensagens
- Perfis desbloqueados
- Histórico de créditos

## 🔧 Desenvolvimento & Manutenção

### Adicionar Novo Usuário
```javascript
S.users.push({
  name: 'Nome',
  email: 'email@example.com',
  pwd: btoa('senha'),
  status: 'active',
  type: 'professional' | 'client',
  credits: 20,
  spec: 'Especialidade (profissionais)',
  loc: 'Cidade - Estado',
  bio: 'Bio',
  phone: 'Telefone'
});
S.saveState();
```

### Editar Página Inicial
Use o Painel Administrativo → "Editar Página" ou dirija-se ao objeto `S.heroTitle` e `S.heroSub`.

## ⚠️ Limitações Atuais

- ✋ Senhas com Base64 (inseguro em produção)
- 🖥️ Sem backend/API (tudo em cliente)
- 📊 Sem persistência real em banco de dados
- 🔐 Admin 2FA hardcoded
- 💬 Chats sem sincronização real

## 🚀 Próximos Passos (TODO)

- [ ] Integração com backend (Node.js/Express, Django, etc)
- [ ] Banco de dados (PostgreSQL, MongoDB)
- [ ] Autenticação JWT segura
- [ ] Uploads de imagens de perfil
- [ ] Sistema de pagamento real
- [ ] Email transacional
- [ ] Notificações em tempo real (WebSocket)
- [ ] Mobile app (React Native)
- [ ] Verificação de profissionais

---

**Desenvolvido com ❤️ para conectar profissionais e clientes.**

© 2024 ProfissionaisTOP — Todos os direitos reservados.
