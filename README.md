# 🎮 Snake Multiplayer - Frontend

Interface web para o jogo Snake multiplayer utilizando **Next.js 16**, **React 19** e **Socket.IO Client**.

**Status:** ✅ Completo | **Versões:** Next.js 16, React 19, Socket.IO 4.5.4

## 📋 Índice
- [Visão Geral](#visão-geral)
- [Arquitetura](#arquitetura)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Descrição dos Arquivos](#descrição-dos-arquivos)
- [Como Executar](#como-executar)
- [Fluxo de Dados](#fluxo-de-dados)

---

## 🎯 Visão Geral

O frontend é responsável por:
- Estabelecer conexão WebSocket com o servidor
- Renderizar interface visual do jogo (canvas)
- Capturar entrada do usuário (teclado)
- Exibir estado do jogo em tempo real
- Gerenciar lobby e início do jogo
- Mostrar efeitos visuais (speed boost, slow down)

**Stack:**
- `Next.js 16` (React Framework)
- `React 19` (UI)
- `Socket.IO Client 4.5` (WebSocket)
- `Tailwind CSS 4` (Estilização)
- `TypeScript` (Type safety)
- `HTML5 Canvas` (Renderização do jogo)

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────┐
│          Browser (Frontend)             │
│  - Page.tsx (Componente Raiz)           │
│  - Hooks (lógica de negócio)            │
│  - Components (UI e Canvas)             │
└────────────────┬────────────────────────┘
                 │
    ┌────────────┴─────────────┐
    │                          │
    ▼                          ▼
┌──────────────┐        ┌──────────────┐
│ useWebSocket │        │  Components  │
│ (Data)       │        │  (Render)    │
└──────┬───────┘        └──────┬───────┘
       │                       │
       └───────────┬───────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │  Socket.IO Client    │
        │  WebSocket Connection│
        └──────────┬───────────┘
                   │
                   ▼ HTTP + WebSocket
        ┌──────────────────────┐
        │  Backend Server      │
        │  localhost:5000      │
        └──────────────────────┘
```

**Padrão de Dados:**
1. **useWebSocket** gerencia conexão e estado
2. **Page** consome hook e distribui props
3. **Components** renderizam baseado no estado
4. **User Input** (teclado) dispara `sendMove()`

---

## 📁 Estrutura de Pastas

```
frontend/
├── app/
│   ├── page.tsx                      # Componente raiz (Home)
│   ├── layout.tsx                    # Layout envolvedor
│   ├── globals.css                   # CSS global
│   │
│   ├── components/
│   │   ├── GameCanvas.tsx            # Canvas renderização
│   │   ├── Lobby.tsx                 # Tela de lobby
│   │   └── EffectIndicator.tsx       # Indicador de efeitos
│   │
│   ├── hooks/
│   │   └── useWebSocket.ts           # Hook de conexão WebSocket
│   │
│   ├── game/
│   │   └── page.tsx                  # Página de jogo
│   │
│   └── public/                       # Assets estáticos
│
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
└── next-env.d.ts
```

---

## 📄 Descrição dos Arquivos

### 🎮 **page.tsx** - Componente Raiz (Home)

**Responsabilidades:**
- Render condicional (Loading → Lobby → Game)
- Gerenciar estado visual (`showGame`)
- Capturar input de teclado durante jogo
- Detectar morte do jogador
- Coordenar componentes filhos

**Estados:**
- `loading` - Conectando ao servidor
- `lobby` - Aguardando início do jogo
- `playing` - Jogo em andamento
- `finished` - Jogador morreu

**Fluxo:**

```tsx
// 1. Inicializa hook
const { gameState, socket, isConnected, sendMove } = useWebSocket()

// 2. Sincroniza showGame com gameState.status
useEffect(() => {
  if (gameState?.status === 'playing') {
    setShowGame(true)
  }
}, [gameState?.status])

// 3. Captura teclado se showGame = true
useEffect(() => {
  if (!showGame) return
  
  const handleKeyDown = (e: KeyboardEvent) => {
    // W/ArrowUp → { dx: 0, dy: -1 }
    // S/ArrowDown → { dx: 0, dy: 1 }
    // A/ArrowLeft → { dx: -1, dy: 0 }
    // D/ArrowRight → { dx: 1, dy: 0 }
    sendMove(direction)
  }
  
  window.addEventListener('keydown', handleKeyDown)
}, [showGame, sendMove])

// 4. Render condicional
return isConnected ? <Lobby /> : <Loading />
return showGame ? <GameCanvas /> : <Lobby />
```

**Throttling:**
- Input é limitado a 1 movimento a cada 50ms (20 FPS máx)
- Evita spam de mensagens ao servidor

---

### 🪝 **hooks/useWebSocket.ts** - Hook de Conexão

**Responsabilidades:**
- Estabelecer conexão WebSocket
- Gerenciar estado do jogo (gameState, lobbyStatus)
- Sincronizar com servidor
- Prover interface para enviar comandos
- Tratar desconexões e reconexões

**Retorno:**
```typescript
{
  gameState: GameState | null,           // Estado atual do jogo
  lobbyStatus: LobbyStatus | null,       // Info de jogadores
  socket: Socket | null,                 // Socket.IO instance
  isConnected: boolean,                  // Status de conexão
  sendMove: (direction) => void,         // Enviar movimento
  startGame: () => void,                 // Iniciar jogo
  playerId: string | null                // ID do jogador
}
```

**Eventos Escutados:**

| Evento | Source | Payload | Ação |
|--------|--------|---------|------|
| `connect` | Socket.IO | - | Define `playerId` |
| `gameState` | Backend | GameState | Atualiza `gameState` |
| `lobbyUpdate` | Backend | LobbyStatus | Atualiza `lobbyStatus` |
| `disconnect` | Socket.IO | - | Reseta estado |

**Métodos Exportados:**

```typescript
// Envia movimento para servidor
sendMove(direction: { dx: number; dy: number }): void

// Emite evento startGame
startGame(): void
```

**Inicialização:**
```typescript
// Na montagem do componente
useEffect(() => {
  const socket = io('http://localhost:5000', {
    reconnection: true,
    reconnectionDelay: 1000,
  })
  
  socket.on('connect', () => {
    setPlayerId(socket.id)
    setIsConnected(true)
  })
  
  socket.on('gameState', (state) => {
    setGameState(state)
  })
  
  return () => socket.disconnect()
}, [])
```

---

### 🎨 **components/GameCanvas.tsx** - Renderização Visual

**Responsabilidades:**
- Renderizar mapa do jogo (Canvas)
- Desenhar cobras com cores diferentes
- Desenhar comida
- Exibir pontuação e status
- Converter coordenadas lógicas → pixels

**Canvas Setup:**
```typescript
const CELL_SIZE = 10  // 1 unidade lógica = 10px
// Logo: 100x60 lógico = 1000x600px visual
```

**Render Loop:**
```
useEffect → Canvas ref
         → requestAnimationFrame
         → Canvas.getContext('2d')
         → Desenha tudo
         → Repete 60 FPS
```

**Elementos Desenhados:**

1. **Fundo** - Cinzento escuro (#1a1a1a)
2. **Grade** - Linhas #444 a cada célula
3. **Comida** - Círculos laranja (#FF9800)
4. **Cobras Vivas:**
   - **Própria** - Verde (#4CAF50) com contorno
   - **Outras** - Azul (#2196F3)
5. **Cabeça** - Quadrado maior para destaque
6. **HUD:**
   - Pontuação própria (canto superior esquerdo)
   - Lista de jogadores com scores
   - Placar ao morrer

**Exemplo de Desenho:**
```typescript
// Desenha cabeça da cobra
const headX = head.x * CELL_SIZE
const headY = head.y * CELL_SIZE

ctx.fillStyle = isOwnSnake ? '#4CAF50' : '#2196F3'
ctx.fillRect(headX + 1, headY + 1, CELL_SIZE - 2, CELL_SIZE - 2)
ctx.strokeStyle = '#fff'
ctx.lineWidth = 2
ctx.strokeRect(headX + 1, headY + 1, CELL_SIZE - 2, CELL_SIZE - 2)
```

---

### 🎯 **components/Lobby.tsx** - Tela Inicial

**Responsabilidades:**
- Exibir lista de jogadores conectados
- Mostrar informações do jogo
- Botão para iniciar jogo
- Informações de frutas (apple vs mango)

**Props:**
```typescript
interface LobbyProps {
  socket: Socket | null;
  onGameStart: () => void;  // Callback quando jogo inicia
}
```

**Estados:**
- `lobbyStatus` - Número de jogadores, lista
- `showFruitInfo` - Toggle informações de frutas
- `isLoading` - Depois de clicar iniciar

**Interações:**
```
handleStartGame()
  → setIsLoading(true)
  → socket.emit('startGame')
  → onGameStart() [atualiza parent]
```

---

### ✨ **components/EffectIndicator.tsx** - Indicador de Efeitos

**Responsabilidades:**
- Mostrar efeito ativo do jogador
- Exibir barra de progresso do efeito
- Animações visuais

**Props:**
```typescript
interface EffectIndicatorProps {
  effect: {
    type: 'speedBoost' | 'slowDown'
    endTime: number
  } | null
}
```

**Rendering:**
- Se `effect === null` → Não renderiza
- Se `effect` ativo → Mostra tipo e barra de tempo
- Animações de entrada/saída

---

### 📄 **game/page.tsx** - Página de Jogo (Opcional)

Rota dedicada para o jogo (se separado do Home).

---

### 🎨 **globals.css** - Estilos Globais

- Reset de estilos padrão do browser
- Variáveis CSS
- Classes utilitárias
- Animações (pulse, spin, etc)

---

### ⚙️ **Configurações**

**next.config.ts**
- Configuração do build e deploy

**tsconfig.json**
- Strict mode enabled
- Paths para imports

**tailwind.config.ts**
- Cores customizadas
- Extensões de tema

**postcss.config.mjs**
- Processamento CSS

**eslint.config.mjs**
- Regras de linting

---

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Backend rodando em `localhost:5000`

### Passos

```bash
# 1. Instalar dependências
npm install

# 2. Executar em modo desenvolvimento (porta 3001)
npm run dev

# 3. OU compilar para produção
npm run build
npm start

# 4. Abrir no navegador
# http://localhost:3001
```

**Saída esperada:**
```
> next dev -p 3001

  ▲ Next.js 16
  - Local:        http://localhost:3001
```

---

## 📊 Fluxo de Dados

### 1. Inicialização

```
User abre navegador
  ↓
Page.tsx renderiza
  ↓
useWebSocket() estabelece conexão
  ↓
socket.on('connect') → setPlayerId
  ↓
socket.emit('lobbyUpdate') ← recebe de broadcast
  ↓
Lobby renderizada com lista de jogadores
```

### 2. Início do Jogo

```
User clica "Iniciar Jogo"
  ↓
Lobby.handleStartGame()
  ↓
socket.emit('startGame')
  ↓
Backend: GameService.startGame()
  ↓
Backend: io.emit('gameState', {...status: 'playing'})
  ↓
useWebSocket.setGameState() atualizada
  ↓
page.tsx detecta gameState.status === 'playing'
  ↓
setShowGame(true)
  ↓
GameCanvas renderizado
```

### 3. Durante o Jogo

```
User pressiona tecla (W/A/S/D)
  ↓
page.tsx handleKeyDown()
  ↓
sendMove({ dx: 0, dy: -1 })
  ↓
socket.emit('move', { direction: ... })
  ↓
Backend: GameService.moveSnake()
  ↓
Backend: game loop atualiza posições
  ↓
Backend: io.emit('gameState', {...snakes})
  ↓
useWebSocket.setGameState() atualizada
  ↓
GameCanvas rerenderiza com novo estado
  ↓
Repete ~10 vezes por segundo
```

### 4. Morte do Jogador

```
game loop detecta colisão
  ↓
gameState.snakes[playerId].alive = false
  ↓
Backend: io.emit('gameState', {...})
  ↓
useWebSocket.setGameState()
  ↓
page.tsx efeito detecta: !playerSnake.alive
  ↓
setTimeout 1000ms → setShowGame(false)
  ↓
Volta para Lobby
```

---

## 🎮 Controles

| Entrada | Ação | Alternativa |
|---------|------|-------------|
| **W** ou **↑** | Mover para cima | ArrowUp |
| **S** ou **↓** | Mover para baixo | ArrowDown |
| **A** ou **←** | Mover para esquerda | ArrowLeft |
| **D** ou **→** | Mover para direita | ArrowRight |

---

## 🎨 Paleta de Cores

| Elemento | Cor | Hex |
|----------|-----|-----|
| Própria Cobra | Verde | #4CAF50 |
| Outras Cobras | Azul | #2196F3 |
| Comida | Laranja | #FF9800 |
| Fundo Canvas | Cinzento Escuro | #1a1a1a |
| Grade | Cinzento Claro | #444 |
| Pano de Fundo | Cinzento Escuro | #111827 (gray-900) |

---

## 🔧 Tecnologias e Dependências

| Pacote | Versão | Função |
|--------|--------|--------|
| next | 16.0.10 | React Framework |
| react | 19.2.1 | UI Library |
| react-dom | 19.2.1 | DOM Rendering |
| socket.io-client | 4.5.4 | WebSocket Cliente |
| tailwindcss | 4 | CSS Utility |
| typescript | 5 | Type Safety |
| eslint | 9 | Linting |

---

## 📝 Notas Importantes

### Sincronização
- Estado é atualizado a cada 100ms (backend)
- Canvas redraw a cada frame (60 FPS)
- Input é throttled a 50ms (20 FPS máx)

### Performance
- Canvas em vez de DOM → Melhor para muitos elementos
- Refs para DOM queries (canvas)
- useCallback para otimizar listeners

### Conectividade
- Socket.IO com reconexão automática
- Fallback de transporte (WebSocket → HTTP Long-Polling)
- Timeout de 5 segundos para inicialização

### Responsividade
- Componentes escaláveis com Tailwind
- Canvas adapta ao tamanho da tela
- Layout flexível

---

## 🔗 Integração com Backend

**Endpoints esperados:**
- WebSocket em `http://localhost:5000`

**Eventos enviados:**
- `startGame` - Inicia o jogo
- `move` - Envia movimento `{ direction: {dx, dy} }`

**Eventos recebidos:**
- `lobbyUpdate` - Status do lobby
- `gameState` - Estado atual do jogo

**Reconexão automática:**
- Timeout: 5000ms
- Delay de reconexão: 1000ms
- Max tentativas: infinitas

---

## 📞 Suporte

Para conectar com um backend diferente, altere:

```typescript
// em useWebSocket.ts, linha ~65
const socket = io('http://seu-servidor:porta', {
  // configurações
})
```
