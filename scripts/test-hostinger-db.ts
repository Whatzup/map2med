import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function testHostingerDb() {
  const host = process.env.MYSQL_HOST || 'srv2108.hstgr.io';
  const port = parseInt(process.env.MYSQL_PORT || '3306', 10);
  const user = process.env.MYSQL_USER || 'u822437904_m2m_admin';
  const password = process.env.MYSQL_PASSWORD || 'Hareem@sep2026';
  const database = process.env.MYSQL_DATABASE || 'u822437904_map2medic';

  console.log(`[Hostinger DB Test] Connecting to ${user}@${host}:${port}/${database}...`);

  let connection;
  try {
    connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      database,
      connectTimeout: 10000,
    });

    console.log(`\n✅ [Hostinger DB Test SUCCESS]: Connected to Hostinger MySQL database "${database}"!`);

    // Define table creation queries for all 14 application tables
    const tableQueries = [
      {
        name: 'users',
        sql: `CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          uid VARCHAR(255) NOT NULL UNIQUE,
          email VARCHAR(255) NOT NULL,
          name VARCHAR(255),
          phone VARCHAR(100),
          role VARCHAR(50) NOT NULL DEFAULT 'patient',
          address TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );`
      },
      {
        name: 'user_logins',
        sql: `CREATE TABLE IF NOT EXISTS user_logins (
          id VARCHAR(255) PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          login_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          ip_address VARCHAR(100),
          user_agent TEXT,
          status VARCHAR(50) NOT NULL DEFAULT 'success',
          FOREIGN KEY (user_id) REFERENCES users(uid) ON DELETE CASCADE
        );`
      },
      {
        name: 'patients',
        sql: `CREATE TABLE IF NOT EXISTS patients (
          id VARCHAR(255) PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL UNIQUE,
          name VARCHAR(255) NOT NULL,
          age INT DEFAULT 35,
          gender VARCHAR(50),
          phone VARCHAR(100),
          address TEXT,
          landmark VARCHAR(255),
          emergency_contact_phone VARCHAR(100),
          mobility_status VARCHAR(100),
          recently_discharged VARCHAR(100),
          medical_notes TEXT,
          blood_group VARCHAR(20),
          allergies TEXT,
          date_of_birth VARCHAR(50),
          insurance_provider VARCHAR(255),
          insurance_policy_number VARCHAR(100),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(uid) ON DELETE CASCADE
        );`
      },
      {
        name: 'providers',
        sql: `CREATE TABLE IF NOT EXISTS providers (
          id VARCHAR(255) PRIMARY KEY,
          user_id VARCHAR(255),
          name VARCHAR(255) NOT NULL,
          title VARCHAR(255) NOT NULL,
          avatar TEXT,
          rating VARCHAR(20) DEFAULT '5.0',
          review_count INT DEFAULT 0,
          experience_years INT DEFAULT 1,
          distance_km VARCHAR(20) DEFAULT '2.0',
          eta_minutes INT DEFAULT 20,
          is_available BOOLEAN DEFAULT TRUE,
          current_location_name VARCHAR(255) DEFAULT 'Metro District',
          badges JSON,
          hourly_rate INT DEFAULT 50,
          completed_visits INT DEFAULT 0,
          phone VARCHAR(100),
          email VARCHAR(255),
          bio TEXT,
          date_of_birth VARCHAR(50),
          age INT DEFAULT 35,
          pending_payout INT DEFAULT 0,
          total_earnings_month INT DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(uid) ON DELETE CASCADE
        );`
      },
      {
        name: 'service_pricing',
        sql: `CREATE TABLE IF NOT EXISTS service_pricing (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          category VARCHAR(100) NOT NULL,
          sub_category VARCHAR(100),
          price INT NOT NULL,
          base_amount_label VARCHAR(100) NOT NULL,
          duration VARCHAR(100) NOT NULL,
          service_type VARCHAR(100) NOT NULL,
          description TEXT NOT NULL,
          includes JSON,
          popular BOOLEAN DEFAULT FALSE,
          requires_prescription BOOLEAN DEFAULT FALSE,
          priority VARCHAR(50),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );`
      },
      {
        name: 'bookings',
        sql: `CREATE TABLE IF NOT EXISTS bookings (
          id VARCHAR(255) PRIMARY KEY,
          patient_id VARCHAR(255),
          service_id VARCHAR(255),
          provider_id VARCHAR(255),
          patient_name VARCHAR(255),
          patient_age INT,
          patient_gender VARCHAR(50),
          patient_phone VARCHAR(100),
          patient_address TEXT,
          landmark VARCHAR(255),
          lift_availability VARCHAR(100),
          emergency_contact_phone VARCHAR(100),
          mobility_status VARCHAR(100),
          recently_discharged VARCHAR(100),
          service_name VARCHAR(255),
          provider_name VARCHAR(255),
          provider_phone VARCHAR(100),
          date VARCHAR(100) NOT NULL,
          time_slot VARCHAR(100) NOT NULL,
          status VARCHAR(50) NOT NULL DEFAULT 'confirmed',
          base_price INT NOT NULL,
          addons JSON,
          platform_fee INT NOT NULL DEFAULT 5,
          discount INT NOT NULL DEFAULT 0,
          total_amount INT NOT NULL,
          payment_method VARCHAR(50) NOT NULL DEFAULT 'card',
          payment_status VARCHAR(50) NOT NULL DEFAULT 'paid',
          medical_notes TEXT,
          vitals_recorded JSON,
          intake_intent VARCHAR(255),
          care_duration VARCHAR(100),
          otp_code VARCHAR(20),
          progress_checklist JSON,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (patient_id) REFERENCES users(uid) ON DELETE SET NULL,
          FOREIGN KEY (service_id) REFERENCES service_pricing(id) ON DELETE SET NULL,
          FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE SET NULL
        );`
      },
      {
        name: 'provider_documents',
        sql: `CREATE TABLE IF NOT EXISTS provider_documents (
          id VARCHAR(255) PRIMARY KEY,
          provider_id VARCHAR(255),
          patient_id VARCHAR(255),
          doc_type VARCHAR(100) NOT NULL,
          file_name VARCHAR(255) NOT NULL,
          uploaded_at VARCHAR(100) NOT NULL,
          status VARCHAR(50) NOT NULL DEFAULT 'pending_review',
          rejection_reason TEXT,
          expiry_date VARCHAR(100),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE,
          FOREIGN KEY (patient_id) REFERENCES users(uid) ON DELETE CASCADE
        );`
      },
      {
        name: 'reviews',
        sql: `CREATE TABLE IF NOT EXISTS reviews (
          id VARCHAR(255) PRIMARY KEY,
          booking_id VARCHAR(255),
          patient_id VARCHAR(255),
          provider_id VARCHAR(255) NOT NULL,
          rating INT NOT NULL,
          comment TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
          FOREIGN KEY (patient_id) REFERENCES users(uid) ON DELETE SET NULL,
          FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE
        );`
      },
      {
        name: 'prescriptions',
        sql: `CREATE TABLE IF NOT EXISTS prescriptions (
          id VARCHAR(255) PRIMARY KEY,
          booking_id VARCHAR(255),
          patient_id VARCHAR(255) NOT NULL,
          provider_id VARCHAR(255),
          medication_name VARCHAR(255) NOT NULL,
          dosage VARCHAR(100) NOT NULL,
          frequency VARCHAR(100) NOT NULL,
          instructions TEXT,
          duration_days INT DEFAULT 7,
          issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
          FOREIGN KEY (patient_id) REFERENCES users(uid) ON DELETE CASCADE,
          FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE SET NULL
        );`
      },
      {
        name: 'patient_vitals_history',
        sql: `CREATE TABLE IF NOT EXISTS patient_vitals_history (
          id VARCHAR(255) PRIMARY KEY,
          patient_id VARCHAR(255) NOT NULL,
          booking_id VARCHAR(255),
          blood_pressure_sys INT,
          blood_pressure_dia INT,
          heart_rate INT,
          temperature_c VARCHAR(50),
          spo2 INT,
          glucose_mg_dl INT,
          notes TEXT,
          recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (patient_id) REFERENCES users(uid) ON DELETE CASCADE,
          FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL
        );`
      },
      {
        name: 'provider_schedules',
        sql: `CREATE TABLE IF NOT EXISTS provider_schedules (
          id VARCHAR(255) PRIMARY KEY,
          provider_id VARCHAR(255) NOT NULL,
          day_of_week INT NOT NULL,
          start_time VARCHAR(50) NOT NULL,
          end_time VARCHAR(50) NOT NULL,
          is_active BOOLEAN NOT NULL DEFAULT TRUE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE
        );`
      },
      {
        name: 'payouts',
        sql: `CREATE TABLE IF NOT EXISTS payouts (
          id VARCHAR(255) PRIMARY KEY,
          provider_id VARCHAR(255) NOT NULL,
          amount INT NOT NULL,
          status VARCHAR(50) NOT NULL DEFAULT 'completed',
          payout_method VARCHAR(100) NOT NULL DEFAULT 'direct_deposit',
          payout_date DATETIME DEFAULT CURRENT_TIMESTAMP,
          transaction_ref VARCHAR(255),
          FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE
        );`
      },
      {
        name: 'care_messages',
        sql: `CREATE TABLE IF NOT EXISTS care_messages (
          id VARCHAR(255) PRIMARY KEY,
          booking_id VARCHAR(255),
          sender_id VARCHAR(255) NOT NULL,
          receiver_id VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          is_read BOOLEAN NOT NULL DEFAULT FALSE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
          FOREIGN KEY (sender_id) REFERENCES users(uid) ON DELETE CASCADE,
          FOREIGN KEY (receiver_id) REFERENCES users(uid) ON DELETE CASCADE
        );`
      },
      {
        name: 'notifications',
        sql: `CREATE TABLE IF NOT EXISTS notifications (
          id VARCHAR(255) PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL,
          title VARCHAR(255) NOT NULL,
          body TEXT NOT NULL,
          type VARCHAR(50) NOT NULL DEFAULT 'general',
          is_read BOOLEAN NOT NULL DEFAULT FALSE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(uid) ON DELETE CASCADE
        );`
      }
    ];

    console.log(`\n[Hostinger DB Migration] Executing DDL table creation for 14 concept tables...`);
    for (const item of tableQueries) {
      await connection.query(item.sql);
      console.log(`  ✓ Table created/verified: ${item.name}`);
    }

    const [rows]: any = await connection.query('SHOW TABLES');
    const tableList = rows.map((r: any) => Object.values(r)[0]);
    console.log(`\n🎉 [Hostinger DB Complete] Verified ${tableList.length} tables in database "${database}":`);
    console.log(tableList.map((t: any) => `   • ${t}`).join('\n'));

    await connection.end();
    process.exit(0);
  } catch (error: any) {
    console.error(`\n❌ [Hostinger DB Test FAILED]:`, error.message || error);
    if (connection) await connection.end();
    process.exit(1);
  }
}

testHostingerDb();
