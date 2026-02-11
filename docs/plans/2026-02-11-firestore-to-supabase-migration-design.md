# Firestore to Supabase Migration Plan
## National Police Index - Database Migration Design

**Date**: 2026-02-11
**Migration Type**: NoSQL (Firestore) → SQL (Supabase) with Schema Transformation
**Strategy**: Dual-Write with New Pipeline First, Then Historical Backfill

---

## Executive Summary

This plan outlines the complete migration from Firebase Firestore to Supabase PostgreSQL, including a fundamental transformation from a denormalized NoSQL structure to a fully normalized relational model. The migration follows a phased approach prioritizing safety and minimal production disruption.

**Key Principles:**
- **New data pipeline first**: Prove the transformation logic with incoming data before bulk migration
- **Frontend cutover last**: Keep frontend on Firestore until all data is migrated
- **Validation at every step**: Never proceed without validating current phase
- **Rollback capability**: Maintain ability to revert at each phase

**Timeline Estimate**: 12-18 weeks

---

## Migration Strategy Overview

### Core Approach
- **Phase 1**: Infrastructure & Schema Setup (1 week)
- **Phase 2**: New Data Ingestion Pipeline (3-4 weeks)
- **Phase 3**: Historical Data Migration (4-6 weeks)
- **Phase 4**: Frontend Migration (2-3 weeks)
- **Phase 5**: Cleanup & Decommission (2-4 weeks)

### Data Model Transformation

**Current Firestore Structure:**
- Denormalized flat documents in `db_launch`
- Each document contains officer name, agency name (string), dates, rank, status embedded together
- `person_nbr` groups multiple records for the same officer across agencies/time

**New Supabase Structure:**
- Normalized relational model with referential integrity
- Separate tables: `officers`, `agencies`, `appointments`, `officer_certifications`, `complaints`
- Foreign key relationships enforcing data integrity
- Full audit trails (`created_by`, `updated_by`, `deleted_by`)
- `person_nbr` → One officer record; each Firestore record → One appointment record

---

## Phase 1: Infrastructure & Schema Setup

**Goal**: Establish the foundation - database tables, system configuration, and tooling for the migration.

**Dependencies**: None (starting point)

**Duration**: 1 week

### Tasks

#### 1.1 Deploy Supabase DDL
- Run the schema DDL to create all tables:
  - `users` - User management with audit trail
  - `officers` - Base officer information
  - `alternative_officer_names` - Name variations for officers
  - `officer_certifications` - Certification records
  - `certification_agencies` - Agencies that grant certifications
  - `certification_types` - Types of certifications
  - `agencies` - Agency catalog with full metadata
  - `appointments` - Officer employment history at agencies
  - `appointment_links` - External links for appointments
  - `complaints` - Allegations and disciplinary records
  - `external_profiles` - Officer profiles on external platforms
- Create all foreign key constraints
- Verify table structure matches schema design

#### 1.2 Create Database Indexes
- **Officers table:**
  - Index on `first_name`, `last_name` for search
  - Composite index on `(first_name, last_name, year_of_birth)` for deduplication
- **Appointments table:**
  - Index on `person_nbr` (critical for migration lookups)
  - Index on `officer_id`, `agency_id`
  - Index on `start_date`, `end_date` for date range queries
- **Agencies table:**
  - Index on `name`, `state`
  - Composite index on `(name, state)` for lookups
- **Officer Certifications:**
  - Index on `officer_id`, `certification_agency_id`
- Additional indexes based on query patterns identified in frontend hooks

#### 1.3 Create System Migration User
- Insert migration bot user into `users` table
  - Email: `migration@npi.system`
  - Role: `system`
  - Document the generated user ID
- This user_id will populate all `created_by`, `updated_by`, `deleted_by` fields during migration
- Store user ID in environment variable for migration scripts

#### 1.4 Set Up Migration Tooling Infrastructure
- Install Supabase client library: `npm install @supabase/supabase-js`
- Create Supabase connection configuration
  - Environment variables for API URL and keys
  - Connection pooling configuration
- Set up structured logging infrastructure
  - Use Winston or similar for structured logs
  - Log format: timestamp, level, migration phase, state, record counts, errors
- Create progress tracking table in Supabase:
  ```sql
  CREATE TABLE migration_progress (
    id SERIAL PRIMARY KEY,
    collection_name VARCHAR NOT NULL,
    state VARCHAR,
    records_processed INTEGER DEFAULT 0,
    records_total INTEGER,
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    status VARCHAR NOT NULL, -- 'in_progress', 'completed', 'failed'
    error_message TEXT,
    metadata JSONB
  );
  ```

#### 1.5 Build Validation Framework
- **Record Count Validator**
  - Script: `scripts/validation/compareRecordCounts.ts`
  - Compare counts between Firestore and Supabase
  - Report discrepancies
- **Data Integrity Checker**
  - Script: `scripts/validation/checkIntegrity.ts`
  - Validate all foreign key relationships exist
  - Check for orphaned records
  - Verify NOT NULL constraints satisfied
- **Sample Data Comparison Tool**
  - Script: `scripts/validation/compareSampleData.ts`
  - Pick 50-100 random person_nbr values
  - Compare Firestore records vs Supabase transformed data
  - Verify transformation accuracy field-by-field
- **Schema Validator**
  - Script: `scripts/validation/validateSchema.ts`
  - Ensure all required fields can be populated from source data
  - Identify fields that will be NULL and document

#### 1.6 Set Up Monitoring & Alerting
- Configure Supabase monitoring dashboard
  - Query performance metrics
  - Connection pool status
  - Database size and growth
- Set up alerts for:
  - Migration script failures (email/Slack)
  - Data validation failures
  - Slow query detection (> 5 seconds)
  - Database connection errors
- Create data quality metrics dashboard
  - Records migrated per phase
  - Error rates
  - Field completeness percentages
- Error logging and notification system
  - Centralized error tracking (Sentry, Rollbar, or similar)

### Deliverables
- ✅ Supabase database with all tables created
- ✅ Indexes created and optimized
- ✅ System user created (ID documented)
- ✅ Migration tooling repository with logging, progress tracking, validation scripts
- ✅ Monitoring dashboard operational
- ✅ Validation framework ready for use

### Success Criteria
- All DDL executed without errors
- System user ID stored and accessible
- Validation scripts run successfully on empty database
- Monitoring alerts triggering correctly in test scenarios

---

## Phase 2: New Data Ingestion Pipeline

**Goal**: Build and deploy the new data ingestion system that writes incoming officer data directly to the normalized Supabase schema.

**Dependencies**: Phase 1 complete

**Duration**: 3-4 weeks

### Tasks

#### 2.1 Design Data Transformation Architecture
- Document mapping from source formats (CSV/JSON from state agencies) to normalized schema
- Create transformation specification document:
  - Field mappings for each source state format
  - Officers extraction rules (person_nbr → officer identity)
  - Agencies extraction rules (agency_name + state → agency identity)
  - Appointments creation rules (each Firestore record → appointment)
  - Certification data handling
- Design error handling strategy:
  - Partial failure handling (transaction rollback)
  - Data validation error recovery
  - Duplicate detection and resolution
  - Missing required field handling

