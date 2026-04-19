-- ============================================================
-- TRADE PORT EA - Anti-Sharing Device Binding Migration
-- Run this on the eaconverter database via phpMyAdmin SQL tab
-- ============================================================

-- 1. Add device_id column: stores unique device fingerprint on first login
ALTER TABLE members
  ADD COLUMN device_id VARCHAR(64) DEFAULT NULL AFTER used;

-- 2. Add max_devices column: flexibility for premium tiers later (default 1)
ALTER TABLE members
  ADD COLUMN max_devices TINYINT(2) NOT NULL DEFAULT 1 AFTER device_id;

-- 3. Set expiry_date for all existing paid users who have NULL expiry
--    Give them 30 days from now (standard subscription cycle)
UPDATE members
  SET expiry_date = DATE_ADD(NOW(), INTERVAL 30 DAY)
  WHERE paid = 1 AND expiry_date IS NULL;

-- 4. Reset 'used' flag for all users so device binding can take over
--    (the old used=1 system is replaced by device_id binding)
UPDATE members
  SET used = 0, device_id = NULL
  WHERE 1=1;

-- 5. Add index on device_id for fast lookups
ALTER TABLE members
  ADD INDEX idx_device_id (device_id);

-- ============================================================
-- VERIFICATION: Run this after to confirm columns exist
-- SELECT id, email, paid, used, device_id, max_devices, expiry_date
-- FROM members LIMIT 5;
-- ============================================================
