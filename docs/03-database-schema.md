# 03-database-schema.md

> **Project:** SilentPay
>
> **Version:** 1.0
>
> **Status:** Approved Database Design
>
> **Database:** PostgreSQL 16+
>
> **ORM:** Prisma ORM
>
> **Blockchain:** Midnight Compact

---

# Table of Contents

1. Database Philosophy
2. Database Goals
3. Architecture
4. Data Ownership
5. Database Design Principles
6. ER Diagram
7. Naming Conventions
8. Enums
9. Company Table
10. Employee Table

---

# Database Philosophy

SilentPay follows a **hybrid storage architecture**.

Unlike traditional applications, **not all data belongs inside PostgreSQL**.

Instead, data is separated into two categories.

---

## Public Metadata

Stored inside PostgreSQL.

Examples

- Company
- Employee Name
- Wallet Address
- Payroll Status
- Payroll Month
- Contract Address
- Claim Timestamp

---

## Confidential Financial Data

Stored inside Midnight.

Examples

- Salary
- Bonus
- Revenue Split
- Payroll Amount
- Vesting Amount

---

# Why?

PostgreSQL is excellent for

- Searching
- Filtering
- Reporting
- Dashboards

Midnight is excellent for

- Privacy
- Confidential Ledger
- Proof Generation
- Claim Verification

Each technology stores what it does best.

---

# Database Goals

The database must

- Support payroll metadata
- Support employee management
- Support dashboards
- Track claims
- Support future revenue splits
- Scale to thousands of employees

---

# Non Goals

Database should NOT

- Store salaries
- Store bonuses
- Store split percentages
- Store private allocations
- Store cryptographic proofs

These belong inside Midnight.

---

# High Level Architecture

```text
                 PostgreSQL

          Metadata + Application Data

                 ▲
                 │
                 │ Prisma
                 │
      Next.js Backend Services
                 │
                 │
        Midnight Service
                 │
                 ▼

          Midnight Blockchain

        Private Financial Data
```

---

# Data Ownership

| Data | PostgreSQL | Midnight |
|----------|------------|-----------|
| Company | ✅ | ❌ |
| Employee | ✅ | ❌ |
| Wallet Address | ✅ | ❌ |
| Payroll Month | ✅ | ❌ |
| Payroll Status | ✅ | ❌ |
| Salary Amount | ❌ | ✅ |
| Bonus | ❌ | ✅ |
| Revenue Split | ❌ | ✅ |
| Claim Eligibility | ❌ | ✅ |
| Claim Timestamp | ✅ | ❌ |
| Contract Address | ✅ | ❌ |

---

# Database Design Principles

---

## Principle 1

Metadata only.

---

## Principle 2

Every table should have UUID primary keys.

---

## Principle 3

Never duplicate information.

---

## Principle 4

Soft delete whenever possible.

---

## Principle 5

Every important table contains timestamps.

---

## Principle 6

Every relationship uses foreign keys.

---

## Principle 7

Indexes must exist for frequently queried columns.

---

## Principle 8

Future scalability over premature optimization.

---

# Entity Relationship Diagram

```text
                     Company
                        │
       ┌────────────────┼─────────────────┐
       │                │                 │
       │                │                 │
 Employee          Payroll         WalletSession
       │                │
       │                │
       │          PayrollItem
       │
       │
 Notification

 AuditLog
```

Future

```text
RevenueSplit

SplitMember

Treasury

Departments
```

---

# Naming Conventions

## Tables

Singular

Example

```text
Company

Employee

Payroll
```

---

## Primary Keys

Always

```text
id
```

UUID

---

## Foreign Keys

Pattern

```text
companyId

employeeId

payrollId
```

---

## Timestamps

Every table

```text
createdAt

updatedAt
```

---

## Soft Delete

Optional

```text
deletedAt
```

---

# Enums

---

## EmployeeStatus

```text
ACTIVE

INACTIVE

ARCHIVED
```

---

## PayrollStatus

```text
DRAFT

PROCESSING

READY

COMPLETED

FAILED

CANCELLED
```

---

## ClaimStatus

```text
NOT_CLAIMED

CLAIMED

EXPIRED
```

---

## UserRole

```text
EMPLOYER

EMPLOYEE
```

---

## NotificationType

