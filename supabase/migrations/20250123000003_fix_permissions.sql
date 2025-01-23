-- Reset permissions
GRANT usage ON schema public TO postgres, anon, authenticated, service_role;

-- Grant access to all existing tables
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;

-- Grant access to all existing sequences
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant access to all existing functions
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Reset ownership of all tables to postgres
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    LOOP
        EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' OWNER TO postgres';
    END LOOP;
END $$;

-- Reset ownership of all sequences to postgres
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'public'
    LOOP
        EXECUTE 'ALTER SEQUENCE public.' || quote_ident(r.sequence_name) || ' OWNER TO postgres';
    END LOOP;
END $$;

-- Reset ownership of all functions to postgres
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT p.proname, l.lanname
        FROM pg_proc p
        LEFT JOIN pg_language l ON p.prolang = l.oid
        WHERE p.pronamespace = 'public'::regnamespace
    LOOP
        EXECUTE 'ALTER FUNCTION public.' || quote_ident(r.proname) || ' OWNER TO postgres';
    END LOOP;
END $$; 