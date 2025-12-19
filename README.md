# Expense Sharing Application

A full-stack expense sharing application similar to Splitwise, built with Spring Boot (backend) and React Vite (frontend), using PostgreSQL as the database.

## Features

- **User Management**: Create and manage users
- **Group Management**: Create groups and add multiple users
- **Expense Management**: Add expenses with different split types:
  - Equal Split: Divide equally among group members
  - Exact Split: Specify exact amounts for each user
  - Percentage Split: Divide based on user-defined percentages
- **Balance Tracking**: Track who owes whom and maintain simplified balances
- **Settlement**: Settle outstanding dues partially or fully

## Tech Stack

- **Backend**: Spring Boot, JPA/Hibernate, PostgreSQL
- **Frontend**: React with Vite
- **Database**: PostgreSQL

## Architecture

### Backend Design

#### Data Models

- **User**: Represents application users with name and email
- **Group**: Contains multiple users, created by a user
- **Expense**: Represents a shared expense with description, amount, paid by user, group, and split type
- **Split**: Details how the expense is split among users
- **Balance**: Net balance between users within a group (fromUser owes toUser amount)
- **Transaction**: Records settlement transactions

#### APIs

- `GET/POST /api/users` - User management
- `GET/POST /api/groups` - Group management
- `POST /api/expenses` - Add expenses
- `GET /api/balances/group/{groupId}` - View balances for a group
- `POST /api/balances/settle` - Settle balances

#### Balance Calculation Logic

When an expense is added:
1. Calculate splits based on split type (equal, exact, percentage)
2. For each split where user != paidBy, update balance (from user to paidBy)

Balances are maintained as net amounts. For simplification, we keep direct balances (A owes B $X), but in a real-world scenario, you might want to implement graph-based simplification to minimize transactions.

### Frontend Design

Simple React application with forms for:
- Creating users
- Creating groups
- Adding expenses
- Viewing balances
- Settling dues

## Setup Instructions

### Prerequisites

- Java 17+
- Maven
- Node.js and npm
- PostgreSQL

### Backend Setup

1. Clone the repository
2. Navigate to `backend` directory
3. Update `application.properties` with your PostgreSQL credentials
4. Run `mvn spring-boot:run`

### Frontend Setup

1. Navigate to `frontend` directory
2. Run `npm install`
3. Run `npm run dev`

### Database

Create a PostgreSQL database named `expense_sharing`.

## Usage Example

1. Create users: Alice, Bob, Charlie
2. Create a group "Trip" with all three users
3. Alice adds an expense: "Hotel" $300, Equal split
   - Each owes Alice $100 (Bob: $100, Charlie: $100)
4. Bob adds an expense: "Dinner" $60, Exact split (Alice: $20, Charlie: $40)
   - Alice owes Bob $20, Charlie owes Bob $40
5. View balances:
   - Bob owes Alice $100
   - Charlie owes Alice $100
   - Alice owes Bob $20
   - Charlie owes Bob $40
6. Settle: Alice pays Bob $20
   - Balance Alice->Bob reduced to $0

## Design Decisions

- **Database Schema**: Used JPA entities with relationships. Group-Member many-to-many relationship.
- **Balance Simplification**: Kept simple direct balances. For full simplification, could implement graph algorithms.
- **API Design**: RESTful APIs with clear endpoints.
- **Frontend**: Minimal UI focusing on functionality.
- **Split Logic**: Handled in service layer with validation for split amounts.

## Troubleshooting

### Backend 500 Error

If you encounter a 500 Internal Server Error when starting the backend:

1. Ensure PostgreSQL is installed and running.
2. Create the database: `CREATE DATABASE expense_sharing;`
3. Update `application.properties` with correct database credentials.
4. If tables are not created, you can run the `schema.sql` file manually in your PostgreSQL client.

### Frontend Errors

- If API calls fail, ensure the backend is running on `http://localhost:8080`.
- Check browser console for CORS errors; the backend is configured to allow `http://localhost:5173`.

## Future Improvements

- User authentication
- Email notifications
- Advanced balance simplification (minimize transactions)
- Expense categories
- Recurring expenses
- Mobile app
