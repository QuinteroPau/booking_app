import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tgybdibpjepzokfnolab.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRneWJkaWJwamVwem9rZm5vbGFiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODgxNTUxOCwiZXhwIjoyMDY0MzkxNTE4fQ.IgoNOmf0cHiEb7ufCstmfC9yLx8m4u0TCK8Jnda8WGM'

const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase