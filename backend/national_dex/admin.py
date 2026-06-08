from django.contrib import admin

from .models import NationalDexBinder, NationalDexCard


class NationalDexCardInline(admin.TabularInline):
    model = NationalDexCard
    extra = 0
    readonly_fields = ('pokemon_name', 'updated_at')


@admin.register(NationalDexBinder)
class NationalDexBinderAdmin(admin.ModelAdmin):
    list_display = ('user', 'created_at', 'updated_at')
    inlines = [NationalDexCardInline]