#### 2.2 Build Officer Deduplication Logic
- Create officer matching algorithm:
  - Primary key: `person_nbr`
  - Function: `getOrCreateOfficer(person_nbr, names) → officer_id`
- Implementation in `scripts/ingestion/officerLookup.ts`:
  ```typescript
  async function getOrCreateOfficer(
    person_nbr: string,
    first_name: string,
    middle_name: string | null,
    last_name: string,
    system_user_id: number
  ): Promise<number>
  ```
- Logic:
  1. Query `appointments` table for existing `person_nbr`
  2. If found: return associated `officer_id`
  3. If not found: create new officer record, return new `officer_id`
- Handle edge cases:
  - Missing or malformed `person_nbr` → generate synthetic ID or reject
  - Name variations across records → use most recent or most complete version
  - Null/empty names → validation error, log to dead letter queue

#### 2.3 Build Agency Lookup/Creation Logic
- Create agency matching function:
  - Key: `(name, state)` composite
  - Function: `getOrCreateAgency(name, state) → agency_id`
- Implementation in `scripts/ingestion/agencyLookup.ts`:
  ```typescript
  async function getOrCreateAgency(
    name: string,
    state: string,
    system_user_id: number
  ): Promise<number>
  ```
- Fuzzy matching for agency name variations:
  - Normalize: trim, lowercase, remove punctuation
  - Handle common abbreviations ("PD" → "Police Department")
  - Use Levenshtein distance for close matches (threshold 85% similarity)
- Logic:
  1. Normalize input name
  2. Query `agencies` for exact match on normalized (name, state)
  3. If not found: try fuzzy match
  4. If no match: create new agency with name + state (other fields NULL)
  5. Return `agency_id`
- Maintain in-memory cache:
  - Map: `(name, state) → agency_id`
  - Refresh cache every 1000 records or on cache miss
  - Improves performance significantly

#### 2.4 Build Core Transformation Scripts
- **Main Entry Point**: `scripts/ingestion/ingestStateData.ts`
  - CLI: `tsx scripts/ingestion/ingestStateData.ts --state CA --file data.csv`
  - Orchestrates entire ingestion process
  - Loads CSV/JSON file
  - Processes in batches
  - Reports statistics

- **Transformation Logic**: `scripts/ingestion/transformOfficerRecord.ts`
  - Transform flat record into normalized structure
  - Use Polars/Pandas for data transformation
  - Example:
    ```python
    import polars as pl

    df = pl.read_csv("data.csv")
    df = df.with_columns([
        pl.col("first_name").str.to_uppercase().alias("first_name_normalized"),
        pl.col("start_date").str.strptime(pl.Date, "%Y-%m-%d").alias("start_date_iso")
    ])
    ```
  - Output: structured JSON ready for database insertion

- **Officer Upsert**: `scripts/ingestion/createOrUpdateOfficer.ts`
  - Upsert officer records using `getOrCreateOfficer`
  - Handle name variations (create alternative names if needed)

- **Agency Upsert**: `scripts/ingestion/createOrUpdateAgency.ts`
  - Upsert agency records using `getOrCreateAgency`

- **Appointment Creation**: `scripts/ingestion/createAppointment.ts`
  - Create appointment linking officer → agency
  - Map fields: rank, type, start_date, end_date, separation_reason, notes, person_nbr

- **Certification Creation**: `scripts/ingestion/createCertification.ts`
  - Extract certification status from source
  - Create `officer_certifications` records
  - Link to certification_types

#### 2.5 Implement Batch Processing & Error Handling
- Process records in batches of 500-1000
- Transaction handling:
  - Begin transaction
  - Create/get officer_id
  - Create/get agency_id
  - Create appointment
  - Create certifications (if any)
  - Commit transaction
  - On error: rollback, log error, continue to next record
- Retry logic for transient failures:
  - Retry up to 3 times with exponential backoff
  - Network errors, timeouts, connection issues
- Dead letter queue:
  - Records that fail validation or transformation
  - Write to `failed_records.jsonl` with error details
  - Create script to review and reprocess failed records
- Detailed error logging:
  - Include source record in error log
  - Include stack trace
  - Include context (batch number, state, file)

#### 2.6 Build Validation & Testing Framework
- **Unit Tests**: `scripts/ingestion/__tests__/`
  - Test transformation functions with sample data
  - Test officer deduplication logic
  - Test agency fuzzy matching
  - Test edge cases (missing fields, malformed dates, etc.)

- **Integration Tests**:
  - Create test dataset from real Firestore samples (anonymized)
  - Run full ingestion pipeline on test data
  - Validate output in test Supabase instance

- **Validation Checks**:
  - Foreign key relationships correct (all appointment.officer_id exists in officers)
  - Required fields populated (NOT NULL constraints satisfied)
  - Dates properly formatted and valid
  - No duplicate officers with same person_nbr
  - Agency names normalized consistently

#### 2.7 Create Data Quality Reports
- **Ingestion Summary Report**: `scripts/reporting/ingestionSummary.ts`
  - Metrics:
    - Total records processed
    - Officers created (new vs existing)
    - Agencies created (new vs existing)
    - Appointments created
    - Certifications created
    - Errors encountered (by type)
    - Processing time and rate (records/second)

- **Data Completeness Report**: `scripts/reporting/completenessReport.ts`
  - For each field, report % populated
  - Identify fields with low completeness (< 50%)
  - Highlight required fields with any NULLs

- **Duplicate Detection Report**: `scripts/reporting/duplicateReport.ts`
  - Identify potential duplicate officers (same name, different person_nbr)
  - Flag for manual review

#### 2.8 Deploy New Ingestion Pipeline
- Deploy scripts to production environment
- Configure environment variables (Supabase credentials, system user ID)
- Create runbook for operators:
  - How to run ingestion for a new state data file
  - How to monitor progress
  - How to handle errors
  - How to reprocess failed records
- Document manual ingestion process:
  ```bash
  # Example
  tsx scripts/ingestion/ingestStateData.ts \
    --state CA \
    --file ./data/california_2026.csv \
    --batch-size 1000
  ```

#### 2.9 Pilot Test with Single State
- Choose a small state with clean data (e.g., Vermont, Delaware, Wyoming)
- Obtain recent data batch for that state
- Run new ingestion pipeline:
  1. Process data file
  2. Review logs for errors
  3. Run validation scripts
  4. Generate data quality report
- Manual validation:
  - Pick 10 random officers
  - Verify Firestore → Supabase transformation correctness
  - Check appointments linked correctly
  - Check agencies created properly
- Fix any issues discovered and re-run pilot

#### 2.10 Production Rollout of New Pipeline
- Begin ingesting all new incoming data through new pipeline
- **Stop writing new data to Firestore** (old pipeline retired)
- Monitor closely for first 2 weeks:
  - Check error rates daily
  - Review data quality reports
  - Validate sample records manually
- Establish baseline metrics:
  - Processing rate (records/minute)
  - Error rate (% of records)
  - Field completeness rates

### Deliverables
- ✅ Complete new data ingestion pipeline writing to Supabase
- ✅ Transformation scripts for all source data formats
- ✅ Officer deduplication working correctly (person_nbr → officer_id)
- ✅ Agency lookup with fuzzy matching operational
- ✅ Validated with pilot state
- ✅ Documentation and runbooks complete
- ✅ New data flowing into Supabase only (Firestore no longer receiving new data)

### Success Criteria
- Pilot state data ingested with < 1% error rate
- All validation checks pass
- Data quality report shows acceptable completeness
- No duplicate officers created (one person_nbr → one officer_id)
- Production ingestion running for 2 weeks with stable error rates

---

## Phase 3: Historical Data Migration

**Goal**: Migrate all existing Firestore data into the new normalized Supabase schema.

**Dependencies**: Phase 2 complete (proven transformation pipeline)

**Duration**: 4-6 weeks

### Tasks

#### 3.1 Pre-Migration Analysis & Planning

**3.1.1 Analyze Firestore Data Volumes**
- Run analysis scripts on Firestore:
  - Total records in `db_launch`: `db.collection('db_launch').count()`
  - Unique `person_nbr` values (future officers count)
  - Unique `(agency_name, state)` combinations (future agencies count)
  - Records per state (to plan batching)
  - Data quality assessment (missing fields, malformed dates, etc.)
- Document findings in migration plan spreadsheet

**3.1.2 Estimate Migration Time**
- Based on Phase 2 pilot:
  - Processing rate: X records/minute
  - Total records: Y
  - Estimated time: Y / X minutes (add 50% buffer)
- Plan for parallel processing if possible:
  - Multiple states simultaneously (if Supabase can handle load)
  - Test with 2 states in parallel, monitor database performance

**3.1.3 Create Migration Batching Strategy**
- **Approach**: Migrate state-by-state
- **Order**: Start with smallest states, build to largest
  - Small states first (< 10K records) to build confidence
  - Medium states next (10K-100K records)
  - Large states last (> 100K records): California, Texas, New York, Florida
- **Checkpoint Intervals**: Save progress every 10,000 records
- **Parallel Processing**: Run 2-3 states simultaneously (monitor database load)

**3.1.4 Build Historical Migration Scripts**
- **Main Orchestrator**: `scripts/migration/migrateHistoricalData.ts`
  - CLI: `tsx scripts/migration/migrateHistoricalData.ts --state CA --resume`
  - Coordinates entire historical migration
  - Processes states in defined order
  - Supports resume from checkpoint

- **Core Migration Logic**: `scripts/migration/migrateDbLaunchRecords.ts`
  - Query Firestore `db_launch` for a given state
  - Transform using same logic as Phase 2
  - Batch insert into Supabase

- **Static Collections**: `scripts/migration/migrateStaticCollections.ts`
  - Migrate `static_texts`, `posts`, `team` (if needed in new schema)
  - Determine if these stay in Firestore or migrate to Supabase

**3.1.5 Implement Progress Tracking & Resume Capability**
- Use `migration_progress` table created in Phase 1
- Before starting a state:
  ```sql
  INSERT INTO migration_progress (collection_name, state, records_total, status)
  VALUES ('db_launch', 'CA', 150000, 'in_progress');
  ```
- After each batch (10K records):
  ```sql
  UPDATE migration_progress
  SET records_processed = 10000
  WHERE collection_name = 'db_launch' AND state = 'CA';
  ```
- On completion:
  ```sql
  UPDATE migration_progress
  SET status = 'completed', completed_at = NOW()
  WHERE collection_name = 'db_launch' AND state = 'CA';
  ```
- Resume logic:
  - Check `migration_progress` for last checkpoint
  - Skip already-processed records
  - Continue from last cursor/offset

#### 3.2 Migrate Reference Data First

**3.2.1 Migrate Agencies Collection**
- **Script**: `scripts/migration/migrateAgencies.ts`
- Extract unique agencies from Firestore:
  ```javascript
  // Firestore query
  const snapshot = await db.collection('db_launch').get();
  const agencies = new Map();
  snapshot.forEach(doc => {
    const data = doc.data();
    const key = `${data.agency_name}|${data.state}`;
    if (!agencies.has(key)) {
      agencies.set(key, {
        name: data.agency_name,
        state: data.state
      });
    }
  });
  ```
- Also check Firestore `agencies` collection for any additional metadata
- Create agency records in Supabase:
  - Populate: `name`, `state`, `created_by`
  - Leave NULL: addresses, geocoding, type, etc. (manual enrichment later)
- Build mapping file: `agency_mapping.json`
  ```json
  {
    "Los Angeles Police Department|california": 1234,
    "San Francisco Police Department|california": 1235
  }
  ```
- Store mapping for use in appointment migration
- **Validation**:
  - Count agencies created = unique (name, state) in Firestore
  - No duplicate agencies
  - All agencies have non-null name and state

**3.2.2 Migrate Certification Agencies**
- Determine if Firestore distinguishes certification agencies from employing agencies
- If `current_certificate_status` references specific agencies, extract those
- Create `certification_agencies` records
- If no distinct data exists:
  - Create placeholder certification agency per state (e.g., "California POST")
  - Document that this needs manual enrichment

**3.2.3 Migrate Certification Types**
- Extract unique `current_certificate_status` values from Firestore:
  ```javascript
  const statuses = new Set();
  snapshot.forEach(doc => {
    const status = doc.data().current_certificate_status;
    if (status) statuses.add(status);
  });
  ```
- Map to `certification_types`:
  - Create one certification_type record per unique status value
  - Example: "Active", "Suspended", "Revoked", "Inactive"
- If `certification_type` field exists in Firestore, use that as well
- Store mapping: status string → certification_type_id

#### 3.3 Migrate Core Officer Data

**3.3.1 Migrate Officers**
- **Script**: `scripts/migration/migrateOfficers.ts`
- Extract unique `person_nbr` values from Firestore:
  ```javascript
  const officersMap = new Map();
  snapshot.forEach(doc => {
    const data = doc.data();
    const pnbr = data.person_nbr;

    if (!officersMap.has(pnbr)) {
      officersMap.set(pnbr, {
        person_nbr: pnbr,
        first_name: data.first_name,
        middle_name: data.middle_name,
        last_name: data.last_name,
        // Use most recent record's name or most common variant
      });
    }
  });
  ```
- For each unique `person_nbr`:
  - Get name from most recent record (or most complete record)
  - Create officer record in Supabase
  - Store mapping: `person_nbr → officer_id`
- **Handle edge cases**:
  - Missing `person_nbr`: skip record or assign synthetic ID (document decision)
  - Name variations: pick canonical name, create alternatives in next step
  - Duplicate `person_nbr` with different names: flag for manual review
- **Store mapping**: `officer_mapping.json`
  ```json
  {
    "12345": 5001,
    "67890": 5002
  }
  ```
- **Validation**:
  - Officer count in Supabase = unique person_nbr in Firestore
  - All officers have non-null first_name, last_name
  - No duplicate person_nbr mappings

**3.3.2 Create Alternative Names**
- **Script**: `scripts/migration/createAlternativeNames.ts`
- For each officer, check if multiple name variations exist across Firestore records
- Example:
  - person_nbr "12345" has records with:
    - "John A. Smith"
    - "J. Smith"
    - "John Smith"
  - Canonical name: "John A. Smith"
  - Alternative names: "J. Smith", "John Smith"
