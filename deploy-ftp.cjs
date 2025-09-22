// eslint-disable-next-line @typescript-eslint/no-require-imports
const ftp = require('basic-ftp');

async function deploy() {
   const client = new ftp.Client();
   client.ftp.verbose = true;

   try {
      console.log('🚀 Connecting to Bunny CDN...');

      await client.access({
         host: 'storage.bunnycdn.com',
         port: 21,
         user: 'exporteru-cache',
         password: 'aebfead0-5fcf-498a-9f329d809b95-9ca7-45bc',
         secure: false
      });

      console.log('✅ Connected! We are in /exporteru-cache/');

      // Просто загружаем ВСЕ из .next/static в текущую папку (/exporteru-cache/)
      console.log('📤 Uploading ALL static files...');
      await client.uploadFromDir('./.next/static');

      console.log('📤 Uploading public files...');
      await client.uploadFromDir('./public');

      console.log('✅ All files uploaded to Bunny CDN root!');
      console.log('🌐 Files will be available at:');
      console.log('   - https://exporteru.b-cdn.net/[filename]');

   } catch (error) {
      console.error('❌ Failed:', error.message);
      process.exit(1);
   } finally {
      client.close();
   }
}

deploy();