export async function onIncrement(previousValue: number) {
  console.log("Côté backend")
  return previousValue + 1;
}