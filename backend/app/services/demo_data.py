import uuid
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.models import (
    Investigation,
    EvidenceSource,
    EvidenceFile,
    Profile
)
from app.analysis.engine import AnalysisPipelineEngine

DEMO_INVESTIGATION_ID = "demo-campus-parking-001"
DEMO_USER_ID = "demo-investigator-001"

def seed_synthetic_demo_data(db: Session) -> Investigation:
    """
    Creates or re-seeds the complete 'Campus Parking Incident' synthetic demo dataset.
    Clearly marked as SYNTHETIC DEMO DATA.
    """
    # 1. Ensure Demo Profile exists
    demo_profile = db.query(Profile).filter(Profile.id == DEMO_USER_ID).first()
    if not demo_profile:
        demo_profile = Profile(
            id=DEMO_USER_ID,
            email="investigator@trace-x.ai",
            full_name="Dr. Alex Rivera",
            organization="TRACE-X Campus Safety Intelligence",
            role="Senior Forensic Analyst",
            avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
        )
        db.add(demo_profile)
        db.commit()

    # 2. Check if demo investigation already exists
    investigation = db.query(Investigation).filter(Investigation.id == DEMO_INVESTIGATION_ID).first()
    if investigation:
        # Delete previous demo to allow fresh re-seeding
        db.delete(investigation)
        db.commit()

    investigation = Investigation(
        id=DEMO_INVESTIGATION_ID,
        user_id=DEMO_USER_ID,
        title="Campus Parking Incident (SYNTHETIC DEMO DATA)",
        description=(
            "SYNTHETIC DEMONSTRATION DATA: Reconstructing unmonitored transit and security events "
            "around North Parking Lot Bay 14 and Building B perimeter. Features CCTV, GPS, access logs, "
            "and motion telemetry."
        ),
        domain="Campus Safety",
        status="ACTIVE",
        is_synthetic_demo=True,
        created_at=datetime.utcnow()
    )
    db.add(investigation)
    db.commit()

    # 3. Create Multi-Modal Evidence Sources
    sources_data = [
        {
            "name": "Camera A - North Entrance",
            "category": "CCTV",
            "description": "High-definition fixed PTZ surveillance camera covering North walkway and entrance barrier.",
            "location": "North Parking Gate - Zone 1",
            "coverage": "10:00:00 - 10:15:00"
        },
        {
            "name": "Camera B - Row B Perimeter",
            "category": "CCTV",
            "description": "Wall-mounted CCTV covering parking rows A & B with known blind-spot behind concrete retaining wall.",
            "location": "Parking Bay 14 & Service Gate",
            "coverage": "10:00:00 - 10:15:00"
        },
        {
            "name": "Camera C - Building B Stairwell",
            "category": "CCTV",
            "description": "Corridor exterior camera monitoring access stairs and side pedestrian door.",
            "location": "Building B - East Stairwell Access",
            "coverage": "10:00:00 - 10:15:00"
        },
        {
            "name": "Service Van 7X-882 Telematics",
            "category": "GPS",
            "description": "Vehicle on-board GPS receiver, CAN-bus door latch monitor, and vibration sensor.",
            "location": "Parked in Bay 14",
            "coverage": "Continuous 1Hz Telemetry"
        },
        {
            "name": "Gate 2 Access Control Reader",
            "category": "Access Control",
            "description": "RFID badge terminal and magnetic lock sensor for restricted utility entrance.",
            "location": "Restricted Service Gate #2",
            "coverage": "Event-driven 10:00:00 - 10:15:00"
        },
        {
            "name": "Perimeter Motion Sensor MS-04",
            "category": "Sensor",
            "description": "Passive infrared and microphonic ground-vibration fence sensor.",
            "location": "East Perimeter Fence Line",
            "coverage": "Continuous 10:00:00 - 10:15:00"
        }
    ]

    source_records = []
    for s_info in sources_data:
        src = EvidenceSource(
            id=str(uuid.uuid4()),
            investigation_id=DEMO_INVESTIGATION_ID,
            name=s_info["name"],
            source_category=s_info["category"],
            description=s_info["description"],
            location=s_info["location"],
            coverage_time_window=s_info["coverage"]
        )
        db.add(src)
        source_records.append(src)
    
    db.commit()

    # 4. Create Evidence Files (Synthetic Logs, Video clips, Sensor CSVs)
    files_data = [
        {
            "name": "CAM_A_20260924_100200_100230.mp4",
            "type": "video",
            "timestamp": "10:02:11",
            "location": "North Parking Gate - Zone 1",
            "source_id": source_records[0].id,
            "size": 14200000,
            "extracted_text": "Object recognition log: Person A detected entering frame at 10:02:11. Velocity 1.4 m/s. Dark hooded apparel, handheld object."
        },
        {
            "name": "CAM_B_20260924_100215_100220.mp4",
            "type": "video",
            "timestamp": "10:02:15",
            "location": "Parking Bay 14",
            "source_id": source_records[1].id,
            "size": 8900000,
            "extracted_text": "Subject reaches Row B bay 14 at 10:02:15. Moves towards blindspot behind retaining wall. Disappears from field of view at 10:02:18."
        },
        {
            "name": "GATE2_ACCESS_CONTROLLER_LOGS.json",
            "type": "json",
            "timestamp": "10:02:17",
            "location": "Restricted Service Gate #2",
            "source_id": source_records[4].id,
            "size": 4200,
            "extracted_text": "LOG_ENTRY: 10:02:17.140 UTC - Rel_Event_09: Auxiliary latch release detected. Status: OPEN. Method: Manual bypass trigger or magnetic pulse."
        },
        {
            "name": "VAN_7X882_CANBUS_TELEMETRY.csv",
            "type": "csv",
            "timestamp": "10:02:20",
            "location": "Bay 14 Service Van",
            "source_id": source_records[3].id,
            "size": 184000,
            "extracted_text": "TIME,LAT,LON,SPEED,REAR_DOOR_PIN,ACCEL_Z\n10:02:19,37.7749,-122.4194,0.0,CLOSED,0.01\n10:02:20,37.7749,-122.4194,0.0,PULSE_OPEN,0.48\n10:02:21,37.7749,-122.4194,0.0,CLOSED,0.02"
        },
        {
            "name": "CAM_C_20260924_100225_100240.mp4",
            "type": "video",
            "timestamp": "10:02:27",
            "location": "Building B - East Stairwell Access",
            "source_id": source_records[2].id,
            "size": 11300000,
            "extracted_text": "Person A detected walking rapidly up stairwell landing at 10:02:27. Approaches badge reader terminal B-1 at 10:02:34."
        },
        {
            "name": "BUILDING_B_BADGE_SWIPES.log",
            "type": "log",
            "timestamp": "10:02:34",
            "location": "Building B Side Entry Terminal",
            "source_id": source_records[4].id,
            "size": 3100,
            "extracted_text": "10:02:34.821 - [DENIED] Token #9041 not in active authorized whitelist for Sector 4. Facility code 0x8F mismatch."
        }
    ]

    for f_info in files_data:
        f_rec = EvidenceFile(
            id=str(uuid.uuid4()),
            investigation_id=DEMO_INVESTIGATION_ID,
            source_id=f_info["source_id"],
            name=f_info["name"],
            file_type=f_info["type"],
            file_path_or_url=f"/demo_assets/{f_info['name']}",
            file_size=f_info["size"],
            timestamp=f_info["timestamp"],
            location=f_info["location"],
            status="READY",
            extracted_text=f_info["extracted_text"]
        )
        db.add(f_rec)

    db.commit()

    # 5. Automatically run the full 12-step TRACE-X analysis pipeline on the demo investigation!
    engine = AnalysisPipelineEngine(db)
    engine.run_investigation_analysis(DEMO_INVESTIGATION_ID)

    return db.query(Investigation).filter(Investigation.id == DEMO_INVESTIGATION_ID).first()
