# Admin Management API Documentation

## Overview

This API provides comprehensive management for two types of administrators:
1. **Super Admin** - System-wide administrators with full access
2. **School Admin** - School-specific administrators with limited access to their assigned school

---

## Database Schema

### Super Admins Table (`super_admins`)

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key (auto-increment) |
| userId | INTEGER | Foreign key to `users` table (unique) |
| fullName | STRING | Full name of the super admin |
| email | STRING | Email address (unique) |
| phoneNumber | STRING | Phone number (unique) |
| department | STRING | Department (e.g., "Operations", "Management") |
| permissions | JSON | Array of permission strings |
| isActive | BOOLEAN | Account active status (default: true) |
| lastLogin | DATE | Last login timestamp |
| profilePhoto | TEXT | URL to profile photo |
| notes | TEXT | Internal notes about this admin |
| createdAt | DATE | Record creation timestamp |
| updatedAt | DATE | Record update timestamp |

**Default Permissions:**
- `manage_schools`
- `manage_school_admins`
- `manage_super_admins`
- `view_analytics`
- `manage_bookings`
- `manage_parents`
- `system_settings`

---

### School Admins Table (`school_admins`)

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key (auto-increment) |
| userId | INTEGER | Foreign key to `users` table (unique) |
| schoolId | INTEGER | Foreign key to `schools` table |
| fullName | STRING | Full name of the school admin |
| email | STRING | Email address (unique) |
| phoneNumber | STRING | Phone number (unique) |
| designation | STRING | Job title (default: "Administrator") |
| permissions | JSON | Array of permission strings |
| isActive | BOOLEAN | Account active status (default: true) |
| lastLogin | DATE | Last login timestamp |
| profilePhoto | TEXT | URL to profile photo |
| joiningDate | DATE | Date when admin joined |
| notes | TEXT | Internal notes about this admin |
| createdAt | DATE | Record creation timestamp |
| updatedAt | DATE | Record update timestamp |

**Default Permissions:**
- `manage_school_details`
- `manage_services`
- `manage_schedules`
- `view_bookings`
- `manage_slots`
- `view_analytics`

---

## API Endpoints

### Base URL
```
http://localhost:3000/api/admin-management
```

---

## Super Admin Endpoints

### 1. Create Super Admin

**Endpoint:** `POST /super-admin/create`

**Description:** Creates a new super admin account with associated user credentials.

**Request Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john.doe@specialnest.com",
  "phoneNumber": "+919876543210",
  "password": "SecurePassword123!",
  "department": "Operations",
  "permissions": [
    "manage_schools",
    "manage_school_admins",
    "view_analytics"
  ],
  "profilePhoto": "https://example.com/photo.jpg",
  "notes": "Senior administrator with 10 years experience"
}
```

**Required Fields:**
- `fullName` (string)
- `email` (string, must be valid email)
- `phoneNumber` (string)
- `password` (string, min 6 characters)

**Optional Fields:**
- `department` (string)
- `permissions` (array of strings)
- `profilePhoto` (string, URL)
- `notes` (string)

**Response (201 Created):**
```json
{
  "message": "Super Admin created successfully",
  "superAdmin": {
    "id": 1,
    "userId": 15,
    "fullName": "John Doe",
    "email": "john.doe@specialnest.com",
    "phoneNumber": "+919876543210",
    "department": "Operations",
    "permissions": [
      "manage_schools",
      "manage_school_admins",
      "view_analytics"
    ],
    "isActive": true
  }
}
```

**Error Responses:**
- `400 Bad Request` - Missing required fields or email already exists
- `500 Internal Server Error` - Server error

---

### 2. Get All Super Admins

**Endpoint:** `GET /super-admin/list`

**Description:** Retrieves a list of all super admins with their associated user data.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "count": 2,
  "superAdmins": [
    {
      "id": 1,
      "userId": 15,
      "fullName": "John Doe",
      "email": "john.doe@specialnest.com",
      "phoneNumber": "+919876543210",
      "department": "Operations",
      "permissions": ["manage_schools", "view_analytics"],
      "isActive": true,
      "lastLogin": "2026-01-20T10:30:00.000Z",
      "profilePhoto": "https://example.com/photo.jpg",
      "notes": "Senior administrator",
      "createdAt": "2026-01-15T08:00:00.000Z",
      "updatedAt": "2026-01-20T10:30:00.000Z",
      "user": {
        "id": 15,
        "email": "john.doe@specialnest.com",
        "mobileNumber": "+919876543210",
        "role": "super_admin",
        "isFirstLogin": false,
        "createdAt": "2026-01-15T08:00:00.000Z"
      }
    }
  ]
}
```

