from django.conf import settings
from django.db import models


class MasterSetCard(models.Model):
    user        = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='master_set_cards',
    )
    set_id      = models.CharField(max_length=50)
    tcg_card_id = models.CharField(max_length=50)
    owned       = models.BooleanField(default=False)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['user', 'set_id', 'tcg_card_id']
        indexes = [models.Index(fields=['user', 'set_id'])]

    def __str__(self):
        return f"{self.user.email} — {self.tcg_card_id} ({'owned' if self.owned else 'missing'})"


class MasterSetCardVariant(models.Model):
    """Tracks ownership of a specific print variant (holo, reverse holo, ...)
    of a card. The frontend gives holo/reverse-holo prints their own binder
    slots, backed by rows here — `MasterSetCard.owned` above backs the plain
    ("normal") print slot when that print exists at all.
    """
    user        = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='master_set_card_variants',
    )
    set_id      = models.CharField(max_length=50)
    tcg_card_id = models.CharField(max_length=50)
    variant     = models.CharField(max_length=20)  # tcgdex variant key, e.g. 'holo', 'reverse'
    owned       = models.BooleanField(default=False)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['user', 'set_id', 'tcg_card_id', 'variant']
        indexes = [models.Index(fields=['user', 'set_id'])]

    def __str__(self):
        return f"{self.user.email} — {self.tcg_card_id} [{self.variant}] ({'owned' if self.owned else 'missing'})"


class MasterSetTotalSlots(models.Model):
    """Cached, global (not per-user) count of how many binder slots a set has
    once holo/reverse-holo variant slots are counted — expensive to compute
    (requires fetching every card's print-variant data from tcgdex), so it's
    computed client-side once by whoever opens that set's binder first and
    reported back here to be shared with everyone afterward, rather than
    crawled server-side for all ~200+ sets up front.
    """
    set_id      = models.CharField(max_length=50, unique=True)
    total_slots = models.PositiveIntegerField()
    updated_at  = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.set_id}: {self.total_slots} slots"
