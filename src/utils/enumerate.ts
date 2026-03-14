export function enumerate<A, B>(lst1: A[], lst2: B[]): [A, B][] {
  if (lst1.length !== lst2.length) {
    throw Error("Both lists should have the same length");
  }
  const res: [A, B][] = [];
  for (let i = 0; i < lst1.length; i++) {
    res.push([lst1[i]!, lst2[i]!]);
  }

  return res;
}
