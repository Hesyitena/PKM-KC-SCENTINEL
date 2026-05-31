"""
SCENTINEL - Application Constants
"""

# Device heartbeat timeout: if no reading in this many seconds → OFFLINE
DEVICE_OFFLINE_THRESHOLD_SECONDS = 120

# Prediction labels (mirror enum values)
PREDICTION_LAYAK = "LAYAK"
PREDICTION_TIDAK_LAYAK = "TIDAK LAYAK"

# Default pagination
DEFAULT_PAGE_LIMIT = 50
MAX_PAGE_LIMIT = 500

# CSV export filename
CSV_EXPORT_FILENAME = "scentinel_readings.csv"

# SSE keepalive interval (seconds)
SSE_KEEPALIVE_INTERVAL = 15
