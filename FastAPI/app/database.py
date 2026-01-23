import psycopg2
from psycopg2.extras import RealDictCursor
import os

# Database connection parameters
DB_PARAMS = {
    'host': 'localhost',
    'database': 'GearShare',
    'user': 'postgres',
    'password': 'fdjm0881',
    'port': 5432
}

def get_db():
    """Create and return a database connection"""
    return psycopg2.connect(**DB_PARAMS)

def get_db_dict():
    """Create a database connection with RealDictCursor for dict results"""
    conn = psycopg2.connect(**DB_PARAMS)
    return conn, conn.cursor(cursor_factory=RealDictCursor)

