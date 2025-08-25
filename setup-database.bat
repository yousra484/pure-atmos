@echo off
echo Setting up Atmos Africa Connect Database...
echo.

echo Checking if Supabase CLI is installed...
npx supabase --version
if %errorlevel% neq 0 (
    echo Installing Supabase CLI...
    npm install -g supabase
)

echo.
echo Starting Supabase local development...
npx supabase start

echo.
echo Applying database migrations...
npx supabase db reset --linked=false

echo.
echo Database setup complete!
echo You can now run: npm run dev
pause
