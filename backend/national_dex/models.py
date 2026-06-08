from django.conf import settings
from django.db import models


class NationalDexBinder(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='national_dex_binder',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email}'s National Dex Binder"


class NationalDexCard(models.Model):
    binder = models.ForeignKey(
        NationalDexBinder,
        on_delete=models.CASCADE,
        related_name='cards',
    )
    pokemon_name = models.CharField(max_length=100)   # PokeAPI slug, e.g. "pikachu-gmax"
    name         = models.CharField(max_length=100)   # TCG card display name
    tcg_image    = models.URLField(max_length=500, blank=True)
    tcg_set      = models.CharField(max_length=200, blank=True)
    tcg_card_id  = models.CharField(max_length=50, blank=True)
    tcg_local_id = models.CharField(max_length=20, blank=True)
    notes        = models.TextField(blank=True)
    owned        = models.BooleanField(default=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['binder', 'pokemon_name']

    def __str__(self):
        return f"{self.pokemon_name}: {self.name}"
