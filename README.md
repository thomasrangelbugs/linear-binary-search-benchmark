# Busca linear x busca binária

Demonstração acadêmica que procura palavras de uma frase no dicionário português `br-utf8.txt` e compara os tempos de busca linear e binária.

## Estado do projeto

Aplicação web estática executada no navegador. O repositório não define etapa de instalação nem de compilação, salvo quando indicado abaixo.

## Funcionalidades

- Carregamento do dicionário
- Tokenização da frase
- Busca linear
- Busca binária
- Medição em milissegundos
- Comparação visual

## Tecnologias

- HTML
- CSS
- JavaScript
- Intl.Collator

## Estrutura principal

- `index.html — relatório`
- `script.js — carga, normalização, buscas e medição`
- `br-utf8.txt — base de palavras`
- `netlify.toml — deploy`

## Executar localmente

Não há dependências de pacote nem comando de build registrado para este projeto. Abra `index.html` em um navegador moderno.

## Como usar

- Abra a página e aguarde o carregamento do dicionário.
- Compare presença e tempo de cada palavra nos dois algoritmos.

## Integrações

- O dicionário é atribuído ao IME-USP no README original.

## Testes

Não foi identificado script de teste automatizado. Valide manualmente os fluxos descritos em **Como usar**, em desktop e em viewport móvel.

## Publicação

- O `netlify.toml` publica a pasta atual (`.`) sem build.

## Limitações e segurança

- A busca binária pressupõe dados ordenados segundo o mesmo critério de comparação.
- Tempos curtos variam por navegador e máquina.
- Se o navegador bloquear leitura local do TXT, use um servidor estático; o repositório não define comando para isso.

## Repositório

[redobrai-del/thomas-projetos](https://github.com/redobrai-del/thomas-projetos)