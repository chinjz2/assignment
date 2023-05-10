## Running Locally

### Backend

create .env file in server folder with these variables

```
PORT = 3001
DATABASE_URL="file:./dev.db"
```

install dependencies using npm

```
npm install
```

sync in-memory database

```
npx prisma db push
```

start development server

```
npm run dev
```

### Frontend

install dependencies using npm

```
npm install
```

start web application

```
npm run dev
```
