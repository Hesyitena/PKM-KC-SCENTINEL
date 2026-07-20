"""
SCENTINEL - CSV Export Utility
Generates CSV string from list of SensorReading objects.
"""
import csv
import io
from app.models.reading import SensorReading


def generate_csv_content(readings: list[SensorReading]) -> str:
    """Convert a list of SensorReading objects to a CSV string."""
    output = io.StringIO()
    fieldnames = [
        "id", "timestamp",
        "mq3", "mq4", "mq135", "tgs2602",
        "temperature", "humidity",
        "prediction", "confidence",
    ]
    writer = csv.DictWriter(output, fieldnames=fieldnames)
    writer.writeheader()

    for r in readings:
        writer.writerow({
            "id": r.id,
            "timestamp": r.timestamp.isoformat() if r.timestamp else "",

            "mq3": r.mq3,
            "mq4": r.mq4,
            "mq135": r.mq135,
            "tgs2602": r.tgs2602,
            "temperature": r.temperature,
            "humidity": r.humidity,
            "prediction": r.prediction.value if r.prediction else "",
            "confidence": f"{r.confidence:.4f}",
        })

    return output.getvalue()
