# Achados Beleza e Casa St 🛍️✨

Uma vitrine digital profissional, leve e rápida para afiliados (ex: Shopee), alimentada por uma planilha do Google Sheets.

## Recursos
- **Leitura ao Vivo (Google Sheets)**: Adicione produtos na planilha e eles aparecem no site na hora.
- **Barra de Pesquisa e Filtros**: Busque itens por nome ou descrição, e filtre por categorias!
- **PWA Instalável**: O usuário pode "Adicionar à Tela Inicial" e usar o site como um aplicativo de celular.
- **Modo Escuro Automático**: Se adapta ao tema do sistema do usuário (claro/escuro).
- **Notificações Toast**: Feedback elegante ao copiar os links.
- **Skeleton Loading**: Animação de carregamento moderno.
- **Zero Dependências de Backend**: Tudo feito puramente com HTML, CSS e Vanilla JS, hospedável de forma 100% grátis (Vercel, GitHub Pages, Netlify, etc).

## Como Configurar a Planilha

Sua planilha do Google Sheets deve ser **Publicada na Web** (Arquivo > Compartilhar > Publicar na Web > Formato CSV).
O link gerado deve ser colado na constante `CSV_URL` no arquivo `js/script.js`.

As colunas necessárias na sua planilha (na primeira linha) são:
1. `imagem`: Link da foto do produto
2. `titulo`: Nome do produto
3. `descricao`: Pequeno texto explicativo (Opcional)
4. `link`: Seu link de afiliado
5. `categoria`: Categoria do produto (Opcional) - Cria botões automáticos de filtro!

---
Desenvolvido com 🤍 para máxima conversão.