- Create `alternative_officer_names` records for each variation
- **Validation**:
  - All alternative names link to valid officer_id
  - No duplicate alternatives for same officer

#### 3.4 Migrate Transactional Data

**3.4.1 Migrate Appointments**
- **Script**: `scripts/migration/migrateAppointments.ts`
- **Core Logic**:
  ```javascript
  for (const firestoreRecord of db_launch_records) {
    const officer_id = officer_mapping[firestoreRecord.person_nbr];
    const agency_id = agency_mapping[`${firestoreRecord.agency_name}|${firestoreRecord.state}`];

    const appointment = {
      person_nbr: firestoreRecord.person_nbr,
      officer_id: officer_id,
      agency_id: agency_id,
      rank: firestoreRecord.rank,
      type: firestoreRecord.type || null,
      start_date: firestoreRecord.start_date_iso || parseDate(firestoreRecord.start_date),
      end_date: firestoreRecord.end_date_iso || parseDate(firestoreRecord.end_date),
      separation_reason: firestoreRecord.separation_reason || '',
      notes: firestoreRecord.notes || null,
      created_by: system_user_id,
      created_at: NOW()
    };

    await supabase.from('appointments').insert(appointment);
  }
  ```
- **Process state-by-state** with progress tracking
- **Batch inserts**: 1000 appointments per batch
- **Handle edge cases**:
  - Missing officer_id (person_nbr not found): log error, skip record
  - Missing agency_id (agency not found): create agency on-the-fly, continue
  - Invalid dates: log warning, insert as NULL
- **Validation after each state**:
  - Appointment count for state = db_launch record count for state
  - All appointments link to valid officer_id
  - All appointments link to valid agency_id
  - No orphaned appointments

**3.4.2 Migrate Officer Certifications**
- **Script**: `scripts/migration/migrateOfficerCertifications.ts`
- Extract certification data from Firestore `db_launch`:
  - `current_certificate_status` → maps to certification_types
  - `certification_type` field (if exists)
- For each Firestore record with certification data:
  ```javascript
  const officer_id = officer_mapping[record.person_nbr];
  const cert_type_id = cert_type_mapping[record.current_certificate_status];

  // Determine certification_agency_id (may be state default)
  const cert_agency_id = getCertificationAgency(record.state);

  const certification = {
    officer_id: officer_id,
    certification_agency_id: cert_agency_id,
    certification_type_id: cert_type_id,
    status: record.current_certificate_status,
    start_date: record.start_date_iso,
    end_date: record.end_date_iso,
    created_by: system_user_id
  };

  await supabase.from('officer_certifications').insert(certification);
  ```
- **Handle missing data**:
  - No certification data: skip certification creation
  - Unknown certification_agency: use state default placeholder
- **Validation**:
  - All certifications link to valid officer_id
  - All certifications link to valid certification_type_id

**3.4.3 Migrate Complaints/Allegations**
- **Script**: `scripts/migration/migrateComplaints.ts`
- Review Firestore fields related to complaints:
  - `offense`, `sanction`, `violation`, `sanction_date`
- Map to `complaints` table:
  ```javascript
  if (record.offense || record.violation) {
    // Find the appointment this complaint is associated with
    const appointment_id = findAppointment(officer_id, agency_id, record.start_date);

    const complaint = {
      appointment_id: appointment_id,
      certification_agency_id: cert_agency_id, // or null
      case_opened: record.sanction_date ? parseDate(record.sanction_date) : null,
      case_closed: null, // Unknown from Firestore
      case_number: null, // Unknown from Firestore
      complaint_type: record.violation || null,
      disposition: record.sanction || null,
      discipline_imposed: record.sanction || null,
      notes: record.offense || null,
      created_by: system_user_id
    };

    await supabase.from('complaints').insert(complaint);
  }
  ```
- **Challenge**: Linking complaint to correct appointment
  - If officer has multiple appointments, need to determine which one
  - Use date ranges or agency matching
- **Handle insufficient data**:
  - If can't reliably link to appointment: skip or create generic complaint entry
  - Document data quality issues
- **Validation**:
  - All complaints link to valid appointment_id
  - Complaint count reasonable (not creating duplicates)

#### 3.5 Migrate Supporting Collections

**3.5.1 Migrate Static Content (Decision Required)**
- **Options**:
  - **A**: Keep `static_texts`, `posts`, `team` in Firestore (simpler, no migration needed)
  - **B**: Migrate to Supabase for consistency (all data in one place)
- If migrating to Supabase:
  - Add tables to DDL (if not already included)
  - Create migration scripts: `migrateStaticTexts.ts`, `migratePosts.ts`, `migrateTeam.ts`
  - Map Firestore documents to Supabase rows
- **Recommendation**: Defer to Phase 5 or keep in Firestore for now

**3.5.2 Handle Statistics Collections**
- **Current**: `statistics_per_state`, `statistics_per_agency` in Firestore
- **Options**:
  - **A**: Migrate statistics as-is (snapshot of old data)
  - **B**: Regenerate statistics from Supabase after migration (more accurate)
- **Recommendation**: Option B - regenerate from Supabase
  - Create new statistics generation scripts querying Supabase
  - Run after migration complete
  - Store statistics in Supabase tables or materialized views
  - Leverage PostgreSQL aggregation functions for performance

#### 3.6 Validation & Quality Assurance

**3.6.1 Run Comprehensive Validation**
- **Record Count Validation**:
  ```sql
  -- Should match
  SELECT COUNT(*) FROM appointments; -- = Firestore db_launch count
  SELECT COUNT(DISTINCT officer_id) FROM appointments; -- = Firestore unique person_nbr count
  SELECT COUNT(*) FROM officers; -- = Firestore unique person_nbr count
  SELECT COUNT(*) FROM agencies; -- = Firestore unique (agency_name, state) count
  ```

- **Foreign Key Integrity**:
  ```sql
  -- Should return 0
  SELECT COUNT(*) FROM appointments
  WHERE officer_id NOT IN (SELECT id FROM officers);

  SELECT COUNT(*) FROM appointments
  WHERE agency_id NOT IN (SELECT id FROM agencies);

  SELECT COUNT(*) FROM officer_certifications
  WHERE officer_id NOT IN (SELECT id FROM officers);
  ```

- **Data Completeness**:
  ```sql
  -- Check required fields
  SELECT COUNT(*) FROM officers WHERE first_name IS NULL OR last_name IS NULL;
  SELECT COUNT(*) FROM appointments WHERE officer_id IS NULL OR agency_id IS NULL;
  ```

- **Date Validity**:
  ```sql
  -- Check for invalid date ranges
  SELECT COUNT(*) FROM appointments
  WHERE end_date IS NOT NULL AND end_date < start_date;
  ```

**3.6.2 Sample Manual Checks**
- Randomly select 50-100 person_nbr values
- For each:
  - Retrieve all Firestore records for that person_nbr
  - Retrieve Supabase officer + appointments
  - Compare field-by-field:
    - Officer name matches
    - Number of appointments matches number of Firestore records
    - Dates match
    - Agencies match
    - Ranks match
  - Document any discrepancies

