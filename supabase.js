require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️  Falta SUPABASE_URL o SUPABASE_ANON_KEY en el archivo .env');
  console.warn('    Copia el archivo .env.example como .env y completa tus datos.');
}

module.exports = createClient(supabaseUrl, supabaseAnonKey);