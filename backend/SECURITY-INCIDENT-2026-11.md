# Incidente de segurança 2026-11 (carolina-api)

> Sem segredos neste arquivo. Evidência forense e `inspect.json` ficam **fora** do repositório.

## Resumo

- **Período:** webshells em `public/css`, `public/css/filament/...` e `public/js` de 15/10/2026 a 17/11/2026, com execução via `?c=`. XMRig como `www-data` a partir de 18/11, em `/var/www/.cache/.fontconfig/.data/.lib`, disfarçado de `/usr/sbin/rsyslogd`.
- **Origem:** `2402:8780:106a:b403::/64`.
- **Exposição:** 5 semanas de RCE como `www-data`. Tudo que o processo PHP enxergava deve ser tratado como vazado: env (`APP_KEY`, banco, S3, SMTP), banco `carolina` e volume `storage/app`.

## Vetor de entrada

| # | Candidato | Confiança | Por quê |
|---|---|---|---|
| 1 | **CVE-2025-54068**: RCE sem autenticação no Livewire < 3.6.4 (hidratação de propriedades em `POST /livewire/update`) | **Alta (~80%)** | O lock tinha `livewire/livewire v3.6.3` desde 2025-06 e foi para produção assim. `/admin/login` (Filament) é um componente Livewire público com `public ?array $data`, o formato explorável. Há exploit público e exploração em massa. Explica RCE como `www-data` sem login. |
| 2 | **CVE-2026-48500** (Filament ≤ 3.3.51): upload temporário sem autenticação nas páginas de auth. A regra padrão do Livewire (`file\|max:12288`) aceita qualquer extensão e mantém a do cliente | Média-baixa como entrada; plausível como staging | Grava `.php` em `livewire-tmp` no disco padrão. Sozinho não executa: no S3 o arquivo não roda, e em `storage/` o nginx já bloqueava `.php`. Não explica arquivos em `public/css`. |
| 3 | `APP_KEY` vazada + snapshot Livewire forjado | Baixa | A chave nunca foi commitada. Só é plausível se foi reutilizada em outro app. |
| 4 | Credencial de admin + polyglot no `FileUpload` | Baixa | O `FileUpload` salvava `ulid.<extensão do cliente>` validando só `mimetypes:image/*`, então `GIF89a<?php` chamado `x.php` era aceito. Mas o arquivo iria para `projects/` no disco do Filament, não para `public/css`. |

**Por que os webshells executavam:**
- o nginx da imagem (`location ~ \.php$`) passava ao PHP-FPM **qualquer** `.php` existente no webroot. Só `/storage/*.php` era bloqueado;
- o `Dockerfile` copiava o código com `--chown=www-data`, então o RCE conseguia escrever em `public/`.

As variantes `.php3/.php4/.php5/.php7/.phps` não executavam; são típicas de dropper automatizado.

**Para confirmar** (no `container.log`):
- os primeiros requests do bloco IPv6;
- todos os `POST /livewire/update`, `POST /livewire/upload-file` e `POST /admin/login` entre 14/10 e 16/10.

O padrão esperado para o candidato 1 é um `POST /livewire/update` do bloco e, segundos depois, o primeiro `GET /css/.../*.php?c=`.

## O que mudou

**Vetor:**
- `livewire/livewire` 3.6.3 → **3.8.12**, `filament/filament` 3.3.29 → **3.3.58**, `laravel/framework` 12.19.3 → **12.74.0**, mais o resto do lock. `composer audit` limpo.
- `config/livewire.php`: upload temporário só autenticado (`auth`), em disco **privado** (`local`), com allowlist `jpg/jpeg/png/webp` por conteúdo e extensão.
- `App\Filament\Forms\Components\SecureImageUpload` (os dois campos de imagem):
  - allowlist `image/jpeg|png|webp` por conteúdo (`mimetypes` + `mimes`) **e** extensão;
  - SVG recusado;
  - nome com `.php`/`.phtml`/`.phar` em qualquer posição recusado;
  - extensão do cliente precisa bater com o conteúdo;
  - **re-encode com GD** antes de gravar, o que remove polyglots;
  - nome `uuid.<ext do tipo real>`;
  - disco = `FILESYSTEM_DISK` (antes caía no default do Filament, `public`).
- `User::canAccessPanel`: e-mail **exato** (`ADMIN_EMAIL`). Antes era `str_ends_with`, então `x` + e-mail da admin passava.
- Removida a rota `/api/user`, que não era usada.

**Endurecimento:**
- `docker/nginx/http.conf.template`: só `location = /index.php` executa. Qualquer `.php*`, `.phtml`, `.pht`, `.phar` ou `.phps` dá **404**. `/storage/` serve só estáticos, com CSP `sandbox`.
- `docker/php/zz-hardening.conf` (só FPM; o CLI/artisan continua normal):
  - `disable_functions=exec,shell_exec,system,passthru,proc_open,popen,pcntl_exec,proc_nice,dl`;
  - `open_basedir=/var/www/html:/tmp`;
  - `allow_url_include=off`, `expose_php=off`.
