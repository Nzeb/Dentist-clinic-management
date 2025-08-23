# Dental Clinic Management System

This is a web-based application for managing a dental clinic. It allows staff to manage patients, appointments, treatments, and more.

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js
- pnpm
- Docker (optional, for running a local PostgreSQL instance)

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/your_username_/your_project_name.git
   ```
2. Install PNPM packages
   ```sh
   pnpm install
   ```
3. Set up your environment variables. Create a `.env` file in the root of the project and add the following:
   ```
   POSTGRES_URL=your_database_url
   JWT_SECRET=your_super_secret_key
   STORAGE_PROVIDER=filesystem # or 'azure'
   # Required if STORAGE_PROVIDER is 'azure'
   AZURE_STORAGE_CONNECTION_STRING=your_azure_storage_connection_string
   AZURE_STORAGE_CONTAINER_NAME=your_azure_storage_container_name
   ```
4. Run the database migrations:
    ```sh
    node migrate.js
    ```
5. Seed the database with test users:
    ```sh
    node seed.js
    ```
6. Run the development server:
    ```sh
    pnpm dev
    ```

The application will be available at `http://localhost:3000`.

## Features

- **Patient Management:** Add, view, and update patient information.
- **Appointment Scheduling:** Schedule and manage patient appointments.
- **Treatment Planning:** Create and manage treatment plans for patients.
- **Billing and Invoicing:** Generate and manage invoices for treatments.
- **User Management:** A profile management system with three user roles.

## Roles

The application has three user roles with different levels of permissions:

- **Admin:** Has full access to the system. Can create, read, update, and delete all data, including managing users.
- **Doctor:** Can view and manage patients assigned to them. They can add medical history and prescriptions for their patients.
- **Reception:** Can view all patients and assign them to doctors. They can add medical history for patients but cannot add prescriptions.

## Test Users

You can use the following test users to log in and test the application:

- **Admin:**
  - **Username:** `admin`
  - **Password:** `password`
- **Doctor:**
  - **Username:** `doctor`
  - **Password:** `password`
- **Reception:**
  - **Username:** `reception`
  - **Password:** `password`