**3.6.3 Generate Migration Report**
- **Script**: `scripts/reporting/migrationReport.ts`
- **Report Sections**:
  - **Summary Statistics**:
    - Total Firestore records processed
    - Officers created
    - Agencies created
    - Appointments created
    - Certifications created
    - Complaints created
    - Processing time
  - **Data Quality Metrics**:
    - Field completeness percentages
    - Error rates by type
    - Records skipped/failed (with reasons)
  - **State-by-State Breakdown**:
    - Per-state record counts
    - Per-state processing times
    - Per-state error rates
  - **Data Quality Issues**:
    - Missing person_nbr count
    - Name variation count
    - Date format issues
    - Unknown agencies
  - **Recommendations**:
    - Fields needing enrichment
    - Data cleanup priorities
    - Manual review items

**3.6.4 Create Rollback Plan**
- **Rollback Procedure**:
  1. Stop all write operations to Supabase
  2. Drop and recreate all tables (use DDL)
  3. Re-run migration from scratch with fixes
  4. Alternative: Restore from Supabase backup (if available)
- **Test Rollback in Staging**:
  - Practice rollback procedure in staging environment
  - Document time required
  - Validate Firestore remains intact
- **Decision Points for Rollback**:
  - Critical validation failures (> 5% data loss)
  - Foreign key integrity violations
  - Unacceptable error rates (> 10%)
  - Data corruption detected

### Deliverables
- ✅ All historical Firestore data migrated to Supabase
- ✅ Tables populated: officers, agencies, appointments, officer_certifications, complaints
- ✅ Mapping files preserved: officer_mapping.json, agency_mapping.json
- ✅ Data validation passed (all checks green)
- ✅ Migration report documenting results and data quality
- ✅ Rollback plan documented and tested

### Success Criteria
- Record count validation passes (< 1% discrepancy)
- Foreign key integrity 100% (no orphaned records)
- Sample manual checks show > 95% accuracy
- Migration report shows acceptable data quality
- All NOT NULL constraints satisfied
- Rollback tested and documented

---

## Phase 4: Frontend Migration

**Goal**: Switch the frontend application from Firestore to Supabase for all data access.

**Dependencies**: Phase 3 complete (all data migrated and validated)

**Duration**: 2-3 weeks

### Tasks

#### 4.1 Install Supabase Client Library
- Add dependency:
  ```bash
  npm install @supabase/supabase-js
  ```
- Configure Supabase client in `lib/supabase.ts`:
  ```typescript
  import { createClient } from '@supabase/supabase-js'

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  export const supabase = createClient(supabaseUrl, supabaseAnonKey)
  ```
- Set up environment variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Configure for Next.js SSR/SSG if needed

#### 4.2 Create Supabase Data Access Layer
- Create new hooks directory: `hooks/supabase/`
- **Base utilities**: `lib/supabaseQueries.ts`
  - Common query patterns
  - Error handling
  - Pagination helpers

- **Update TypeScript Types**: `types/index.ts`
  - Define interfaces matching new Supabase schema:
    ```typescript
    export interface Officer {
      id: number;
      first_name: string;
      middle_name: string | null;
      last_name: string;
      suffix: string | null;
      year_of_birth: number | null;
      race: string | null;
      sex: string | null;
    }

    export interface Agency {
      id: number;
      name: string;
      state: string;
      city: string | null;
      // ... other fields
    }

    export interface Appointment {
      id: number;
      person_nbr: string;
      officer_id: number;
      agency_id: number;
      rank: string | null;
      start_date: string | null;
      end_date: string | null;
      separation_reason: string;
      notes: string | null;
      // Joined data
      officer?: Officer;
      agency?: Agency;
    }

    export interface OfficerWithAppointments {
      officer: Officer;
      appointments: Appointment[];
    }
    ```

#### 4.3 Replace Firestore Hooks with Supabase Hooks

**4.3.1 Replace `useOfficersByUid` → `useOfficersByState`**
- **Current**: `hooks/useOfficersByUid.ts` queries Firestore `db_launch` by state
- **New**: `hooks/supabase/useOfficersByState.ts`
- **Query Logic**:
  ```typescript
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      id,
      person_nbr,
      rank,
      start_date,
      end_date,
      separation_reason,
      officer:officers (
        id,
        first_name,
        middle_name,
        last_name
      ),
      agency:agencies (
        id,
        name,
        state
      )
    `)
    .eq('agency.state', stateParam)
    .order('officer.last_name', { ascending: true })
    .range(startIndex, endIndex);
  ```
- **Features to support**:
  - **Name search**: Filter by officer name (ILIKE on first_name, last_name)
  - **Agency filter**: Filter by agency_id or agency name
  - **Date range filter**: Filter on start_date, end_date
  - **Pagination**: Cursor-based or offset-based
  - **Sorting**: By name, date, agency
  - **Active only**: Filter where end_date IS NULL
- **Grouping by officer**:
  - Query returns appointments with joined officer/agency
  - Client-side grouping by officer_id to show all appointments per officer
  - Or use subquery/aggregation in PostgreSQL

**4.3.2 Replace `useAgencyStats`**
- **Current**: `hooks/useAgencyStats.ts` queries Firestore `statistics_per_agency`
- **New**: `hooks/supabase/useAgencyStats.ts`
- **Options**:
  - **Option A**: Pre-compute statistics and store in Supabase table
    - Create `agency_statistics` table
    - Populate with aggregation queries
    - Query from that table in hook
  - **Option B**: Calculate on-the-fly with SQL aggregations
    ```sql
    SELECT
      a.id,
      a.name,
      a.state,
      COUNT(DISTINCT ap.officer_id) as total_officers,
      COUNT(DISTINCT CASE WHEN ap.end_date IS NULL THEN ap.officer_id END) as active_officers
    FROM agencies a
    LEFT JOIN appointments ap ON a.id = ap.agency_id
    WHERE a.name = $1 AND a.state = $2
    GROUP BY a.id;
    ```
  - **Recommendation**: Option B for freshness, with caching

**4.3.3 Replace `useStateStats`**
- **Current**: `hooks/useStateStats.ts` queries Firestore `statistics_per_state`
- **New**: `hooks/supabase/useStateStats.ts`
- **Query Example**:
  ```sql
  SELECT
    COUNT(DISTINCT ap.officer_id) as total_officers,
    COUNT(DISTINCT CASE WHEN ap.end_date IS NULL THEN ap.officer_id END) as active_officers,
    COUNT(DISTINCT ap.agency_id) as total_agencies
  FROM appointments ap
  JOIN agencies ag ON ap.agency_id = ag.id
  WHERE ag.state = $1;
  ```
- Store in materialized view or compute on-demand with caching

**4.3.4 Replace `useOfficerByPersonNbr`**
- **Current**: `hooks/useOfficerByPersonNbr.ts` queries by document_id or person_nbr
- **New**: `hooks/supabase/useOfficerByPersonNbr.ts`
- **Query**:
  ```typescript
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      id,
      person_nbr,
      rank,
      start_date,
      end_date,
      separation_reason,
      officer:officers (*),
      agency:agencies (*)
    `)
    .eq('person_nbr', personNbr);
  ```
- Returns all appointments for that person_nbr with officer and agency details

**4.3.5 Handle `useStaticText`, `usePosts`, `useTeam`**
- **Decision point**: Did these migrate to Supabase in Phase 3?
- **If migrated**: Create Supabase hooks
- **If staying in Firestore**: Keep existing hooks, no changes needed