```text
SUCCESS

INFO

WARNING

ERROR
```

---

# Company Table

---

## Purpose

Represents one organization using SilentPay.

A company owns

- Employees
- Payrolls
- Wallet Sessions

---

## Relationships

One Company

↓

Many Employees

Many Payrolls

Many Wallet Sessions

Many Notifications

---

# Schema

| Field | Type | Nullable | Default | Indexed | Description |
|----------|----------|----------|----------|----------|-------------|
| id | UUID | ❌ | uuid() | ✅ PK | Primary Key |
| name | VARCHAR(120) | ❌ | - | ✅ | Company Name |
| slug | VARCHAR(80) | ❌ | - | ✅ Unique | URL Identifier |
| ownerWallet | VARCHAR(120) | ❌ | - | ✅ | Employer Wallet |
| email | VARCHAR(150) | ✅ | NULL | ❌ | Contact Email |
| logoUrl | TEXT | ✅ | NULL | ❌ | Company Logo |
| website | TEXT | ✅ | NULL | ❌ | Website |
| timezone | VARCHAR(50) | ❌ | UTC | ❌ | Payroll Timezone |
| payrollCurrency | VARCHAR(20) | ❌ | USDC | ❌ | Display Currency |
| createdAt | TIMESTAMP | ❌ | NOW() | ❌ | Created Time |
| updatedAt | TIMESTAMP | ❌ | NOW() | ❌ | Updated Time |

---

# Constraints

- slug must be unique
- ownerWallet must be unique
- company name required

---

# Indexes

```sql
PRIMARY KEY(id)

UNIQUE(slug)

UNIQUE(ownerWallet)
```

---

# Example Record

```json
{
  "id":"cmp_001",
  "name":"Acme Labs",
  "slug":"acme-labs",
  "ownerWallet":"addr_midnight_xyz",
  "timezone":"UTC",
  "payrollCurrency":"USDC"
}
```

---

# Employee Table

---

## Purpose

Stores employee metadata.

Never stores salary.

---

## Relationships

Employee

↓

belongs to Company

↓

appears in PayrollItems

↓

creates AuditLogs

---

# Schema

| Field | Type | Nullable | Default | Indexed | Description |
|----------|----------|----------|----------|----------|-------------|
| id | UUID | ❌ | uuid() | ✅ PK | Employee ID |
| companyId | UUID | ❌ | - | ✅ FK | Company |
| fullName | VARCHAR(120) | ❌ | - | ✅ | Employee Name |
| email | VARCHAR(150) | ✅ | NULL | ✅ | Contact Email |
| walletAddress | VARCHAR(120) | ❌ | - | ✅ Unique | Midnight Wallet |
| designation | VARCHAR(100) | ✅ | NULL | ❌ | Job Title |
| department | VARCHAR(80) | ✅ | NULL | ✅ | Department |
| joinedAt | DATE | ✅ | NULL | ❌ | Joining Date |
| status | EmployeeStatus | ❌ | ACTIVE | ✅ | Employee Status |
| avatarUrl | TEXT | ✅ | NULL | ❌ | Profile Image |
| notes | TEXT | ✅ | NULL | ❌ | Internal Notes |
| lastClaimAt | TIMESTAMP | ✅ | NULL | ❌ | Last Claim |
| createdAt | TIMESTAMP | ❌ | NOW() | ❌ | Created |
| updatedAt | TIMESTAMP | ❌ | NOW() | ❌ | Updated |
| deletedAt | TIMESTAMP | ✅ | NULL | ❌ | Soft Delete |

---

# Constraints

- walletAddress unique
- employee belongs to company
- name required
- ACTIVE by default

---

# Indexes

```sql
PRIMARY KEY(id)

INDEX(companyId)

INDEX(status)

INDEX(department)

UNIQUE(walletAddress)
```

---

# Why No Salary Column?

This is one of the core architectural decisions of SilentPay.

**Salary must never exist in PostgreSQL.**

Reasons:

1. PostgreSQL is queryable by administrators.
2. Database backups could expose confidential information.
3. Salary changes would require additional encryption.
4. Midnight already provides a privacy-preserving ledger.

Instead, PostgreSQL stores only the employee identity and links payroll metadata to Midnight.

---

# Employee Lifecycle

