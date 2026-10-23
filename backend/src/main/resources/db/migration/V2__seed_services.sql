-- ===================================================================
-- SMART DIGITAL LICENSING PLATFORM - FLYWAY SEED DATA (V2)
-- Representative services: Driving License and Trade License
-- Uses relational lookups to ensure pure ANSI & PostgreSQL portability
-- ===================================================================

-- 1. Seed Departments
INSERT INTO departments (code, name, description) VALUES
('DEPT_TRANSPORT', 'Department of Transport', 'Handles vehicular licensing, permits, and driver registrations.'),
('DEPT_MUNICIPAL', 'Municipal Administration & Urban Development', 'Handles trade licenses, local business registrations, and urban permits.');

-- 2. Seed Services
INSERT INTO services (code, name, description, department_id, is_active, sample_fee, processing_time_days)
SELECT 'SRV_DRIVING_LICENSE', 'Learner & Permanent Driving License', 'Apply for a non-commercial or commercial vehicle driving license.', id, TRUE, 500.00, 14
FROM departments WHERE code = 'DEPT_TRANSPORT';

INSERT INTO services (code, name, description, department_id, is_active, sample_fee, processing_time_days)
SELECT 'SRV_TRADE_LICENSE', 'Municipal Trade & Business License', 'Register a new commercial business, shop, or trade establishment within municipal limits.', id, TRUE, 1200.00, 7
FROM departments WHERE code = 'DEPT_MUNICIPAL';

-- 3. Seed Form Fields for Driving License (SRV_DRIVING_LICENSE)
INSERT INTO service_fields (service_id, field_key, label_en, label_te, data_type, is_required, validation_rules, options_json, display_order)
SELECT id, 'fullName', 'Full Name (as per ID proof)', 'పూర్తి పేరు (గుర్తింపు కార్డు ప్రకారం)', 'TEXT', TRUE, '{"minLength":3,"maxLength":100}', NULL, 1
FROM services WHERE code = 'SRV_DRIVING_LICENSE';

INSERT INTO service_fields (service_id, field_key, label_en, label_te, data_type, is_required, validation_rules, options_json, display_order)
SELECT id, 'dateOfBirth', 'Date of Birth', 'పుట్టిన తేదీ', 'DATE', TRUE, '{"minAgeYears":18}', NULL, 2
FROM services WHERE code = 'SRV_DRIVING_LICENSE';

INSERT INTO service_fields (service_id, field_key, label_en, label_te, data_type, is_required, validation_rules, options_json, display_order)
SELECT id, 'bloodGroup', 'Blood Group', 'రక్త సమూహం', 'SELECT', TRUE, NULL, '["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]', 3
FROM services WHERE code = 'SRV_DRIVING_LICENSE';

INSERT INTO service_fields (service_id, field_key, label_en, label_te, data_type, is_required, validation_rules, options_json, display_order)
SELECT id, 'vehicleClass', 'Vehicle Class', 'వాహన తరగతి', 'SELECT', TRUE, NULL, '["Motorcycle without Gear (MCWOG)", "Motorcycle with Gear (MCWG)", "Light Motor Vehicle (LMV)"]', 4
FROM services WHERE code = 'SRV_DRIVING_LICENSE';

INSERT INTO service_fields (service_id, field_key, label_en, label_te, data_type, is_required, validation_rules, options_json, display_order)
SELECT id, 'aadhaarNumber', 'Aadhaar / National Identity Number', 'ఆధార్ సంఖ్య', 'TEXT', TRUE, '{"regex":"^[0-9]{12}$","formatDesc":"12 numeric digits"}', NULL, 5
FROM services WHERE code = 'SRV_DRIVING_LICENSE';

INSERT INTO service_fields (service_id, field_key, label_en, label_te, data_type, is_required, validation_rules, options_json, display_order)
SELECT id, 'residentialAddress', 'Permanent Address', 'శాశ్వత చిరునామా', 'TEXT', TRUE, '{"minLength":10,"maxLength":255}', NULL, 6
FROM services WHERE code = 'SRV_DRIVING_LICENSE';

-- 4. Seed Form Fields for Trade License (SRV_TRADE_LICENSE)
INSERT INTO service_fields (service_id, field_key, label_en, label_te, data_type, is_required, validation_rules, options_json, display_order)
SELECT id, 'businessName', 'Trade / Establishment Name', 'వ్యాపార / సంస్థ పేరు', 'TEXT', TRUE, '{"minLength":3,"maxLength":150}', NULL, 1
FROM services WHERE code = 'SRV_TRADE_LICENSE';

INSERT INTO service_fields (service_id, field_key, label_en, label_te, data_type, is_required, validation_rules, options_json, display_order)
SELECT id, 'ownerName', 'Proprietor / Managing Partner Name', 'యజమాని పేరు', 'TEXT', TRUE, '{"minLength":3,"maxLength":100}', NULL, 2
FROM services WHERE code = 'SRV_TRADE_LICENSE';

