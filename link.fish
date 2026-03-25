#!/usr/bin/env fish

# Harbinger House PF2e — Foundry Symlink Setup
# Creates a symlink from the local build folder into your Foundry modules directory.
# Run 'pnpm run build' (or 'pnpm run watch') first, then run this script once.

set -l script_dir (dirname (realpath (status --current-filename)))
set -l module_id "harbinger-house-pf2e"
set -l build_dir "$script_dir/build/$module_id"

echo ""
echo "Harbinger House PF2e — Foundry Symlink Setup"
echo "============================================="
echo ""

# Prompt for Foundry data path
read -P "Enter the full path to your Foundry data folder: " data_path

# Strip trailing whitespace and slashes
set data_path (string trim $data_path | string trim --right --chars="/")

if test -z "$data_path"
    echo "No path entered. Aborting."
    exit 1
end

# Append /Data if the path doesn't already end with it
if not string match -qr '\bData$' -- $data_path
    set data_path "$data_path/Data"
end

# Validate the directory exists
if not test -d "$data_path"
    echo "No folder found at \"$data_path\""
    exit 1
end

set symlink_path "$data_path/modules/$module_id"

# Handle existing entry at the symlink path
if test -L "$symlink_path"
    set existing_type "symlink"
else if test -d "$symlink_path"
    set existing_type "folder"
else if test -e "$symlink_path"
    set existing_type "file"
else
    set existing_type ""
end

if test -n "$existing_type"
    echo ""
    echo "A \"$module_id\" $existing_type already exists at:"
    echo "  $symlink_path"
    read -P "Replace with new symlink? [y/N] " confirm
    if not string match -qi "y" -- $confirm
        echo "Aborting."
        exit 0
    end

    if test "$existing_type" = "folder"
        rm -rf "$symlink_path"
    else
        rm "$symlink_path"
    end
end

# Ensure the build exists before linking
if not test -d "$build_dir"
    echo ""
    echo "Build directory not found at:"
    echo "  $build_dir"
    echo ""
    echo "Run 'pnpm run build' first, then re-run this script."
    exit 1
end

# Create the symlink
ln -s "$build_dir" "$symlink_path"

if test $status -eq 0
    echo ""
    echo "Symlink created:"
    echo "  $symlink_path"
    echo "  -> $build_dir"
    echo ""
    echo "Run 'pnpm run watch' to keep the build updated as you develop."
else
    echo "Failed to create symlink."
    exit 1
end