```text
Employer Creates Employee

↓

Employee Saved

↓

Wallet Linked

↓

Appears in Payroll

↓

Claims Payroll

↓

History Updated

↓

Archived (Optional)
```

---

# Future Fields (Not in MVP)

These fields are intentionally excluded from the initial release but reserved for future versions:

| Field | Reason |
|--------|--------|
| managerId | Organizational hierarchy |
| employeeCode | HR integrations |
| officeLocation | Multi-office companies |
| emergencyContact | Enterprise HR |
| taxIdentifier | Payroll compliance |
| preferredLanguage | Internationalization |

---

# Design Decision Summary

| Decision | Reason |
|----------|--------|
| UUID Primary Keys | Globally unique IDs |
| Metadata Only | Keep confidential data on Midnight |
| Soft Deletes | Preserve historical records |
| Foreign Keys | Maintain referential integrity |
| Indexed Wallets | Fast authentication and lookups |
| Enum Statuses | Prevent invalid state values |

---

# 03-database-schema.md

> **Part 2**
>
> **Payroll • PayrollItem • WalletSession • Notification • AuditLog • Relationships**

---

# Table of Contents

11. Payroll Table
12. Payroll Item Table
13. Wallet Session Table
14. Notification Table
15. Audit Log Table
16. Database Relationships
17. Cascade Rules
18. Index Strategy

---

# Payroll Table

---

## Purpose

Payroll represents **one payroll run**.

Example

```
July 2026 Payroll
```

One payroll contains multiple employees.

---

## Responsibilities

Stores

- Month
- Status
- Employee Count
- Midnight Contract Address
- Progress

Never stores

- Salary
- Bonus
- Split Amounts

---

## Lifecycle

```
Draft

↓

Processing

↓

Ready

↓

Completed
```

---

# Schema

| Field | Type | Nullable | Default | Indexed | Description |
|----------|----------|----------|----------|----------|-------------|
| id | UUID | ❌ | uuid() | ✅ PK | Payroll ID |
| companyId | UUID | ❌ | - | ✅ FK | Company |
| title | VARCHAR(120) | ❌ | - | ❌ | Payroll Name |
| payrollMonth | DATE | ❌ | - | ✅ | Payroll Month |
| employeeCount | INTEGER | ❌ | 0 | ❌ | Total Employees |
| claimedCount | INTEGER | ❌ | 0 | ❌ | Claimed Employees |
| status | PayrollStatus | ❌ | DRAFT | ✅ | Payroll Status |
| contractAddress | VARCHAR(150) | ✅ | NULL | ✅ | Midnight Contract |
| transactionHash | VARCHAR(200) | ✅ | NULL | ❌ | Deployment Hash |
| proofReference | VARCHAR(200) | ✅ | NULL | ❌ | Midnight Proof Ref |
| notes | TEXT | ✅ | NULL | ❌ | Employer Notes |
| createdBy | UUID | ❌ | - | ✅ FK | Employer/User |
| createdAt | TIMESTAMP | ❌ | NOW() | ❌ | Created |
| updatedAt | TIMESTAMP | ❌ | NOW() | ❌ | Updated |

---

# Constraints

- One payroll per company per month (MVP)
- employeeCount >= 0
- claimedCount <= employeeCount

---

# Indexes

```sql
PRIMARY KEY(id)

INDEX(companyId)

INDEX(status)

INDEX(payrollMonth)

INDEX(createdBy)
```

---

# Example Record

```json
{
  "title":"July Payroll",
  "status":"READY",
  "employeeCount":12,
  "claimedCount":5,
  "contractAddress":"midnight_xyz..."
}
```

---

# PayrollItem Table

---

## Purpose

Represents one employee inside one payroll.

**Important**

This table links employees to payrolls.

It still **does not store salary**.

Salary exists only inside Midnight.

---

## Example

```
July Payroll

↓

Employee A

Employee B

Employee C
```

Each row is a PayrollItem.

---

# Schema

