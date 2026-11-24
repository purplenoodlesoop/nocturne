import { render } from "vitest-browser-svelte";
import { describe, it, expect } from "vitest";
import Harness from "./TemporaryTargetTrackHarness.test.svelte";

const from = new Date("2026-01-01T12:00:00Z");
const to = new Date("2026-01-01T14:00:00Z");
const minutes = (m: number) => new Date(from.getTime() + m * 60_000);

const span = (
  id: string,
  start: number,
  end: number,
  low: number,
  high: number
) => ({
  id,
  startTime: minutes(start),
  endTime: minutes(end),
  displayStart: minutes(start),
  displayEnd: minutes(end),
  low,
  high,
  reason: null,
});

function bands(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<SVGPathElement>(
      '[data-testid="temporary-target"]'
    )
  );
}

describe("TemporaryTargetTrack", () => {
  it("draws one band per temporary target across its span", async () => {
    const { container } = render(Harness, {
      from,
      to,
      spans: [
        span("eating-soon", 0, 45, 72, 72),
        span("range", 60, 120, 90, 110),
      ],
    });

    const drawn = bands(container);
    expect(drawn).toHaveLength(2);
    const box = drawn[1].getBBox();
    expect(box.width).toBeCloseTo(200, 0);
    expect(box.height).toBeGreaterThan(0);
  });

  it("still draws a single-value target, which has no height", async () => {
    const { container } = render(Harness, {
      from,
      to,
      spans: [span("eating-soon", 0, 45, 72, 72)],
    });

    const [band] = bands(container);
    expect(band.getBBox().width).toBeCloseTo(150, 0);
    expect(band.getBBox().height).toBe(0);
    expect(band.getAttribute("class")).toContain("stroke-foreground");
  });

  it("draws a higher target higher, at the same height as a glucose rule", async () => {
    const { container } = render(Harness, {
      from,
      to,
      spans: [span("low", 0, 30, 72, 72), span("high", 30, 60, 200, 200)],
      ruleAt: 200,
    });

    const [low, high] = bands(container).map((b) => b.getBBox().y);
    expect(high).toBeLessThan(low);
    const rule = container.querySelector<SVGLineElement>(
      '[data-testid="reference-rule"] line'
    );
    expect(rule).not.toBeNull();
    expect(high).toBeCloseTo(rule!.getBBox().y, 0);
  });

  it("draws nothing without temporary targets", async () => {
    const { container } = render(Harness, { from, to, spans: [] });
    expect(bands(container)).toHaveLength(0);
  });
});
