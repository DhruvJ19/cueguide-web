# Setup Instructions for CueGuide Supabase

## Database Setup

The Supabase CLI is having network issues on this machine. Please set up the database manually:

### Option 1: Run SQL in Supabase Dashboard (Recommended)

1. Go to: https://supabase.com/dashboard/project/yfjubuvpxrxquppgqazx/sql
2. Copy and paste the contents of `supabase/schema.sql` into the SQL editor
3. Click "Run" to execute

### Option 2: Use Supabase CLI (if network issues resolve)

```bash
cd CueGuide
supabase db push
```

---

## Project is Connected! 

Your CueGuide app is now configured with:

- **Supabase URL:** https://yfjubuvpxrxquppgqazx.supabase.co
- **API Key:** Configured in `.env.local`

The app works in offline-first mode - it uses local AsyncStorage by default and will sync to Supabase once the database schema is set up.

---

## Next Steps

1. Set up the database schema (see above)
2. Run the app: `cd CueGuide && npx expo run:ios`

The app will automatically connect to Supabase when:
- Database tables exist
- User signs up/logs in