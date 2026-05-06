from django.contrib import admin

from .models import CustomBinder, CustomBinderSlot


class CustomBinderSlotInline(admin.TabularInline):
    model = CustomBinderSlot
    extra = 0
    readonly_fields = ('slot_index', 'updated_at')


@admin.register(CustomBinder)
class CustomBinderAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'grid_cols', 'grid_rows', 'updated_at')
    list_filter = ('user',)
    inlines = [CustomBinderSlotInline]