#### 4.4 Update Search Functionality
- **Current**: Uses Firestore `searchQueries` array-contains for text search
- **New**: Use PostgreSQL full-text search or ILIKE
- **Implementation Options**:
  - **Option A**: ILIKE for simple prefix/substring matching
    ```sql
    WHERE officers.first_name ILIKE '%john%'
       OR officers.last_name ILIKE '%smith%'
    ```
  - **Option B**: PostgreSQL full-text search (more powerful)
    ```sql
    -- Add tsvector column
    ALTER TABLE officers ADD COLUMN search_vector tsvector;
    CREATE INDEX officers_search_idx ON officers USING GIN(search_vector);

    -- Populate
    UPDATE officers SET search_vector =
      to_tsvector('english', first_name || ' ' || last_name);

    -- Query
    WHERE search_vector @@ to_tsquery('english', 'john & smith');
    ```
  - **Recommendation**: Start with ILIKE (simpler), upgrade to full-text if performance issues

- **Agency Autocomplete**:
  - Query agencies table with ILIKE:
    ```sql
    SELECT id, name, state
    FROM agencies
    WHERE name ILIKE '%los angeles%'
    LIMIT 10;
    ```

#### 4.5 Update Components to Use New Data Structure
- **Current structure**: Components expect flat `PoliceOfficer` objects from Firestore
- **New structure**: Normalized data (officer + appointments[] + agencies)
- **Update components**:
  - **Officer cards/lists**: Receive `OfficerWithAppointments` instead of `PoliceOfficer`
  - **Officer detail pages**: Display multiple appointments per officer
  - **Agency pages**: Query appointments for that agency, join to officers
  - **State pages**: Use new statistics queries
- **Example transformation**:
  ```typescript
  // Old
  <OfficerCard officer={policeOfficer} />

  // New
  <OfficerCard
    officer={officer}
    appointments={appointments}
  />
  ```

#### 4.6 Implement Caching Strategy
- **Current**: Hooks implement local caching for Firestore queries
- **New**: Replicate caching for Supabase
- **Options**:
  - **React Query**: Automatic caching, background refetching
    ```typescript
    import { useQuery } from '@tanstack/react-query';

    export function useOfficersByState(state: string) {
      return useQuery({
        queryKey: ['officers', state],
        queryFn: () => fetchOfficersFromSupabase(state),
        staleTime: 5 * 60 * 1000, // 5 minutes
      });
    }
    ```
  - **SWR**: Similar to React Query
  - **Manual caching**: Use React state/context (current approach)
- **Recommendation**: Migrate to React Query for better developer experience
- **Cache invalidation**: Define rules for when to refetch (user actions, time-based)

#### 4.7 Build API Routes
- **Current**: Next.js API routes query Firestore (e.g., `app/api/download/csv/route.ts`)
- **Update to query Supabase**:
  ```typescript
  // app/api/download/csv/route.ts
  import { supabase } from '@/lib/supabase';

  export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const state = searchParams.get('state');

    const { data, error } = await supabase
      .from('appointments')
      .select('*, officer:officers(*), agency:agencies(*)')
      .eq('agency.state', state);

    // Transform to CSV
    const csv = convertToCSV(data);
    return new Response(csv, {
      headers: { 'Content-Type': 'text/csv' }
    });
  }
  ```

#### 4.8 Update Scripts and Administrative Tools
- **Sitemap generation**: `scripts/generateSitemap.ts`
  - Update to query Supabase for officers, agencies, states
- **Export tools**: Any scripts that export data
  - Update to use Supabase client
- **Statistics generation**: If regenerating statistics
  - Create new scripts querying Supabase

#### 4.9 Testing in Staging Environment
- Deploy frontend changes to staging with Supabase backend
- **Comprehensive testing**:
  - **Officer search**: Test various queries (name, agency, date range)
  - **Agency pages**: Verify correct officers displayed for each agency
  - **State pages**: Verify statistics accurate
  - **Pagination**: Test forward/backward navigation, edge cases
  - **Filtering**: Test all filter combinations
  - **Sorting**: Test all sort options
  - **CSV export**: Verify download functionality works
- **Performance testing**:
  - Compare query times: Firestore vs Supabase
  - Measure page load times
  - Check for N+1 query issues
  - Optimize slow queries (add indexes, refactor queries)
- **Cross-browser testing**: Chrome, Firefox, Safari, Edge
- **Mobile responsiveness**: Test on various screen sizes
- **Accessibility**: Verify no regressions

#### 4.10 Performance Optimization
- **Analyze slow queries**:
  - Use Supabase dashboard to identify slow queries
  - Check `EXPLAIN ANALYZE` for problematic queries
- **Add missing indexes**:
  - If queries are slow, add indexes (e.g., on search fields)
