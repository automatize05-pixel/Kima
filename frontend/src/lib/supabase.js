import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pdhdbiukvbgokkvjcqks.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkaGRiaXVrdmJnb2trdmpjcWtzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzA1MjA5OCwiZXhwIjoyMDkyNjI4MDk4fQ.5asDsIsYw_DqcAt4jrqxRDkUMMTQixTbZBmt8MkF31o';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
