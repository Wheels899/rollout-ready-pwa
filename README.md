# 📋 Rollout Ready

A role-based checklist and task management system designed to ensure that no steps are missed during large-scale implementation projects.

## 🚀 UNIFIED DEPLOYMENT SYSTEM

**IMPORTANT: This application uses a unified deployment system with a single Start/Deploy button.**

### ⚡ Quick Start (Recommended)

**Option 1: Cross-Platform (Node.js)**
```bash
npm run deploy
```

**Option 2: Windows (PowerShell)**
```powershell
.\START.ps1
```

**Option 3: Windows (Batch)**
```cmd
START.bat
```

### 🎯 Deployment Modes

The unified start system provides these deployment options:

1. **Development Mode** - Hot reload, debugging enabled
2. **Production Mode** - Optimized build, production ready
3. **Build Only** - Just build the application
4. **Database Setup** - First-time database initialization
5. **Full Reset** - Clean slate with fresh installation

### 🔒 Single Entry Point Policy

- **ALL backend service launches MUST use the unified start button**
- **NO duplicate or disconnected start scripts should be created**
- **This Start button is the SOLE entry point for deployment**

Any code changes or service initiation must reference this unified deployment system.

## 🎯 Purpose

Rollout Ready helps teams manage complex implementation projects by:
- Using **project templates** with predefined tasks
- Assigning **role-specific responsibilities**
- Tracking task completion with **due dates** and **status updates**
- Providing **user dashboards** for personalized task views

## 🚀 Features

### ✅ MVP Features (Implemented)
- **Role Management**: Create and manage project roles (PM, Infrastructure Lead, Security Architect, etc.)
- **Template System**: Create reusable task templates linked to specific roles
- **Project Creation**: Set up projects with role assignments and auto-generated tasks
- **Task Tracking**: Monitor task status (To Do, In Progress, Done) with due dates
- **User Dashboards**: Personalized views showing tasks assigned to specific users
- **Admin Dashboard**: Overview of all roles, templates, projects, and statistics

### 🔄 Future Enhancements
- Recurring tasks (e.g., weekly status reports)
- Task dependencies and workflows
- Email notifications and reminders
- File attachments and comments
- Advanced reporting and analytics
- Team collaboration features

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: SQLite with Prisma ORM
- **Development**: Node.js, npm

## 🚀 **ONE-CLICK PWA DEPLOYMENT**

**Perfect for deployment anywhere! Just one button starts everything.**

### ⚡ **EASIEST WAY - Double-Click:**
```
Double-click: START.bat
```

### 🖥️ **Command Line:**
```bash
node DEPLOY.js
```

### 🎯 **What It Does Automatically:**
✅ Installs all dependencies
✅ Sets up database
✅ Seeds sample data
✅ Builds optimized PWA
✅ Starts production server

### 🔒 **Single Entry Point Policy:**
- **ALL deployments MUST use the unified start button**
- **NO manual setup required**
- **Works anywhere - just copy and run!**

**Then open: http://localhost:3000**

---

## 📱 **PWA Features**

✅ **Installable** - Add to home screen on any device
✅ **Offline Ready** - Works without internet connection
✅ **Mobile Optimized** - Touch-friendly interface
✅ **Fast Loading** - Service worker caching
✅ **Native Feel** - Standalone app experience

---

## 🎯 **Quick Test**

After launching, test these key features:

1. **Admin Dashboard:** http://localhost:3000/admin
2. **View Project:** http://localhost:3000/admin/projects/1
3. **User Tasks:** http://localhost:3000/dashboard/ollie
4. **Create Role:** http://localhost:3000/admin/roles/new
5. **Create Template:** http://localhost:3000/admin/templates/new

---

## 📦 Installation (Development)

1. **Clone and navigate to the project**:
   ```bash
   cd rollout-ready
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up the database**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Seed the database with sample data**:
   ```bash
   npm run seed
   ```

5. **Start the development server**:
   ```bash
   npm run dev
   ```

6. **Open your browser** to [http://localhost:3000](http://localhost:3000)

## 📊 Database Schema

The application uses the following core entities:

- **Role**: Job functions (PM, Infrastructure Lead, etc.)
- **Template**: Reusable task lists linked to roles
- **TemplateTask**: Individual tasks within templates with offset days
- **Project**: Real-world implementation projects
- **ProjectRole**: User assignments to roles within projects
- **ProjectTask**: Actual tasks generated from templates for specific projects

## 🎮 Usage

### Admin Workflow
1. **Create Roles**: Define project roles like "Project Manager", "Infrastructure Lead"
2. **Create Templates**: Build task checklists for each role with due date offsets
3. **Create Projects**: Set up new projects and assign users to roles
4. **Monitor Progress**: Track task completion across all projects

### User Workflow
1. **Access Dashboard**: Visit `/dashboard/[username]` to see your tasks
2. **View Tasks**: See all assigned tasks across projects with due dates
3. **Update Status**: Mark tasks as In Progress or Done
4. **Track Progress**: Monitor overdue tasks and completion rates

## 🌱 Sample Data

The seed script creates:
- **4 Roles**: Project Manager, Infrastructure Lead, Security Architect, Business Analyst
- **3 Templates**: With 4 tasks each, including critical pre-start tasks
- **1 Sample Project**: "Deploy MES at Avonmouth" with role assignments
- **12 Tasks**: Auto-generated from templates with realistic due dates

Sample users: `ollie`, `sarah`, `alex`

## 🔗 Key URLs

- **Home**: `/` - Welcome page with quick navigation
- **Admin Dashboard**: `/admin` - Management overview
- **Role Management**: `/admin/roles` - Create and manage roles
- **User Dashboards**: `/dashboard/[user]` - Personal task views
- **Create Project**: `/admin/projects/new` - Set up new projects

## 🏗 Architecture

```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin management pages
│   ├── dashboard/         # User dashboard pages
│   └── api/               # API routes
├── components/ui/         # Reusable UI components
├── lib/                   # Database and utility functions
└── prisma/                # Database schema
```

## 🧪 Development

- **Database**: SQLite file at `./dev.db`
- **Prisma Studio**: `npx prisma studio` to view data
- **Type Safety**: Full TypeScript coverage
- **Hot Reload**: Automatic updates during development

## 📝 License

This project is built for demonstration purposes as part of the Rollout Ready specification.
