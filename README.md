# Linear vs Binary Search Benchmark

> Demonstracao web da diferenca de performance entre buscas linear e binaria.

## Sobre o projeto

Atividade academica U2 que carrega o dicionario portugues br-utf8.txt (IME-USP), tokeniza a frase do enunciado e mede o tempo de busca de cada palavra usando busca linear e busca binaria. Resultados exibidos em milissegundos com comparacao visual direta entre os dois algoritmos, evidenciando a vantagem da busca binaria em estruturas ordenadas.

## Funcionalidades principais

- Carregamento do dicionario br-utf8.txt (IME-USP) em memoria
- Tokenizacao da frase do enunciado palavra a palavra
- Medicao de tempo em milissegundos para busca linear
- Medicao de tempo em milissegundos para busca binaria
- Comparacao visual lado a lado dos resultados
- Site estatico pronto para publicacao no Netlify

## Tecnologias utilizadas

- HTML
- CSS
- JavaScript
- Intl.Collator
- Netlify

## Como executar

Abra `index.html` no navegador. A pagina carrega o dicionario e executa as buscas automaticamente.

## Deploy / Demonstracao

Publique a pasta raiz no Netlify. O arquivo `netlify.toml` ja define a configuracao.

## Fonte dos dados

- IME-USP: https://www.ime.usp.br/~pf/dicios/
- Arquivo: br-utf8.txt

## Repositorio

[github.com/thomasrangelbugs/linear-binary-search-benchmark](https://github.com/thomasrangelbugs/linear-binary-search-benchmark)

## Autor

**Thomas Rangel Bugs**

Desenvolvido para portfolio, estudo e pratica de algoritmos de busca.
