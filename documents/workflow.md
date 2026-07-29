# User Management Workflow

## Pathologist Friend

### Workflow Overview

The User Management workflow defines how users are created, authenticated, managed, and maintained within the Pathologist Friend application. The system supports two roles:

- **Administrator**
- **Pathologist**

The Administrator is responsible for managing user accounts, while the Pathologist accesses the application to perform pathology-related tasks.

---

# Workflow 1: User Creation

**Actor:** Administrator

```text
Administrator Login
        │
        ▼
Navigate to User Management
        │
        ▼
Click "Add User"
        │
        ▼
Enter User Details
(Name, Email, Username,
Password, Role)
        │
        ▼
Validate Information
        │
        ▼
Save User
        │
        ▼
User Account Created
        │
        ▼
User Status = Active
```

**Outcome:**

- A new Pathologist account is created.
- The user can log in using the assigned credentials.

---



# Workflow 2: User Login

**Actor:** Administrator / Pathologist

```text
Open Login Page
        │
        ▼
Enter Username/Email
and Password
        │
        ▼
Validate Credentials
        │
        ├───────────────┐
        │               │
     Valid           Invalid
        │               │
        ▼               ▼
Load User Role     Display Error
        │
        ▼
Generate Session
        │
        ▼
Redirect to Dashboard
```

**Outcome:**

- Authenticated users are redirected to the dashboard based on their role.

---



# Workflow 3: Update User Information

**Actor:** Administrator

```text
Open User Management
        │
        ▼
Search User
        │
        ▼
Select User
        │
        ▼
Modify Details
        │
        ▼
Validate Changes
        │
        ▼
Save Updates
        │
        ▼
User Information Updated
```

**Outcome:**

- User details are updated successfully.

---



# Workflow 4: Update Profile

**Actor:** Pathologist

```text
Login
        │
        ▼
Open My Profile
        │
        ▼
Edit Personal Information
        │
        ▼
Save Changes
        │
        ▼
Profile Updated
```

**Outcome:**

- The Pathologist updates only their own profile information.

---



# Workflow 5: Password Change

**Actor:** Administrator / Pathologist

```text
Login
        │
        ▼
Open Change Password
        │
        ▼
Enter Current Password
        │
        ▼
Enter New Password
        │
        ▼
Confirm Password
        │
        ▼
Validate Password
        │
        ▼
Password Updated Successfully
```

**Outcome:**

- The new password is securely stored and becomes effective immediately.

---



# Workflow 6: Reset User Password

**Actor:** Administrator

```text
Open User Management
        │
        ▼
Select User
        │
        ▼
Click Reset Password
        │
        ▼
Generate Temporary Password
or Reset Link
        │
        ▼
Notify User
```

**Outcome:**

- The user receives a temporary password or password reset link.

---



# Workflow 7: Activate / Deactivate User

**Actor:** Administrator

```text
Open User Management
        │
        ▼
Select User
        │
        ▼
Change Account Status
        │
        ├───────────────┐
        │               │
    Activate      Deactivate
        │               │
        ▼               ▼
Save Changes     Save Changes
        │               │
        ▼               ▼
User Can Login   Login Disabled
```

**Outcome:**

- Active users can access the application.
- Inactive users are prevented from logging in.

---



# Workflow 8: Delete User

**Actor:** Administrator

```text
Open User Management
        │
        ▼
Select User
        │
        ▼
Click Delete
        │
        ▼
Confirmation Prompt
        │
        ▼
Delete User
        │
        ▼
User Removed
```

**Outcome:**

- The selected user account is permanently removed from the system.

---



# Overall User Management Workflow

```text
Administrator
      │
      ▼
Login
      │
      ▼
User Management
      │
      ├──────────────┬──────────────┬──────────────┬──────────────┐
      │              │              │              │              │
      ▼              ▼              ▼              ▼              ▼
Create User    Update User   Reset Password   Change Status   Delete User
      │
      ▼
Pathologist Account Created
      │
      ▼
Pathologist Login
      │
      ▼
Dashboard
      │
      ├───────────────┐
      │               │
      ▼               ▼
Manage Profile   Change Password
```

---



## Business Rules

1. Only **Administrators** can create, update, activate, deactivate, reset passwords for, or delete user accounts.
2. Only **Administrators** can access the User Management module.
3. **Pathologists** can update only their own profile and change their own password.
4. Every user must have a unique email address and username.
5. Only users with an **Active** status can log in.
6. All user management actions should be recorded in the audit log.

