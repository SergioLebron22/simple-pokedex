from django.contrib import admin

from .models import MasterSetCard, MasterSetCardVariant, MasterSetTotalSlots


@admin.register(MasterSetCard)
class MasterSetCardAdmin(admin.ModelAdmin):
    list_display = ('user', 'set_id', 'tcg_card_id', 'owned', 'updated_at')
    list_filter  = ('owned', 'set_id')


@admin.register(MasterSetCardVariant)
class MasterSetCardVariantAdmin(admin.ModelAdmin):
    list_display = ('user', 'set_id', 'tcg_card_id', 'variant', 'owned', 'updated_at')
    list_filter  = ('owned', 'variant', 'set_id')


@admin.register(MasterSetTotalSlots)
class MasterSetTotalSlotsAdmin(admin.ModelAdmin):
    list_display = ('set_id', 'total_slots', 'updated_at')
