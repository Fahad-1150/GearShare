-- Create the User table
CREATE TABLE "User" (
    "UserName_PK" VARCHAR(255) PRIMARY KEY,
    "Email" VARCHAR(255) UNIQUE NOT NULL,
    "Password" VARCHAR(255) NOT NULL,
    "Role" VARCHAR(50) DEFAULT 'User',
    "Location" TEXT,
    "VerificationStatus" BOOLEAN DEFAULT TRUE,
    "CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create an index on email for faster lookups
CREATE INDEX idx_user_email ON "User"("Email");

-- Create an index on role for filtering
CREATE INDEX idx_user_role ON "User"("Role");