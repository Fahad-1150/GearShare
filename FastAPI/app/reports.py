from fastapi import APIRouter, HTTPException, Header
from psycopg2.extras import RealDictCursor
from .database import get_db
from .schemas import ReportCreate, ReportUpdate, ReportResponse

router = APIRouter()


# CREATE a new report
@router.post("/", response_model=ReportResponse)
def create_report(
    report: ReportCreate,
    reporter_username: str = Header(None, convert_underscores=False)
):
    """Create a new report"""
    if not reporter_username:
        raise HTTPException(status_code=400, detail="reporter_username header is required")
    
    conn = get_db()
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("""
            INSERT INTO report (reporter_username, report_type, subject, description, 
                              equipment_id, reservation_id, priority)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING report_id, reporter_username, report_type, subject, description, 
                      equipment_id, reservation_id, status, priority, created_at
        """, (reporter_username, report.report_type, report.subject, report.description,
              report.equipment_id, report.reservation_id, report.priority or "medium"))
        
        new_report = cursor.fetchone()
        conn.commit()
        cursor.close()
        return new_report
    finally:
        conn.close()


# GET all reports
@router.get("/", response_model=list[ReportResponse])
def get_all_reports():
    """Get all reports"""
    conn = get_db()
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("""
            SELECT report_id, reporter_username, report_type, subject, description,
                   equipment_id, reservation_id, status, priority, created_at
            FROM report
        """)
        reports = cursor.fetchall()
        cursor.close()
        return reports
    finally:
        conn.close()


# GET reports by status
@router.get("/status/{status}", response_model=list[ReportResponse])
def get_reports_by_status(status: str):
    """Get reports by status"""
    conn = get_db()
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("""
            SELECT report_id, reporter_username, report_type, subject, description,
                   equipment_id, reservation_id, status, priority, created_at
            FROM report
            WHERE status = %s
        """, (status,))
        reports = cursor.fetchall()
        cursor.close()
        return reports
    finally:
        conn.close()


# GET specific report
@router.get("/{report_id}", response_model=ReportResponse)
def get_report(report_id: int):
    """Get a specific report"""
    conn = get_db()
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("""
            SELECT report_id, reporter_username, report_type, subject, description,
                   equipment_id, reservation_id, status, priority, created_at
            FROM report
            WHERE report_id = %s
        """, (report_id,))
        report = cursor.fetchone()
        cursor.close()
        
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        
        return report
    finally:
        conn.close()


# UPDATE report
@router.put("/{report_id}", response_model=ReportResponse)
def update_report(report_id: int, report_update: ReportUpdate):
    """Update a report"""
    conn = get_db()
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute("""
            SELECT report_id FROM report
            WHERE report_id = %s
        """, (report_id,))
        
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Report not found")
        
        # Build update query
        updates = {}
        if report_update.status:
            updates['status'] = report_update.status
        if report_update.priority:
            updates['priority'] = report_update.priority
        
        if not updates:
            cursor.execute("""
                SELECT report_id, reporter_username, report_type, subject, description,
                       equipment_id, reservation_id, status, priority, created_at
                FROM report
                WHERE report_id = %s
            """, (report_id,))
            return cursor.fetchone()
        
        set_clauses = []
        values = []
        for field, value in updates.items():
            set_clauses.append(f"{field} = %s")
            values.append(value)
        
        values.append(report_id)
        
        query = f"""
            UPDATE report
            SET {', '.join(set_clauses)}
            WHERE report_id = %s
            RETURNING report_id, reporter_username, report_type, subject, description,
                     equipment_id, reservation_id, status, priority, created_at
        """
        
        cursor.execute(query, values)
        updated_report = cursor.fetchone()
        conn.commit()
        cursor.close()
        return updated_report
    finally:
        conn.close()


# DELETE report
@router.delete("/{report_id}")
def delete_report(report_id: int):
    """Delete a report"""
    conn = get_db()
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute("SELECT report_id FROM report WHERE report_id = %s", (report_id,))
        
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Report not found")
        
        cursor.execute("DELETE FROM report WHERE report_id = %s", (report_id,))
        conn.commit()
        cursor.close()
        
        return {"message": "Report deleted successfully"}
    finally:
        conn.close()


# GET report count
@router.get("/count")
def get_report_count():
    """Get total count of reports"""
    conn = get_db()
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("SELECT COUNT(*) as count FROM report")
        result = cursor.fetchone()
        cursor.close()
        return {"count": result['count']}
    finally:
        conn.close()
