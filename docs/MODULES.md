# Módulos JavaScript

| Módulo | Responsabilidade |
|---|---|
| `app.js` | Inicialização da aplicação e ligação dos módulos principais. |
| `backup.js` | Exportação e importação segura do estado persistido em JSON. |
| `calculator.js` | Cálculo de custos fixos, variáveis, metas e valor mínimo por KM. |
| `daily-records.js` | CRUD do Registro Diário e renderização segura da tabela. |
| `dashboard.js` | Filtros, métricas e gráficos Chart.js. |
| `date-utils.js` | Datas locais, formatação, semanas e deslocamentos de período. |
| `dom.js` | Referências centralizadas aos elementos permanentes da calculadora. |
| `financial-data.js` | Normalização e consolidação das métricas financeiras compartilhadas. |
| `intelligence.js` | Rankings, comparações históricas e recomendações automáticas. |
| `navigation.js` | Troca acessível de painéis e navegação por teclado. |
| `pdf.js` | Montagem e exportação do relatório financeiro. |
| `simulator.js` | Rentabilidade e diagnóstico de corridas. |
| `settings.js` | Persistência e formulário de metas e preferências financeiras. |
| `state.js` | Estado financeiro compartilhado entre calculadora e simulador. |
| `storage.js` | Leitura e escrita dos registros no LocalStorage. |
| `theme.js` | Tema claro/escuro e persistência da preferência. |
| `utils.js` | Formatação monetária, numérica e atualização de cartões. |

## Contrato do registro diário

```js
{
  id: String,
  data: "AAAA-MM-DD",
  aplicativo: "Uber" | "99" | "InDrive",
  horasTrabalhadas: Number,
  kmRodados: Number,
  receitaBruta: Number,
  litrosAbastecidos: Number,
  valorCombustivel: Number,
  alimentacao: Number,
  pedagio: Number,
  estacionamento: Number,
  outrasDespesas: Number,
  observacoes: String
}
```

## Convenções

- Arquivos e identificadores internos usam português consistente.
- Funções de inicialização começam com `iniciar`.
- Funções de atualização da interface começam com `atualizar` ou `renderizar`.
- Valores ausentes são normalizados para zero antes dos cálculos.
- Datas de negócio são armazenadas em ISO e formatadas apenas na apresentação.
