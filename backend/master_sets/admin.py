from django.contrib import admin

from .models import MasterSetCard


@admin.register(MasterSetCard)
class MasterSetCardAdmin(admin.ModelAdmin):
    list_display = ('user', 'set_id', 'tcg_card_id', 'owned', 'updated_at')
    list_filter  = ('owned', 'set_id')
