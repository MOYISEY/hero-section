DELETE FROM task_assignments
WHERE developer_id IN (
  SELECT id FROM users WHERE email IN ('frontend@neuralbrief.local', 'backend@neuralbrief.local')
);

DELETE FROM notifications
WHERE title IN ('Новое назначение в проект CRM', 'Новое ТЗ на рассмотрение')
   OR body LIKE '%Project ID:%';

DELETE FROM tasks
WHERE title IN ('Ролевая модель и интерфейсы', 'Рабочее пространство разработчика');

DELETE FROM projects
WHERE title IN ('CRM для веб-студии', 'Новое ТЗ из NeuralBrief');

DELETE FROM wiki_pages
WHERE title = 'Code Style студии';

DELETE FROM users
WHERE email IN (
  'frontend@neuralbrief.local',
  'backend@neuralbrief.local',
  'manager@neuralbrief.local',
  'client@neuralbrief.local'
);

DELETE FROM chat_sessions;
