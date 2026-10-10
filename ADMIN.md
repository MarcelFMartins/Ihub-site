# Painel dos donos (`/admin`)

Os donos entram em `seusite.com/admin` com e-mail e senha, adicionam celulares (com foto) e retiram os vendidos. O catálogo do site atualiza na hora.

Os dados ficam no **Firebase** (plano gratuito basta). Configuração única, feita por quem cuida do site:

1. Em https://console.firebase.google.com crie um projeto.
2. **Build → Authentication → Sign-in method**: ative **E-mail/senha**. Em **Users**, adicione os e-mails e senhas dos donos.
3. **Build → Firestore Database**: crie o banco (modo produção). Na aba **Rules**, cole o conteúdo de `firestore.rules` **trocando os e-mails de exemplo pelos dos donos** e publique. Isso é o que impede que qualquer pessoa edite o estoque.
4. **Configurações do projeto → Seus apps → Web (`</>`)**: registre um app e copie `apiKey`, `authDomain`, `projectId` e `appId`.
5. Coloque esses valores nas variáveis `NEXT_PUBLIC_FIREBASE_*` (veja `.env.example`) — em `.env.local` para testar e nas variáveis de ambiente da hospedagem. Faça um novo deploy.
6. **Authentication → Settings → Authorized domains**: adicione o domínio do site.

Enquanto o Firebase não estiver configurado, o catálogo mostra o estoque de exemplo de `lib/data.ts` e `/admin` avisa que não está configurado.

Observações:
- As fotos são reduzidas no navegador (até 900 px, WebP) e salvas no próprio documento, então não é preciso ativar o Firebase Storage (que é pago).
- Os dados de `apiKey` etc. são públicos por natureza no Firebase; a proteção é feita pelas regras do passo 3 e pelo login.