- **Optimize joins**:
  - Use proper `SELECT` clauses (don't over-fetch)
  - Consider denormalization for frequently accessed data
- **Implement lazy loading**:
  - For large lists, load data incrementally
  - Use virtual scrolling for very long lists

#### 4.11 Create Feature Flag (Optional)
- **Purpose**: Kill-switch to rollback to Firestore if critical issue post-deploy
- **Implementation**:
  - Environment variable or feature flag service
  - `USE_SUPABASE=true` or `USE_FIRESTORE=true`
  - In hooks, check flag and route to appropriate data source
  ```typescript
  export function useOfficersByState(state: string) {
    const useSupabase = process.env.NEXT_PUBLIC_USE_SUPABASE === 'true';

    if (useSupabase) {
      return useOfficersByStateSupabase(state);
    } else {
      return useOfficersByUid({ state }); // Old Firestore hook
    }
  }
  ```
- **Recommendation**: Implement for safety, remove after 2 weeks of stability

#### 4.12 Production Deployment
- **Pre-deployment checklist**:
  - [ ] All Firestore hooks replaced
  - [ ] Staging tests pass
  - [ ] Performance acceptable
  - [ ] Rollback plan documented
  - [ ] Team briefed on deployment
  - [ ] Monitoring alerts configured

- **Deployment**:
  - Deploy during low-traffic window
  - Monitor error rates in real-time
  - Have team on standby for immediate issues

- **Post-deployment checks**:
  - Smoke test critical paths (search, agency page, state page)
  - Check error monitoring (Sentry, etc.)
  - Verify analytics tracking still working
  - Monitor performance metrics

#### 4.13 Post-Deployment Monitoring
- **Monitor closely for 48-72 hours**:
  - **Error rates**: Should be comparable to pre-migration baseline
  - **Query performance**: Track p50, p95, p99 query times
  - **User complaints**: Monitor support channels
  - **Data inconsistencies**: Users reporting missing/incorrect data

- **Metrics to track**:
  - Page load times
  - API response times
  - Database query times
  - Error rates by endpoint
  - User engagement (search usage, page views)

- **Compare with baseline**:
  - Pre-migration metrics vs post-migration
  - Identify regressions
  - Address issues immediately

- **Be prepared for rollback**:
  - If critical failures occur:
    1. Flip feature flag to Firestore (if implemented)
    2. Or rollback frontend deployment
    3. Investigate and fix issues
    4. Re-deploy when ready

### Deliverables
- ✅ Frontend fully migrated to Supabase
- ✅ All Firestore hooks replaced with Supabase equivalents
- ✅ Search functionality working with PostgreSQL
- ✅ Components updated to handle normalized data structure
- ✅ API routes updated
- ✅ Comprehensive testing completed in staging
- ✅ Performance optimized (queries < 500ms p95)
- ✅ Application deployed to production
- ✅ 48-hour monitoring period complete with stable metrics
- ✅ Rollback capability tested and documented

### Success Criteria
- All critical user flows working correctly
- Error rates < 1%
- Query performance acceptable (p95 < 1 second)
- No major user complaints
- Data consistency validated (spot checks)
- Rollback tested and available if needed

---

## Phase 5: Cleanup & Decommission

**Goal**: Clean up old systems, archive Firestore data, remove dependencies, and finalize the migration.

**Dependencies**: Phase 4 complete and stable for 2+ weeks

**Duration**: 2-4 weeks

### Tasks

#### 5.1 Monitor Production Stability
- **Timeline**: Run Supabase-only for 2-4 weeks minimum
- **Stability criteria**:
  - Error rates stable and acceptable
  - No critical data issues reported
  - Performance meets or exceeds baseline
  - User feedback positive or neutral
- **Weekly review**:
  - Review metrics dashboard
  - Address any issues that arise
  - Collect user feedback
- **Sign-off**: Get stakeholder approval that migration is stable before proceeding with cleanup

#### 5.2 Archive Firestore Data
- **Full export** of Firestore database:
  ```bash
  gcloud firestore export gs://your-bucket/firestore-backup-2026-02-11
  ```
- **Export to JSON** for long-term storage:
  - Script: `scripts/archive/exportFirestoreToJson.ts`
  - Export all collections: `db_launch`, `statistics_per_agency`, `statistics_per_state`, `agencies`, `static_texts`, `posts`, `team`
  - Store in cloud storage (S3, Google Cloud Storage, etc.)
- **Document archive**:
  - Location: `gs://npi-archive/firestore-2026-02-11/`
  - Format: JSON + Firestore native export
  - Size: [document size]
  - Date: 2026-02-11
  - Retention: Permanent
- **Verify archive integrity**:
  - Test restore to a new Firestore instance
  - Verify record counts match
  - Spot-check random records

#### 5.3 Set Firestore to Read-Only
- **Update Firestore security rules**:
  ```javascript
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /{document=**} {
        allow read: if true;  // Public read access
        allow write: if false; // No write access
      }
    }
  }
  ```
- **Deploy rules**: `firebase deploy --only firestore:rules`
- **Purpose**: Prevent accidental writes, keep read access for emergency fallback
- **Document**: Firestore is now archive-only

#### 5.4 Remove Firebase Dependencies from Codebase
- **Remove dependencies** from `package.json`:
  ```bash
  npm uninstall firebase firebase-admin firebase-tools
  ```
- **Delete unused files**:
  - `lib/firebase.ts`
  - `config/firebase.ts`
  - `hooks/useOfficersByUid.ts` (old Firestore hook)
  - `hooks/useAgencyStats.ts` (old Firestore hook)
  - `hooks/useStateStats.ts` (old Firestore hook)
  - `hooks/useOfficerByPersonNbr.ts` (old Firestore hook)
  - Delete `hooks/` entirely if all migrated to `hooks/supabase/`
- **Delete old migration/normalization scripts** that operated on Firestore:
  - `scripts/addSearchQueries.ts`
  - `scripts/addSearchQueriesAdvanced.ts`
  - `scripts/addSearchQueriesByState.ts`
  - `scripts/normalizeDatesByState.ts`
  - `scripts/normalizeStateData.ts`
  - `scripts/normalizeWashingtonData.ts`
  - `scripts/generateAgencyStats.ts` (old Firestore version)
  - `scripts/generateStateStats.ts` (old Firestore version)
  - `scripts/updateAgencyActiveStats.ts`
- **Archive scripts** (don't delete entirely):
  - Move to `scripts/archive/firestore/` for reference
  - May need to reference logic during troubleshooting
- **Remove Firebase imports** throughout codebase:
  - Search for `from 'firebase'` or `from '@/lib/firebase'`
  - Remove or replace with Supabase equivalents
- **Update `.env` files**:
  - Remove Firebase config variables
  - Keep Supabase config variables only

#### 5.5 Update Documentation
- **Update DATABASE_DOCUMENTATION.md**:
  - Replace Firestore schema with Supabase schema
  - Document new table structure
  - Update query patterns and access patterns
  - Remove references to old collections
  - Add new SQL query examples

- **Create new architecture diagram**:
  - Show Supabase table relationships
  - Include foreign keys
  - Document indexes

- **Update README.md**:
  - Remove Firebase setup instructions
  - Add Supabase setup instructions:
    ```markdown
    ## Database Setup

    1. Create a Supabase account and project
    2. Run the DDL in `database/schema.sql`
    3. Configure environment variables:
       - `NEXT_PUBLIC_SUPABASE_URL`
       - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    4. Run migrations if needed
    ```

- **Document data ingestion process**:
  - How to ingest new state data
  - How to run transformation scripts
  - How to validate ingested data

- **Create migration retrospective document**:
  - `docs/migration-retrospective.md`
  - Timeline and milestones
  - Challenges encountered and solutions
  - Lessons learned
  - Recommendations for future migrations

#### 5.6 Decommission Firestore Project (Optional)
- **Recommendation**: Keep Firestore on free tier for 6 months as safety net
- **After 6 months** with no issues:
  - Downgrade Firebase plan to free tier (if on paid plan)
  - Or fully delete Firebase project
  - Ensure archive is accessible before deleting
- **Cost savings**: Eliminate Firebase hosting/query costs

#### 5.7 Clean Up Migration Infrastructure
- **Archive migration scripts**:
  - Move to `scripts/archive/migration/`
  - Don't delete - may need for reference or future migrations
  - Keep: `migrateHistoricalData.ts`, `migrateOfficers.ts`, etc.

- **Remove temporary tables** (optional):
  - `migration_progress` - could remove or keep for audit trail
  - Decision: Keep for historical record

- **Remove system migration user** (optional):
  - Could deactivate or delete
  - Decision: Keep for audit trail (who created these records)

- **Clean up temporary indexes**:
  - Review indexes created specifically for migration performance
  - Remove if not needed for production queries
  - Keep performance-critical indexes

#### 5.8 Performance Tuning & Optimization
- **Analyze 1 month of production query patterns**:
  - Use Supabase query analyzer
  - Identify most frequent queries
  - Identify slowest queries

- **Optimize indexes**:
  - Add indexes for frequent queries not yet indexed
  - Remove unused indexes (slow down writes)
  - Consider partial indexes for specific query patterns
  - Example:
    ```sql
    CREATE INDEX idx_active_appointments ON appointments(officer_id)
    WHERE end_date IS NULL;
    ```

- **Tune Supabase configuration**:
  - Connection pooling settings (based on traffic patterns)
  - Query timeouts (balance between UX and resource usage)
  - Resource allocation (CPU, memory) if on custom plan

- **Review and optimize expensive queries**:
  - Rewrite slow queries with better SQL
  - Add materialized views for complex aggregations
  - Consider denormalization for specific use cases

- **Caching strategy**:
  - Review cache hit rates (React Query or SWR)
  - Adjust stale times based on data update frequency
  - Implement edge caching (Vercel Edge, Cloudflare) if applicable

#### 5.9 Build Data Enrichment Tools
- **Agency data enrichment**:
  - Create admin interface for adding agency addresses
  - Integrate Google Places API for geocoding:
    ```typescript
    async function enrichAgency(agencyId: number, address: string) {
      const geocoded = await googlePlaces.geocode(address);
      await supabase.from('agencies').update({
        addr_street_one: geocoded.street,
        city: geocoded.city,
        zipcode: geocoded.zipcode,
        latitude: geocoded.lat,
        longitude: geocoded.lng
      }).eq('id', agencyId);
    }
    ```
  - Batch enrichment script for all agencies

- **Officer data enrichment** (if sources available):
  - Year of birth, race, sex (if available from public records)
  - Create intake forms for manual entry

- **Certification data enrichment**:
  - Populate certification_agencies with real data
  - Link appointments to correct certification agencies

- **Plan enrichment sprints**:
  - Sprint 1: Agency addresses (critical for maps/search)
  - Sprint 2: Geocoding all agencies
  - Sprint 3: Officer demographic data (if available)
  - Sprint 4: Certification details

#### 5.10 Retrospective & Lessons Learned
- **Hold migration retrospective meeting**:
  - Invite all stakeholders
  - Review timeline and milestones
  - Discuss what went well
  - Discuss challenges and how they were resolved
  - Identify improvements for future projects

- **Document lessons learned**:
  - `docs/migration-lessons-learned.md`
  - **What worked well**:
    - New pipeline first approach
    - State-by-state batching
    - Progress tracking and resume capability
  - **Challenges**:
    - [Document specific challenges faced]
    - Data quality issues
    - Performance optimization needs
  - **Recommendations**:
    - [Future recommendations]

- **Record metrics**:
  - Total timeline: [X weeks]
  - Data volume: [Y million records]
  - Issues encountered: [Z]
  - Downtime: [none, if successful]

- **Update migration playbook**:
  - Create template for future migrations
  - Based on this experience
  - Reusable for other NoSQL → SQL migrations

### Deliverables
- ✅ Firestore archived and set to read-only
- ✅ Firebase dependencies removed from codebase
- ✅ Documentation fully updated (README, DATABASE_DOCUMENTATION, architecture)
- ✅ Migration scripts archived
- ✅ Production system optimized (queries performing well)
- ✅ Data enrichment tools built
- ✅ Retrospective completed and documented
- ✅ Migration officially complete

### Success Criteria
- Archive verified and restorable
- Firestore successfully set to read-only
- No Firebase code remaining in codebase (except archives)
- Documentation accurate and complete
- Performance meets or exceeds baseline
- Data enrichment plan in place
- Lessons learned captured

---

## Summary: Migration Phases Overview

| Phase | Focus | Duration | Key Deliverable | Success Metric |
|-------|-------|----------|-----------------|----------------|
| **Phase 1** | Infrastructure Setup | 1 week | Supabase tables, tooling, monitoring | All validation scripts passing |
| **Phase 2** | New Data Pipeline | 3-4 weeks | Ingestion pipeline writing to Supabase | < 1% error rate on pilot state |
| **Phase 3** | Historical Migration | 4-6 weeks | All Firestore data in Supabase | < 1% data loss, integrity checks pass |
| **Phase 4** | Frontend Cutover | 2-3 weeks | Frontend using Supabase | Stable production, < 1% errors |
| **Phase 5** | Cleanup | 2-4 weeks | Firestore archived, Firebase removed | Documentation complete, optimized |
| **Total** | | **12-18 weeks** | **Complete migration** | **Production stable on Supabase** |

---

## Critical Success Factors

1. **Validation at Every Step**
   - Never proceed to next phase without validating current phase
   - Run validation scripts after every major operation
   - Manual spot-checks supplement automated validation

2. **Incremental Progress**
   - Use progress tracking for all long-running operations
   - Resume capability essential (migrations can fail/interrupt)
   - State-by-state batching reduces risk

3. **Rollback Plans**
   - Always have a way to revert if things go wrong
   - Test rollback procedures in staging
   - Document rollback steps clearly

4. **Comprehensive Monitoring**
   - Instrument everything: logs, metrics, alerts
   - Real-time visibility into migration progress
   - Early warning system for issues

5. **Clear Communication**
   - Keep stakeholders informed of progress
   - Transparent about challenges and risks
   - Regular status updates (weekly during active phases)

6. **Data Quality Over Completeness**
   - Accept that historical data has gaps (NULL fields)
   - Focus on structural correctness over 100% completeness
   - Plan for gradual enrichment post-migration

7. **Performance Focus**
   - Optimize queries from the start
   - Index appropriately
   - Monitor and tune continuously

8. **Team Readiness**
   - Ensure team understands new schema
   - Training on Supabase/PostgreSQL if needed
   - Clear ownership of each phase

---

## Key Dependencies Between Phases

```
Phase 1: Infrastructure & Schema Setup
    ↓
    Must be complete with all tables created and validated
    ↓
Phase 2: New Data Ingestion Pipeline
    ↓
    Must be working and validated with pilot state before proceeding
    ↓
Phase 3: Historical Data Migration
    ↓
    All historical data must be migrated and validated before frontend cutover
    ↓
Phase 4: Frontend Migration
    ↓
    Frontend must be stable on Supabase for 2+ weeks before cleanup
    ↓
Phase 5: Cleanup & Decommission
```

**Critical Path**: Cannot skip or parallelize phases. Each depends on successful completion of previous phase.

---

## Risk Assessment & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Data loss during migration | Medium | Critical | Validation scripts, manual spot-checks, maintain Firestore backup |
| Performance degradation | Medium | High | Performance testing in staging, query optimization, indexing |
| Frontend bugs post-cutover | High | High | Comprehensive testing, feature flag for rollback, gradual rollout |
| Extended migration timeline | Medium | Medium | Progress tracking, resume capability, parallel processing where safe |
| Data quality issues | High | Medium | Accept NULLs for non-critical fields, plan enrichment sprints |
| Team knowledge gaps | Medium | Medium | Training, documentation, pair programming |
| Unforeseen schema limitations | Low | High | Thorough schema review in Phase 1, flexibility to adjust |

---

## Next Steps

1. **Review and approve this plan** with all stakeholders
2. **Set up project tracking**:
   - Create epics for each phase
   - Create tasks for each deliverable
   - Assign owners
3. **Establish governance**:
   - Weekly status meetings
   - Decision-making process for issues
   - Escalation path for blockers
4. **Begin Phase 1**: Infrastructure & Schema Setup
   - Allocate resources (dev team, database admin, QA)
   - Set timeline for Phase 1 (target: 1 week)
   - Kickoff meeting

---

**Document Control**

- **Version**: 1.0
- **Date**: 2026-02-11
- **Author**: Claude Sonnet 4.5
- **Approvers**: [To be filled]
- **Status**: Draft - Pending Review

---

*This plan is a living document and may be updated as the migration progresses and new information becomes available.*
