FAEL MODS — GERADOR + PAINEL CONECTADOS

Arquivos:
- FAEL_MODS_gerador_keys_conectado.html: gerador modificado para registrar keys no servidor.
- FAEL_MODS_painel_conectado.html: painel que valida a key no mesmo servidor.
- server.js: API compartilhada, sem dependências externas.
- package.json: comando de inicialização.

COMO EXECUTAR
1. Instale Node.js 18 ou mais recente no servidor/host.
2. Envie TODOS os arquivos deste pacote para a mesma pasta no host.
3. Execute: npm start (ou node server.js).
4. Configure o host para executar a aplicação Node usando a porta indicada pela variável PORT.
5. Abra /FAEL_MODS_gerador_keys_conectado.html para criar keys e /FAEL_MODS_painel_conectado.html para digitar a key.
6. No gerador, altere a key para status Ativo. O painel só aceita keys ativas e não expiradas.

IMPORTANTE
- A conexão só funciona quando os dois HTMLs são servidos pelo mesmo servidor/base URL da API. Não funciona abrindo os HTMLs como arquivo local file:// nem hospedando-os em dois hosts sem configurar CORS e URL da API.
- Este pacote implementa validação de keys, não autenticação administrativa robusta. Antes de uso público real, proteja endpoints administrativos (criar/alterar/excluir key) com autenticação e HTTPS; neste exemplo, qualquer pessoa que conheça a URL pode chamar esses endpoints.
- O servidor guarda keys em keys-db.json; mantenha backup e use armazenamento persistente do provedor.
- Painel é visual demonstrativo e não modifica jogos.
