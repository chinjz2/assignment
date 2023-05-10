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

Runs on localhost:3001

### Frontend

install dependencies using npm

```
npm install
```

start web application

```
npm run dev
```

Runs on localhost:3000

## Afterword

> This app is using the unstable releases for Next.js 13 and React 18. There has been some performance issue ongoing with both of them since they are both not production ready.

> Expect some small lag at the start.

If there are any questions regarding my choice of implementation or libraries/tools or anything at all
feel free to reach out to me @ nicholas.chinjz2@gmail.com.

Thanks.
