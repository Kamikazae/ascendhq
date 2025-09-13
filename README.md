# 📊 TeamOKR

A collaborative OKR (Objectives & Key Results) management platform that helps teams align goals, track progress, and visualize performance with role-based dashboards.

---

## 🚀 Tech Stack

- [Next.js 15](https://nextjs.org/) (App Router + Turbopack)  
- [React 19](https://react.dev/) + TypeScript  
- [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) components  
- [Framer Motion](https://www.framer.com/motion/) for smooth UI animations  
- [Prisma](https://www.prisma.io/) ORM with PostgreSQL (or your database of choice)  
- [NextAuth.js](https://next-auth.js.org/) with Prisma Adapter for authentication  
- [Zod](https://zod.dev/) + [react-hook-form](https://react-hook-form.com/) for validation & form handling  
- [Radix UI](https://www.radix-ui.com/) components (Dialog, Avatar, Label, Progress)  
- [Lucide Icons](https://lucide.dev/) for modern iconography  

---

## ✨ Features

- ✅ **Create & Manage Objectives** — Define and update team and individual OKRs  
- 📈 **Track Key Results** — Monitor progress with real-time updates  
- 🤝 **Team Alignment** — Ensure objectives cascade from organization to teams  
- 🔐 **Role-Based Access** — Admin, Manager, and Member roles with dedicated permissions  
- 📊 **Analytics Dashboards** — Separate dashboards tailored to each role  
- 🎨 **Responsive UI** — Mobile-friendly and modern design  

---

## 📂 Project Structure

.
├── app/ # Next.js App Router pages
├── components/ # Reusable UI components
├── lib/ # Utilities, helpers, Prisma client
├── prisma/ # Prisma schema & seed
├── public/ # Static assets
├── types/ # TypeScript definitions
├── middleware.ts # Middleware (auth, etc.)
├── next.config.ts # Next.js config
└── tailwind.config.js # TailwindCSS config

yaml


---

## ⚡ Getting Started (Development)

### 1. Clone & Install
```bash
git clone https://github.com/Kamikazae/teamokr.git
cd teamokr
npm install
2. Setup Environment Variables
Create a .env file in the root:

env

DATABASE_URL="postgresql://user:password@localhost:5432/teamokr"
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
3. Database Setup
bash

npx prisma generate
npx prisma migrate dev --name init
npm run dev
4. Run Locally
bash

npm run dev
App will be available at http://localhost:3000.

📜 License
This project is licensed under the MIT License.
Feel free to use and extend it 🚀
