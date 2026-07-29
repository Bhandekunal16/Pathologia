# User Management

## Pathologist Friend

### 1. Overview

The User Management module is responsible for managing user accounts and controlling access to the Pathologist Friend application. The system uses Role-Based Access Control (RBAC) with two user roles: **Administrator** and **Pathologist**.

Only authenticated users can access the application, and each user is granted permissions based on their assigned role.

---

# 2. User Roles

## 2.1 Administrator

The Administrator has full control over the application and is responsible for managing users and system configuration.

### Responsibilities

* Create Pathologist accounts
* Update user information
* Activate or deactivate user accounts
* Reset user passwords
* View all users
* Assign or change user roles (if applicable)
* Access all application features

---

## 2.2 Pathologist

The Pathologist performs pathology-related tasks within the application.

### Responsibilities

* Log in to the application
* View assigned work
* Manage pathology records
* Update personal profile
* Change password
* Access only features permitted for the Pathologist role

---

# 3. User Lifecycle

### Create User

Only an Administrator can create a new user account.

Required information:

* Full Name
* Email Address
* Username
* Password
* Role
* Status (Active/Inactive)

---

### Update User

Administrators can update:

* Name
* Email Address
* Username
* Role
* Account Status

Pathologists can update only their own profile information.

---

### Disable User

Administrators can deactivate a user account without deleting it.

A deactivated user cannot log in until the account is reactivated.

---

### Delete User

Only Administrators can permanently delete a user account when it is no longer required.

---

# 4. Authentication

Users authenticate using:

* Username or Email
* Password

After successful authentication:

* User identity is verified.
* Access token is generated.
* User permissions are loaded based on the assigned role.

---

# 5. Password Management

Users can:

* Change their password
* Update password after authentication

Administrators can:

* Reset passwords for any user

Passwords are securely stored using a strong hashing algorithm.

---

# 6. Permissions Matrix

| Feature                   | Administrator | Pathologist |
| ------------------------- | :-----------: | :---------: |
| Login                     |       ✓       |      ✓      |
| View Dashboard            |       ✓       |      ✓      |
| Manage Users              |       ✓       |      ✗      |
| Create Users              |       ✓       |      ✗      |
| Update Users              |       ✓       |      ✗      |
| Delete Users              |       ✓       |      ✗      |
| Reset Passwords           |       ✓       |      ✗      |
| View Own Profile          |       ✓       |      ✓      |
| Update Own Profile        |       ✓       |      ✓      |
| Change Own Password       |       ✓       |      ✓      |
| Access Pathology Features |       ✓       |      ✓      |

---

# 7. User Status

Each user account has one of the following statuses:

| Status   | Description                            |
| -------- | -------------------------------------- |
| Active   | User can access the application.       |
| Inactive | User account exists but cannot log in. |

---

# 8. Security

The User Management module follows these security practices:

* Secure password hashing
* Role-Based Access Control (RBAC)
* Authenticated access to protected resources
* Session expiration after inactivity
* Audit logging for user management activities
* Access restricted according to assigned role

---

# 9. Audit Logging

The system records important user-related activities, including:

* User login
* User logout
* User creation
* User updates
* Password reset
* Password change
* User activation or deactivation
* User deletion

---

# 10. API Endpoints (Example)

| Method | Endpoint                     | Description                   |
| ------ | ---------------------------- | ----------------------------- |
| POST   | `/auth/login`                | Authenticate user             |
| POST   | `/auth/logout`               | Log out current user          |
| GET    | `/users`                     | List all users                |
| POST   | `/users`                     | Create a new user             |
| GET    | `/users/{id}`                | Retrieve user details         |
| PUT    | `/users/{id}`                | Update user information       |
| DELETE | `/users/{id}`                | Delete a user                 |
| PATCH  | `/users/{id}/status`         | Activate or deactivate a user |
| POST   | `/users/{id}/reset-password` | Reset a user's password       |

---

# 11. Best Practices

* Grant the Administrator role only to trusted personnel.
* Use strong passwords that meet the organization's password policy.
* Review user accounts periodically and remove inactive accounts.
* Ensure Pathologists have access only to features required for their responsibilities.
* Maintain audit logs for all administrative actions.
