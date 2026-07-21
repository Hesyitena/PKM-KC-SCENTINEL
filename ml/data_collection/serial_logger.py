#!/usr/bin/env python3
"""
SCENTINEL - Serial Data Logger
================================
Membaca data CSV dari ESP32 via Serial dan menyimpan ke file dataset.

Cara pakai:
    pip install pyserial
    python serial_logger.py --port /dev/ttyUSB0 --output ../datasets/raw_data.csv

Argumen:
    --port   : Port serial ESP32 (default: /dev/ttyUSB0)
    --baud   : Baud rate (default: 115200)
    --output : File output CSV (default: ../datasets/raw_data.csv)
    --append : Tambahkan ke file yang sudah ada (default: overwrite)
"""

import argparse
import csv
import os
import sys
import time
from datetime import datetime
from pathlib import Path

try:
    import serial
    import serial.tools.list_ports
except ImportError:
    print("[ERROR] pyserial tidak ditemukan. Install dengan: pip install pyserial")
    sys.exit(1)


# ============================================================
# KONFIGURASI
# ============================================================
EXPECTED_COLUMNS = [
    "timestamp_ms", "label",
    "mq3_raw", "mq4_raw", "mq135_raw", "tgs2602_raw",
    "temperature_c", "humidity_pct", "sample_id"
]

VALID_LABELS = {"LAYAK", "TIDAK_LAYAK"}


# ============================================================
# FUNGSI UTILITAS
# ============================================================
def list_available_ports():
    """Tampilkan semua port serial yang tersedia."""
    ports = serial.tools.list_ports.comports()
    if not ports:
        print("[INFO] Tidak ada port serial yang ditemukan.")
        return []
    
    print("[INFO] Port serial yang tersedia:")
    for p in ports:
        print(f"  - {p.device}: {p.description}")
    return [p.device for p in ports]


def validate_row(row: dict) -> tuple[bool, str]:
    """Validasi satu baris data sensor."""
    # Cek label
    if row.get("label") not in VALID_LABELS:
        return False, f"Label tidak valid: {row.get('label')}"
    
    # Cek nilai ADC (0–4095)
    for col in ["mq3_raw", "mq4_raw", "mq135_raw", "tgs2602_raw"]:
        try:
            val = int(row.get(col, -1))
            if not (0 <= val <= 4095):
                return False, f"{col}={val} di luar range ADC (0-4095)"
        except (ValueError, TypeError):
            return False, f"{col} bukan angka valid"
    
    # Cek suhu & kelembapan
    try:
        temp = float(row.get("temperature_c", "NaN"))
        if not (-40 <= temp <= 80):
            return False, f"Suhu tidak realistis: {temp}"
    except ValueError:
        return False, "Suhu bukan angka valid"
    
    try:
        hum = float(row.get("humidity_pct", "NaN"))
        if not (0 <= hum <= 100):
            return False, f"Kelembapan tidak valid: {hum}"
    except ValueError:
        return False, "Kelembapan bukan angka valid"
    
    return True, "OK"


def print_stats(stats: dict):
    """Tampilkan statistik pengambilan data."""
    total = stats["total"]
    valid = stats["valid"]
    skipped = stats["skipped"]
    
    print("\n" + "=" * 50)
    print("  STATISTIK PENGAMBILAN DATA")
    print("=" * 50)
    print(f"  Total baris diterima : {total}")
    print(f"  Baris valid          : {valid}")
    print(f"  Baris dilewati       : {skipped}")
    
    if stats["by_label"]:
        print("\n  Distribusi per label:")
        for label, count in stats["by_label"].items():
            print(f"    - {label:15s}: {count} sampel")
    

    
    print("=" * 50)


