# Arquitetura

## Visão geral

O KM Lucrativo utiliza uma arquitetura frontend modular, sem etapa de compilação e sem backend. O HTML define as três áreas funcionais, o CSS é separado por responsabilidade e os módulos JavaScript coordenam domínio, persistência e apresentação.

## Camadas

### Apresentação

O `index.html` contém Visão Geral, Custo por KM, Registro Diário, Relatórios e Configurações como painéis acessíveis. Os arquivos em `css/` implementam tokens visuais, componentes, layouts especializados, responsividade e suporte a preferência de movimento reduzido.

### Aplicação

`js/app.js` é o composition root. Ele exporta `init()`, registra os eventos globais e inicializa tema, navegação, registros, configurações, backup, dashboard e inteligência financeira após `DOMContentLoaded`.

Os módulos em `js/` permanecem como fonte organizada. `tools/build-bundle.mjs` gera `script.js`, a entrada clássica carregada pelo `index.html`, evitando que a abertura direta do projeto bloqueie imports locais.

### Domínio

`js/financial-data.js` centraliza normalização, despesas e consolidação financeira. Calculadora, simulador, dashboard e inteligência trabalham sobre estruturas explícitas, evitando dependências circulares.

### Persistência

`js/storage.js` isola os registros no LocalStorage. `js/settings.js` mantém metas e preferências financeiras. Toda gravação publica eventos de atualização, permitindo que tabela, dashboard e análises permaneçam sincronizados. `js/backup.js` exporta e restaura o estado persistente em JSON.

## Fluxo de dados

```text
Formulário diário
      ↓
daily-records.js
      ↓
storage.js → LocalStorage
      ↓ evento registros-atualizados
      ├── dashboard.js → métricas e gráficos
      └── intelligence.js → análises e recomendações
```

## Eventos internos

- `registros-atualizados`: emitido após alterações persistidas.
- `financeiro-calculado`: emitido após recalcular custos e meta.
- `tema-atualizado`: emitido após mudança de tema.
- `aba-alterada`: emitido pela navegação ao ativar um painel.
- `configuracoes-atualizadas`: emitido após salvar metas e valor mínimo por quilômetro.

## Decisões de produção

- Módulos ES nativos mantêm baixo custo operacional.
- Dados permanecem locais e não exigem autenticação.
- Conteúdo de usuário é renderizado com `textContent` para evitar injeção de HTML.
- Dependências externas possuem versões fixadas.
- Operações de persistência e PDF possuem tratamento de falhas.
- Navegação segue o padrão ARIA de abas e suporta teclado.
