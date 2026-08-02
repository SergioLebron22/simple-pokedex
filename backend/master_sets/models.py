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
