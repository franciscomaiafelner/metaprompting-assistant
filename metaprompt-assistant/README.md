# Metaprompt Assistant (MVP)

Mini-assistente de metaprompting para páginas do ChatGPT. Lê o contexto, clarifica com 1–2 perguntas, gera **um único prompt final** e envia; acompanha a resposta e sugere ajuste.

## Instalar (modo dev)
1. `chrome://extensions` → *Developer mode* → **Load unpacked** → selecionar a pasta `metaprompt-assistant/`.
2. Abre o ChatGPT. Verás o painel lateral no canto direito (botão ⟂ para abrir/fechar).
3. (Opcional) Em **Options**, define API key e preferências.

## Notas técnicas
- Manifest V3, service worker para storage e futura proxy de rede.
- Content script injeta **Shadow DOM** para evitar conflitos de CSS.
- Seletor de mensagens/textarea com heurísticas tolerantes.
- MVP sem chamadas à OpenAI (stub em `api/openaiClient.js`).
- Próximos passos:
  - Implementar `openaiClient.complete()` com `fetch` e `chrome.storage.sync.get("apiKey")`.
  - Melhorar `alignChecker` com regexes por tipo de tarefa (código, lista, resumo curto).
  - Guardar histórico de prompts enviados e permitir “duplicar e editar”.

## Segurança/Permissões
- Apenas `storage`, `scripting`, `activeTab` e host permissions para domínios do ChatGPT.
- Sem bibliotecas externas; CSS isolado no Shadow DOM.
