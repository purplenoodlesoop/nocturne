<script lang="ts">
  import { ChartClipPath, getChartContext } from "layerchart";
  import { getGlucoseChartContext } from "../chart-context.svelte";

  const ctx = getGlucoseChartContext();
  const chartCtx = getChartContext();

  // A path rather than a rect: a single-value target has no height, and SVG
  // draws no rect of height 0, while a closed path still strokes its outline.
  const bands = $derived(
    ctx.engine.displayTemporaryTargetSpans.map((span) => {
      const x0 = chartCtx.xScale(span.displayStart);
      const x1 = chartCtx.xScale(span.displayEnd);
      const top = ctx.layout.glucose.scale(span.high);
      const bottom = ctx.layout.glucose.scale(span.low);
      return {
        key: `${span.id}-${span.startTime.getTime()}`,
        d: `M${x0},${top}H${x1}V${bottom}H${x0}Z`,
      };
    })
  );
</script>

<!-- Temporary targets, styled as the Time spans page draws them over the
     scheduled target. Their reason and value are in the tooltip. -->
<ChartClipPath>
  {#each bands as band (band.key)}
    <path
      d={band.d}
      class="fill-foreground/30 stroke-foreground stroke-1 print:fill-foreground/20"
      data-testid="temporary-target"
    />
  {/each}
</ChartClipPath>