| Field | Type | Nullable | Default | Indexed | Description |
|----------|----------|----------|----------|----------|-------------|
| id | UUID | ❌ | uuid() | ✅ PK | Payroll Item |
| payrollId | UUID | ❌ | - | ✅ FK | Payroll |
| employeeId | UUID | ❌ | - | ✅ FK | Employee |
| claimStatus | ClaimStatus | ❌ | NOT_CLAIMED | ✅ | Claim Status |
| claimedAt | TIMESTAMP | ✅ | NULL | ❌ | Claim Time |
| midnightReference | VARCHAR(150) | ✅ | NULL | ❌ | Private Ledger Ref |
| proofVerified | BOOLEAN | ❌ | false | ❌ | Proof Verified |
| createdAt | TIMESTAMP | ❌ | NOW() | ❌ | Created |
| updatedAt | TIMESTAMP | ❌ | NOW() | ❌ | Updated |

---

# Constraints

- One employee only once per payroll

---

# Unique Constraint

```sql
UNIQUE(payrollId, employeeId)
```

---

# Why No Salary?

Because PayrollItem exists only to connect

```
Payroll

↓

Employee

↓

Midnight Allocation
```

Salary lives inside Midnight.

---

# Claim Flow

```
NOT_CLAIMED

↓

CLAIMED

↓

History Updated
```

---

# WalletSession Table

---

## Purpose

Track active authenticated wallets.

---

## Why?

Allows

- Secure Sessions
- Session Expiry
- Logout
- Multiple Devices (future)

---

# Schema

| Field | Type | Nullable | Default | Indexed | Description |
|----------|----------|----------|----------|----------|-------------|
| id | UUID | ❌ | uuid() | ✅ PK | Session |
| companyId | UUID | ❌ | - | ✅ FK | Company |
| walletAddress | VARCHAR(120) | ❌ | - | ✅ | Wallet |
| role | UserRole | ❌ | EMPLOYEE | ✅ | Role |
| expiresAt | TIMESTAMP | ❌ | - | ✅ | Expiry |
| lastSeenAt | TIMESTAMP | ❌ | NOW() | ❌ | Last Activity |
| ipAddress | VARCHAR(45) | ✅ | NULL | ❌ | IPv4/IPv6 |
| userAgent | TEXT | ✅ | NULL | ❌ | Browser |
| createdAt | TIMESTAMP | ❌ | NOW() | ❌ | Created |

---

# Session Lifecycle

```
Wallet Connect

↓

Session Created

↓

Active

↓

Expires

↓

Deleted
```

---

# Notification Table

---

## Purpose

Stores in-app notifications.

Examples

```
Payroll Ready

Claim Successful

Payroll Completed

Employee Added
```

---

# Schema

| Field | Type | Nullable | Default | Indexed | Description |
|----------|----------|----------|----------|----------|-------------|
| id | UUID | ❌ | uuid() | ✅ PK | Notification |
| companyId | UUID | ❌ | - | ✅ FK | Company |
| employeeId | UUID | ✅ | NULL | ✅ FK | Optional Recipient |
| type | NotificationType | ❌ | INFO | ✅ | Notification Type |
| title | VARCHAR(120) | ❌ | - | ❌ | Title |
| message | TEXT | ❌ | - | ❌ | Body |
| isRead | BOOLEAN | ❌ | false | ✅ | Read Status |
| createdAt | TIMESTAMP | ❌ | NOW() | ❌ | Created |

---

# Examples

Employer

```
Payroll Generated
```

Employee

```
You have a payment ready.
```

---

# AuditLog Table

---

## Purpose

Track important actions.

Useful for

- Debugging
- Compliance
- Admin History

---

## Example Events

```
Employee Created

Employee Archived

Payroll Generated

Claim Completed

Wallet Connected
```

---

# Schema

| Field | Type | Nullable | Default | Indexed | Description |
|----------|----------|----------|----------|----------|-------------|
| id | UUID | ❌ | uuid() | ✅ PK | Log ID |
| companyId | UUID | ❌ | - | ✅ FK | Company |
| actorWallet | VARCHAR(120) | ❌ | - | ✅ | Action By |
| action | VARCHAR(100) | ❌ | - | ✅ | Event Name |
| entity | VARCHAR(80) | ❌ | - | ❌ | Table Name |
| entityId | UUID | ❌ | - | ✅ | Related Record |
| metadata | JSONB | ✅ | NULL | ❌ | Extra Details |
| createdAt | TIMESTAMP | ❌ | NOW() | ✅ | Timestamp |

