#!/usr/bin/env fish

# Harbinger House PF2e Module Build Script

set -l script_dir (dirname (status --current-filename))
cd $script_dir

echo "🏠 Building Harbinger House PF2e Module..."

# Check if harbinger_house_complete.md exists
if not test -f harbinger_house_complete.md
    echo "❌ Error: harbinger_house_complete.md not found!"
    echo "   Make sure this file is in the project root."
    exit 1
end

echo "✅ Found harbinger_house_complete.md"

# Install dependencies if needed
if not test -d node_modules
    echo "📦 Installing dependencies..."
    pnpm install
end

# Clean old build
echo "🧹 Cleaning old build..."
pnpm run clean

# Build the module
echo "🔨 Building TypeScript..."
pnpm run build

# Check if build succeeded
if test $status -eq 0
    echo "✅ Build successful!"
    
    # Show output file size
    set -l output_size (du -h dist/module.js | cut -f1)
    echo "   Output: dist/module.js ($output_size)"
    
    # Count journals that will be available
    set -l journal_count (grep -c "^## " harbinger_house_complete.md)
    echo "   Journals parsed: ~$journal_count entries"
    
    echo ""
    echo "🎲 Module ready for FoundryVTT!"
    echo "   Copy this directory to:"
    echo "   <FoundryData>/Data/modules/harbinger-house-pf2e"
else
    echo "❌ Build failed! Check errors above."
    exit 1
end
