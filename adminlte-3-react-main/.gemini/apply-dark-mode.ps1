# Dark Mode Update Script
# This script applies dark mode classes to all index.tsx files

$files = @(
    "assemblyIssue\index.tsx",
    "events\index.tsx",
    "voter\index.tsx",
    "visitors\index.tsx",
    "memberList\index.tsx",
    "samiti\index.tsx",
    "subtypeOfWork\index.tsx",
    "department\index.tsx",
    "phoneDirectory\index.tsx",
    "worktype\index.tsx",
    "inDocs\index.tsx",
    "inwardRegister\index.tsx",
    "dispatchRegister\index.tsx",
    "callManagement\index.tsx"
)

$basePath = "d:\Akalp\AdminLTE\adminlte-3-react-main\src\views\"

$replacements = @{
    'className="bg-white rounded-xl shadow-lg border border-gray-200' = 'className="bg-white dark:bg-card rounded-xl shadow-lg border border-gray-200 dark:border-gray-800'
    'className="p-6 border-b border-gray-200"' = 'className="p-6 border-b border-gray-200 dark:border-gray-800"'
    'className="pl-12 h-12 text-base"' = 'className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-all duration-200 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200 dark:focus:bg-[#202123] dark:text-gray-200"'
    'className="px-6 py-3 border-b border-gray-200 bg-gray-50"' = 'className="px-6 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50"'
    'className="w-36 h-9 bg-white text-sm"' = 'className="w-36 h-9 bg-white dark:bg-[#202123] text-sm dark:border-gray-700 dark:text-gray-300"'
    'className="px-6 py-3 border-b border-gray-200 flex justify-start"' = 'className="px-6 py-3 border-b border-gray-200 dark:border-gray-800 flex justify-start"'
    'className="bg-gray-50"' = 'className="bg-gray-50 dark:bg-gray-800/50 hover:bg-transparent border-gray-200 dark:border-gray-800"'
    'className="text-white font-semibold"' = 'className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs"'
    'className="text-center py-20 text-gray-500"' = 'className="text-center py-20 text-gray-500 dark:text-gray-400"'
    'className="hover:bg-gray-50 transition-colors"' = 'className="hover:bg-gray-50 dark:hover:bg-white/5 border-gray-100 dark:border-gray-800 transition-colors"'
    'className="border-t border-gray-200 p-6"' = 'className="border-t border-gray-200 dark:border-gray-800 p-6 bg-gray-50/30 dark:bg-gray-800/30"'
    'className="text-sm text-gray-600"' = 'className="text-sm text-gray-600 dark:text-gray-400"'
}

foreach ($file in $files) {
    $fullPath = Join-Path $basePath $file
    if (Test-Path $fullPath) {
        Write-Host "Processing: $file"
        $content = Get-Content $fullPath -Raw
        
        foreach ($key in $replacements.Keys) {
            $content = $content -replace [regex]::Escape($key), $replacements[$key]
        }
        
        Set-Content $fullPath -Value $content -NoNewline
        Write-Host "  ✓ Updated: $file"
    } else {
        Write-Host "  ✗ Not found: $file"
    }
}

Write-Host "`nDark mode update complete!"