---

# Example Audit Record

```json
{
  "action":"PAYROLL_CREATED",
  "entity":"Payroll",
  "entityId":"pay_001"
}
```

---

# Database Relationships

```text
Company
│
├──────── Employees
│
├──────── Payroll
│          │
│          └──────── PayrollItems
│
├──────── WalletSessions
│
├──────── Notifications
│
└──────── AuditLogs
```

---

# Relationship Details

## Company → Employee

```
1 Company

↓

Many Employees
```

---

## Company → Payroll

```
1 Company

↓

Many Payrolls
```

---

## Payroll → PayrollItem

```
1 Payroll

↓

Many Payroll Items
```

---

## Employee → PayrollItem

```
1 Employee

↓

Many Payroll Items
```

(One per payroll due to unique constraint.)

---

## Company → WalletSession

```
1 Company

↓

Many Sessions
```

---

## Company → Notification

```
1 Company

↓

Many Notifications
```

---

## Company → AuditLog

```
1 Company

↓

Many Logs
```

---

# Cascade Rules

| Parent | Child | On Delete |
|----------|--------|-----------|
| Company | Employee | Restrict |
| Company | Payroll | Restrict |
| Payroll | PayrollItem | Cascade |
| Employee | PayrollItem | Restrict |
| Company | Notification | Cascade |
| Company | AuditLog | Cascade |
| Company | WalletSession | Cascade |

---

# Why Restrict Company Deletion?

Deleting a company would destroy payroll history.

Instead:

- Mark company inactive.
- Preserve historical records.

---

# Index Strategy

## Frequently Queried Fields

Employee

- walletAddress
- companyId
- status

---

Payroll

- companyId
- payrollMonth
- status

---

PayrollItem

- payrollId
- employeeId
- claimStatus

---

WalletSession

- walletAddress
- expiresAt

---

AuditLog

- createdAt
- action

---

# Database Query Examples

## Employer Dashboard

```sql
SELECT *
FROM Payroll
WHERE companyId = ?
ORDER BY payrollMonth DESC;
```

---

## Employee Lookup

```sql
SELECT *
FROM Employee
WHERE walletAddress = ?;
```

---

## Pending Claims

```sql
SELECT *
FROM PayrollItem
WHERE claimStatus = 'NOT_CLAIMED';
```

---

# Midnight Integration Notes

The database intentionally stores only references to Midnight:

- `contractAddress`
- `transactionHash`
- `proofReference`
- `midnightReference`

Actual confidential allocations remain on the Midnight private ledger.

# 03-database-schema.md

> **Part 3 (Final)**
>
> Migration Strategy • Prisma Design • Seed Data • Query Patterns • Database Rules • Production Checklist

---

# Table of Contents

19. Prisma Model Relationships
20. Migration Strategy
21. Seed Data
22. Query Patterns
23. Transaction Strategy
24. Database Validation Rules
25. Backup Strategy
26. Performance Guidelines
27. Database Checklist

---

# Prisma Model Relationships

The database relationships should follow this structure.

```text
Company
│
├──────── Employee
│
├──────── Payroll
│            │
│            └──────── PayrollItem
│
├──────── WalletSession
│
├──────── Notification
│
└──────── AuditLog
```

---

## Relationship Summary

| Parent | Child | Relation |
|----------|---------|-----------|
| Company | Employee | One → Many |
| Company | Payroll | One → Many |
| Company | WalletSession | One → Many |
| Company | Notification | One → Many |
| Company | AuditLog | One → Many |
| Payroll | PayrollItem | One → Many |
| Employee | PayrollItem | One → Many |

---

# Prisma Model Overview

The project will contain the following Prisma models.

```text
Company

Employee

Payroll

PayrollItem

WalletSession

Notification

AuditLog
```

Each model should:

- Use UUID primary keys
- Include `createdAt`
- Include `updatedAt`
- Use proper relations
- Avoid duplicated information

---

# Migration Strategy

Development workflow:

```text
Update schema.prisma

↓

Generate Migration

↓

Review SQL

↓

Apply Migration

↓

Generate Prisma Client

↓

Run Seed

↓

Start Development
```

---

## Migration Rules

Always create a new migration.

Never edit old migrations.

Use descriptive names.

Example

