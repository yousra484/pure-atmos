@echo off
echo Linking to Supabase project...
npx supabase link --project-ref uawbrrkphwwwnrsyfxdp
echo.
echo Pushing migrations to database...
npx supabase db push
echo.
echo Done!
pause
