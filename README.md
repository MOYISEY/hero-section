# hero-section

## Diploma materials

Дипломная структура, проверка требований и готовые формулировки для пояснительной записки находятся в `docs/diploma-plan.md`.

## NeuralBrief features

- LLM-диалог с клиентом и генерация черновика технического задания.
- Структурированное извлечение требований и расчёт полноты данных.
- Авторизация с ролями: client, manager, developer, director.
- Сохранение ТЗ и проектов только для зарегистрированных клиентов.
- CRM workflow: клиент → менеджер → разработчик → проверка → клиент.
- Уведомления с прочтением, удалением и очисткой ленты.
- Служебные чаты по каналам manager-client, manager-developer, director-user.
- Панель директора со статистикой, рабочей командой, отзывами и наблюдением за проектами.
- Личный кабинет клиента с проектами, прогрессом, скачиванием ТЗ и оценкой результата.
- Интеграция с Trello: при назначении задачи разработчику создаётся карточка в доске задач.

## Integrations

### Trello

Чтобы задачи автоматически отправлялись в Trello, добавьте в `.env.local`:

```env
TRELLO_API_KEY=your_trello_api_key
TRELLO_TOKEN=your_trello_token
TRELLO_TASKS_LIST_ID=your_trello_list_id
```

Если переменные не заданы, приложение продолжит работать, а создание карточки будет пропущено с предупреждением в консоли.

## Quality checks

```bash
corepack pnpm test
corepack pnpm build
```

This is a [Next.js](https://nextjs.org) project bootstrapped with [v0](https://v0.app).

## Built with v0

This repository is linked to a [v0](https://v0.app) project. You can continue developing by visiting the link below -- start new chats to make changes, and v0 will push commits directly to this repo. Every merge to `main` will automatically deploy.

[Continue working on v0 →](https://v0.app/chat/projects/prj_6QNy4KptjlXoKNAxGAHsWOakTOTh)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Learn More

To learn more, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [v0 Documentation](https://v0.app/docs) - learn about v0 and how to use it.

<a href="https://v0.app/chat/api/kiro/clone/MOYISEY/hero-section" alt="Open in Kiro"><img src="https://pdgvvgmkdvyeydso.public.blob.vercel-storage.com/open%20in%20kiro.svg?sanitize=true" /></a>
