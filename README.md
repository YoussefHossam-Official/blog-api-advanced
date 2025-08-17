
**Tech:** Node.js, Express, MongoDB, JWT, Roles, Joi, Swagger

## Features
- Auth (register/login/me) + JWT
- Roles (user/admin) with `permit()`
- Posts CRUD with slug, tags, likes, comments
- Search (`q`), filter by tag/author/published, pagination, sort
- Joi validation + centralized error handling
- Swagger docs at `/api/docs`


## Key Endpoints
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET  /api/auth/me` (Bearer token)
- `GET  /api/posts?q=js&tag=dev&page=1&limit=10&sort=-createdAt`
- `POST /api/posts` (auth)
- `GET  /api/posts/:slug`
- `PATCH/DELETE /api/posts/:slug` (author or admin)
- `POST /api/posts/:slug/like` (toggle like)
- `POST /api/posts/:slug/comments` (add comment)
- `DELETE /api/posts/:slug/comments/:commentId`
