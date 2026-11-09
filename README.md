# Лабораторная работа №4 — Student Manager (Vue)

Frontend для системы управления студентами из ЛР №1, переписанный на Vue 3.
Работает с REST API из ЛР №3 (Spring Boot + PostgreSQL).

Вариант: **Vue**.

## Что используется

Frontend:
- Vue 3 (Composition API, `<script setup>`)
- Vue Router — страницы `/` (студенты), `/login` (вход), `/register` (регистрация), `/profile` (профиль)
- Pinia — глобальное состояние (`stores/auth.js`, `stores/students.js`)
- RxJS — поиск/фильтрация с debounce и отменой старых запросов, защита форм от повторной отправки
- axios — запросы к API, автоматическое обновление access-токена через refresh-токен

Backend (ЛР №3): Spring Boot 3, Spring Security + JWT, jOOQ, Flyway, PostgreSQL.

## Где что лежит

```
backend/                 Spring Boot приложение (ЛР №3)
frontend/
  src/views/             страницы (список студентов, логин, регистрация, профиль)
  src/components/        модальные окна, фильтры, пагинация
  src/composables/       логика на RxJS (useStudentList, useSubmit)
  src/stores/            Pinia stores
  src/services/          работа с API
  src/utils/             обработка ошибок, обёртка запроса в Observable
  nginx.conf             раздача собранного фронта и проксирование /api на backend
docker-compose.yml
.env.example
```

## Запуск через Docker

1. Скопировать пример конфигурации (можно и не делать — у всех переменных есть значения по умолчанию):

```bash
cp .env.example .env
```

2. Собрать и запустить:

```bash
docker compose up --build
```

После запуска:
- приложение: http://localhost:8081
- backend API: http://localhost:8080/api
- Swagger: http://localhost:8080/swagger-ui.html

3. Остановить:

```bash
docker compose down
```

Чтобы удалить ещё и данные БД:

```bash
docker compose down -v
```

## Переменные окружения (.env)

| Переменная | Описание | По умолчанию |
|---|---|---|
| `POSTGRES_DB` | имя базы | `students` |
| `POSTGRES_USER` | пользователь БД | `students_user` |
| `POSTGRES_PASSWORD` | пароль БД | `students_pass` |
| `JWT_SECRET` | ключ подписи JWT (не меньше 32 символов) | — |
| `JWT_ACCESS_EXPIRATION_MS` | время жизни access-токена | `900000` (15 мин) |
| `JWT_REFRESH_EXPIRATION_MS` | время жизни refresh-токена | `604800000` (7 дней) |
| `BACKEND_PORT` | порт backend на хосте | `8080` |
| `FRONTEND_PORT` | порт frontend на хосте | `8081` |

## Локальный запуск без Docker

Нужен PostgreSQL на `localhost:5432` (база `student_db`, пользователь/пароль `postgres`, либо задать `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`).

```bash
cd backend
mvn spring-boot:run
```

```bash
cd frontend
npm install
npm run dev
```

Фронт откроется на http://localhost:3000, запросы `/api` проксируются на `localhost:8080`.

## Пользователи по умолчанию

| Логин | Пароль | Роль |
|---|---|---|
| `admin` | `admin123` | ADMIN — может добавлять, редактировать и удалять студентов |
| `student_user` | `user123` | USER — только просмотр |

Роль (USER или ADMIN) выбирается при регистрации, как в ЛР №3.

## API

- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/refresh`, `POST /api/auth/logout`
- `GET /api/users/me` — текущий пользователь
- `GET /api/students` — список с фильтрами (`search`, `isuId`, `fullName`, `group`, `dormitoryNumber`, `room`, `accommodationFrom`, `accommodationTo`, `isInternational`, `notes`), сортировкой (`sortBy`, `order`) и пагинацией (`limit`, `offset`). Общее количество записей возвращается в заголовке `X-Total-Count`.
- `GET /api/students/{isuId}`
- `POST /api/students`, `PUT/PATCH /api/students/{isuId}`, `DELETE /api/students/{isuId}` — только ADMIN