---

### 3. Get Super Admin by ID

**Endpoint:** `GET /super-admin/:id`

**Description:** Retrieves a specific super admin by their ID.

**Request Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `id` (integer) - Super Admin ID

**Example:** `GET /super-admin/1`

**Response (200 OK):**
```json
{
  "superAdmin": {
    "id": 1,
    "userId": 15,
    "fullName": "John Doe",
    "email": "john.doe@specialnest.com",
    "phoneNumber": "+919876543210",
    "department": "Operations",
    "permissions": ["manage_schools", "view_analytics"],
    "isActive": true,
    "lastLogin": "2026-01-20T10:30:00.000Z",
    "profilePhoto": "https://example.com/photo.jpg",
    "notes": "Senior administrator",
    "createdAt": "2026-01-15T08:00:00.000Z",
    "updatedAt": "2026-01-20T10:30:00.000Z",
    "user": {
      "id": 15,
      "email": "john.doe@specialnest.com",
      "mobileNumber": "+919876543210",
      "role": "super_admin",
      "isFirstLogin": false,
      "createdAt": "2026-01-15T08:00:00.000Z"
    }
  }
}
```

**Error Responses:**
- `404 Not Found` - Super Admin not found

---

### 4. Update Super Admin

**Endpoint:** `PUT /super-admin/:id`

**Description:** Updates an existing super admin's information.

**Request Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**URL Parameters:**
- `id` (integer) - Super Admin ID

**Request Body (all fields optional):**
```json
{
  "fullName": "John Michael Doe",
  "email": "john.m.doe@specialnest.com",
  "phoneNumber": "+919876543211",
  "department": "Management",
  "permissions": [
    "manage_schools",
    "manage_school_admins",
    "manage_super_admins",
    "view_analytics"
  ],
  "isActive": true,
  "profilePhoto": "https://example.com/new-photo.jpg",
  "notes": "Promoted to senior management"
}
```

**Response (200 OK):**
```json
{
  "message": "Super Admin updated successfully",
  "superAdmin": {
    "id": 1,
    "userId": 15,
    "fullName": "John Michael Doe",
    "email": "john.m.doe@specialnest.com",
    "phoneNumber": "+919876543211",
    "department": "Management",
    "permissions": [
      "manage_schools",
      "manage_school_admins",
      "manage_super_admins",
      "view_analytics"
    ],
    "isActive": true,
    "lastLogin": "2026-01-20T10:30:00.000Z",
    "profilePhoto": "https://example.com/new-photo.jpg",
    "notes": "Promoted to senior management",
    "createdAt": "2026-01-15T08:00:00.000Z",
    "updatedAt": "2026-01-20T14:00:00.000Z"
  }
}
```

**Error Responses:**
- `404 Not Found` - Super Admin not found

---

### 5. Delete Super Admin

**Endpoint:** `DELETE /super-admin/:id`

**Description:** Deletes a super admin and their associated user account.

**Request Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `id` (integer) - Super Admin ID

**Response (200 OK):**
```json
{
  "message": "Super Admin deleted successfully"
}
```

**Error Responses:**
- `404 Not Found` - Super Admin not found

---

## School Admin Endpoints

### 1. Create School Admin

**Endpoint:** `POST /school-admin/create`

**Description:** Creates a new school admin account associated with a specific school.

