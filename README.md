# Falares

Mandioca, aipim ou macaxeira? O Falares é um jogo em que você responde como chama coisas do dia a dia e o site tenta adivinhar em que parte do Brasil você cresceu.

Depois do palpite, você conta de onde é de verdade. Essas respostas validadas alimentam os mapas e deixam os próximos palpites mais precisos.

## Como funciona

1. **Questionário:** 12 perguntas (5 fixas e 7 escolhidas conforme as suas respostas), sem cadastro.
2. **Resultado:** a frase com o palpite, um mapa de calor por estado e as palavras em que você foi minoria.
3. **Validação:** você informa o município da infância (e, se quiser, onde mora hoje e a faixa etária). Só a partir daí as respostas são salvas.

A ideia completa está em [`Detalhamento.md`](Detalhamento.md), e o vocabulário de referência em [`vocab.md`](vocab.md).

## Rodando localmente

Requer Node 22.18 ou mais recente.

```sh
npm install
npm run dev
```

O site abre em http://localhost:5173 e a API roda na porta 3001.

Para produção:

```sh
npm run build
npm start
```

## Tecnologias

React, TypeScript e Vite no site; Node com SQLite (`node:sqlite`) na API; mapa desenhado com d3-geo a partir da malha do IBGE.

## Onde mexer

- `src/data/questions.ts`: as perguntas, as opções de resposta e as 5 perguntas fixas.
- `src/lib/model.ts`: o cálculo do palpite.
- `src/screens/`: as telas do jogo.
- `server/index.ts`: a API e o banco de dados (`data/falares.db`, fora do git).
