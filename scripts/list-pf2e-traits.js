/**
 * Script to list all valid PF2e traits from the system
 * Run this in the browser console while Foundry VTT is loaded with the PF2e system
 * 
 * Usage: Copy and paste this entire script into the browser console (F12)
 */

(() => {
  // Check if we're in a PF2e game
  if (game.system.id !== 'pf2e') {
    console.error('This script requires the PF2e system to be active.');
    return;
  }

  const CONFIG_PF2E = game.pf2e?.system?.CONFIG ?? CONFIG.PF2E;
  
  if (!CONFIG_PF2E) {
    console.error('Could not find PF2e configuration.');
    return;
  }

  // Collect all trait categories
  const traitCategories = {
    // Action/Ability traits
    actionTraits: CONFIG_PF2E.actionTraits ?? {},
    
    // Spell traits
    spellTraits: CONFIG_PF2E.spellTraits ?? {},
    
    // Weapon traits
    weaponTraits: CONFIG_PF2E.weaponTraits ?? {},
    
    // Armor traits
    armorTraits: CONFIG_PF2E.armorTraits ?? {},
    
    // Equipment traits
    equipmentTraits: CONFIG_PF2E.equipmentTraits ?? {},
    
    // NPC/Monster traits
    npcAttackTraits: CONFIG_PF2E.npcAttackTraits ?? {},
    
    // Creature traits
    creatureTraits: CONFIG_PF2E.creatureTraits ?? {},
    
    // Feat traits
    featTraits: CONFIG_PF2E.featTraits ?? {},
    
    // Damage types (often used as traits)
    damageTypes: CONFIG_PF2E.damageTypes ?? {},
    
    // Magic traditions
    magicTraditions: CONFIG_PF2E.magicTraditions ?? {},
  };

  // Format output
  console.group('%c📜 PF2e System Traits', 'font-size: 16px; font-weight: bold; color: #5e0000;');
  
  for (const [category, traits] of Object.entries(traitCategories)) {
    if (Object.keys(traits).length === 0) continue;
    
    const traitKeys = Object.keys(traits).sort();
    console.groupCollapsed(`%c${category} (${traitKeys.length} traits)`, 'font-weight: bold; color: #1e88e5;');
    console.table(
      traitKeys.map(key => ({
        trait: key,
        label: typeof traits[key] === 'string' ? traits[key] : traits[key]?.label ?? key
      }))
    );
    console.groupEnd();
  }

  console.groupEnd();

  // Also create a combined list of all unique traits
  const allTraits = new Set();
  for (const traits of Object.values(traitCategories)) {
    for (const key of Object.keys(traits)) {
      allTraits.add(key);
    }
  }

  const sortedTraits = [...allTraits].sort();
  
  console.group('%c📋 All Unique Traits (Combined)', 'font-size: 14px; font-weight: bold; color: #2e7d32;');
  console.log(`Total unique traits: ${sortedTraits.length}`);
  console.log(sortedTraits.join(', '));
  console.groupEnd();

  // Return for programmatic access
  return {
    categories: traitCategories,
    allTraits: sortedTraits
  };
})();