```text
001_initial_schema

002_add_notifications

003_add_audit_logs
```

---

# Seed Strategy

The development database should always contain sample data.

---

## Company

```
Acme Labs
```

---

## Employees

```
Alice

Bob

Charlie

David

Emma
```

---

## Payroll

```
July Payroll

Status

READY
```

---

## Payroll Items

Create one PayrollItem for every employee.

Default

```
NOT_CLAIMED
```

---

## Notifications

Example

```
Payroll Ready
```

---

## Audit Logs

Example

```
EMPLOYEE_CREATED

PAYROLL_CREATED

PAYROLL_READY
```

---

# Query Patterns

These queries should be optimized.

---

## Employer Dashboard

Needs

- Company
- Employee Count
- Payroll Count
- Recent Payroll

---

## Employee Dashboard

Needs

- Employee Profile
- Claim Status
- Payroll History

---

## Payroll Page

Needs

- Payroll
- PayrollItems
- Employee Names
- Claim Progress

---

## History

Needs

- Payrolls

Sorted

Newest First

---

# Transaction Strategy

Certain operations should always execute inside database transactions.

---

## Employee Creation

```text
Create Employee

↓

Audit Log

↓

Commit
```

---

## Payroll Creation

```text
Create Payroll

↓

Create PayrollItems

↓

Audit Log

↓

Commit
```

---

## Claim

```text
Verify

↓

Update PayrollItem

↓

Update Payroll

↓

Create Audit Log

↓

Commit
```

---

# Validation Rules

---

## Company

- Name required
- Slug unique
- Wallet unique

---

## Employee

- Name required
- Wallet required
- Wallet unique
- Company required

---

## Payroll

- Month required
- Company required
- Status required

---

## PayrollItem

- Payroll required
- Employee required
- Unique employee per payroll

---

## Wallet Session

- Wallet required
- Expiry required

---

## Notification

- Title required
- Message required

---

## Audit Log

- Action required
- Actor required
- Timestamp required

---

# Soft Delete Strategy

Soft delete should be used only for:

```text
Employee
```

Reason:

Historical payroll records must remain valid.

---

Do NOT soft delete:

- Payroll
- PayrollItem
- AuditLog

These represent immutable historical events.

---

# Backup Strategy

Production backups should include:

- PostgreSQL database
- Prisma migrations

Do **not** include:

- Wallet secrets
- `.env` files
- Private keys

---

# Performance Guidelines

---

## Index Frequently Queried Columns

Employee

- walletAddress
- companyId
- status

Payroll

- companyId
- payrollMonth
- status

PayrollItem

- payrollId
- employeeId
- claimStatus

AuditLog

- createdAt
- action

---

## Avoid

- `SELECT *` on large datasets
- N+1 query patterns
- Duplicate records

---

## Use

- Pagination
- Indexed lookups
- Prisma relations
- Transactions

---

# Database Best Practices

- Use UUIDs for primary keys.
- Keep business logic out of Prisma models.
- Use services for complex operations.
- Never store confidential payroll amounts.
- Validate input before writing to the database.
- Keep migrations small and descriptive.

---

# Midnight Integration Rules

PostgreSQL stores only references to Midnight.

Examples:

- `contractAddress`
- `transactionHash`
- `proofReference`
- `midnightReference`

Never store:

- Salary
- Bonus
- Revenue split
- Private allocations
- Zero-knowledge proof contents

---

# Database Acceptance Checklist

## Schema

- [ ] All tables created
- [ ] Foreign keys added
- [ ] Enums created
- [ ] Indexes added

---

## Relationships

- [ ] Company → Employee
- [ ] Company → Payroll
- [ ] Payroll → PayrollItem
- [ ] Employee → PayrollItem

---

## Constraints

- [ ] Unique wallet addresses
- [ ] Unique payroll employee entries
- [ ] Required fields validated

---

## Performance

- [ ] Indexed lookup columns
- [ ] Pagination supported
- [ ] Transactions implemented

---

## Security

- [ ] No salary columns
- [ ] No bonus columns
- [ ] No confidential financial data in PostgreSQL

---

## Seed Data

- [ ] Sample company
- [ ] Sample employees
- [ ] Sample payroll
- [ ] Sample notifications
- [ ] Sample audit logs

---
