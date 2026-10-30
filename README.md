# Cartwise – E-Commerce Platform

Cartwise is an e-commerce platform designed with a focus on backend architecture, data consistency, and system reliability.

The project covers core e-commerce operations, including product management, inventory handling, order processing, checkout, and payment integration. It follows a modular architecture designed to keep the codebase maintainable and support future development.

## Features

- Product catalog and category management.
- Product variants and dynamic attributes.
- Inventory reservation and stock management.
- Order creation and checkout workflows.
- Payment integration architecture.
- Product search, filtering, and sorting.
- User authentication and role-based access control.
- Reliable event processing using the Transactional Outbox pattern.
- Architecture prepared for future AI-powered recommendations and shopping assistance.

## Tech Stack

**Backend**
- C#
- ASP.NET Core Web API
- Entity Framework Core

**Database**
- PostgreSQL

**Frontend**
- React
- TypeScript

## Run Locally

### Prerequisites

- .NET SDK
- Node.js
- npm
- PostgreSQL

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Restore dependencies:

   ```bash
   dotnet restore
   ```

3. Configure the database connection string in `appsettings.Development.json`.

4. Apply database migrations:

   ```bash
   dotnet ef database update
   ```

5. Run the backend:

   ```bash
   dotnet run
   ```

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

## Project Goals

Cartwise aims to apply software engineering principles to real e-commerce challenges, with an emphasis on maintainability, scalability, security, and reliable business logic.