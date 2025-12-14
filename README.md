# 🎨 Frontend - Snake Multiplayer (Next.js)

## 📝 Descrição

Frontend do jogo Snake multiplayer desenvolvido com **Next.js 16** (App Router) e **React 19**.

**Responsabilidades:**
- Renderizar mapa e jogadores em Canvas HTML5
- Capturar input de teclado
- Comunicar com servidor via WebSocket
- Sincronizar estado com servidor
- Exibir scores e status

---

## 🏗️ Estrutura

```
app/
├── page.tsx                      # Página inicial (boas-vindas)
├── game/
│   └── page.tsx                 # Página do jogo (orquestração)
├── components/
│   └── GameCanvas.tsx           # Componente de renderização
├── hooks/
│   └── useWebSocket.ts          # Hook de comunicação WebSocket
├── layout.tsx                   # Layout global
└── globals.css                  # CSS global (Tailwind)

public/
└── (assets estáticos)
```

---

## 🚀 Como Executar

### Instalação

```bash
cd frontend
npm install
```

### Desenvolvimento

```bash
npm run dev
```

Abrir: **http://localhost:3001**

### Produção

```bash
npm run build
npm run start
```

---

## 🎮 Componentes

### `useWebSocket` Hook
- Conecta ao servidor via Socket.IO
- Gerencia ciclo de vida da conexão
- Envia movimentos
- Recebe estado do jogo

### `GameCanvas` Component
- Renderiza canvas HTML5
- Desenha cobras, comida, interface
- Sem lógica de jogo (apenas rendering)

### `Game` Page
- Integra WebSocket hook
- Gerencia input de teclado
- Orquestra componentes

---

## 📡 Comunicação WebSocket

### Eventos Enviados
- **`move`** - Comando de movimento `{direction: {dx, dy}}`

### Eventos Recebidos
- **`state`** - Estado do jogo `{snakes: [...], food: {...}, ...}`

---

## ⌨️ Controles

| Tecla | Ação |
|-------|------|
| ⬆️ ou **W** | Mover para cima |
| ⬇️ ou **S** | Mover para baixo |
| ⬅️ ou **A** | Mover para esquerda |
| ➡️ ou **D** | Mover para direita |

---

## 🎨 Cores e Design

| Elemento | Cor |
|----------|-----|
| Fundo | `#1a1a1a` (cinzento escuro) |
| Grade | `#444` (cinzento claro) |
| Sua cobra | `#4CAF50` (verde) |
| Outra cobra | `#2196F3` (azul) |
| Comida | `#FF9800` (laranja) |
| Texto | `#FFF` (branco) |

---

## 📚 Dependências

```json
{
  "next": "16.0.10",
  "react": "19.2.1",
  "react-dom": "19.2.1",
  "socket.io-client": "^4.5.4",
  "tailwindcss": "^4"
}
```

---

## 🔄 Fluxo de Renderização

```
1. Usuário aperta seta
   ↓
2. handleKeyDown → parseKey
   ↓
3. sendMove(direction)
   ↓
4. socket.emit('move', {direction})
   ↓
[REDE ~50ms]
   ↓
5. Servidor processa movimento
   ↓
6. Servidor executa tick
   ↓
7. Servidor envia state
   ↓
[REDE ~50ms]
   ↓
8. socket.on('state', (state) => {
     setGameState(state)
   })
   ↓
9. useEffect([gameState])
   ↓
10. Canvas renderiza novo estado
    ↓
11. Tela atualiza (~150-200ms após input)
```

---

## 🧪 Testando

### Múltiplos Jogadores
```bash
# Terminal
npm run dev

# Abrir 3 abas em http://localhost:3001
# Cada aba = um jogador
# Movimentos sincronizados em tempo real
```

### DevTools
1. F12 → Network
2. Procurar `socket.io`
3. Ver eventos sendo enviados/recebidos
4. Verificar payload JSON

---

## 🛠️ Tecnologias

- **Next.js 16** - Framework React
- **React 19** - Biblioteca UI
- **Tailwind CSS** - Estilos
- **Socket.IO Client** - WebSocket
- **Canvas API** - Renderização

---

## 📖 Referências

- [Next.js Docs](https://nextjs.org/docs)
- [React Hooks](https://react.dev/reference/react/hooks)
- [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [Socket.IO Client](https://socket.io/docs/v4/client-api/)

---

**Desenvolvido como projeto acadêmico em Sistemas Distribuídos**

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
