<script lang="ts">
  interface Category {
    id: string;
    label: string;
    count: number;
  }

  let {
    title,
    icon,
    enabled = $bindable(true),
    categories,
    selectedIds = $bindable<string[]>([]),
    description,
  }: {
    title: string;
    icon: string;
    enabled: boolean;
    categories?: Category[];
    selectedIds?: string[];
    description?: string;
  } = $props();

  function toggleCategory(id: string, checked: boolean) {
    if (checked) {
      selectedIds = [...selectedIds, id];
    } else {
      selectedIds = selectedIds.filter(i => i !== id);
    }
  }
</script>

<div class="content-section">
  <div class="section-title">
    <i class="fas {icon}"></i>
    {title}
    <label style="margin-left: auto; font-weight: normal; font-size: 12px;">
      <input type="checkbox" bind:checked={enabled}> Import
    </label>
  </div>

  {#if description}
    <p style="font-size: 12px; color: #b0a8b9; margin: 4px 0;">
      {description}
    </p>
  {/if}

  {#if categories && enabled}
    <div class="category-grid">
      {#each categories as cat}
        <label class="category-item">
          <input
            type="checkbox"
            checked={selectedIds.includes(cat.id)}
            onchange={(e: Event) => toggleCategory(cat.id, (e.currentTarget as HTMLInputElement).checked)}
          >
          {cat.label}
          <span class="category-count">({cat.count})</span>
        </label>
      {/each}
    </div>
  {/if}
</div>
