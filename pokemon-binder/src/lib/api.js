export const API_BASE = process.env.REACT_APP_API_URL ?? '';
export const apiUrl = (path) => `${API_BASE}${path}`;

export function toApiCard(card) {
  return {
    name:         card.name         ?? '',
    tcg_image:    card.tcgImage     ?? '',
    tcg_set:      card.tcgSet       ?? '',
    tcg_card_id:  card.tcgCardId    ?? '',
    tcg_local_id: card.tcgLocalId   ?? '',
    notes:        card.notes        ?? '',
    owned:        card.owned        ?? true,
  };
}

export function fromApiCard(data) {
  return {
    name:       data.name         ?? '',
    tcgImage:   data.tcg_image    ?? '',
    tcgSet:     data.tcg_set      ?? '',
    tcgCardId:  data.tcg_card_id  ?? '',
    tcgLocalId: data.tcg_local_id ?? '',
    notes:      data.notes        ?? '',
    owned:      data.owned        ?? true,
  };
}
