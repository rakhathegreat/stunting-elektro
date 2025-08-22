// src/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://hvkbugmzlrnghgqcffnw.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2a2J1Z216bHJuZ2hncWNmZm53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NTIyMTYsImV4cCI6MjA3MTIyODIxNn0.2rkNMU0q28nWdJ04_8H_S-8qma-8evm00Z7XkK_y0zs";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
