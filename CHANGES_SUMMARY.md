# PostgreSQL Column Quoting Fix - Complete Change Log

## Overview
Fixed `psycopg2.errors.UndefinedColumn: column "username_pk" does not exist` error by properly quoting mixed-case column names in PostgreSQL queries.

## Technical Background

**PostgreSQL Identifier Rules:**
- Unquoted identifiers like `UserName_PK` → automatically lowercased to `username_pk`
- Quoted identifiers like `"UserName_PK"` → case preserved exactly
- Our database has mixed-case columns, requiring quotes

**Error Pattern:**
```sql
-- ❌ WRONG - causes: column "username_pk" does not exist
SELECT UserName_PK FROM "User" WHERE Email = %s

-- ✅ CORRECT - works properly
SELECT "UserName_PK" FROM "User" WHERE "Email" = %s
```

---

## File Changes

### File 1: `FastAPI/app/auth.py`

#### Change 1: Signup endpoint - Check existing user (Line 18-21)
```diff
  cursor.execute("""
-     SELECT UserName_PK FROM "User"
-     WHERE Email = %s OR UserName_PK = %s
+     SELECT "UserName_PK" FROM "User"
+     WHERE "Email" = %s OR "UserName_PK" = %s
  """, (user.email, user.username))
```

#### Change 2: Signup endpoint - Insert new user (Line 30-33)
```diff
  cursor.execute("""
-     INSERT INTO "User" (UserName_PK, Email, Password, Location)
+     INSERT INTO "User" ("UserName_PK", "Email", "Password", "Location")
      VALUES (%s, %s, %s, %s)
-     RETURNING UserName_PK, Email, Role, Location, VerificationStatus, "CreatedAt"
+     RETURNING "UserName_PK", "Email", "Role", "Location", "VerificationStatus", "CreatedAt"
  """, (user.username, user.email, user.password, user.location))
```

#### Change 3: Login endpoint - Select user (Line 65-68)
```diff
  cursor.execute("""
-     SELECT UserName_PK, Email, Password, Role, Location, "CreatedAt"
+     SELECT "UserName_PK", "Email", "Password", "Role", "Location", "CreatedAt"
      FROM "User"
-     WHERE Email = %s
+     WHERE "Email" = %s
  """, (user.email,))
```

#### Change 4: Dictionary key access - Signup response (Line 40-41)
```diff
  token = create_access_token({
-     "sub": new_user['UserName_PK'],
-     "role": new_user['Role']
+     "sub": new_user["UserName_PK"],
+     "role": new_user["Role"]
  })
```
*Note: Dictionary keys don't need quotes, but consistent quote style improves readability*

---

### File 2: `FastAPI/app/users.py`

#### Change 1: GET all users (Line 17-19)
```diff
  cursor.execute("""
-     SELECT UserName_PK, Email, Role, Location, VerificationStatus, "CreatedAt"
+     SELECT "UserName_PK", "Email", "Role", "Location", "VerificationStatus", "CreatedAt"
      FROM "User"
  """)
```

#### Change 2: GET user by username (Line 53-56)
```diff
  cursor.execute("""
-     SELECT UserName_PK, Email, Role, Location, VerificationStatus, "CreatedAt"
+     SELECT "UserName_PK", "Email", "Role", "Location", "VerificationStatus", "CreatedAt"
      FROM "User"
-     WHERE UserName_PK = %s
+     WHERE "UserName_PK" = %s
  """, (username,))
```

---

## Affected Column Names (All Fixed)

| Column Name | Type | Usage |
|-------------|------|-------|
| `"UserName_PK"` | Primary Key | Auth, Users endpoints |
| `"Email"` | VARCHAR(255) UNIQUE | Auth, Users endpoints |
| `"Password"` | VARCHAR(255) | Auth (login) |
| `"Role"` | VARCHAR(50) | Auth, Users endpoints |
| `"Location"` | TEXT | Auth, Users endpoints |
| `"VerificationStatus"` | BOOLEAN | Users endpoints |
| `"CreatedAt"` | TIMESTAMP | Auth, Users endpoints |

---

## Files NOT Modified (Already Correct)

- **equipment.py** - Uses lowercase columns: `equipment_id`, `owner_username`, `pickup_location`, `status`, `booked_till`, `rating_avg`
- **review.py** - Uses lowercase columns: `review_id`, `reviewer_username`, `equipment_id`, `rating`, `comments`, `created_at`
- **reservation.py** - Uses lowercase columns: `reservation_id`, `equipment_id`, `user_username`, `start_date`, `end_date`, `daily_rate`, `total_cost`, `status`
- **reports.py** - Uses lowercase columns: `report_id`, `reporter_username`, `report_type`, `subject`, `description`, `equipment_id`, `reservation_id`, `status`, `priority`, `created_at`

---

## Verification Results

### Code Quality Checks
- ✅ All mixed-case User table column names quoted
- ✅ Dictionary key accesses correct (without quotes)
- ✅ SQL parameterization preserved (`%s` placeholders)
- ✅ No SQL injection vulnerabilities introduced
- ✅ Other files not affected by changes

### Syntax Verification
- ✅ All Python files valid syntax
- ✅ All SQL queries valid PostgreSQL
- ✅ String escaping correct in all queries

---

## Summary of Changes

**Total Files Modified:** 2
- `FastAPI/app/auth.py` - 4 changes (1 SELECT, 1 INSERT, 1 SELECT, 1 dict access style)
- `FastAPI/app/users.py` - 2 changes (2 SELECT statements)

**Total Changes:** 6 replacements
**Lines Affected:** ~20 lines total
**Backwards Compatibility:** ✅ Yes - Only fixes broken queries

**Result:** Application now correctly handles PostgreSQL's case-sensitive identifier requirements for mixed-case column names.

