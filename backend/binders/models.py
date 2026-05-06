from django.conf import settings
from django.db import models


class CustomBinder(models.Model):
    user         = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='custom_binders',
    )
    name         = models.CharField(max_length=100)
    bg_color     = models.CharField(max_length=20, default='#1a1a2e')
    binder_color = models.CharField(max_length=20, default='#4a4a5a')
    grid_cols    = models.PositiveSmallIntegerField(default=4)
    grid_rows    = models.PositiveSmallIntegerField(default=3)
    page_count   = models.PositiveSmallIntegerField(default=20)
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.user.email} — {self.name} ({self.grid_cols}×{self.grid_rows})"


class CustomBinderSlot(models.Model):
    binder       = models.ForeignKey(
        CustomBinder,
        on_delete=models.CASCADE,
        related_name='slots',
    )
    slot_index   = models.PositiveIntegerField()
    name         = models.CharField(max_length=100)
    tcg_image    = models.URLField(max_length=500, blank=True)
    tcg_set      = models.CharField(max_length=200, blank=True)
    tcg_card_id  = models.CharField(max_length=50, blank=True)
    tcg_local_id = models.CharField(max_length=20, blank=True)
    notes        = models.TextField(blank=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['binder', 'slot_index']
        ordering = ['slot_index']

    def __str__(self):
        return f"Slot {self.slot_index}: {self.name}"
