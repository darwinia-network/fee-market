export const isTheGraphEntities = <T>(entities: unknown): entities is T[] => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (entities as any)?.nodes === undefined;
};

export const isSubQueryEntities = <T>(entities: unknown): entities is { nodes: T[] } => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (entities as any)?.nodes !== undefined;
};