**Request Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "schoolId": 5,
  "fullName": "Jane Smith",
  "email": "jane.smith@school.com",
  "phoneNumber": "+919123456789",
  "password": "SecurePassword123!",
  "designation": "Principal",
  "permissions": [
    "manage_school_details",
    "manage_services",
    "view_bookings"
  ],
  "profilePhoto": "https://example.com/jane-photo.jpg",
  "joiningDate": "2026-01-01",
  "notes": "Experienced principal with 15 years in education"
}
```

**Required Fields:**
- `schoolId` (integer)
- `fullName` (string)
- `email` (string, must be valid email)
- `phoneNumber` (string)
- `password` (string, min 6 characters)

**Optional Fields:**
- `designation` (string, default: "Administrator")
- `permissions` (array of strings)
- `profilePhoto` (string, URL)
- `joiningDate` (date string)
- `notes` (string)

**Response (201 Created):**
```json
{
  "message": "School Admin created successfully",
  "schoolAdmin": {
    "id": 1,
    "userId": 20,
    "schoolId": 5,
    "fullName": "Jane Smith",
    "email": "jane.smith@school.com",
    "phoneNumber": "+919123456789",
    "designation": "Principal",
    "permissions": [
      "manage_school_details",
      "manage_services",
      "view_bookings"
    ],
    "isActive": true
  }
}
```

**Error Responses:**
- `400 Bad Request` - Missing required fields or email already exists
- `404 Not Found` - School not found
- `500 Internal Server Error` - Server error

---

### 2. Get All School Admins

**Endpoint:** `GET /school-admin/list`

**Description:** Retrieves a list of all school admins, optionally filtered by school.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `schoolId` (integer, optional) - Filter by specific school

**Example:** `GET /school-admin/list?schoolId=5`

**Response (200 OK):**
```json
{
  "count": 1,
  "schoolAdmins": [
    {
      "id": 1,
      "userId": 20,
      "schoolId": 5,
      "fullName": "Jane Smith",
      "email": "jane.smith@school.com",
      "phoneNumber": "+919123456789",
      "designation": "Principal",
      "permissions": ["manage_school_details", "manage_services"],
      "isActive": true,
      "lastLogin": "2026-01-20T09:00:00.000Z",
      "profilePhoto": "https://example.com/jane-photo.jpg",
      "joiningDate": "2026-01-01T00:00:00.000Z",
      "notes": "Experienced principal",
      "createdAt": "2026-01-10T08:00:00.000Z",
      "updatedAt": "2026-01-20T09:00:00.000Z",
      "user": {
        "id": 20,
        "email": "jane.smith@school.com",
        "mobileNumber": "+919123456789",
        "role": "school_admin",
        "isFirstLogin": false,
        "createdAt": "2026-01-10T08:00:00.000Z"
      },
      "school": {
        "id": 5,
        "name": "Sunshine Special School",
        "city": "Mumbai",
        "address": "123 Main Street, Mumbai"
      }
    }
  ]
}
```

---

### 3. Get School Admin by ID

**Endpoint:** `GET /school-admin/:id`

**Description:** Retrieves a specific school admin by their ID.

**Request Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `id` (integer) - School Admin ID

**Response (200 OK):**
```json
{
  "schoolAdmin": {
    "id": 1,
    "userId": 20,
    "schoolId": 5,
    "fullName": "Jane Smith",
    "email": "jane.smith@school.com",
    "phoneNumber": "+919123456789",
    "designation": "Principal",
    "permissions": ["manage_school_details", "manage_services"],
    "isActive": true,
    "lastLogin": "2026-01-20T09:00:00.000Z",
    "profilePhoto": "https://example.com/jane-photo.jpg",
    "joiningDate": "2026-01-01T00:00:00.000Z",
    "notes": "Experienced principal",
    "createdAt": "2026-01-10T08:00:00.000Z",
    "updatedAt": "2026-01-20T09:00:00.000Z",
    "user": {
      "id": 20,
      "email": "jane.smith@school.com",
      "mobileNumber": "+919123456789",
      "role": "school_admin",
      "isFirstLogin": false,
      "createdAt": "2026-01-10T08:00:00.000Z"
    },
    "school": {
      "id": 5,
      "name": "Sunshine Special School",
      "city": "Mumbai",
      "address": "123 Main Street, Mumbai",
      "logoUrl": "https://example.com/school-logo.jpg"
    }
  }
}
```

**Error Responses:**
- `404 Not Found` - School Admin not found

---

### 4. Update School Admin

**Endpoint:** `PUT /school-admin/:id`

**Description:** Updates an existing school admin's information.

**Request Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**URL Parameters:**
- `id` (integer) - School Admin ID

**Request Body (all fields optional):**
```json
{
  "fullName": "Jane Marie Smith",
  "email": "jane.m.smith@school.com",
  "phoneNumber": "+919123456790",
  "designation": "Senior Principal",
  "permissions": [
    "manage_school_details",
    "manage_services",
    "manage_schedules",
    "view_bookings",
    "view_analytics"
  ],
  "isActive": true,
  "profilePhoto": "https://example.com/jane-new-photo.jpg",
  "notes": "Promoted to senior principal"
}
```

**Response (200 OK):**
```json
{
  "message": "School Admin updated successfully",
  "schoolAdmin": {
    "id": 1,
    "userId": 20,
    "schoolId": 5,
    "fullName": "Jane Marie Smith",
    "email": "jane.m.smith@school.com",
    "phoneNumber": "+919123456790",
    "designation": "Senior Principal",
    "permissions": [
      "manage_school_details",
      "manage_services",
      "manage_schedules",
      "view_bookings",
      "view_analytics"
    ],
    "isActive": true,
    "lastLogin": "2026-01-20T09:00:00.000Z",
    "profilePhoto": "https://example.com/jane-new-photo.jpg",
    "joiningDate": "2026-01-01T00:00:00.000Z",
    "notes": "Promoted to senior principal",
    "createdAt": "2026-01-10T08:00:00.000Z",
    "updatedAt": "2026-01-20T15:00:00.000Z"
  }
}
```

**Error Responses:**
- `404 Not Found` - School Admin not found

---

### 5. Delete School Admin

**Endpoint:** `DELETE /school-admin/:id`

**Description:** Deletes a school admin and their associated user account.

**Request Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `id` (integer) - School Admin ID

**Response (200 OK):**
```json
{
  "message": "School Admin deleted successfully"
}
```

**Error Responses:**
- `404 Not Found` - School Admin not found

---

## Utility Endpoints

### Update Last Login

**Endpoint:** `POST /update-last-login`

**Description:** Updates the last login timestamp for an admin.

**Request Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": 15,
  "role": "super_admin"
}
```

