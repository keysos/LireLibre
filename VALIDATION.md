# Validação do pacote

- Build de produção Next.js: passou (variáveis fictícias, sem conexão a um projeto Supabase real).
- TypeScript: passou.
- ESLint: passou, sem erros ou avisos.
- Testes PostgreSQL embutido: passaram; SQL completo, RLS, privacidade, posse de registros, follows, triggers, cascade e reposicionamento de sequências.
- HTTP local de produção: páginas login/signup 200; usuário ausente retorna null; profile/follows sem sessão 401; JSON inválido 400; origem externa em POST 403.

Não testado sem suas credenciais: Auth hospedado, entrega de email/SMTP, renovação de sessão de uma conta real, integração real Open Library e importação dos dados do seu banco. Siga o checklist do README antes de publicar.
