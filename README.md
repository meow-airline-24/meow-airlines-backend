## Get started
0. Clone the project into your local machine.
1. Create a `.env` file, following `.env.example`.
2. Run `npm install` (or `pnpm install`).
3. To run the BACKEND development server: `npm run dev` (or `pnpm run dev`).
4. To run the FRONTEND: clone the frontend repo with the link above, then use a server like Apache, XAMPP to serve it. Note that at the time of writing, the frontend part assumes that such public backend information as `API_HOST`, `API_PORT`, and `SOCKET_PORT` be exactly as specified in `.env.example`, so you should copy those values into your `.env` file.
5. Now you should be able to access the app via the FRONTEND path.
