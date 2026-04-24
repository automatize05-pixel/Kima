import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pdhdbiukvbgokkvjcqks.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkaGRiaXVrdmJnb2trdmpjcWtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNTIwOTgsImV4cCI6MjA5MjYyODA5OH0.y_nr6qK8jAyUrkvA2MAXuacrxXaklIj0K3mvrtuairs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