# ============================================================
# KELAS LOGGER
# ============================================================
class ScentinelLogger:
    def __init__(self, port: str, baud: int, output_path: str, append: bool = False):
        self.port = port
        self.baud = baud
        self.output_path = Path(output_path)
        self.append = append
        self.ser = None
        self.writer = None
        self.file = None
        
        self.stats = {
            "total": 0,
            "valid": 0,
            "skipped": 0,
            "by_label": {}
        }
    
    def connect(self) -> bool:
        """Buka koneksi Serial."""
        try:
            self.ser = serial.Serial(
                port=self.port,
                baudrate=self.baud,
                timeout=2.0,
                bytesize=serial.EIGHTBITS,
                parity=serial.PARITY_NONE,
                stopbits=serial.STOPBITS_ONE
            )
            print(f"[OK] Terhubung ke {self.port} @ {self.baud} baud")
            return True
        except serial.SerialException as e:
            print(f"[ERROR] Gagal membuka port {self.port}: {e}")
            return False
    
    def open_output(self) -> bool:
        """Buka file output CSV."""
        self.output_path.parent.mkdir(parents=True, exist_ok=True)
        
        mode = "a" if self.append and self.output_path.exists() else "w"
        write_header = (mode == "w") or not self.output_path.exists()
        
        try:
            self.file = open(self.output_path, mode, newline="", encoding="utf-8")
            self.writer = csv.DictWriter(self.file, fieldnames=EXPECTED_COLUMNS)
            
            if write_header:
                self.writer.writeheader()
                print(f"[OK] File baru: {self.output_path}")
            else:
                print(f"[OK] Append ke file: {self.output_path}")
            
            return True
        except IOError as e:
            print(f"[ERROR] Gagal membuka file output: {e}")
            return False
    
    def process_line(self, line: str):
        """Proses satu baris dari Serial."""
        line = line.strip()
        
        # Skip komentar dan baris kosong
        if not line or line.startswith("#"):
            if line.startswith("#"):
                print(f"[ESP32] {line}")
            return
        
        # Skip header CSV dari ESP32
        if line.startswith("timestamp_ms"):
            return
        
        self.stats["total"] += 1
        
        # Parse CSV
        parts = line.split(",")
        if len(parts) != len(EXPECTED_COLUMNS):
            print(f"[WARN] Kolom tidak sesuai ({len(parts)} vs {len(EXPECTED_COLUMNS)}): {line}")
            self.stats["skipped"] += 1
            return
        
        row = dict(zip(EXPECTED_COLUMNS, parts))
        
        # Validasi
        is_valid, reason = validate_row(row)
        if not is_valid:
            print(f"[WARN] Data tidak valid ({reason}): {line}")
            self.stats["skipped"] += 1
            return
        
        # Tulis ke CSV
        self.writer.writerow(row)
        self.file.flush()
        self.stats["valid"] += 1
        
        # Update statistik
        label = row["label"]
        self.stats["by_label"][label] = self.stats["by_label"].get(label, 0) + 1
        
        # Tampilkan progress
        print(
            f"| {label:12s} | "
            f"MQ3={row['mq3_raw']:4s} MQ4={row['mq4_raw']:4s} "
            f"MQ135={row['mq135_raw']:4s} TGS={row['tgs2602_raw']:4s} | "
            f"T={row['temperature_c']}°C H={row['humidity_pct']}%"
        )
    
    def run(self):
        """Loop utama logging."""
        print("\n[INFO] Mulai logging... Tekan Ctrl+C untuk berhenti.\n")
        
        try:
            while True:
                try:
                    raw = self.ser.readline()
                    if raw:
                        line = raw.decode("utf-8", errors="replace")
                        self.process_line(line)
                except serial.SerialException as e:
                    print(f"\n[ERROR] Serial error: {e}")
                    break
                except UnicodeDecodeError:
                    pass
        except KeyboardInterrupt:
            print("\n\n[INFO] Logging dihentikan oleh pengguna.")
        finally:
            self.cleanup()
    
    def cleanup(self):
        """Tutup koneksi dan file."""
        if self.ser and self.ser.is_open:
            self.ser.close()
            print("[OK] Port serial ditutup.")
        
        if self.file:
            self.file.close()
            print(f"[OK] File disimpan: {self.output_path}")
        
        print_stats(self.stats)


# ============================================================
# MAIN
# ============================================================
def main():
    parser = argparse.ArgumentParser(
        description="SCENTINEL Serial Data Logger - Logging sensor ESP32 ke CSV"
    )
    parser.add_argument(
        "--port", "-p",
        default=None,
        help="Port serial ESP32 (contoh: /dev/ttyUSB0 atau COM3)"
    )
    parser.add_argument(
        "--baud", "-b",
        type=int,
        default=115200,
        help="Baud rate (default: 115200)"
    )
    parser.add_argument(
        "--output", "-o",
        default="../datasets/raw_data.csv",
        help="Path file output CSV (default: ../datasets/raw_data.csv)"
    )
    parser.add_argument(
        "--append", "-a",
        action="store_true",
        help="Tambahkan ke file yang sudah ada (default: timpa)"
    )
    parser.add_argument(
        "--list-ports",
        action="store_true",
        help="Tampilkan daftar port serial yang tersedia"
    )
    
    args = parser.parse_args()
    
    # List ports jika diminta
    if args.list_ports:
        list_available_ports()
        return
    
    # Auto-detect port jika tidak dispesifikasikan
    if args.port is None:
        available = list_available_ports()
        if not available:
            print("[ERROR] Tidak ada port yang tersedia. Sambungkan ESP32 terlebih dahulu.")
            sys.exit(1)
        if len(available) == 1:
            args.port = available[0]
            print(f"[INFO] Auto-pilih port: {args.port}")
        else:
            print("[INFO] Tersedia beberapa port. Gunakan --port untuk memilih.")
            sys.exit(1)
    
    print("=" * 50)
    print("  SCENTINEL - Serial Data Logger")
    print("=" * 50)
    print(f"  Port   : {args.port}")
    print(f"  Baud   : {args.baud}")
    print(f"  Output : {args.output}")
    print(f"  Mode   : {'Append' if args.append else 'Overwrite'}")
    print("=" * 50)
    
    logger = ScentinelLogger(args.port, args.baud, args.output, args.append)
    
    if not logger.connect():
        sys.exit(1)
    
    if not logger.open_output():
        sys.exit(1)
    
    logger.run()


if __name__ == "__main__":
    main()
