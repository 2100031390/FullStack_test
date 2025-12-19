Expense Sharing Application

A full-stack expense sharing application inspired by Splitwise, built using Spring Boot for the backend and React (Vite) for the frontend, with PostgreSQL as the database.
The application focuses on correct expense-splitting logic, balance tracking, and settlement handling.

Features

User Management: Create and manage users

Group Management: Create groups and add multiple users

Expense Management: Add shared expenses with multiple split types:

Equal Split – Amount divided equally among members

Exact Split – Specific amount per user

Percentage Split – Split based on defined percentages

Balance Tracking: Track who owes whom within a group

Settlement: Settle dues partially or fully

Simplified Balances: Net balances maintained to avoid redundancy

Tech Stack

Backend: Spring Boot, Java 17, JPA/Hibernate

Frontend: React.js with Vite

Database: PostgreSQL

API Style: RESTful APIs

Architecture
Backend Design
Core Data Models

User – Represents application users with name and email

Group – A group created by a user containing multiple members

Expense – A shared expense with description, amount, payer, group, and split type

Split – Defines how an expense amount is distributed among users

Balance – Tracks net amount owed between users in a group
(fromUser → toUser : amount)

Transaction – Records settlement payments

API Endpoints

GET /api/users | POST /api/users – User management

GET /api/groups | POST /api/groups – Group management

POST /api/expenses – Add expenses

GET /api/balances/group/{groupId} – View balances for a group

POST /api/balances/settle – Settle outstanding balances

Balance Calculation Logic

When an expense is added:

The expense amount is split based on the selected split type
(Equal / Exact / Percentage)

For each participant other than the payer, a balance is created or updated:

fromUser = participant

toUser = payer

Balances are stored as net values, so repeated expenses update existing balances

The system maintains direct balances (A owes B ₹X).
For large-scale systems, graph-based balance simplification can be added as an enhancement.

Frontend Design

A simple and clean React UI that allows users to:

Create users and groups

Add expenses

View group-level balances

Settle dues

The UI prioritizes clarity and functionality over visual complexity.

Usage Example (Real-World Scenario)
Scenario: Vacation Expense

Users: Satya, Chaya, Lakshmi

Group: VacationTrip

Total Expense: ₹20,000

Paid by: Satya

Split Type: Equal

Calculation:
₹20,000 ÷ 3 = ₹6,666.67 per person

Balances Generated:

Chaya → Satya : ₹6,666.67

Lakshmi → Satya : ₹6,666.67

After Settlement:

Chaya pays Satya ₹6,666.67

Lakshmi pays Satya ₹6,666.67

Result:

No balances found for this group (all dues settled)


This behavior ensures balances are shown only when dues exist.

Setup Instructions
Prerequisites

Java 17+

Maven

Node.js & npm

PostgreSQL

Backend Setup
cd backend
mvn spring-boot:run


Update application.properties with your PostgreSQL credentials.

Frontend Setup
cd frontend
npm install
npm run dev

Database Setup

Create the database manually:

CREATE DATABASE expense_sharing;


Tables are auto-created using JPA/Hibernate.