- `Dockerfile`:
  - código, `/var/www` (home do `www-data`) e `/etc/nginx` pertencem a **root**;
  - só `storage/` e `bootstrap/cache` são graváveis;
  - templates do nginx renderizados no build;
  - symlink `public/storage` criado no build;
  - `HEALTHCHECK` com `security:scan`.
- **Filesystem read-only (`--read-only`): ficou de fora.** O entrypoint da imagem precisa escrever em `/etc/nginx`, `/run` e `/var/cache/nginx` no boot. Com o código e a config de root e `/tmp` e `/dev/shm` com `noexec`, o efeito prático (nada novo executável fora de `storage/`) já está coberto.

**Detecção:**
- `php artisan security:scan` procura:
  - `.php*` em `public/` (fora `index.php`) e em `storage/app`;
  - executável, ELF ou script em `/tmp`, `/dev/shm` e `~www-data`;
  - processos fora da allowlist (`s6-*`, `php-fpm`, `nginx`, `php`, `sh`, `curl`, `sleep`);
  - CPU > 80% de 1 vCPU por 3 checagens seguidas (cgroup v2).
- Com achado, gera `CRITICAL` no log do container e o container fica **unhealthy**. Com `SECURITY_ALERT_WEBHOOK` definido, faz POST para Discord ou Slack. CPU alta só alerta, não derruba o container.
- Logs `file_upload` (usuário, IP, `CF-Connecting-IP`, nome original, MIME real, caminho) e `auth_login`, `auth_failed`, `auth_lockout`, `auth_logout`.

**Observação operacional:** `php artisan tinker` no container precisa de `HOME=/tmp php artisan tinker`, porque o home não é mais gravável.

## Configuração no Coolify

1. **Environment** (backend):
   - `APP_KEY` **nova**;
   - `APP_PREVIOUS_KEYS` vazio;
   - `APP_DEBUG=false`;
   - `ADMIN_EMAIL`;
   - `LIVEWIRE_TMP_DISK=local`;
   - `FILESYSTEM_DISK=s3`;
   - credenciais novas;
   - opcional: `SECURITY_ALERT_WEBHOOK`.
2. **Advanced → Custom Docker Options:**
   ```
   --cap-drop=ALL --security-opt=no-new-privileges --cpus=1 --memory=512m --pids-limit=256 --tmpfs /tmp:rw,noexec,nosuid,size=64m --tmpfs /dev/shm:rw,noexec,nosuid,size=16m
   ```
3. **Scheduled Tasks** (opcional, além do healthcheck): `php artisan security:scan` a cada 5 min. O Coolify notifica quando a tarefa falha, se as notificações estiverem configuradas.
4. **Healthcheck:** se o Coolify sobrescrever o `HEALTHCHECK` da imagem, use o mesmo comando:
   ```
   curl -fsS http://127.0.0.1:8080/healthcheck >/dev/null && php /var/www/html/artisan security:scan --no-ansi --quiet 2>>/proc/1/fd/2
   ```

## Checklist de religamento (executar manualmente)

### 0. Antes de tudo
- [ ] **Não** reiniciar o container antigo. Remover o container e a imagem antiga depois de preservar a evidência.
- [ ] Inspecionar o **volume `storage/app`**, que sobrevive ao rebuild:
  ```sh
  docker volume ls | grep -i <nome-do-recurso>
  docker run --rm -v <volume>:/v:ro alpine sh -c '
    find /v -type f -newermt 2026-10-14 | head -200;
    find /v -type f ! -iregex ".*\.\(jpe?g\|png\|webp\|gif\)$";
    find /v -name "*.php*" -o -name ".*" -type f'
  ```
  Copie para fora só as imagens legítimas e **recrie o volume vazio**. As imagens podem ser re-subidas pelo painel, o que as re-encoda.
- [ ] Auditar o bucket `carolina-portfolio`. Tudo que não for imagem, que esteja em `livewire-tmp/` ou que tenha sido modificado depois de 14/10 é suspeito:
  ```sh
  aws s3 ls s3://carolina-portfolio --recursive --endpoint-url https://s3.rukado.com \
    | grep -viE '\.(jpe?g|png|webp|gif)$'
  ```
  Confira também se a chave S3 do Carolina tinha acesso a **outros buckets** do SeaweedFS.
