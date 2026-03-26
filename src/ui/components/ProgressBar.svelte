<script lang="ts">
let {
	percent = 0,
	text = '',
	active = false,
}: {
	percent: number;
	text: string;
	active: boolean;
} = $props();
</script>

<div class="progress-container" class:active>
  <div class="progress-bar">
    <div class="progress-fill" style:width="{percent}%"></div>
  </div>
  <div class="progress-text">{text}</div>
</div>
