const express = require('express');
const mysql = require('mysql2');
const AWS = require('aws-sdk');
const cors = require('cors');

const app = express();
const port = 3000;

// Konfigurasi CORS
app.use(cors({
  origin: 'http://127.0.0.1:5500' // Sesuaikan kalau frontend pindah IP
}));

// Konfigurasi AWS S3
const s3 = new AWS.S3({
  region: 'ap-southeast-2',
  accessKeyId: 'AKIAXNGUVTZQG6JCHKC4',
  secretAccessKey: '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'
});

const bucketName = 'bucketutstio';

// Koneksi ke MySQL RDS
const db = mysql.createConnection({
  host: 'dbutstio.cbi8w4w8256z.ap-southeast-2.rds.amazonaws.com',
  user: 'admin',
  password: 'Bramantio123#',
  database: 'dbutstio'
});

db.connect(err => {
  if (err) {
    console.error('❌ Gagal koneksi ke database:', err);
  } else {
    console.log('✅ Terhubung ke database MySQL RDS');
  }
});

// Endpoint API motor
app.get('/api/motor', (req, res) => {
  const query = 'SELECT id, nama, merek, harga, size, gambar_key FROM motor';

  db.query(query, (err, results) => {
    if (err) {
      console.error('❌ Query error:', err);
      return res.status(500).json({ error: 'Gagal mengambil data motor', details: err });
    }

    const motor = results.map(item => {
      const gambarUrl = s3.getSignedUrl('getObject', {
        Bucket: bucketName,
        Key: item.gambar_key,
        Expires: 3600 // 1 jam
      });

      return {
        id: item.id,
        nama: item.nama,
        merek: item.merek,
        harga: item.harga,
        size: item.size,
        gambar: gambarUrl
      };
    });

    res.json(motor);
  });
});

app.listen(port, () => {
  console.log(`✅ Backend berjalan di http://localhost:${port}`);
});
