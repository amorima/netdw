# NETDW

Projeto Nuxt com páginas públicas e endpoints de servidor em `server/api` para chatbot e formulários.

## Desenvolvimento local

```bash
npm install
npm run dev
```

## Deploy recomendado (SSR no Ubuntu)

O chatbot depende de variáveis privadas (`NUXT_IAEDU_API_KEY`) e endpoints server-side (`/api/chatbot`).
Por esse motivo, o deploy deve ser SSR, não estático.

### 1) Preparar serviço no servidor

1. Copiar o ficheiro `deploy/systemd/netdw.service` para `/etc/systemd/system/netdw.service`.
2. Garantir que existe o diretório `/var/www/netdw/app`.
3. Ativar o serviço:

```bash
sudo systemctl daemon-reload
sudo systemctl enable netdw
sudo systemctl start netdw
sudo systemctl status netdw
```

### 2) Configurar Nginx

1. Copiar `deploy/nginx/netdw.conf` para `/etc/nginx/sites-available/netdw.conf`.
2. Criar symlink para `sites-enabled`.
3. Testar e reiniciar:

```bash
sudo ln -s /etc/nginx/sites-available/netdw.conf /etc/nginx/sites-enabled/netdw.conf
sudo nginx -t
sudo systemctl reload nginx
```

### 3) Configurar GitHub Secrets

No repositório, adicionar os secrets usados no workflow:

- `NUXT_DIRECTUS_URL`
- `NUXT_DIRECTUS_TOKEN`
- `NUXT_DIRECTUS_CONTACT_COLLECTION`
- `NUXT_DIRECTUS_INSCRICAO_COLLECTION`
- `NUXT_IAEDU_API_ENDPOINT`
- `NUXT_IAEDU_API_KEY`
- `NUXT_IAEDU_CHANNEL_ID`
- `NUXT_IAEDU_DEFAULT_THREAD_ID`
- `NUXT_CONTACT_MIN_FILL_TIME_MS`
- `NUXT_CONTACT_RATE_LIMIT_WINDOW_MS`
- `NUXT_CONTACT_RATE_LIMIT_MAX_REQUESTS`
- `NUXT_INSCRICAO_MIN_FILL_TIME_MS`
- `NUXT_INSCRICAO_RATE_LIMIT_WINDOW_MS`
- `NUXT_INSCRICAO_RATE_LIMIT_MAX_REQUESTS`

### 4) Workflow de deploy

O workflow `.github/workflows/deploy.yml` já está preparado para:

1. Fazer `npm ci`.
2. Fazer `npm run build` (SSR).
3. Publicar em `/var/www/netdw/app`.
4. Gerar `/var/www/netdw/app/.env` a partir dos Secrets.
5. Instalar dependências de runtime.
6. Reiniciar `netdw.service`.
7. Validar `http://127.0.0.1:3000/api/chatbot-health`.

## Verificação rápida pós deploy

```bash
curl http://127.0.0.1:3000/api/chatbot-health
sudo journalctl -u netdw -f
```

Se o health devolver configuração incompleta, o processo Node arrancou sem variáveis válidas.
