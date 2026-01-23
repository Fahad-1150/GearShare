# PostgreSQL Column Quoting Fix - Summary

## Problem
PostgreSQL automatically lowercases unquoted identifiers. The User table has mixed-case column names that require double quotes to preserve case:
- `"UserName_PK"` (with quotes) = correct
- `UserName_PK` (without quotes) = becomes `username_pk` = error

**Error Encountered:**
```
psycopg2.errors.UndefinedColumn: column "username_pk" does not exist
```

## Solution
Quote all mixed-case column names in SQL queries with double quotes (`"ColumnName"`).

## Files Fixed

### 1. `FastAPI/app/auth.py`
**User table columns affected:** `UserName_PK`, `Email`, `Password`, `Role`, `Location`, `VerificationStatus`, `CreatedAt`

**Fixed Sections:**

#### Signup endpoint - CHECK if user exists (Line 18-21)
```python
# BEFORE
SELECT UserName_PK FROM "User" WHERE Email = %s OR UserName_PK = %s

# AFTER
SELECT "UserName_PK" FROM "User" WHERE "Email" = %s OR "UserName_PK" = %s
```

#### Signup endpoint - INSERT new user (Line 30-33)
```python
# BEFORE
INSERT INTO "User" (UserName_PK, Email, Password, Location)
VALUES (%s, %s, %s, %s)
RETURNING UserName_PK, Email, Role, Location, VerificationStatus, "CreatedAt"

# AFTER
INSERT INTO "User" ("UserName_PK", "Email", "Password", "Location")
VALUES (%s, %s, %s, %s)
RETURNING "UserName_PK", "Email", "Role", "Location", "VerificationStatus", "CreatedAt"
```

#### Login endpoint - SELECT user (Line 65-68)
```python
# BEFORE
SELECT UserName_PK, Email, Password, Role, Location, "CreatedAt"
FROM "User"
WHERE Email = %s

# AFTER
SELECT "UserName_PK", "Email", "Password", "Role", "Location", "CreatedAt"
FROM "User"
WHERE "Email" = %s
```

#### Dictionary accesses (Lines 40-41, 48-52, 80-84)
Dictionary keys from `RealDictCursor` work without quotes:
```python
new_user["UserName_PK"]  # ✓ Correct
new_user['Email']        # ✓ Correct (single or double quotes work)
```

### 2. `FastAPI/app/users.py`
**User table columns affected:** `UserName_PK`, `Email`, `Role`, `Location`, `VerificationStatus`, `CreatedAt`

**Fixed Sections:**

#### GET all users (Line 17-20)
```python
# BEFORE
SELECT UserName_PK, Email, Role, Location, VerificationStatus, "CreatedAt" FROM "User"

# AFTER
SELECT "UserName_PK", "Email", "Role", "Location", "VerificationStatus", "CreatedAt" FROM "User"
```

#### GET specific user (Line 53-56)
```python
# BEFORE
SELECT UserName_PK, Email, Role, Location, VerificationStatus, "CreatedAt"
FROM "User"
WHERE UserName_PK = %s

# AFTER
SELECT "UserName_PK", "Email", "Role", "Location", "VerificationStatus", "CreatedAt"
FROM "User"
WHERE "UserName_PK" = %s
```

## Files Checked (No Changes Needed)
- `equipment.py` - Uses lowercase columns: `equipment_id`, `owner_username`, `pickup_location`, etc.
- `review.py` - Uses lowercase columns
- `reports.py` - Uses lowercase columns
- `reservation.py` - Uses lowercase columns

## Key Takeaways

1. **PostgreSQL Identifier Rules:**
   - Unquoted identifiers → folded to lowercase
   - Quoted identifiers → preserve case
   - Must match database schema exactly

2. **Solution Pattern:**
   ```python
   # ✓ CORRECT - All columns quoted
   SELECT "UserName_PK", "Email" FROM "User" WHERE "Email" = %s
   
   # ✗ WRONG - Missing quotes on columns
   SELECT UserName_PK, Email FROM "User" WHERE Email = %s
   ```

3. **Dictionary Access:**
   - RealDictCursor returns keys without quotes
   - Use: `result['UserName_PK']` or `result["UserName_PK"]` (both work)
   - NOT: `result['"UserName_PK"']` (incorrect - adds extra quotes)

4. **When to Quote:**
   - Mixed-case column/table names: ALWAYS quote
   - Lowercase columns: Optional (both work), consistency matters
   - Reserved SQL keywords: ALWAYS quote
   - All: SELECT, INSERT, UPDATE, DELETE, WHERE, RETURNING clauses

## Testing Recommendations

1. Test signup endpoint with new user
2. Test login endpoint with registered user
3. Test GET /users endpoint (admin)
4. Test GET /users/{username} endpoint
5. Test all endpoints that return User table data

## Verification
All fixes have been applied to match the actual database schema defined in:
- `FastAPI/user_table.sql` - Shows all User table columns with mixed-case names