- [ ] Verificar os outros containers do host, inclusive o **Salonna**, e o próprio host:
  ```sh
  docker ps --format '{{.Names}}' | while read c; do
    echo "== $c"; docker exec "$c" sh -c 'find / -xdev \( -path /proc -o -path /sys \) -prune -o \( -name "*.php*" -path "*/public/*" ! -name index.php -print \) 2>/dev/null | head; ls -la /var/www/.cache /tmp /dev/shm 2>/dev/null | head -30' ; done
  ps aux --sort=-%cpu | head -15
  ss -tnp | grep -E ':(10032|3333|4444|5555|7777|14444)\b'
  grep -rE 'moneroocean|xmrig' /etc/cron* /var/spool/cron 2>/dev/null; crontab -l
  cat /root/.ssh/authorized_keys; last -n 30
  ```

### 1. Rebuild limpo
- [ ] Merge deste branch e **rebuild pelo Coolify a partir do git**, com as configurações da seção anterior.
- [ ] Após subir: `/up` = 200, `/css/x.php` = 404, `docker inspect --format '{{.State.Health.Status}}'` = `healthy`.

### 2. Rotacionar segredos (todos)
- [ ] `APP_KEY`: gerar localmente com `php artisan key:generate --show`. **Não** colocar a antiga em `APP_PREVIOUS_KEYS`. Isso derruba sessões e cookies. O app não usa `encrypt()` nem casts `encrypted`, então não há dado a recriptografar.
- [ ] Senha do role `carolina` no Postgres compartilhado:
  ```sql
  ALTER ROLE carolina PASSWORD '<nova>';
  ```
- [ ] Chaves S3/SeaweedFS do bucket: criar par novo e revogar o antigo.
- [ ] SMTP e qualquer chave de terceiros que estava no env.
- [ ] O Postgres é compartilhado com `rukado_api`. Confira o que o role `carolina` alcançava (consultas abaixo). Se alcançava outros bancos, trate esses bancos também como expostos.

### 3. Auditar o banco (`carolina`)
```sql
-- Usuários criados/alterados no período (o app só deveria ter a admin)
SELECT id, name, email, email_verified_at, created_at, updated_at
FROM users ORDER BY updated_at DESC;

-- Tokens Sanctum: o app não emite nenhum, então qualquer linha é suspeita
SELECT id, tokenable_type, tokenable_id, name, abilities, last_used_at, created_at
FROM personal_access_tokens ORDER BY created_at DESC;

-- Resets de senha
SELECT * FROM password_reset_tokens;

-- Sessões: do bloco do atacante e de usuários logados
SELECT id, user_id, ip_address, user_agent, to_timestamp(last_activity) AS last_activity
FROM sessions
WHERE ip_address LIKE '2402:8780:106a:b403:%' OR user_id IS NOT NULL
ORDER BY last_activity DESC;

-- Jobs: o app não enfileira nada, então qualquer linha é suspeita (payload é PHP serializado)
SELECT id, queue, attempts, to_timestamp(created_at) AS created_at, left(payload, 500) FROM jobs;
SELECT id, uuid, queue, failed_at, left(payload, 500), left(exception, 300) FROM failed_jobs;
SELECT * FROM job_batches;

-- Conteúdo alterado no período
SELECT id, title, slug, image, status, updated_at FROM projects WHERE updated_at >= '2026-10-14' ORDER BY updated_at;
SELECT id, project_id, image_path, updated_at FROM project_images WHERE updated_at >= '2026-10-14' ORDER BY updated_at;
SELECT id, name, icon, updated_at FROM technologies WHERE updated_at >= '2026-10-14';

-- Caminhos que não são imagem
SELECT id, image FROM projects WHERE image IS NOT NULL AND image !~* '\.(jpe?g|png|webp|gif)$';
SELECT id, image_path FROM project_images WHERE image_path !~* '\.(jpe?g|png|webp|gif)$';

-- Conteúdo injetado (XSS no frontend) ou links trocados
SELECT id, title, repo_url, live_url, reference_url FROM projects
WHERE description ~* '<\s*(script|iframe|img|svg)|javascript:'
   OR coalesce(repo_url, '') || coalesce(live_url, '') || coalesce(reference_url, '') ~* 'javascript:|data:';

-- Migrations inesperadas
SELECT * FROM migrations ORDER BY id DESC LIMIT 10;
```

