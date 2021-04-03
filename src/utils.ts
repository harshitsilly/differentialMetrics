export function formatBytes(value: number, symbol = " MB"): string {
  return (
    new Intl.NumberFormat("en").format((value / 1024 / 1024).toFixed(
      2
    ) as any) + symbol
  );
}