INSERT INTO service_fields (service_id, field_key, label_en, label_te, data_type, is_required, validation_rules, options_json, display_order)
SELECT id, 'tradeCategory', 'Category of Trade', 'వ్యాపార విభాగం', 'SELECT', TRUE, NULL, '["Retail Merchant", "Wholesale Trading", "Food & Hospitality", "Manufacturing & Assembly", "Services & Consulting"]', 3
FROM services WHERE code = 'SRV_TRADE_LICENSE';

INSERT INTO service_fields (service_id, field_key, label_en, label_te, data_type, is_required, validation_rules, options_json, display_order)
SELECT id, 'businessAddress', 'Business Premise Address', 'వ్యాపార చిరునామా', 'TEXT', TRUE, '{"minLength":10,"maxLength":255}', NULL, 4
FROM services WHERE code = 'SRV_TRADE_LICENSE';

INSERT INTO service_fields (service_id, field_key, label_en, label_te, data_type, is_required, validation_rules, options_json, display_order)
SELECT id, 'annualTurnover', 'Estimated Annual Turnover (INR)', 'వార్షిక టర్నోవర్ (రూ.)', 'NUMBER', FALSE, '{"min":0}', NULL, 5
FROM services WHERE code = 'SRV_TRADE_LICENSE';

INSERT INTO service_fields (service_id, field_key, label_en, label_te, data_type, is_required, validation_rules, options_json, display_order)
SELECT id, 'panNumber', 'Business / Proprietor PAN', 'పాన్ సంఖ్య', 'TEXT', TRUE, '{"regex":"^[A-Z]{5}[0-9]{4}[A-Z]{1}$","formatDesc":"10 alphanumeric characters (e.g. ABCDE1234F)"}', NULL, 6
FROM services WHERE code = 'SRV_TRADE_LICENSE';

-- 5. Seed Required Document Types for Driving License
INSERT INTO required_document_types (service_id, document_code, name_en, name_te, is_required, accepted_mime_types, max_size_bytes)
SELECT id, 'DOC_ID_PROOF', 'Government Photo Identity Proof (Aadhaar/Voter ID)', 'గుర్తింపు కార్డు (ఆధార్/ఓటర్ ఐడీ)', TRUE, 'image/jpeg,image/png,application/pdf', 5242880
FROM services WHERE code = 'SRV_DRIVING_LICENSE';

INSERT INTO required_document_types (service_id, document_code, name_en, name_te, is_required, accepted_mime_types, max_size_bytes)
SELECT id, 'DOC_ADDRESS_PROOF', 'Address Proof (Electricity Bill/Rental Agreement)', 'చిరునామా రుజువు', TRUE, 'image/jpeg,image/png,application/pdf', 5242880
FROM services WHERE code = 'SRV_DRIVING_LICENSE';

INSERT INTO required_document_types (service_id, document_code, name_en, name_te, is_required, accepted_mime_types, max_size_bytes)
SELECT id, 'DOC_MEDICAL_FITNESS', 'Medical Fitness Certificate (Form 1A)', 'వైద్య ధృవీకరణ పత్రం', FALSE, 'image/jpeg,image/png,application/pdf', 5242880
FROM services WHERE code = 'SRV_DRIVING_LICENSE';

-- 6. Seed Required Document Types for Trade License
INSERT INTO required_document_types (service_id, document_code, name_en, name_te, is_required, accepted_mime_types, max_size_bytes)
SELECT id, 'DOC_PREMISE_PROOF', 'Proof of Business Premise Ownership / Lease Agreement', 'వ్యాపార స్థల యాజమాన్య/అద్దె పత్రం', TRUE, 'image/jpeg,image/png,application/pdf', 5242880
FROM services WHERE code = 'SRV_TRADE_LICENSE';

INSERT INTO required_document_types (service_id, document_code, name_en, name_te, is_required, accepted_mime_types, max_size_bytes)
SELECT id, 'DOC_PAN_CARD', 'Proprietor / Firm PAN Card Copy', 'పాన్ కార్డు కాపీ', TRUE, 'image/jpeg,image/png,application/pdf', 5242880
FROM services WHERE code = 'SRV_TRADE_LICENSE';

INSERT INTO required_document_types (service_id, document_code, name_en, name_te, is_required, accepted_mime_types, max_size_bytes)
SELECT id, 'DOC_FIRE_NOC', 'Fire Safety NOC (if applicable)', 'అగ్నిమాపక భద్రత ఎన్‌ఓసీ', FALSE, 'image/jpeg,image/png,application/pdf', 5242880
FROM services WHERE code = 'SRV_TRADE_LICENSE';
