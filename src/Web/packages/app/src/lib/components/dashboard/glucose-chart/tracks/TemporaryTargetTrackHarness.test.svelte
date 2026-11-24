<script lang="ts">
  import { Chart, Rule, Svg } from "layerchart";
  import { scaleTime } from "d3-scale";
  import TemporaryTargetTrack from "./TemporaryTargetTrack.svelte";
  import {
    partialEngine,
    setGlucoseChartContext,
  } from "../chart-context.svelte";
  import { computeTrackLayout } from "../engine/track-layout";
  import type { GlucoseChartContext } from "../chart-context.svelte";
  import type { DisplayTemporaryTargetSpan } from "../engine/chart-data-view.svelte";

  interface Props {
    spans: DisplayTemporaryTargetSpan[];
    from: Date;
    to: Date;
    /** Draws a glucose rule at this mg/dL the way ThresholdRule does. */
    ruleAt?: number;
  }

  let { spans, from, to, ruleAt }: Props = $props();

  const height = 300;
  const glucoseYMax = 400;

  const engineStub = partialEngine({
    get displayTemporaryTargetSpans() {
      return spans;
    },
  });

  const layout = computeTrackLayout(
    height,
    glucoseYMax,
    1,
    1,
    { basal: false, iob: false, cob: false },
    { pumpMode: false, override: false, profile: false, activity: false }
  );

  const ctx: GlucoseChartContext = {
    get engine() {
      return engineStub;
    },
    get layout() {
      return layout;
    },
  };
  setGlucoseChartContext(ctx);
</script>

<div class="h-[300px] w-[400px]">
  <Chart
    data={[]}
    x={(d: { time: Date }) => d.time}
    xScale={scaleTime()}
    xDomain={[from, to]}
    yDomain={[0, glucoseYMax]}
    padding={{ left: 0, right: 0, top: 0, bottom: 0 }}
  >
    <Svg>
      <TemporaryTargetTrack />
      {#if ruleAt != null}
        <g data-testid="reference-rule">
          <Rule y={layout.glucose.scale(ruleAt)} />
        </g>
      {/if}
    </Svg>
  </Chart>
</div>
