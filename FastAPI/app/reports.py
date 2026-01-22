from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from .database import get_db
from .models import Report
from .schemas import ReportCreate, ReportUpdate, ReportResponse

router = APIRouter()


# CREATE a new report
@router.post("/", response_model=ReportResponse)
async def create_report(
    report: ReportCreate,
    reporter_username: str = Header(None, convert_underscores=False),
    db: AsyncSession = Depends(get_db)
):
    """Create a new report"""
    if not reporter_username:
        raise HTTPException(status_code=400, detail="reporter_username header is required")

    new_report = Report(
        reporter_username=reporter_username,
        report_type=report.report_type,
        subject=report.subject,
        description=report.description,
        equipment_id=report.equipment_id,
        reservation_id=report.reservation_id,
        priority=report.priority or "medium"
    )

    db.add(new_report)
    await db.commit()
    await db.refresh(new_report)

    return new_report


# GET all reports
@router.get("/", response_model=list[ReportResponse])
async def get_all_reports(db: AsyncSession = Depends(get_db)):
    """Get all reports"""
    result = await db.execute(select(Report))
    reports = result.scalars().all()
    return reports


# GET reports by status
@router.get("/status/{status}", response_model=list[ReportResponse])
async def get_reports_by_status(status: str, db: AsyncSession = Depends(get_db)):
    """Get reports by status"""
    result = await db.execute(select(Report).where(Report.status == status))
    reports = result.scalars().all()
    return reports


# GET specific report
@router.get("/{report_id}", response_model=ReportResponse)
async def get_report(report_id: int, db: AsyncSession = Depends(get_db)):
    """Get a specific report"""
    result = await db.execute(select(Report).where(Report.report_id == report_id))
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report


# UPDATE report
@router.put("/{report_id}", response_model=ReportResponse)
async def update_report(
    report_id: int,
    report_update: ReportUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update a report"""
    result = await db.execute(select(Report).where(Report.report_id == report_id))
    report = result.scalar_one_or_none()
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    if report_update.status:
        report.status = report_update.status
    if report_update.priority:
        report.priority = report_update.priority

    await db.commit()
    await db.refresh(report)
    return report


# DELETE report
@router.delete("/{report_id}")
async def delete_report(report_id: int, db: AsyncSession = Depends(get_db)):
    """Delete a report"""
    result = await db.execute(select(Report).where(Report.report_id == report_id))
    report = result.scalar_one_or_none()
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    await db.delete(report)
    await db.commit()
    return {"message": "Report deleted successfully"}


# GET report count
@router.get("/count")
async def get_report_count(db: AsyncSession = Depends(get_db)):
    """Get total count of reports"""
    result = await db.execute(select(Report))
    reports = result.scalars().all()
    return {"count": len(reports)}
