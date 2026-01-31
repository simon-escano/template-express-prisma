# Express + Prisma TypeScript Template

A production-ready Express.js backend template with TypeScript and Prisma ORM, following best practices for building scalable REST APIs.

**Inspired by**: [LogRocket's Express TypeScript Guide](https://blog.logrocket.com/express-typescript-node/)

## Features

- **Express 5** with async error handling
- **TypeScript** with strict mode
- **Prisma ORM** with PostgreSQL adapter
- **Controller-Service-Route** architecture
- **Global error handling** middleware
- **CORS** enabled for frontend integration
- **Dev Container** support for VS Code
- **ESLint + Prettier** for code quality

## Quick Start

```bash
# Clone and install
git clone https://github.com/simon-escano/template-express-prisma.git
cd express-prisma
npm install

# Set up environment
cp .env.example .env
# Edit .env with your database URL

# Generate PrismaClient into node_modules
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

Server runs at `http://localhost:3000`

## Project Structure

```
express-prisma/
├── src/
│   ├── app.ts              # Express app configuration
│   ├── server.ts           # Entry point
│   ├── config/
│   │   ├── config.ts       # Typed environment variables
│   │   └── prisma.ts       # Prisma client instance
│   ├── controllers/        # Request handlers
│   ├── services/           # Business logic
│   ├── routes/             # API routes
│   ├── middleware/         # Express middleware
│   └── utils/              # Utilities and error classes
├── prisma/
│   └── schema.prisma       # Database schema
├── .devcontainer/          # VS Code dev container
└── package.json
```

---

## Understanding the Architecture

This template follows the **Controller-Service-Route** pattern, which separates concerns and makes code testable:

### Routes

Routes define API endpoints and connect them to controller functions:

```typescript
// src/routes/itemRoutes.ts
import { Router } from 'express';
import { getItems, createItem } from '../controllers/itemController';

const router = Router();

router.get('/', getItems);      // GET /api/items
router.post('/', createItem);   // POST /api/items

export default router;
```

### Controllers

Controllers handle HTTP requests/responses and delegate business logic to services:

```typescript
// src/controllers/itemController.ts
export const getItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await itemService.getItems();
    res.json(items);
  } catch (error) {
    next(error); // Pass to error handler
  }
};
```

### Services

Services contain business logic and database operations:

```typescript
// src/services/itemService.ts
import { prisma } from '../config/prisma';

export const getItems = async () => {
  return await prisma.item.findMany();
};
```

### Middleware

Middleware functions process requests before they reach controllers:

```typescript
// Error handling middleware catches all errors
app.use(errorHandler);

// CORS allows cross-origin requests
app.use(cors());

// JSON parser for request bodies
app.use(express.json());
```

---

## Prisma Basics

Prisma is a modern ORM that provides type-safe database access.

### Schema Definition

Define your data models in `prisma/schema.prisma`:

```prisma
model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
  posts Post[]
}

model Post {
  id        Int     @id @default(autoincrement())
  title     String
  content   String?
  published Boolean @default(false)
  author    User    @relation(fields: [authorId], references: [id])
  authorId  Int
}
```

### Migrations

After changing your schema, create and apply migrations:

```bash
# Create migration and apply to database
npx prisma migrate dev --name add_posts_table

# Apply migrations in production
npx prisma migrate deploy
```

### Prisma Client

Use the typed client for database operations:

```typescript
// Create
const user = await prisma.user.create({
  data: { email: 'john@example.com', name: 'John' }
});

// Read
const users = await prisma.user.findMany();
const user = await prisma.user.findUnique({ where: { id: 1 } });

// Update
const updated = await prisma.user.update({
  where: { id: 1 },
  data: { name: 'Jane' }
});

// Delete
await prisma.user.delete({ where: { id: 1 } });

// Relations
const userWithPosts = await prisma.user.findUnique({
  where: { id: 1 },
  include: { posts: true }
});
```

---

## Database Setup

Choose the database setup that fits your project:

### Option 1: Docker (Local Development)

```bash
# Create docker-compose.yml
cat > docker-compose.yml << EOF
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: myapp
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
EOF

# Start PostgreSQL
docker-compose up -d
```

Update `.env`:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/myapp"
```

### Option 2: Supabase (Cloud)

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Settings > Database**
3. Copy the connection string (under "Connection string" > "URI")

Update `.env`:
```
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"
```

### Option 3: Neon (Serverless PostgreSQL)

1. Create a project at [neon.tech](https://neon.tech)
2. Copy the connection string from the dashboard

Update `.env`:
```
DATABASE_URL="postgresql://[USER]:[PASSWORD]@[HOST]/[DATABASE]?sslmode=require"
```

### Option 4: Railway

1. Create a PostgreSQL database at [railway.app](https://railway.app)
2. Copy the connection string from **Variables > DATABASE_URL**

### After Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Explore data with Prisma Studio
npx prisma studio
```

---

## Switching Database Providers

One of the key benefits of using Prisma is easy migration between database providers. Here's how to switch:

### Switching PostgreSQL Hosts (Easiest)

To move between PostgreSQL providers (self-hosted → Supabase → AWS RDS → Neon), you only need to change one thing:

1. Update `DATABASE_URL` in `.env` with the new connection string
2. Run `npx prisma migrate deploy` (production) or `npx prisma migrate dev` (development)
3. Done! Your code doesn't change at all.

| Provider | DATABASE_URL Format |
|----------|---------------------|
| Self-hosted | `postgresql://user:pass@localhost:5432/mydb` |
| Supabase | `postgresql://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:6543/postgres` |
| AWS RDS | `postgresql://user:pass@mydb.xxx.us-east-1.rds.amazonaws.com:5432/mydb` |
| Neon | `postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/mydb?sslmode=require` |
| Railway | `postgresql://postgres:pass@containers-xxx.railway.app:5432/railway` |

### Switching Database Types (e.g., PostgreSQL → MySQL)

Prisma 7 uses driver adapters, so switching database types requires changing both the adapter and schema:

**Step 1: Install the new adapter**

```bash
# For MySQL
npm install @prisma/adapter-mysql mysql2

# For SQLite
npm install @prisma/adapter-better-sqlite3 better-sqlite3
```

**Step 2: Update `src/config/prisma.ts`**

```typescript
// For MySQL:
import { PrismaMySQL } from '@prisma/adapter-mysql';
import mysql from 'mysql2/promise';

const pool = mysql.createPool(process.env.DATABASE_URL!);
const adapter = new PrismaMySQL(pool);
const prisma = new PrismaClient({ adapter });

// For SQLite:
import { PrismaBetterSQLite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';

const database = new Database('mydb.sqlite');
const adapter = new PrismaBetterSQLite3(database);
const prisma = new PrismaClient({ adapter });
```

**Step 3: Update `prisma/schema.prisma`**

```prisma
datasource db {
  provider = "mysql"  // or "sqlite"
}
```

**Step 4: Update `prisma.config.ts`**

```typescript
export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),  // Update connection string format
  },
})
```

**Step 5: Regenerate and migrate**

```bash
npx prisma generate
npx prisma migrate dev --name switch_to_mysql
```

> [!NOTE]
> When switching database types, you may need to adjust your schema for database-specific features (e.g., MySQL doesn't support arrays, SQLite has limited types).

---

## Adding New Features

### Creating a New Resource (e.g., Posts)

**1. Update `prisma/schema.prisma`:**

```prisma
model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  createdAt DateTime @default(now())
}
```

**2. Run migration:**

```bash
npx prisma migrate dev --name add_posts
```

**3. Create service `src/services/postService.ts`:**

```typescript
import { prisma } from '../config/prisma';
import { NotFoundError } from '../utils/errors';

export const getPosts = async () => {
  return await prisma.post.findMany();
};

export const getPostById = async (id: number) => {
  return await prisma.post.findUnique({ where: { id } });
};

export const createPost = async (title: string, content?: string) => {
  return await prisma.post.create({
    data: { title, content }
  });
};

export const updatePost = async (id: number, title: string, content?: string) => {
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) throw new NotFoundError('Post');
  
  return await prisma.post.update({
    where: { id },
    data: { title, content }
  });
};

export const deletePost = async (id: number) => {
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) throw new NotFoundError('Post');
  
  return await prisma.post.delete({ where: { id } });
};
```

**4. Create controller `src/controllers/postController.ts`:**

```typescript
import { Request, Response, NextFunction } from 'express';
import * as postService from '../services/postService';
import { AppError } from '../utils/errors';

export const getPosts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const posts = await postService.getPosts();
    res.json(posts);
  } catch (error) {
    next(error);
  }
};

export const getPostById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const post = await postService.getPostById(id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    res.json(post);
  } catch (error) {
    next(error);
  }
};

export const createPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, content } = req.body;
    const post = await postService.createPost(title, content);
    res.status(201).json(post);
  } catch (error) {
    next(error);
  }
};

export const updatePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const { title, content } = req.body;
    const post = await postService.updatePost(id, title, content);
    res.json(post);
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.status).json({ message: error.message });
    }
    next(error);
  }
};

export const deletePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    await postService.deletePost(id);
    res.status(204).send();
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.status).json({ message: error.message });
    }
    next(error);
  }
};
```

**5. Create routes `src/routes/postRoutes.ts`:**

```typescript
import { Router } from 'express';
import {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
} from '../controllers/postController';

const router = Router();

router.get('/', getPosts);
router.get('/:id', getPostById);
router.post('/', createPost);
router.put('/:id', updatePost);
router.delete('/:id', deletePost);

export default router;
```

**6. Register in `src/app.ts`:**

```typescript
import postRoutes from './routes/postRoutes';

app.use('/api/posts', postRoutes);
```

### Adding Input Validation

Install Zod for schema validation:

```bash
npm install zod
```

Create a validation middleware:

```typescript
// src/middleware/validate.ts
import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: result.error.flatten().fieldErrors
      });
    }
    
    req.body = result.data;
    next();
  };
};
```

Use in routes:

```typescript
import { z } from 'zod';
import { validate } from '../middleware/validate';

const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().optional()
});

router.post('/', validate(createPostSchema), createPost);
```

### Adding Authentication

Install JWT packages:

```bash
npm install jsonwebtoken bcryptjs
npm install -D @types/jsonwebtoken @types/bcryptjs
```

Create auth middleware:

```typescript
// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: number;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
```

Protect routes:

```typescript
import { authenticate } from '../middleware/auth';

router.post('/', authenticate, createPost);
router.put('/:id', authenticate, updatePost);
router.delete('/:id', authenticate, deletePost);
```

---

## API Reference

### Items

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/items` | List all items |
| GET | `/api/items/:id` | Get item by ID |
| POST | `/api/items` | Create new item |
| PUT | `/api/items/:id` | Update item |
| DELETE | `/api/items/:id` | Delete item |

**Request/Response Examples:**

```bash
# Create item
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -d '{"name": "My Item"}'

# Response
{"id": 1, "name": "My Item"}

# Get all items
curl http://localhost:3000/api/items

# Response
[{"id": 1, "name": "My Item"}]
```

---

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Run production server |
| `npm run lint` | Check code with ESLint |
| `npx prisma studio` | Open Prisma database GUI |
| `npx prisma migrate dev` | Create and run migrations |
| `npx prisma generate` | Regenerate Prisma client |

---

## Deployment

### Environment Variables

Set these in your production environment:

```
NODE_ENV=production
PORT=3000
DATABASE_URL=<your-production-database-url>
```

### Build for Production

```bash
npm run build
npm start
```

### Docker Deployment

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY prisma ./prisma
RUN npx prisma generate

COPY dist ./dist

EXPOSE 3000
CMD ["node", "dist/server.js"]
```

---

## License

ISC
