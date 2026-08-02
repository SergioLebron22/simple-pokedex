function leadingNumber(localId) {
  const match = /^(\d+)/.exec(localId || '');
  return match ? parseInt(match[1], 10) : null;
}

export function compareByLocalId(a, b) {
  const aId = a?.localId || '';
  const bId = b?.localId || '';
  const aNum = leadingNumber(aId);
  const bNum = leadingNumber(bId);

  if (aNum != null && bNum != null) {
    if (aNum !== bNum) return aNum - bNum;
    return aId.localeCompare(bId);
  }
  if (aNum != null) return -1;
  if (bNum != null) return 1;
  return aId.localeCompare(bId);
}
