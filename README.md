# ChatBot Console

### Установка зависимостей

```bash
npm install
```

### Настройка окружения

1. Создайте файл `.env.local` в корне проекта

2. Добавьте ваш OpenAI API ключ в `.env.local`:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

### Запуск

```bash
npm run dev
```

### Запуск тестов

```bash
npm test
```

### Сборка для production

```bash
npm run build
npm start
```

#### Тесты

Реализовано **5 тестов** с использованием React Testing Library:

1. Создание нового диалога
2. Поиск диалога
3. Удаление диалога
4. Отправка сообщения и получение ответа ассистента
5. Ошибка ответа ассистента и повторная отправка (retry)

- Потоковая генерация ответа ассистента (ответ "нарастает" частями)
- Кнопка **Stop** для прерывания генерации (используется AbortController)
- Реализация через fetch streaming на API endpoint `/api/chat`

## Структура проекта

```
src/
├── app/                   # Next.js App Router
│   ├── api/chat/          # API endpoint для чата
│   ├── chat/[id]/         # Страница диалога
│   └── layout.tsx         # Корневой layout
├── components/            # React компоненты
│   ├── Chat.tsx          # Основной компонент чата
│   ├── Composer.tsx      # Компонент ввода сообщений
│   ├── MessageList.tsx   # Список сообщений с Markdown
│   ├── Sidebar.tsx       # Боковая панель с диалогами
│   └── ui/               # UI компоненты (shadcn/ui)
├── hooks/                # Custom хуки
│   ├── useChat.ts        # Логика работы с чатом
│   ├── useConversation.ts # Логика работы с одной conversation
│   └── useConversations.ts # Логика работы со списком conversations
├── shared/               # Общие утилиты и типы
│   ├── lib/
│   │   ├── formatText.ts # Форматирование Markdown
│   │   └── storage.ts    # Работа с LocalStorage
│   └── types/
│       └── chat.ts       # TypeScript типы
└── __tests__/            # Тесты
```

Бизнес-логика вынесена в custom хуки (`hooks/`) для:
- Переиспользуемости кода
- Упрощения тестирования
- Чистоты компонентов 

### Хранение данных

- Используется LocalStorage для сохранения conversations
- Состояние синхронизируется между компонентами через хуки
- Данные сохраняются автоматически при изменении

### Обработка ошибок

- Retry механизм для повторной отправки при ошибках
- Корректная обработка прерывания запроса (AbortController)

## Технологический стек

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Markdown**: Custom форматирование + Prism.js для code blocks
- **Testing**: Jest + React Testing Library
- **AI**: OpenAI API (gpt-4o-mini)

## Что сделано дополнительно

- Адаптивный дизайн (мобильная версия)
- Подсветка синтаксиса для code blocks
- Копирование кода одной кнопкой
- ESLint для качества кода

