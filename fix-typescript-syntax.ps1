# PowerShell script to fix all remaining TypeScript syntax in JavaScript files

Write-Host "Fixing all remaining TypeScript syntax..."

# Get all JS/JSX files
$files = Get-ChildItem -Recurse -Include "*.js","*.jsx" -Exclude "node_modules"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Fix import type statements
    $content = $content -replace 'import type (\w+) from', 'import $1 from'
    
    # Fix type annotations in function parameters
    $content = $content -replace '(\w+):\s*(\w+(?:\|[\w\s]+)*)\s*([,=)])', '$1$3'
    
    # Fix generic types
    $content = $content -replace '<[^>]*>', ''
    
    # Fix interface and type definitions
    $content = $content -replace 'interface\s+\w+\s*\{[^}]*\}', ''
    $content = $content -replace 'type\s+\w+\s*=\s*[^;]+;', ''
    
    # Fix React.ComponentProps
    $content = $content -replace 'React\.ComponentProps<[^>]*>', ''
    
    # Fix type assertions
    $content = $content -replace 'as\s+\w+', ''
    
    # Fix import * syntax
    $content = $content -replace 'import \*\s+from', 'import * as React from'
    
    # Clean up extra spaces and empty lines
    $content = $content -replace '\n\s*\n\s*\n', "`n`n"
    
    # Write the updated content back
    Set-Content -Path $file.FullName -Value $content -NoNewline
    
    Write-Host "Fixed: $($file.FullName)"
}

Write-Host "All TypeScript syntax fixed!"

