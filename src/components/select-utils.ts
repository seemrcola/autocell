export function getRelativeOptionIndex(currentIndex: number, optionCount: number, direction: -1 | 1): number {
  if (optionCount <= 0) {
    return currentIndex;
  }

  return (currentIndex + direction + optionCount) % optionCount;
}