**Response (200 OK):**
```json
{
  "message": "Last login updated successfully"
}
```

---

## Testing with cURL

### Create Super Admin
```bash
curl -X POST http://localhost:3000/api/admin-management/super-admin/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john.doe@specialnest.com",
    "phoneNumber": "+919876543210",
    "password": "SecurePassword123!",
    "department": "Operations"
  }'
```

### Create School Admin
```bash
curl -X POST http://localhost:3000/api/admin-management/school-admin/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "schoolId": 5,
    "fullName": "Jane Smith",
    "email": "jane.smith@school.com",
    "phoneNumber": "+919123456789",
    "password": "SecurePassword123!",
    "designation": "Principal"
  }'
```

### Get All Super Admins
```bash
curl -X GET http://localhost:3000/api/admin-management/super-admin/list \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get School Admins for a Specific School
```bash
curl -X GET "http://localhost:3000/api/admin-management/school-admin/list?schoolId=5" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Permission System

### Super Admin Permissions
- `manage_schools` - Create, update, delete schools
- `manage_school_admins` - Create, update, delete school admins
- `manage_super_admins` - Create, update, delete super admins
- `view_analytics` - View system-wide analytics
- `manage_bookings` - Manage all bookings
- `manage_parents` - Manage parent accounts
- `system_settings` - Modify system settings

### School Admin Permissions
- `manage_school_details` - Update school information
- `manage_services` - Create, update, delete services
- `manage_schedules` - Manage school schedules
- `view_bookings` - View bookings for their school
- `manage_slots` - Manage time slots
- `view_analytics` - View school-specific analytics

---

## Notes

1. **Authentication Required**: All endpoints require a valid JWT token in the Authorization header
2. **Role-Based Access**: In production, add middleware to restrict endpoints based on user roles
3. **Password Security**: Passwords are hashed using bcrypt before storage
4. **Cascade Delete**: Deleting a user will automatically delete their admin profile
5. **Unique Constraints**: Email and phone numbers must be unique across all users
6. **Default Values**: Permissions and other optional fields have sensible defaults

---

## Error Handling

All endpoints follow a consistent error response format:

```json
{
  "error": "Error message",
  "details": "Detailed error information (in development mode)"
}
```

Common HTTP status codes:
- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error