```sql
-- Nível Postgres (rodar como superuser)
SELECT rolname, rolsuper, rolcreaterole, rolcreatedb, rolcanlogin, rolvaliduntil
FROM pg_roles ORDER BY oid DESC LIMIT 20;                         -- roles criadas recentemente aparecem no topo

SELECT datname, has_database_privilege('carolina', datname, 'CONNECT') AS carolina_can_connect, datacl
FROM pg_database WHERE NOT datistemplate;                         -- CONNECT é concedido a PUBLIC por padrão

-- No banco carolina: objetos que o app não cria
SELECT n.nspname, p.proname FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname NOT IN ('pg_catalog', 'information_schema');
SELECT event_object_table, trigger_name, action_statement FROM information_schema.triggers;
SELECT table_schema, table_name FROM information_schema.tables
WHERE table_schema NOT IN ('pg_catalog', 'information_schema') ORDER BY 1, 2;
SELECT extname FROM pg_extension;
```
- [ ] Se `carolina_can_connect` for `true` em outros bancos, fechar:
  ```sql
  REVOKE CONNECT ON DATABASE <db> FROM PUBLIC;
  GRANT CONNECT ON DATABASE <db> TO <role-dono>;
  ```
  Depois, procurar nos logs do Postgres conexões do role `carolina` a outros bancos.

### 4. Invalidar sessões, tokens e cache
```sql
TRUNCATE sessions;
DELETE FROM personal_access_tokens;
DELETE FROM password_reset_tokens;
TRUNCATE cache, cache_locks;   -- valores PHP serializados: quem tinha acesso de escrita ao banco pode ter plantado payload
TRUNCATE jobs, failed_jobs;    -- só depois de salvar o que a auditoria acima mostrou
```
- [ ] Trocar a senha da admin, que também deve ser trocada em qualquer outro lugar onde tenha sido reutilizada. Remover `test@example.com`, se existir (vem do `DatabaseSeeder`).

### 5. Bloqueio temporário do atacante
- [ ] **Cloudflare WAF** (o domínio passa pela Cloudflare): Custom rule `(ip.src in {2402:8780:106a:b403::/64})` → **Block**.
- [ ] **No host**, para quem acessa a origem direto, sem passar pela Cloudflare:
  ```sh
  ip6tables -I INPUT -s 2402:8780:106a:b403::/64 -j DROP
  ip6tables -I DOCKER-USER -s 2402:8780:106a:b403::/64 -j DROP
  ```
  Melhor ainda: aceitar 80/443 só dos ranges da Cloudflare.

### 6. Egress (no host)
Limitar a saída por container exige uma rede dedicada. Como medida mínima, bloquear de **todos** os containers as portas de pool e o pool usado:
```sh
for p in 10032 3333 4444 5555 7777 14444 45700; do
  iptables -I DOCKER-USER -p tcp --dport $p -j REJECT
done
getent ahosts gulf.moneroocean.stream | awk '{print $1}' | sort -u | while read ip; do
  case "$ip" in *:*) ip6tables -I DOCKER-USER -d "$ip" -j REJECT ;; *) iptables -I DOCKER-USER -d "$ip" -j REJECT ;; esac
done
```
Persista as regras (`iptables-persistent` ou equivalente).

### 7. LGPD
- **O que havia de dado pessoal:**
  - `users`: só a admin (nome, e-mail, hash bcrypt);
  - `sessions`: IP e user agent de quem visitou `/` ou `/admin`, com vida curta (`SESSION_LIFETIME=120`);
  - `projects` não tem dado pessoal de terceiros.
- **Critério (art. 48 da LGPD + Resolução CD/ANPD nº 15/2024):** comunicar ANPD e titulares quando o incidente **puder acarretar risco ou dano relevante**. Isso exige afetar significativamente interesses ou direitos dos titulares **e** envolver ao menos um dos critérios: dados sensíveis, de crianças, adolescentes ou idosos, financeiros, **de autenticação**, protegidos por sigilo, ou em larga escala.
  - Se a auditoria confirmar que o banco `carolina` só tinha a admin e sessões efêmeras, e que o role **não** alcançava outros bancos, o dado de autenticação exposto é da própria titular do portfólio. Não há terceiros afetados de forma significativa, e a comunicação à ANPD tende a **não** ser obrigatória.
  - Se o role `carolina`, a chave S3 ou a rede alcançavam dados de clientes de outros sistemas (`rukado_api`, Salonna...), a avaliação muda: a comunicação passa a ser provável.
- **Prazo, se for comunicar:** 3 dias úteis a partir da ciência de que o incidente afetou dados pessoais. Agente de pequeno porte tem prazo em dobro (Res. CD/ANPD nº 2/2022). A comunicação pode ser preliminar e complementada depois. Aos titulares: linguagem clara, com o que aconteceu, quais dados, riscos e medidas.
- **Sempre, mesmo sem comunicar:** manter o **registro do incidente** (o que aconteceu, dados envolvidos, avaliação de risco, medidas tomadas), guardado por pelo menos 5 anos.
- Não é parecer jurídico. Com dados de terceiros envolvidos, vale consultar alguém de privacidade.

### 8. Depois de religar
- [ ] Acompanhar por 72h os logs `file_upload`, `auth_failed` e `security_scan`, além da CPU do host.
- [ ] Atualizar também o **Salonna** (Livewire 4.3.3 tem o XSS CVE-2026-81887).
