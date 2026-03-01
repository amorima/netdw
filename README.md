# NETDW

![Nuxt](https://img.shields.io/badge/Nuxt-00DC82?style=for-the-badge&logo=nuxtdotjs&logoColor=white)
![Vue.js](https://img.shields.io/badge/Vue.js-4FC08D?style=for-the-badge&logo=vuedotjs&logoColor=white)
![Directus](https://img.shields.io/badge/Directus-263238?style=for-the-badge&logo=directus&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)

Plataforma web institucional do NeTDW, implementada com Nuxt em modo SSR, com conteúdos dinâmicos consumidos a partir de Directus e com endpoints server-side para chatbot e formulários.

Este documento descreve a arquitetura do projeto, o propósito de cada tecnologia, a execução local, o deploy em produção e um conjunto de boas práticas técnicas para manutenção e evolução.

---

## 1. Enquadramento e objetivos do projeto

O projeto NETDW responde a três necessidades centrais:

1. **Comunicação institucional**, através de páginas públicas como Homepage, Sobre, Pelouros, Órgãos, Eventos, Notícias e Contactos.
2. **Operação editorial flexível**, através de dados geridos no Directus e consumidos no frontend em tempo real.
3. **Interação inteligente com utilizadores**, através de um assistente conversacional que usa contexto público do próprio NeTDW.

Este projeto demonstra integração de:

- renderização SSR em Nuxt,
- consumo de CMS headless,
- tratamento de formulários com validação server-side,
- práticas de proteção anti-spam,
- pipeline de deploy automatizado.

---

## 2. Stack tecnológica e propósito de cada tecnologia

### 2.1 Nuxt 4

- **Propósito**: framework principal da aplicação.
- **Papel no projeto**:
  - estrutura de páginas e rotas em `app/pages`;
  - endpoints backend em `server/api`;
  - configuração global em `nuxt.config.ts`;
  - suporte a SSR em produção.

### 2.2 Vue 3

- **Propósito**: motor de componentes do frontend.
- **Papel no projeto**:
  - componentes reutilizáveis (`app/components`),
  - layout principal (`app/layouts/default.vue`),
  - estado local e reatividade por componente.

### 2.3 Vue Router

- **Propósito**: navegação entre páginas.
- **Papel no projeto**:
  - rotas automáticas por ficheiro em `app/pages`;
  - rota dinâmica para detalhe de notícia em `app/pages/noticias/[id].vue`.

### 2.4 Directus SDK (`@directus/sdk`)

- **Propósito**: acesso a dados de CMS headless.
- **Papel no projeto**:
  - leitura de coleções para homepage, eventos, notícias, pelouros, órgãos e página sobre;
  - fallback entre nomes de coleções em `app/utils/directus-content.js`.

### 2.5 Endpoints server-side (Nitro / `server/api`)

- **Propósito**: encapsular lógica sensível no servidor.
- **Papel no projeto**:
  - submissão de contactos (`/api/contact`),
  - submissão de inscrições (`/api/inscricao`),
  - saúde do chatbot (`/api/chatbot-health`),
  - intermediação do chatbot com contexto de dados públicos (`/api/chatbot`).

### 2.6 Nginx + systemd

- **Propósito**: execução e reverse proxy em produção Linux.
- **Papel no projeto**:
  - Nginx encaminha tráfego HTTP para a app Nuxt;
  - systemd garante execução persistente e reinício automático.

### 2.7 GitHub Actions

- **Propósito**: automação de build e deploy.
- **Papel no projeto**:
  - pipeline de CI/CD em `.github/workflows/deploy.yml`;
  - deploy num runner self-hosted com publicação de artefactos SSR.

---

## 3. Estrutura do projeto

```text
.
├─ app/
│  ├─ app.vue
│  ├─ components/
│  ├─ composables/
│  ├─ layouts/
│  ├─ pages/
│  └─ utils/
├─ server/
│  └─ api/
├─ deploy/
│  ├─ nginx/
│  └─ systemd/
├─ public/
├─ .github/workflows/
├─ nuxt.config.ts
└─ package.json
```

### 3.1 Camada de apresentação (`app/`)

- `app/layouts/default.vue`: shell global, menu, rodapé e inclusão do chatbot.
- `app/components/ChatAssistant.vue`: UI do assistente, estado do chat e envio para `/api/chatbot`.
- `app/components/DirectusSkeleton.vue`: placeholders para estados de carregamento.
- `app/components/GlobalLoading.vue` + `app/composables/useGlobalLoading.js`: feedback global de loading.
- `app/pages/*`: páginas públicas da aplicação.

### 3.2 Camada de integração de dados (`app/utils` + Directus)

- `app/utils/directus-content.js` centraliza:
  - leitura de coleções com fallback,
  - extração de campos alternativos,
  - sanitização de texto (remoção de HTML para excertos).

### 3.3 Camada de backend (`server/api`)

- lógica de validação,
- mitigação de spam,
- rate limiting por IP em memória,
- persistência em Directus,
- integração do chatbot com API externa.

---

## 4. Funcionalidades por página

### Homepage (`app/pages/index.vue`)

- Hero dinâmico via coleção `hero_section`.
- Destaques via coleção `highlights`.
- Pré-visualização de pelouros via coleção `pelouros`.
- Próximos eventos via coleção `agenda`.
- Últimas notícias via coleção `noticias`.
- Modal de inscrição com submissão para `/api/inscricao`.

### Sobre (`app/pages/sobre-netdw.vue`)

- Conteúdo textual da coleção `sobre`.

### Pelouros (`app/pages/pelouros.vue`)

- Lista de áreas e respetivas descrições via Directus.

### Órgãos (`app/pages/orgaos.vue`)

- Estrutura por ano letivo.
- Agrupamento em Direção, Mesa do Plenário e Membros dos Pelouros.
- Ordenação baseada em regras de cargo e ordem manual (`sort`).

### Eventos (`app/pages/eventos.vue`)

- Separação entre eventos futuros, sem data e passados.
- Normalização de datas e metadados.

### Notícias (`app/pages/noticias/index.vue` e `[id].vue`)

- Lista de notícias com excertos e imagem de capa.
- Página de detalhe por ID.

### Contactos (`app/pages/contactos.vue`)

- Informações institucionais e formulário.
- Submissão para `/api/contact`.

---

## 5. Endpoints server-side e contratos

### 5.1 `GET /api/chatbot-health`

- **Objetivo**: validar se o chatbot tem configuração mínima para operar.
- **Verifica**:
  - endpoint IA,
  - API key IA,
  - channel ID,
  - conectividade com Directus (`/server/ping`).

Resposta esperada:

```json
{ "ok": true, "status": "Ligação disponível." }
```

### 5.2 `POST /api/contact`

- **Objetivo**: receber mensagens de contacto e persistir no Directus.
- **Validações principais**:
  - campos obrigatórios,
  - formato de email,
  - limites de tamanho,
  - honeypot (`company`),
  - tempo mínimo de preenchimento,
  - rate limit por IP.

Body esperado:

```json
{
  "name": "Nome",
  "email": "utilizador@dominio.pt",
  "subject": "Assunto opcional",
  "message": "Mensagem",
  "company": "",
  "formStartedAt": 1730000000000
}
```

### 5.3 `POST /api/inscricao`

- **Objetivo**: registar inscrições no núcleo.
- **Validações**: equivalentes ao contacto, adaptadas aos campos de inscrição.

Body esperado:

```json
{
  "nome": "Nome",
  "email": "utilizador@dominio.pt",
  "numero_estudante": "12345",
  "ano_curricular": ["2º Ano"],
  "pelouro": "membro",
  "company": "",
  "formStartedAt": 1730000000000
}
```

### 5.4 `POST /api/chatbot`

- **Objetivo**: responder perguntas de utilizadores com contexto público do NeTDW.
- **Fluxo resumido**:
  1.  lê coleções públicas no Directus,
  2.  constrói contexto textual e estruturado,
  3.  responde localmente para intenções específicas (próximo evento, presidente, objetivo),
  4.  caso contrário, encaminha para API IA externa,
  5.  processa resposta stream/texto e devolve resposta limpa.

Body esperado:

```json
{
  "message": "Qual é o próximo evento?",
  "threadId": "netdw-..."
}
```

---

## 6. Variáveis de ambiente

As variáveis são consumidas a partir de `runtimeConfig` em `nuxt.config.ts`.

### 6.1 Integração Directus

- `NUXT_DIRECTUS_URL`
- `NUXT_DIRECTUS_TOKEN`
- `NUXT_DIRECTUS_CONTACT_COLLECTION`
- `NUXT_DIRECTUS_INSCRICAO_COLLECTION`

### 6.2 Integração IA (chatbot)

- `NUXT_IAEDU_API_ENDPOINT`
- `NUXT_IAEDU_API_KEY`
- `NUXT_IAEDU_CHANNEL_ID`
- `NUXT_IAEDU_DEFAULT_THREAD_ID`

### 6.3 Proteção de formulários

- `NUXT_CONTACT_MIN_FILL_TIME_MS`
- `NUXT_CONTACT_RATE_LIMIT_WINDOW_MS`
- `NUXT_CONTACT_RATE_LIMIT_MAX_REQUESTS`
- `NUXT_INSCRICAO_MIN_FILL_TIME_MS`
- `NUXT_INSCRICAO_RATE_LIMIT_WINDOW_MS`
- `NUXT_INSCRICAO_RATE_LIMIT_MAX_REQUESTS`

### 6.4 Exemplo

Existe um ficheiro base em `.env.example` com variáveis do chatbot.

---

## 7. Execução local

### 7.1 Pré-requisitos

- Node.js LTS (recomendado ≥ 20)
- npm

### 7.2 Instalação e arranque

```bash
npm install
npm run dev
```

Aplicação disponível, por omissão, em `http://localhost:3000`.

### 7.3 Comandos úteis

```bash
npm run build
npm run preview
npm run generate
```

Nota: o projeto depende de endpoints server-side e segredos privados para o chatbot. Por esse motivo, o modo de referência é **SSR**, não export estático.

---

## 8. Deploy SSR em Ubuntu

### 8.1 Serviço de aplicação (systemd)

1. Copiar `deploy/systemd/netdw.service` para `/etc/systemd/system/netdw.service`.
2. Garantir diretório de deploy em `/var/www/netdw/app`.
3. Ativar serviço:

```bash
sudo systemctl daemon-reload
sudo systemctl enable netdw
sudo systemctl start netdw
sudo systemctl status netdw
```

### 8.2 Reverse proxy (Nginx)

1. Copiar `deploy/nginx/netdw.conf` para `/etc/nginx/sites-available/netdw.conf`.
2. Criar symlink para `sites-enabled`.
3. Validar e recarregar:

```bash
sudo ln -s /etc/nginx/sites-available/netdw.conf /etc/nginx/sites-enabled/netdw.conf
sudo nginx -t
sudo systemctl reload nginx
```

### 8.3 CI/CD (GitHub Actions)

O workflow em `.github/workflows/deploy.yml` executa:

1. checkout,
2. `npm ci`,
3. `npm run build`,
4. publicação em `/var/www/netdw/app`,
5. escrita de `.env` em produção,
6. instalação de runtime dependencies,
7. restart do serviço,
8. health check de chatbot.

---

## 9. Segurança e robustez

Práticas já implementadas no projeto:

- **Rate limiting por IP** nos endpoints de formulários.
- **Honeypot field** para bloquear bots simples.
- **Tempo mínimo de preenchimento** para travar submissões automáticas.
- **Validação de campos no servidor** (presença, formato, comprimento).
- **Token Directus opcional em header Authorization**.
- **Sanitização de texto** para reduzir ruído HTML em respostas.

Recomendação de produção:

- complementar rate limit em memória com camada externa (Nginx, Redis ou WAF) em cenários de tráfego elevado;
- reforçar política de CSP e headers de segurança no Nginx.

---

## 10. Boas práticas por stack tecnológica

### Nuxt e Vue

- Preferir lógica assíncrona centralizada em `methods` ou utilitários.
- Isolar estados de loading e erro por secção funcional.
- Usar componentes de skeleton para manter continuidade visual.
- Evitar acoplamento de regras de negócio no template.

### Directus

- Manter nomes de campo consistentes entre coleções.
- Definir `status=published` no modelo editorial e no consumo.
- Criar vistas ou mapeamentos de leitura para reduzir fallbacks excessivos.

### Endpoints server-side

- Nunca expor API keys no cliente.
- Validar input no servidor, mesmo após validação no frontend.
- Normalizar mensagens de erro para UX previsível.

### Deploy e operação

- Automatizar build e publicação com workflow versionado.
- Monitorizar health endpoint e logs do serviço.
- Garantir paridade entre portas e variáveis do `.env`.

---

## 11. Checklist operacional

### Antes de deploy

- [ ] Secrets configurados no repositório.
- [ ] Runner self-hosted com permissões adequadas.
- [ ] Serviço `netdw` instalado no servidor.
- [ ] Nginx ativo com proxy para porta correta.

### Após deploy

- [ ] `curl http://127.0.0.1:<PORTA>/api/chatbot-health` devolve `ok: true`.
- [ ] Formulário de contactos cria registo no Directus.
- [ ] Formulário de inscrição cria registo no Directus.
- [ ] Chatbot responde com conteúdo contextual.

---

## 12. Notas técnicas importantes

1. **Coerência de portas**: existem referências a `3000` e `3001` em ficheiros de deploy. Em produção, recomenda-se alinhar `systemd`, `nginx` e health check para a mesma porta.
2. **Centralização de URL Directus**: há leituras frontend com URL hardcoded (`https://api.netdw.tech`). Para maior consistência entre ambientes, recomenda-se migrar para configuração única por ambiente.
3. **Pasta `3002/`**: contém artefactos locais de ambiente (`.nuxt` e `node_modules`) e não integra o runtime principal da aplicação.

---

## 13. Resumo

O NETDW é um projeto pessoal sólido de Programação Web moderna, porque combina frontend reativo, integração com CMS headless, backend orientado a API e operação em produção com CI/CD. O projeto evidencia uma abordagem pragmática, com foco em entrega funcional, proteção básica contra abuso e extensibilidade para evolução futura.

Do ponto de vista técnico, permite consolidar arquitetura por camadas, validação defensiva, gestão de configuração sensível e práticas de deploy contínuo num contexto real.
